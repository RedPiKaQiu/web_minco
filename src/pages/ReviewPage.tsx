import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { X, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewPage = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [showRemainingTasks, setShowRemainingTasks] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  
  // 初始化当前日期
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    setDate(`${year}年${month}月${day}日，星期${weekday}`);
  }, []);
  
  // 获取当天已完成的事项
  const completedTasks = state.tasks.filter(task => 
    task.completed && !task.postponedToTomorrow
  );
  
  // 获取当天未完成的事项
  const incompleteTasks = state.tasks.filter(task => 
    !task.completed && !task.postponedToTomorrow
  );
  
  // 计算完成率
  const completionRate = state.tasks.length > 0 
    ? Math.round((completedTasks.length / state.tasks.length) * 100) 
    : 0;
  
  const handleClose = () => {
    navigate('/home');
  };
  
  // 处理展示剩余事项
  const handleShowRemainingTasks = () => {
    // 如果没有剩余事项，直接显示收集物页面
    if (incompleteTasks.length === 0) {
      setShowCollections(true);
    } else {
      setShowRemainingTasks(true);
    }
  };
  
  // 处理将事项移至明天
  const handleMoveToTomorrow = () => {
    if (incompleteTasks.length > 0) {
      const incompleteTaskIds = incompleteTasks.map(task => task.id);
      dispatch({
        type: 'POSTPONE_TASKS_TO_TOMORROW',
        payload: incompleteTaskIds
      });
    }
    // 显示收集物页面
    setShowCollections(true);
  };
  
  // 处理开心收下
  const handleHappyReceive = () => {
    // 获取当前日期
    const today = new Date().toISOString().split('T')[0];
    
    // 添加收集物到状态
    collections.forEach(item => {
      const collection = {
        ...item,
        acquiredDate: today
      };
      dispatch({
        type: 'ADD_COLLECTION',
        payload: collection
      });
    });
    
    // 导航到晚安页面
    navigate('/night');
  };
  
  // 模拟的收集物数据
  const collections = [
    {
      id: '1',
      title: '白玉岛的海鸥羽毛',
      description: '专注航行了25分钟',
      icon: '🕊️'
    },
    {
      id: '2',
      title: '东海滩的扇贝壳',
      description: '完整了一次情绪',
      icon: '🐚'
    },
    {
      id: '3',
      title: '椰林岛的椰子',
      description: '专注航行了50分钟',
      icon: '🥥'
    },
    {
      id: '4',
      title: '小女孩送的小鱼',
      description: '完整了一次情绪',
      icon: '🐠'
    }
  ];
  
  // 渲染收集物页面
  if (showCollections) {
    return (
      <div className="min-h-screen bg-[#0c2d6b] text-white flex flex-col">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-yellow-300 mr-2"></div>
            <div className="w-5 h-5 bg-gray-300/30 rounded-full absolute ml-4 mt-1"></div>
          </div>
          <h1 className="text-xl font-bold">今日航行日志</h1>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 日期显示 */}
        <div className="text-center mb-4 text-blue-200">
          {date}
        </div>
        
        {/* 虚线分隔 */}
        <div className="border-dashed border-t border-blue-400/40 mx-6 mb-4"></div>
        
        {/* 收集物 */}
        <div className="px-6 flex-grow">
          <h2 className="text-lg font-medium mb-4">收集物</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {collections.map(item => (
              <div key={item.id} className="bg-[#123a7c] rounded-lg p-3 flex flex-col">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">{item.icon}</span>
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <p className="text-xs text-blue-200">{item.description}</p>
              </div>
            ))}
          </div>
          
          {/* 底部提示语 */}
          <div className="mt-8 bg-[#123a7c] rounded-lg p-4">
            <p className="text-sm text-blue-200">
              今天的你收获满满呢~<br />
              专注与冥想，是心灵成长的礼物：海鸥羽毛与扇贝壳，是旅途中的美好记忆。
            </p>
          </div>
        </div>
        
        {/* 开心收下按钮 */}
        <div className="px-6 mb-6 mt-4">
          <button 
            onClick={handleHappyReceive}
            className="w-full bg-[#0f172a] py-4 rounded-lg text-center text-white font-medium"
          >
            开心收下
          </button>
        </div>
      </div>
    );
  }
  
  // 渲染剩余事项页面
  if (showRemainingTasks) {
    return (
      <div className="min-h-screen bg-[#0c2d6b] text-white flex flex-col">
        {/* 顶部栏 */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-yellow-300 mr-2"></div>
            <div className="w-5 h-5 bg-gray-300/30 rounded-full absolute ml-4 mt-1"></div>
          </div>
          <h1 className="text-xl font-bold">今日航行日志</h1>
          <button 
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* 日期显示 */}
        <div className="text-center mb-4 text-blue-200">
          {date}
        </div>
        
        {/* 虚线分隔 */}
        <div className="border-dashed border-t border-blue-400/40 mx-6 mb-4"></div>
        
        {/* 剩余事项 */}
        <div className="px-6 flex-grow">
          <h2 className="text-lg font-medium mb-4">剩余事项</h2>
          
          <div className="space-y-3">
            {incompleteTasks.map(task => (
              <div key={task.id} className="bg-[#123a7c] rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center">
                  {task.startTime && (
                    <span className="text-sm text-blue-300 mr-2">{task.startTime}</span>
                  )}
                  <span>{task.title}</span>
                </div>
                <div className="w-6 h-6 border border-gray-500 rounded-full"></div>
              </div>
            ))}
          </div>
          
          {/* 底部提示语 */}
          <div className="mt-8 bg-[#123a7c] rounded-lg p-4">
            <h3 className="font-medium mb-2">取舍也是一种智慧</h3>
            <p className="text-sm text-blue-200 mb-4">
              你已经尽力而为了，晨练和快递可以安排在明天哦~
            </p>
          </div>
        </div>
        
        {/* 移至明天按钮 */}
        <div className="px-6 mb-6 mt-4">
          <button 
            onClick={handleMoveToTomorrow}
            className="w-full bg-[#0f172a] py-4 rounded-lg text-center text-white font-medium"
          >
            移至明天
          </button>
        </div>
      </div>
    );
  }
  
  // 渲染初始回顾页面
  return (
    <div className="min-h-screen bg-[#0c2d6b] text-white flex flex-col">
      {/* 顶部栏 */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-yellow-300 mr-2"></div>
          <div className="w-5 h-5 bg-gray-300/30 rounded-full absolute ml-4 mt-1"></div>
        </div>
        <h1 className="text-xl font-bold">今日航行日志</h1>
        <button 
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* 日期显示 */}
      <div className="text-center mb-4 text-blue-200">
        {date}
      </div>
      
      {/* 虚线分隔 */}
      <div className="border-dashed border-t border-blue-400/40 mx-6 mb-4"></div>
      
      {/* 今日三要事 */}
      <div className="px-6 mb-6">
        <h2 className="text-lg font-medium mb-4">今日三要事</h2>
        
        <div className="space-y-3">
          {completedTasks.slice(0, 3).map(task => (
            <div key={task.id} className="bg-[#123a7c] rounded-lg p-3 flex justify-between items-center">
              <div className="flex items-center">
                {task.startTime && (
                  <span className="text-sm text-blue-300 mr-2">{task.startTime}</span>
                )}
                <span className="line-through text-gray-400">{task.title}</span>
              </div>
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check size={16} className="text-green-400" />
              </div>
            </div>
          ))}
          
          {/* 如果已完成事项少于3个，显示未完成的事项 */}
          {completedTasks.length < 3 && incompleteTasks.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="text-lg font-semibold text-gray-900">未完成的事项</h3>
              {incompleteTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    {task.startTime && (
                      <span className="text-sm text-blue-300 mr-2">{task.startTime}</span>
                    )}
                    <span>{task.title}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 其他事项 */}
      {state.tasks.length > 3 && (
        <div className="px-6 mb-6">
          <h2 className="text-lg font-medium mb-4">其他事项</h2>
          
          <div className="space-y-3">
            {state.tasks.slice(3).map(task => (
              <div key={task.id} className="bg-[#123a7c] rounded-lg p-3 flex justify-between items-center">
                <div className="flex items-center">
                  {task.startTime && (
                    <span className="text-sm text-blue-300 mr-2">{task.startTime}</span>
                  )}
                  <span className={task.completed ? "line-through text-gray-400" : ""}>{task.title}</span>
                </div>
                <div className={`w-6 h-6 ${task.completed ? 'bg-green-500/20' : 'border border-gray-500'} rounded-full flex items-center justify-center`}>
                  {task.completed && <Check size={16} className="text-green-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 今天总结 */}
      <div className="px-6 mt-auto">
        <div className="bg-[#123a7c] rounded-lg p-4 mb-4">
          <h2 className="text-lg font-medium mb-2">今天真是充实～</h2>
          <p className="text-sm text-blue-200 mb-4">
            {completedTasks.length > 0 
              ? `工作、锻炼、送心意...完成了${completedTasks.length}项事项，还能让交流和时间更有效！`
              : '今天还没有完成事项，明天继续加油！'}
          </p>
          
          {/* 完成率环形进度 */}
          <div className="flex items-center">
            <div className="relative w-12 h-12">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#2d4b8d" strokeWidth="4" />
                <circle 
                  cx="18" 
                  cy="18" 
                  r="16" 
                  fill="none" 
                  stroke="#60a5fa" 
                  strokeWidth="4" 
                  strokeDasharray={`${completionRate} 100`}
                  transform="rotate(-90 18 18)" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
            </div>
            <span className="ml-3 text-sm">完成率</span>
          </div>
        </div>
        
        {/* 下一步按钮 */}
        <button 
          onClick={handleShowRemainingTasks}
          className="w-full bg-[#0f172a] py-4 rounded-lg text-center text-white font-medium mb-6 flex items-center justify-center"
        >
          下一步
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default ReviewPage; 