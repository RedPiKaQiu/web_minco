import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskItem from '../components/TaskItem';
import CompletedTasks from '../components/CompletedTasks';
import { MessageCircle, Plus, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import QuickActionArea from '../components/QuickActionArea';
import FloatingToolbar from '../components/FloatingToolbar';
import TaskAddDrawer from '../components/TaskAddDrawer';
import { useTheme } from '../context/ThemeContext';

// 晚间回顾时间范围
const NIGHT_REVIEW_START_HOUR = 22; // 晚上10点
const NIGHT_REVIEW_END_HOUR = 4;    // 凌晨4点

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
  const { state, refreshTasks } = useAppContext();
  const [currentDate] = useState(new Date());
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('今日聚焦');
  const navigate = useNavigate();
  const { currentTime } = useTheme();
  const [isNightTime, setIsNightTime] = useState(false); // 是否在晚间时间段
  const [isNightReview, setIsNightReview] = useState(false); // 是否处于晚间回顾模式
  const [hasAutoTriggeredReview, setHasAutoTriggeredReview] = useState(false); // 是否已自动触发过回顾模式
  
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
  
  // 获取用户昵称，如果没有则使用默认值
  const userNickname = userState.user?.nickname || '朋友';

  // 检查当前时间是否在晚间时间范围内
  useEffect(() => {
    const checkNightTime = () => {
      if (currentTime) {
        const [hours] = currentTime.split(':').map(Number);
        const isNight = hours >= NIGHT_REVIEW_START_HOUR || hours < NIGHT_REVIEW_END_HOUR;
        
        // 判断是否是从非晚间时间进入晚间时间
        const enteringNightTime = isNight && !isNightTime;
        setIsNightTime(isNight);
        
        // 只有在进入晚间时间且没有自动触发过回顾模式时，才自动进入回顾模式
        if (enteringNightTime && !hasAutoTriggeredReview) {
          setIsNightReview(true);
          setHasAutoTriggeredReview(true);
        }
        
        // 如果离开晚间时间段，重置自动触发标记
        if (!isNight) {
          setHasAutoTriggeredReview(false);
        }
      }
    };
    
    checkNightTime();
  }, [currentTime, isNightTime, hasAutoTriggeredReview]);
  
  // 切换回正常模式
  const handleContinueTasks = () => {
    setIsNightReview(false);
  };

  // 页面加载时刷新任务列表
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

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
    <div className="flex flex-col h-full bg-app">
      {/* 顶部状态栏 - 添加homepage-header类方便计算高度 */}
      <div className="bg-primary-light/20 p-4 rounded-b-3xl homepage-header">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold text-app">
            {hasAnyTasks ? "海况稳定，可以放心启航 ☀️" : `${userNickname}，早上好。☀️`}
            </h1>
            <p className="text-app-secondary text-sm">{formattedDate}</p>
          </div>
          
          {/* 添加晚间回顾按钮 - 只在晚间时间且非回顾模式下显示 */}
          {isNightTime && !isNightReview && hasAnyTasks && (
            <button 
              onClick={() => setIsNightReview(true)}
              className="px-3 py-1.5 text-xs bg-[#1e3a8a] text-white rounded-full flex items-center"
            >
              <Book size={14} className="mr-1" />
              晚间回顾
            </button>
          )} 
        </div>
        
        {/* 用户提示语 */}
        {hasAnyTasks && (
          <div className="px-4 mb-3">
            <p className="text-lg text-app">
              {`${userNickname}，接下来想做点什么呢？`}
            </p>
          </div>
        )}
        
        {/* 快速操作区 - 修改为传递控制参数 */}
        {hasAnyTasks && quickActionTask && (
          <>
            <QuickActionArea 
              task={quickActionTask} 
              isNightReview={isNightReview}
            />
            {/* "继续完成剩下事项"按钮 - 只在夜间回顾模式显示 */}
            {isNightReview && (
              <div className="flex justify-center mt-3">
                <button 
                  onClick={handleContinueTasks}
                  className="text-app-secondary text-sm bg-transparent"
                >
                  继续完成剩下事项
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 使用content-wrapper类包装滚动区域内容 */}
      <div className="content-wrapper">
        {/* 任务标签页和内容区域 */}
        <div className="px-[var(--spacing-page)] pt-4 flex flex-col page-main">
          {hasAnyTasks && !isNightReview && (
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
          
          {/* 根据标签显示任务 - 仅在非回顾模式下显示 */}
          {!isNightReview && (
            <div className="flex-grow">
              {renderTasksByTab()}
            </div>
          )}
          
          {/* 已完成任务 - 仅在非回顾模式下显示 */}
          {hasAnyTasks && !isNightReview && <CompletedTasks />}
          
          {/* 底部间距 - 确保内容不被导航栏遮挡 */}
          <div className="pb-safe"></div>
        </div>
      </div>
      
      {/* 悬浮工具栏 - 仅在有任务时显示 */}
      {hasAnyTasks && (
        <FloatingToolbar onAddTask={() => setIsAddTaskOpen(true)} />
      )}
      
      {/* 使用封装的任务添加抽屉组件 */}
      <TaskAddDrawer 
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />
    </div>
  );
};

export default HomePage; 
