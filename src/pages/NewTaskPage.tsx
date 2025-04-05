import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, Calendar, Clock, Flag, RefreshCw, Edit, ChevronRight, Check, AlarmClock } from 'lucide-react';
import { Dialog } from '@headlessui/react';

// 任务类型选项
const taskNatureOptions = [
  { id: 'routine', icon: <RefreshCw size={22} />, label: '例行' },
  { id: 'chore', icon: <Edit size={22} />, label: '杂务' },
  { id: 'event', icon: <Calendar size={22} strokeWidth={1.5} />, label: '活动' },
  { id: 'idea', icon: <div className="text-2xl">💡</div>, label: '想法' },
];

// 任务分类选项
const taskCategoryOptions = [
  { id: 'life', icon: '🏠', label: '生活' },
  { id: 'study', icon: '📚', label: '学习' },
  { id: 'work', icon: '💼', label: '工作' },
  { id: 'other', icon: '🔍', label: '其他' },
];

// 优先级选项
const priorityOptions = [
  { id: 'low', color: 'bg-red-400 border-red-400', label: '' },
  { id: 'medium', color: 'bg-yellow-400 border-yellow-400', label: '' },
  { id: 'high', color: 'bg-blue-400 border-blue-400', label: '' },
];

const NewTaskPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  
  // 状态管理
  const [title, setTitle] = useState('');
  const [selectedNature, setSelectedNature] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [date, setDate] = useState('今天');
  const [startTime, setStartTime] = useState('随时');
  const [time, setTime] = useState('30 分钟');
  const [priority, setPriority] = useState('');
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [showAiGeneration, setShowAiGeneration] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isAnytime, setIsAnytime] = useState(true);
  
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
  
  // 处理保存任务
  const handleSaveTask = () => {
    if (title.trim()) {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: Date.now().toString(),
          title: title,
          completed: false,
          isAnytime: startTime === '随时',
          startTime: startTime !== '随时' ? startTime : undefined,
          category: selectedCategory ? taskCategoryOptions.find(cat => cat.id === selectedCategory)?.label : undefined,
          priority: priority as 'low' | 'medium' | 'high' | undefined,
          duration: time,
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
    setTime(selectedTime);
    setIsTimePickerOpen(false);
  };
  
  // 处理开始时间选择
  const handleSelectStartTime = (selectedStartTime: string) => {
    setStartTime(selectedStartTime);
    setIsAnytime(selectedStartTime === '随时');
    setIsStartTimePickerOpen(false);
  };
  
  return (
    <div className="h-screen bg-white flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-medium">新建任务</h1>
        <button 
          onClick={handleSaveTask}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          disabled={!title.trim()}
        >
          保存
        </button>
      </div>
      
      {/* 任务标题输入 */}
      <div className="p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="添加标题..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg px-2 py-3 border-0 focus:outline-none focus:ring-0"
        />
      </div>
      
      {/* 任务性质选择 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg mb-4">任务性质</h2>
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
      
      {/* 任务分类 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg mb-4">任务分类</h2>
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
      
      {/* 子任务 */}
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg mb-4">子任务</h2>
        
        {/* AI生成子任务按钮 */}
        <div 
          className="bg-blue-50 py-3 px-4 rounded-lg mb-4 flex items-center justify-center cursor-pointer"
          onClick={() => setShowAiGeneration(!showAiGeneration)}
        >
          <Edit size={18} className="text-blue-500 mr-2" />
          <span className="text-blue-500">AI 生成子任务</span>
        </div>
        
        {/* 手动添加子任务 */}
        <div className="flex items-center border border-gray-200 rounded-lg p-2">
          <input
            type="checkbox"
            className="w-5 h-5 mr-3 border-gray-300 rounded"
            disabled
          />
          <span className="text-gray-500">添加子任务</span>
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