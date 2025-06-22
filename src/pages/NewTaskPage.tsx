import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Calendar, Clock, Flag, RefreshCw, Edit, ChevronRight, Check, AlarmClock } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { Task, TaskCategory, TASK_CATEGORIES } from '../types';
import { createItem, updateItem, CreateItemRequest, UpdateItemRequest } from '../api/items';

// 事项类型选项
const taskNatureOptions = [
  { id: 'routine', icon: <RefreshCw size={22} />, label: '例行' },
  { id: 'chore', icon: <Edit size={22} />, label: '杂务' },
  { id: 'event', icon: <Calendar size={22} strokeWidth={1.5} />, label: '活动' },
  { id: 'idea', icon: <div className="text-2xl">💡</div>, label: '想法' },
];

// 使用统一的事项分类配置
const taskCategoryOptions = TASK_CATEGORIES.map(category => ({
  id: category.id.toLowerCase(),
  icon: category.emoji,
  label: category.label
}));

// 优先级选项
const priorityOptions = [
  { id: 'low', color: 'bg-red-400 border-red-400', label: '' },
  { id: 'medium', color: 'bg-yellow-400 border-yellow-400', label: '' },
  { id: 'high', color: 'bg-blue-400 border-blue-400', label: '' },
];

// 预设时间选项
const timeOptions = [
  '5 分钟', 
  '15 分钟', 
  '30 分钟', 
  '45 分钟', 
  '1 小时', 
  '1.5 小时', 
  '2 小时', 
  '3 小时', 
  '4 小时',
  '全天'
];

// 预设开始时间选项
const startTimeOptions = [
  '随时',
  '上午 8:00',
  '上午 9:00',
  '上午 10:00',
  '上午 11:00',
  '中午 12:00',
  '下午 1:00',
  '下午 2:00',
  '下午 3:00',
  '下午 4:00',
  '下午 5:00',
  '下午 6:00',
  '晚上 7:00',
  '晚上 8:00',
  '晚上 9:00'
];

interface LocationState {
  editTask?: Task;
}

const NewTaskPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dispatch } = useAppContext();
  
  const locationState = location.state as LocationState;
  const editTask = locationState?.editTask;
  const isEditMode = !!editTask;
  
  // 状态管理
  const [title, setTitle] = useState('');
  const [selectedNature, setSelectedNature] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [date] = useState('今天');
  const [startTime, setStartTime] = useState('随时');
  const [time, setTime] = useState('30 分钟');
  const [priority, setPriority] = useState('');
  const [showAiGeneration, setShowAiGeneration] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 在编辑模式下预填充表单数据
  useEffect(() => {
    if (isEditMode && editTask) {
      setTitle(editTask.title);
      setStartTime(editTask.startTime || '随时');
      setTime(editTask.duration || '30 分钟');
      setPriority(editTask.priority || '');
      
      // 根据category找到对应的分类ID
      if (editTask.category) {
        const categoryOption = taskCategoryOptions.find(opt => opt.label === editTask.category);
        if (categoryOption) {
          setSelectedCategory(categoryOption.id);
        }
      }
      
      // 根据type找到对应的性质ID
      if (editTask.type) {
        const natureOption = taskNatureOptions.find(opt => opt.label === editTask.type);
        if (natureOption) {
          setSelectedNature(natureOption.id);
        }
      }
    }
  }, [isEditMode, editTask]);
  
  // 映射函数：将分类标签转换为category_id
  const getCategoryId = (categoryLabel: string): number => {
    const categoryMap: { [key: string]: number } = {
      '生活': 1,
      '健康': 2,
      '工作': 3,
      '学习': 4,
      '放松': 5,
      '探索': 6
    };
    return categoryMap[categoryLabel] || 1;
  };

  // 映射函数：将优先级字符串转换为数字
  const getPriorityNumber = (priorityStr: string): number => {
    const priorityMap: { [key: string]: number } = {
      'low': 2,
      'medium': 3,
      'high': 5
    };
    return priorityMap[priorityStr] || 3;
  };

  // 映射函数：将时间字符串转换为分钟数
  const getDurationInMinutes = (timeStr: string): number => {
    if (timeStr === '全天') return 480; // 8小时
    const match = timeStr.match(/(\d+(?:\.\d+)?)\s*(分钟|小时)/);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2];
      return unit === '小时' ? num * 60 : num;
    }
    return 30; // 默认30分钟
  };

  // 映射函数：将开始时间转换为时间段ID
  const getTimeSlotId = (startTimeStr: string): number => {
    if (startTimeStr === '随时') return 5;
    
    const hour = parseInt(startTimeStr.split(' ')[1]?.split(':')[0] || '0');
    if (hour >= 6 && hour < 12) return 1; // 上午
    if (hour >= 12 && hour < 14) return 2; // 中午
    if (hour >= 14 && hour < 18) return 3; // 下午
    if (hour >= 18 && hour < 24) return 4; // 晚上
    return 5; // 随时
  };

  // 映射函数：将开始时间转换为ISO格式
  const getStartTimeISO = (startTimeStr: string, _dateStr: string): string | undefined => {
    if (startTimeStr === '随时') return undefined;
    
    // 提取时间部分，例如 "上午 9:00" -> "9:00"
    const timeMatch = startTimeStr.match(/(\d{1,2}):(\d{2})/);
    if (!timeMatch) return undefined;
    
    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    
    // 处理下午时间（除了12点）
    if (startTimeStr.includes('下午') && hour !== 12) {
      hour += 12;
    }
    
    // 构建今天的日期时间
    const today = new Date();
    today.setHours(hour, minute, 0, 0);
    
    return today.toISOString();
  };
  
  // 处理保存事项
  const handleSaveTask = async () => {
    if (!title.trim()) return;
    
    setIsLoading(true);
    
    try {
      const selectedCategoryConfig = taskCategoryOptions.find(cat => cat.id === selectedCategory);
      const selectedCategoryValue = selectedCategoryConfig?.label as TaskCategory;
      
      if (isEditMode && editTask) {
        // 编辑模式：调用更新事项API
        const updateData: UpdateItemRequest = {
          title: title,
          category_id: selectedCategoryValue ? getCategoryId(selectedCategoryValue) : undefined,
          priority: priority ? getPriorityNumber(priority) : undefined,
          estimated_duration: getDurationInMinutes(time),
          time_slot_id: getTimeSlotId(startTime),
          start_time: getStartTimeISO(startTime, date),
        };

        await updateItem(editTask.id, updateData);
        
        // 更新本地状态
        dispatch({
          type: 'UPDATE_TASK',
          payload: {
            ...editTask,
            title: title,
            isAnytime: startTime === '随时',
            startTime: startTime !== '随时' ? startTime : undefined,
            category: selectedCategoryValue,
            type: selectedNature ? taskNatureOptions.find(nat => nat.id === selectedNature)?.label : undefined,
            priority: priority as 'low' | 'medium' | 'high' | undefined,
            duration: time,
          },
        });
        
        // 直接更新时间轴缓存中的任务数据
        try {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
          const cacheKey = `timeline-tasks-${today}`;
          const existingCache = sessionStorage.getItem(cacheKey);
          
          if (existingCache) {
            // 如果有现有缓存，更新对应的任务
            const cachedTasks = JSON.parse(existingCache);
            const updatedTasks = cachedTasks.map((task: any) => 
              task.id === editTask.id 
                ? {
                    ...task,
                    title: title,
                    category_id: selectedCategoryValue ? getCategoryId(selectedCategoryValue) : task.category_id,
                    priority: priority ? getPriorityNumber(priority) : task.priority,
                    estimated_duration: getDurationInMinutes(time),
                    time_slot_id: getTimeSlotId(startTime),
                    start_time: getStartTimeISO(startTime, date),
                  }
                : task
            );
            sessionStorage.setItem(cacheKey, JSON.stringify(updatedTasks));
            
            // 更新缓存元数据时间戳
            const metadataKey = 'timeline-cache-metadata';
            const metadata = sessionStorage.getItem(metadataKey);
            if (metadata) {
              const parsed = JSON.parse(metadata);
              parsed[today] = Date.now();
              sessionStorage.setItem(metadataKey, JSON.stringify(parsed));
            }
            
            console.log('✅ NewTaskPage: 已在时间轴缓存中更新任务', { 
              taskId: editTask.id, 
              taskTitle: title,
              totalTasks: updatedTasks.length 
            });
          } else {
            console.log('💾 NewTaskPage: 时间轴缓存不存在，更新的任务将在下次加载时显示');
          }
        } catch (error) {
          console.error('更新时间轴缓存失败:', error);
        }
      } else {
        // 新建模式：调用创建事项API
        const createData: CreateItemRequest = {
          title: title,
          category_id: selectedCategoryValue ? getCategoryId(selectedCategoryValue) : 1,
          priority: priority ? getPriorityNumber(priority) : 3,
          estimated_duration: getDurationInMinutes(time),
          time_slot_id: getTimeSlotId(startTime),
          start_time: getStartTimeISO(startTime, date),
        };

        const newItem = await createItem(createData);
        
        // 更新本地状态
        dispatch({
          type: 'ADD_TASK',
          payload: {
            id: newItem.id,
            title: title,
            completed: false,
            isAnytime: startTime === '随时',
            startTime: startTime !== '随时' ? startTime : undefined,
            category: selectedCategoryValue,
            type: selectedNature ? taskNatureOptions.find(nat => nat.id === selectedNature)?.label : undefined,
            priority: priority as 'low' | 'medium' | 'high' | undefined,
            duration: time,
          },
        });
        
        // 直接更新时间轴缓存，添加新创建的任务
        try {
          const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
          const cacheKey = `timeline-tasks-${today}`;
          const existingCache = sessionStorage.getItem(cacheKey);
          
          if (existingCache) {
            // 如果有现有缓存，添加新任务到缓存中
            const cachedTasks = JSON.parse(existingCache);
            const updatedTasks = [...cachedTasks, newItem];
            sessionStorage.setItem(cacheKey, JSON.stringify(updatedTasks));
            
            // 更新缓存元数据时间戳
            const metadataKey = 'timeline-cache-metadata';
            const metadata = sessionStorage.getItem(metadataKey);
            if (metadata) {
              const parsed = JSON.parse(metadata);
              parsed[today] = Date.now();
              sessionStorage.setItem(metadataKey, JSON.stringify(parsed));
            }
            
            console.log('✅ NewTaskPage: 已将新任务添加到时间轴缓存', { 
              taskId: newItem.id, 
              taskTitle: newItem.title,
              totalTasks: updatedTasks.length 
            });
          } else {
            console.log('💾 NewTaskPage: 时间轴缓存不存在，新任务将在下次加载时显示');
          }
        } catch (error) {
          console.error('更新时间轴缓存失败:', error);
        }
      }
      
      // 成功保存后关闭页面，返回上一页
      // 由于已经通过dispatch更新了缓存，上一页会自动显示新任务
      navigate(-1);
    } catch (error) {
      console.error('保存事项失败:', error);
      // 这里可以添加错误提示UI
      alert('保存事项失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 处理返回
  const handleBack = () => {
    navigate(-1);
  };
  
  // 处理切换重复
  const handleToggleRepeat = () => {
    setIsRepeating(!isRepeating);
  };
  
  // 处理时间选择
  const handleSelectTime = (selectedTime: string) => {
    setTime(selectedTime);
    setIsTimePickerOpen(false);
  };
  
  // 处理开始时间选择
  const handleSelectStartTime = (selectedStartTime: string) => {
    setStartTime(selectedStartTime);
    setIsStartTimePickerOpen(false);
  };

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-medium">{isEditMode ? '编辑事项' : '新建事项'}</h1>
        <button 
          onClick={handleSaveTask}
          className={`px-4 py-2 rounded-lg ${
            !title.trim() || isLoading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white'
          }`}
          disabled={!title.trim() || isLoading}
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
      
      {/* 事项标题输入 */}
      <div className="p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="添加标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg px-2 py-3 border-0 focus:outline-none focus:ring-0"
        />
      </div>
      
      {/* 事项性质选择 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg mb-4">事项性质</h2>
        <div className="grid grid-cols-4 gap-4">
          {taskNatureOptions.map((option) => (
            <div 
              key={option.id}
              onClick={() => setSelectedNature(option.id)}
              className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer ${
                selectedNature === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="mb-2">{option.icon}</div>
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 事项分类 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg mb-4">事项分类</h2>
        <div className="grid grid-cols-4 gap-4">
          {taskCategoryOptions.map((option) => (
            <div 
              key={option.id}
              onClick={() => setSelectedCategory(option.id)}
              className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer ${
                selectedCategory === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <span className="text-sm">{option.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* 重复设置 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <RefreshCw size={20} className="text-gray-500 mr-3" />
            <span>重复</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-gray-500">{isRepeating ? '不重复' : '不重复'}</span>
            <button 
              onClick={handleToggleRepeat}
              className="w-10 h-6 bg-gray-200 rounded-full relative focus:outline-none"
            >
              <div className={`
                absolute w-5 h-5 bg-white rounded-full shadow transition
                ${isRepeating ? 'right-0.5 bg-blue-500' : 'left-0.5'}
              `}></div>
            </button>
          </div>
        </div>
      </div>
      
      {/* 日期设置 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Calendar size={20} className="text-gray-500 mr-3" />
            <span>日期</span>
          </div>
          <div className="text-gray-500">
            {date} <span className="ml-1">&#10095;</span>
          </div>
        </div>
      </div>
      
      {/* 开始时间设置 */}
      <div 
        className="p-4 border-b border-gray-100 cursor-pointer"
        onClick={() => setIsStartTimePickerOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlarmClock size={20} className="text-gray-500 mr-3" />
            <span>开始时间</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>{startTime}</span>
            <ChevronRight size={18} className="ml-1" />
          </div>
        </div>
      </div>
      
      {/* 时间设置 */}
      <div 
        className="p-4 border-b border-gray-100 cursor-pointer"
        onClick={() => setIsTimePickerOpen(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock size={20} className="text-gray-500 mr-3" />
            <span>估时</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>{time}</span>
            <ChevronRight size={18} className="ml-1" />
          </div>
        </div>
      </div>
      
      {/* 优先级设置 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Flag size={20} className="text-gray-500 mr-3" />
            <span>优先级</span>
          </div>
          <div className="flex items-center space-x-2">
            {priorityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setPriority(option.id)}
                className={`w-6 h-6 rounded-full border-2 ${
                  priority === option.id ? option.color : 'border-gray-300 bg-white'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 子事项 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg mb-4">子事项</h2>
        
        {/* AI生成子事项按钮 */}
        <div 
          className="bg-blue-50 py-3 px-4 rounded-lg mb-4 flex items-center justify-center cursor-pointer"
          onClick={() => setShowAiGeneration(!showAiGeneration)}
        >
          <Edit size={18} className="text-blue-500 mr-2" />
          <span className="text-blue-500">AI 生成子事项</span>
        </div>
        
        {/* 手动添加子事项 */}
        <div className="flex items-center border border-gray-200 rounded-lg p-2">
          <input
            type="checkbox"
            className="rounded mr-3"
            disabled
          />
          <input
            type="text"
            placeholder="添加子事项"
            className="flex-1 border-0 focus:outline-none focus:ring-0"
          />
        </div>
      </div>
      
      {/* 时间选择对话框 */}
      <Dialog
        open={isTimePickerOpen}
        onClose={() => setIsTimePickerOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 px-2">
              选择估计时间
            </Dialog.Title>
            
            <div className="mb-4 max-h-80 overflow-y-auto">
              {timeOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectTime(option)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <span>{option}</span>
                  {time === option && <Check size={18} className="text-blue-500" />}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsTimePickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
      {/* 开始时间选择对话框 */}
      <Dialog
        open={isStartTimePickerOpen}
        onClose={() => setIsStartTimePickerOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 px-2">
              选择开始时间
            </Dialog.Title>
            
            <div className="mb-4 max-h-80 overflow-y-auto">
              {startTimeOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelectStartTime(option)}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <span>{option}</span>
                  {startTime === option && <Check size={18} className="text-blue-500" />}
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsStartTimePickerOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default NewTaskPage; 