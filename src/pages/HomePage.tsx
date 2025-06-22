import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTaskCompletion } from '../hooks/useTaskCompletion';
import { useHomePageTasks } from '../hooks/useTaskData';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Loader2, Grid3X3, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task, Item, TaskCategory } from '../types';
import { CardMode } from '../components/CardMode';
import { StickyNoteBoard } from '../components/StickyNoteBoard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { formatBeijingTimeToLocal } from '../utils/timezone';

// 烟花特效组件
const Fireworks = ({ 
  show, 
  onComplete, 
  clickPosition 
}: { 
  show: boolean; 
  onComplete: () => void; 
  clickPosition?: { x: number; y: number } 
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 1500); // 缩短时间确保状态及时重置
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  const centerX = clickPosition?.x || window.innerWidth / 2;
  const centerY = clickPosition?.y || window.innerHeight / 2;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        const distance = 80 + Math.random() * 60;
        const finalX = centerX + Math.cos(angle) * distance;
        const finalY = centerY + Math.sin(angle) * distance;
        
        const colors = [
          '#FF1744', '#E91E63', '#9C27B0', '#673AB7',
          '#3F51B5', '#2196F3', '#03DAC6', '#00BCD4',
          '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
          '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={`${show}-${i}`} // 使用show状态作为key的一部分，确保重新渲染
            className="firework-line"
            style={{
              left: `${centerX}px`,
              top: `${centerY}px`,
              '--final-x': `${finalX - centerX}px`,
              '--final-y': `${finalY - centerY}px`,
              '--color': color,
              animationDelay: `${Math.random() * 0.3}s`,
            } as React.CSSProperties}
          />
        );
      })}
      
      {/* 中心爆炸效果 */}
      <div
        key={`center-${show}`} // 确保重新渲染
        className="firework-center"
        style={{
          left: `${centerX}px`,
          top: `${centerY}px`,
        }}
      />
    </div>
  );
};

