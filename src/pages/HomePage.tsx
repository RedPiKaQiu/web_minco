import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskItem from '../components/TaskItem';
import CompletedTasks from '../components/CompletedTasks';
import SailingButton from '../components/SailingButton';
import { Anchor, Clock, MessageCircle, Plus, MoreHorizontal } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

type TabType = '今日聚焦' | '时间轴' | '随时可做';

// 辅助函数：将时间字符串转换为分钟数以便排序
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return Infinity; // 如果没有时间，放到最后
  
  // 处理 "上午/下午/晚上" 格式的时间
  let hours = 0;
  let minutes = 0;
  
  if (timeStr.includes('上午')) {
    const matches = timeStr.match(/上午\s*(\d+):(\d+)/);
    if (matches) {
      hours = parseInt(matches[1]);
      minutes = parseInt(matches[2] || '0');
    }
  } else if (timeStr.includes('下午')) {
    const matches = timeStr.match(/下午\s*(\d+):(\d+)/);
    if (matches) {
      hours = parseInt(matches[1]) + 12;
      if (hours === 24) hours = 12; // 处理12小时制中的"下午12:00"
      minutes = parseInt(matches[2] || '0');
    }
  } else if (timeStr.includes('晚上')) {
    const matches = timeStr.match(/晚上\s*(\d+):(\d+)/);
    if (matches) {
      hours = parseInt(matches[1]) + 12;
      minutes = parseInt(matches[2] || '0');
    }
  } else if (timeStr.includes('中午')) {
    const matches = timeStr.match(/中午\s*(\d+):(\d+)/);
    if (matches) {
      hours = 12;
      minutes = parseInt(matches[2] || '0');
    }
  }
  
  return hours * 60 + minutes;
};

const HomePage = () => {
  const { state: userState } = useUser();
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
  
  // 按开始时间排序的时间轴任务
  const scheduledTasks = activeTasks
    .filter(task => !task.isAnytime)
    .sort((a, b) => {
      // 按照开始时间从早到晚排序
      const timeA = timeToMinutes(a.startTime || '');
      const timeB = timeToMinutes(b.startTime || '');
      return timeA - timeB;
    });
  
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
  
  const openNewTaskPage = () => {
    navigate('/new-task');
    setIsAddTaskOpen(false);
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

  // 获取用户昵称，如果没有则使用默认值
  const userNickname = userState.user?.nickname || '朋友';

  const renderTasksByTab = () => {
    // 如果完全没有任务，显示空状态界面
    if (!hasAnyTasks) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] mt-10">
          <h2 className="text-xl text-gray-600 mb-3">今天还没有日程哦~</h2>
          <p className="text-sm text-gray-500 mb-8">点击下方按钮，快速添加</p>
          
          <div className="w-full max-w-md flex rounded-full overflow-hidden shadow-md">
            <button 
              onClick={() => setIsAddTaskOpen(true)}
              className="flex-1 bg-[var(--color-empty-add-bg)] py-4 flex items-center justify-center"
            >
              <Plus className="text-[var(--color-empty-add-icon)]" size={20} />
            </button>
            <button
              onClick={openAiChat}
              className="flex-1 bg-white py-4 flex items-center justify-center"
            >
              <MessageCircle className="text-[var(--color-empty-chat-icon)]" size={20} />
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
    <div className="flex flex-col min-h-screen bg-app">
      {/* 顶部状态栏 */}
      <div className="bg-primary-light/20 p-4 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-app">
            {hasAnyTasks ? "海况稳定，可以放心启航 ☀️" : `${userNickname}，早上好。☀️`}
            </h1>
            <p className="text-app-secondary text-sm">{formattedDate}</p>
          </div>
        </div>
        
        {/* 用户提示语 */}
        {hasAnyTasks && (
          <div className="px-4 mb-3">
            <p className="text-lg text-app">
              {`${userNickname}，接下来想做点什么呢？`}
            </p>
          </div>
        )}
        
        {/* 快速操作区 - 仅在有任务时显示 */}
        {hasAnyTasks && quickActionTask && (
          <div className="
            bg-gradient-to-br 
            from-[var(--color-quick-action-gradient-from)] 
            to-[var(--color-quick-action-gradient-to)] 
            rounded-[var(--radius-large)]
            p-[var(--spacing-card)]
            shadow-[var(--shadow-md)]
          ">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <Anchor className="text-[var(--color-quick-action-icon)] mr-2" size={18} />
                <span className="text-sm font-medium text-[var(--color-quick-action-text)]">{quickActionTask.title}</span>
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
      
      {/* 任务标签页 - 添加 flex-grow 让它能够填充可用的空间 */}
      <div className="px-[var(--spacing-page)] mt-4 flex flex-col flex-grow">
        {hasAnyTasks && (
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              {(['今日聚焦', '时间轴', '随时可做'] as const).map((tab) => (
                <button
                  key={tab}
                  className={`pb-1 ${
                    activeTab === tab 
                      ? 'font-medium text-app border-b-2 border-primary text-lg' 
                      : 'text-app-secondary'
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
        <div className="flex-grow">
          {renderTasksByTab()}
        </div>
        
        {/* 已完成任务 */}
        {hasAnyTasks && <CompletedTasks />}
      </div>
      
      {/* 悬浮工具栏 - 仅在有任务时显示 */}
      {hasAnyTasks && (
        <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none" style={{ background: 'transparent' }}>
          <div className="app-container mx-auto flex justify-end bg-transparent" style={{ boxShadow: 'none' }}>
            <div className="mr-4 pointer-events-auto inline-flex bg-transparent" style={{ boxShadow: 'none' }}>
              <div className="bg-card rounded-full shadow-md flex overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
                {/* 聊天按钮 */}
                <button 
                  onClick={openAiChat} 
                  className="p-4 flex items-center justify-center border-r border-app-border"
                  aria-label="打开聊天"
                >
                  <MessageCircle className="text-primary" size={24} />
                </button>
                
                {/* 竖线分隔符 */}
                <div className="w-[1px] bg-app-border"></div>
                
                {/* 添加任务按钮 */}
                <button 
                  onClick={() => setIsAddTaskOpen(true)} 
                  className="p-4 flex items-center justify-center"
                  aria-label="添加任务"
                >
                  <Plus className="text-primary" size={24} />
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
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-card p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-app">
                添加新任务
              </Dialog.Title>
              <button
                onClick={openNewTaskPage}
                className="p-2 rounded-full hover:bg-app-background"
                aria-label="更多选项"
              >
                <MoreHorizontal className="text-app-secondary" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddTask}>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="输入任务内容"
                className="w-full border border-app-border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary bg-card text-app"
                autoFocus
              />
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-app-secondary hover:bg-app-background rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
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
