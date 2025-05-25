import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Calendar, Clock, Flag, RefreshCw, Star, ChevronRight, Check, AlarmClock, List } from 'lucide-react';
import { Dialog } from '@headlessui/react';

// 任务类型选项
const taskTypeOptions = [
  { id: 'life', icon: '🏠', label: '生活' },
  { id: 'study', icon: '📚', label: '学习' },
  { id: 'work', icon: '💼', label: '工作' },
  { id: 'entertainment', icon: '🎮', label: '娱乐' },
  { id: 'personal', icon: '🌱', label: '自我关怀' }
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

const NewTaskPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  
  // 状态管理
  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('💡');
  const [selectedType, setSelectedType] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [date, setDate] = useState('随时');
  const [startTime, setStartTime] = useState('随时');
  const [duration, setDuration] = useState('30 分钟');
  const [isIconSelectorOpen, setIsIconSelectorOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [subtasks, setSubtasks] = useState<{id: string, title: string, completed: boolean}[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  
  // 图标选项
  const iconOptions = ['💡', '📝', '📚', '🏠', '💼', '🎮', '🎯', '🌱', '🎁', '🎨', '🎓', '📱', '💻', '🚗'];
  
  // 处理保存任务
  const handleSaveTask = () => {
    if (title.trim()) {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: Date.now().toString(),
          title: title,
          completed: false,
          isAnytime: date === '随时',
          dueDate: date !== '随时' ? date : undefined,
          startTime: startTime !== '随时' ? startTime : undefined,
          type: selectedType,
          icon: selectedIcon,
          duration: duration,
          subtasks: subtasks.length > 0 ? subtasks : undefined,
        },
      });
      navigate('/home');
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
    setDuration(selectedTime);
    setIsTimePickerOpen(false);
  };
  
  // 处理开始时间选择
  const handleSelectStartTime = (selectedStartTime: string) => {
    setStartTime(selectedStartTime);
    setIsStartTimePickerOpen(false);
  };
  
  // 处理图标选择
  const handleSelectIcon = (icon: string) => {
    setSelectedIcon(icon);
    setIsIconSelectorOpen(false);
  };
  
  // 处理添加子任务
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([
        ...subtasks,
        { id: Date.now().toString(), title: newSubtask, completed: false }
      ]);
      setNewSubtask('');
    }
  };
  
  // 处理删除子任务
  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };
  
  // 处理子任务完成状态
  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map(subtask => 
        subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask
      )
    );
  };
  
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-medium">返回</h1>
        <button 
          onClick={handleSaveTask}
          className="px-4 py-2 bg-blue-500 text-white rounded-full"
          disabled={!title.trim()}
        >
          <span className="flex items-center">
            <span className="mr-1">↑</span>添加事项
          </span>
        </button>
      </div>
      
      {/* 任务标题输入 - 白色卡片 */}
      <div className="p-4 my-4 mx-4 bg-white rounded-xl shadow-sm">
        <input
          type="text"
          placeholder="准备做什么？"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg px-2 py-3 border-0 focus:outline-none focus:ring-0"
        />
      </div>
      
      {/* 图标选择 - 白色卡片 */}
      <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsIconSelectorOpen(true)}
        >
          <div className="flex items-center">
            <Star size={20} className="text-gray-500 mr-3" />
            <span>图标</span>
          </div>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-2xl">{selectedIcon}</span>
            </div>
            <ChevronRight size={18} className="ml-2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* 日期和时间设置 - 白色卡片 */}
      <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm">
        {/* 日期设置 */}
        <div 
          className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
          onClick={() => setIsDatePickerOpen(true)}
        >
          <div className="flex items-center">
            <Calendar size={20} className="text-gray-500 mr-3" />
            <span>日期</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>{date}</span>
            <ChevronRight size={18} className="ml-2 text-gray-400" />
          </div>
        </div>
        
        {/* 开始时间设置 */}
        <div 
          className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer"
          onClick={() => setIsStartTimePickerOpen(true)}
        >
          <div className="flex items-center">
            <Clock size={20} className="text-gray-500 mr-3" />
            <span>开始时间</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>{startTime}</span>
            <ChevronRight size={18} className="ml-2 text-gray-400" />
          </div>
        </div>
        
        {/* 估计用时设置 */}
        <div 
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsTimePickerOpen(true)}
        >
          <div className="flex items-center">
            <AlarmClock size={20} className="text-gray-500 mr-3" />
            <span>估计用时</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>AI 智能判断</span>
            <ChevronRight size={18} className="ml-2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* 重复设置 - 白色卡片 */}
      <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <RefreshCw size={20} className="text-gray-500 mr-3" />
            <span>重复</span>
          </div>
          <div className="flex items-center text-gray-500">
            <span>不重复</span>
            <ChevronRight size={18} className="ml-2 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* 子任务 - 白色卡片 */}
      <div className="mx-4 mb-4 bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div 
            className="flex items-center justify-between"
            onClick={() => setShowSubtasks(!showSubtasks)}
          >
            <div className="flex items-center">
              <List size={20} className="text-gray-500 mr-3" />
              <span>子事项</span>
            </div>
            <ChevronRight size={18} className={`ml-2 text-gray-400 transform transition-transform ${showSubtasks ? 'rotate-90' : ''}`} />
          </div>
        </div>
        
        {showSubtasks && (
          <div className="p-4">
            {subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={() => handleToggleSubtask(subtask.id)}
                  className="w-5 h-5 mr-3 border-gray-300 rounded"
                />
                <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-400' : ''}`}>
                  {subtask.title}
                </span>
                <button 
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            
            <div className="flex items-center mt-2">
              <span className="w-5 h-5 mr-3 border border-gray-300 rounded-full flex items-center justify-center text-gray-300">
                +
              </span>
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="添加子事项"
                className="flex-1 border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 任务分类 - 白色卡片 */}
      <div className="mx-4 mb-20 bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center">
            <Flag size={20} className="text-gray-500 mr-3" />
            <span>任务分类</span>
          </div>
        </div>
        
        <div className="p-4 flex flex-wrap gap-3">
          {taskTypeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedType(option.id)}
              className={`flex items-center py-2 px-3 rounded-full border ${
                selectedType === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 图标选择对话框 */}
      <Dialog
        open={isIconSelectorOpen}
        onClose={() => setIsIconSelectorOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-4">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4 px-2">
              选择图标
            </Dialog.Title>
            
            <div className="grid grid-cols-6 gap-4 mb-4">
              {iconOptions.map((icon) => (
                <div
                  key={icon}
                  onClick={() => handleSelectIcon(icon)}
                  className={`w-12 h-12 flex items-center justify-center rounded-full cursor-pointer ${
                    selectedIcon === icon ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setIsIconSelectorOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      
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
                  {duration === option && <Check size={18} className="text-blue-500" />}
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