// API Item 到 Task 的转换函数
const convertApiItemToTask = (apiItem: Item): Task => {
  return {
    id: apiItem.id,
    title: apiItem.title,
    completed: apiItem.status_id === 3, // 3表示已完成
    dueDate: apiItem.start_time ? apiItem.start_time.split('T')[0] : undefined,
    // 将北京时间转换为本地时间显示
    startTime: apiItem.start_time ? formatBeijingTimeToLocal(apiItem.start_time) : undefined,
    endTime: apiItem.end_time ? formatBeijingTimeToLocal(apiItem.end_time) : undefined,
    priority: (apiItem.priority >= 4 ? 'high' : apiItem.priority >= 3 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
    // 正确映射TaskCategory枚举
    category: apiItem.category_id === 1 ? TaskCategory.LIFE : 
              apiItem.category_id === 2 ? TaskCategory.HEALTH :
              apiItem.category_id === 3 ? TaskCategory.WORK :
              apiItem.category_id === 4 ? TaskCategory.STUDY :
              apiItem.category_id === 5 ? TaskCategory.RELAX :
              apiItem.category_id === 6 ? TaskCategory.EXPLORE : undefined,
    isAnytime: !apiItem.start_time,
    icon: apiItem.emoji,
    duration: apiItem.estimated_duration ? `${apiItem.estimated_duration}分钟` : undefined
  };
};

const HomePage = () => {
  const navigate = useNavigate();
  const { isTestUser } = useAppContext();
  const { toggleTaskCompletion } = useTaskCompletion();
  
  // 使用新的首页数据hook
  const {
    todayTasks: apiTodayTasks,
    recommendedTasks: apiRecommendedTasks,
    isLoading: homePageLoading,
    error: homePageError,
    loadTodayTasks,
    getMoreRecommendations,
    setRecommendedTasks: setApiRecommendedTasks,
    refreshFromCache
  } = useHomePageTasks();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'card' | 'sticky'>('card');

  // 转换API数据为Task格式
  const todayTasks = apiTodayTasks.map(convertApiItemToTask);
  const recommendedTasks = apiRecommendedTasks.map(convertApiItemToTask);
  
  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 页面加载时优先尝试从缓存加载，否则获取今日任务
  useEffect(() => {
    console.log('🏠 HomePage: useEffect触发，检查状态', { isTestUser });
    
    // 首先尝试从缓存刷新数据
    console.log('🏠 HomePage: 优先尝试从缓存加载数据');
    const refreshed = refreshFromCache();
    if (!refreshed) {
      // 如果缓存不可用，则调用loadTodayTasks
      console.log('🏠 HomePage: 缓存不可用，开始加载今日任务');
      loadTodayTasks();
    } else {
      console.log('✅ HomePage: 使用缓存数据初始化页面');
    }
  }, [loadTodayTasks, refreshFromCache]); // 依赖loadTodayTasks和refreshFromCache

  // 监听页面焦点，返回页面时尝试从缓存刷新数据
  useEffect(() => {
    const handleFocus = () => {
      console.log('👁️ HomePage: 页面重新获得焦点，尝试刷新缓存');
      const refreshed = refreshFromCache();
      if (!refreshed) {
        console.log('📡 HomePage: 缓存刷新失败，重新加载数据');
        loadTodayTasks();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 HomePage: 页面变为可见，尝试刷新缓存');
        const refreshed = refreshFromCache();
        if (!refreshed) {
          console.log('📡 HomePage: 缓存刷新失败，重新加载数据');
          loadTodayTasks();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshFromCache, loadTodayTasks]);

  // 设置问候语
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('早上好！准备开始美好的一天吧 ☀️');
    } else if (hour >= 12 && hour < 14) {
      setGreeting('中午好！记得吃午饭哦 🍲');
    } else if (hour >= 14 && hour < 18) {
      setGreeting('下午好！来杯咖啡提提神？ ☕');
    } else if (hour >= 18 && hour < 22) {
      setGreeting('晚上好！今天过得怎么样？ 🌙');
    } else {
      setGreeting('夜深了，注意休息哦 💤');
    }
  }, [currentTime]);

  // 生成推荐理由
  const generateRecommendReason = () => {
    const reasons = [
      '现在是完成这个事项的好时机',
      '这个事项优先级较高',
      '完成这个事项会让你感觉很棒',
      '这个事项不会花费太多时间',
      '现在精力充沛，适合处理这个事项'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  // 处理卡片模式的滑动
  const handleCardSwipe = (dir: 'left' | 'right') => {
    if (recommendedTasks.length === 0) return;

    if (dir === 'left') {
      // 左滑跳过 - 从推荐列表移除
      const currentTask = recommendedTasks[0];
      if (currentTask) {
        // 从API数据中移除
        setApiRecommendedTasks(prev => prev.filter(task => task.id !== currentTask.id));
      }
    } else if (dir === 'right') {
      // 右滑开始专注 - 导航到专注模式
      const currentTask = recommendedTasks[0];
      if (currentTask) {
        navigate(`/focus/${currentTask.id}`);
        setApiRecommendedTasks(prev => prev.filter(task => task.id !== currentTask.id));
      }
    }
  };

  // 处理完成事项
  const handleComplete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    console.log('🏠 HomePage: handleComplete 被调用', { id });
    
    // 获取当前任务的完成状态
    const currentTask = todayTasks.find(task => task.id === id) || recommendedTasks.find(task => task.id === id);
    if (!currentTask) {
      console.error('❌ HomePage: 未找到任务', { id });
      return;
    }
    
    // 获取点击位置
    const clickX = e.clientX;
    const clickY = e.clientY;
    
    // 先确保烟花状态被重置
    setShowFireworks(false);
    
    // 使用setTimeout确保状态重置后再设置新状态
    setTimeout(() => {
      setClickPosition({ x: clickX, y: clickY });
      setShowFireworks(true);
    }, 10);
    
    // 延迟完成事项，让用户看到烟花效果
    setTimeout(async () => {
      try {
        // 使用useTaskCompletion hook调用API
        await toggleTaskCompletion(id, currentTask.completed);
        
        // 从推荐列表中移除已完成的事项
        setApiRecommendedTasks(prev => prev.filter(task => task.id !== id));
        
        // 不再重新加载今日任务，避免重复API调用
        // 任务状态已通过toggleTaskCompletion更新，推荐列表已通过setApiRecommendedTasks更新
        console.log('✅ HomePage: 任务完成状态更新成功');
      } catch (error) {
        console.error('❌ HomePage: 更新任务完成状态失败', error);
        // 只有在API调用失败时才重新加载以恢复状态
        console.log('🔄 API调用失败，重新加载今日任务');
        await loadTodayTasks();
      }
    }, 800); // 调整延迟时间
  };

  // 获取更多推荐
  const handleGetMoreRecommendations = async () => {
    try {
      const newRecommendations = await getMoreRecommendations();
      setApiRecommendedTasks(prev => [...prev, ...newRecommendations]);
    } catch (error) {
      console.error('获取更多推荐失败:', error);
    }
  };

  // 处理跳过（便利贴模式）
  const handleSkip = (id: string) => {
    setApiRecommendedTasks(prev => prev.filter(task => task.id !== id));
  };

  // 处理开始专注（便利贴模式）
  const handleFocus = (id: string) => {
    navigate(`/focus/${id}`);
    setApiRecommendedTasks(prev => prev.filter(task => task.id !== id));
  };

  // 处理创建新事项
  const handleCreateTask = () => {
    navigate('/new-task');
  };

  // 使用新的loading和error状态
  const isLoading = homePageLoading;
  const error = homePageError;

  return (
    <div className="page-content safe-area-top">
      {/* 头部区域 */}
      <div className="py-6">
        <div className="text-sm text-gray-500">
          {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
        </div>
        <h1 className="text-2xl font-bold mt-1 text-gray-900">{greeting}</h1>
        {isTestUser && (
          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            🧪 测试用户模式
          </div>
        )}
      </div>

      {/* 决策区域 */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">现在可以做什么？</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('card')}
              className={`h-8 w-8 p-0 rounded flex items-center justify-center touch-target ${
                viewMode === 'card' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Layers className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('sticky')}
              className={`h-8 w-8 p-0 rounded flex items-center justify-center touch-target ${
                viewMode === 'sticky' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 错误状态 */}
        {error ? (
          <ErrorState 
            error={error} 
            onRetry={loadTodayTasks}
            isLoading={isLoading}
          />
        ) : /* 空状态 */ todayTasks.length === 0 && !isLoading ? (
          <EmptyState onCreateTask={handleCreateTask} />
        ) : /* 推荐事项 */ recommendedTasks.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-500 mb-4">目前没有推荐的事项</p>
            <button
              onClick={handleGetMoreRecommendations}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-blue-300 flex items-center touch-target"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在思考...
                </>
              ) : (
                '再给点推荐'
              )}
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">正在加载今日任务...</p>
          </div>
        ) : viewMode === 'sticky' ? (
          <StickyNoteBoard
            tasks={recommendedTasks}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onFocus={handleFocus}
            onGetMore={handleGetMoreRecommendations}
            isLoading={isLoading}
          />
        ) : (
          <CardMode
            tasks={recommendedTasks}
            onComplete={handleComplete}
            onSwipe={handleCardSwipe}
            generateRecommendReason={generateRecommendReason}
          />
        )}
      </div>

      {showFireworks && (
        <Fireworks
          show={showFireworks}
          onComplete={() => setShowFireworks(false)}
          clickPosition={clickPosition}
        />
      )}
    </div>
  );
};

export default HomePage; 
