import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskItem from '../components/TaskItem';
import CompletedTasks from '../components/CompletedTasks';
import SailingButton from '../components/SailingButton';
import { Anchor, Clock, MessageCircle, Plus } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

type TabType = '今日聚焦' | '时间轴' | '随时可做';

const HomePage = () => {
  const { state, dispatch } = useAppContext();
  const [currentDate] = useState(new Date());
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('今日聚焦');
  const navigate = useNavigate();
  
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const formattedDate = `${months[currentDate.getMonth()]}${currentDate.getDate()}日，${days[currentDate.getDay()]}`;
  
  const activeTasks = state.tasks.filter(task => !task.completed);
  const anytimeTasks = activeTasks.filter(task => task.isAnytime);
  const scheduledTasks = activeTasks.filter(task => !task.isAnytime);
  
  // 检查是否有任何任务（包括已完成的）
  const hasAnyTasks = state.tasks.length > 0;

  // 获取快速操作区要显示的任务
  const getQuickActionTask = () => {
    // 优先使用第一个时间轴任务
    if (scheduledTasks.length > 0) {
      return scheduledTasks[0];
    }
    // 如果没有时间轴任务，使用第一个随时任务
    if (anytimeTasks.length > 0) {
      return anytimeTasks[0];
    }
    return null;
  };

  const quickActionTask = getQuickActionTask();

  const openAiChat = () => {
    navigate('/ai-chat');
  };
  
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskTitle.trim()) {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: Date.now().toString(),
          title: taskTitle,
          completed: false,
          isAnytime: true,
        },
      });
      setTaskTitle('');
      setIsAddTaskOpen(false);
    }
  };

  const renderTasksByTab = () => {
    // 如果完全没有任务，显示空状态界面
    if (!hasAnyTasks) {
      return (
        <div className="flex flex-col items-center mt-10">
          <h2 className="text-xl text-gray-600 mb-3">今天还没有日程哦~</h2>
          <p className="text-sm text-gray-500 mb-8">点击下方按钮，快速添加</p>
          
          <div className="w-full max-w-md flex rounded-full overflow-hidden shadow-md">
            <button 
              onClick={() => setIsAddTaskOpen(true)}
              className="flex-1 bg-[#E1F5FE] py-4 flex items-center justify-center"
            >
              <Plus className="text-blue-500" size={20} />
            </button>
            <button
              onClick={openAiChat}
              className="flex-1 bg-white py-4 flex items-center justify-center"
            >
              <MessageCircle className="text-sky-400" size={20} />
            </button>
          </div>
        </div>
      );
    }
    
    // 有任务时，根据标签显示相应内容
    switch (activeTab) {
      case '今日聚焦':
        return (
          <div className="flex flex-col">
            {/* 时间轴任务 */}
            <div className="space-y-3 mb-3">
              {scheduledTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
            
            {/* 随时可做任务 */}
            {anytimeTasks.length > 0 && (
              <div className="mt-0">
                <div className="space-y-3">
                  {anytimeTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
            
            {/* 当今日聚焦标签下没有任务时显示提示 */}
            {scheduledTasks.length === 0 && anytimeTasks.length === 0 && (
              <p className="text-gray-500 text-center py-4">暂无今日聚焦任务</p>
            )}
          </div>
        );
      case '时间轴':
        return (
          <div className="flex flex-col">
            <div className="space-y-3">
              {scheduledTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
              {scheduledTasks.length === 0 && (
                <p className="text-gray-500 text-center py-4">暂无时间轴任务</p>
              )}
            </div>
          </div>
        );
      case '随时可做':
        return (
          <div className="flex flex-col">
            <div className="space-y-3">
              {anytimeTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {anytimeTasks.length === 0 && (
                <p className="text-gray-500 text-center py-4">暂无随时可做任务</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-20">
      {/* 顶部状态栏 */}
      <div className="bg-ocean-50 p-4 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold">
            {hasAnyTasks ? "海况稳定，可以放心启航 ☀️" : "Shell，早上好。☀️"}
            </h1>
            <p className="text-gray-600 text-sm">{formattedDate}</p>
          </div>
        </div>
        
        {/* 用户提示语 */}
      {/* 悬浮工具栏 - 仅在有任务时显示 */}
      {hasAnyTasks && (
        <div className="px-4 mb-3">
          <p className="text-lg text-gray-800">
            {"Shell，接下来想做点什么呢？"}
          </p>
        </div>
      )}
        
        {/* 快速操作区 - 仅在有任务时显示 */}
        {hasAnyTasks && quickActionTask && (
          <div className="bg-ocean-100 rounded-xl p-4 mb-2">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Anchor className="text-ocean-600 mr-2" size={18} />
                <span className="text-sm font-medium">{quickActionTask.title}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                <span>{quickActionTask.duration || '10分钟'}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <div className="flex items-center">
                <span className="text-xs text-gray-500">
                  {quickActionTask.startTime && quickActionTask.endTime 
                    ? `${quickActionTask.startTime} - ${quickActionTask.endTime}`
                    : (quickActionTask.isAnytime ? '随时' : '')}
                </span>
              </div>
              <SailingButton text="启航" task={quickActionTask} />
            </div>
          </div>
        )}
      </div>
      
      {/* 任务标签页 */}
      <div className="px-4 mt-4 flex flex-col min-h-[calc(100vh-330px)]">
        {hasAnyTasks && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              {(['今日聚焦', '时间轴', '随时可做'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`pb-1 ${
                    activeTab === tab 
                      ? 'font-medium text-gray-900 border-b-2 border-gray-900 text-lg' 
                      : 'text-gray-500'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 根据标签显示任务 */}
        {renderTasksByTab()}
        
        {/* 已完成任务 */}
        {hasAnyTasks && <CompletedTasks />}
        
        {/* 添加弹性空间 */}
        <div className="flex-grow"></div>
      </div>
      
      {/* 悬浮工具栏 - 仅在有任务时显示 */}
      {hasAnyTasks && (
        <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none" style={{ background: 'transparent' }}>
          <div className="app-container mx-auto flex justify-end bg-transparent" style={{ boxShadow: 'none' }}>
            <div className="mr-4 pointer-events-auto inline-flex bg-transparent" style={{ boxShadow: 'none' }}>
              <div className="bg-white rounded-full shadow-md flex overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                {/* 聊天按钮 */}
                <button 
                  onClick={openAiChat} 
                  className="p-4 flex items-center justify-center border-r border-gray-100"
                  aria-label="打开聊天"
                >
                  <MessageCircle className="text-sky-400" size={24} />
                </button>
                
                {/* 竖线分隔符 */}
                <div className="w-[1px] bg-gray-200"></div>
                
                {/* 添加任务按钮 */}
                <button 
                  onClick={() => setIsAddTaskOpen(true)} 
                  className="p-4 flex items-center justify-center"
                  aria-label="添加任务"
                >
                  <Plus className="text-blue-500" size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 添加任务对话框 */}
      <Dialog
        open={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
              添加新任务
            </Dialog.Title>
            
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="输入任务内容"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ocean-500"
                autoFocus
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-ocean-600 rounded-lg hover:bg-ocean-700"
                >
                  添加
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default HomePage; 
