import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskItem from '../components/TaskItem';
import CompletedTasks from '../components/CompletedTasks';
import QuickAddTask from '../components/QuickAddTask';
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
    switch (activeTab) {
      case '今日聚焦':
        return (
          <div className="flex flex-col">
            {/* 时间轴任务 */}
            <div className="space-y-3 mb-4">
              {scheduledTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
            
            {/* 随时可做任务 */}
            {anytimeTasks.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm text-gray-500 mb-3">随时</h3>
                <div className="space-y-3">
                  {anytimeTasks.map(task => (
                    <TaskItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
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
            <h1 className="text-xl font-bold">海况稳定，可以放心启航 ☀️</h1>
            <p className="text-gray-600 text-sm">{formattedDate}</p>
          </div>
        </div>
        
        
        {/* 用户提示语 */}
        <div className="px-4 mb-3">
          <p className="text-lg text-gray-800">Shell，接下来想做点什么呢？</p>
        </div>
        
        {/* 快速操作区 */}
        <div className="bg-ocean-100 rounded-xl p-4 mb-2">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <Anchor className="text-ocean-600 mr-2" size={18} />
              <span className="text-sm font-medium">收集PPT相关数据资料</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock size={14} className="mr-1" />
              <span>15分钟</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <div className="flex items-center">
              <span className="text-xs text-gray-500">#完成PPT制作</span>
            </div>
            <SailingButton text="启航" />
          </div>
        </div>
      </div>
      
      {/* 任务标签页 */}
      <div className="px-4 mt-4 flex flex-col min-h-[calc(100vh-330px)]">
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
        
        {/* 根据标签显示任务 */}
        {renderTasksByTab()}
        
        {/* 已完成任务 */}
        <CompletedTasks />
        
        {/* 添加弹性空间 */}
        <div className="flex-grow"></div>
      </div>
      
      {/* 悬浮工具栏 */}
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
