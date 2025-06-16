import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Loader2, Grid3X3, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';
import { CardMode } from '../components/CardMode';
import { StickyNoteBoard } from '../components/StickyNoteBoard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

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

const HomePage = () => {
  const navigate = useNavigate();
  const { state, dispatch, isLoading, error, refreshTasks, isTestUser } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'card' | 'sticky'>('card');

  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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

  // 获取推荐事项（模拟AI推荐）- 返回3-5个推荐事项
  const getRecommendedTask = (tasks: Task[]): Task[] => {
    if (tasks.length === 0) return [];
    
    // 设置推荐数量：最少3个，最多5个，但不超过可用事项数量
    const recommendCount = Math.min(Math.max(3, Math.min(5, tasks.length)), tasks.length);
    
    // 创建推荐列表，按优先级和特征排序
    const recommendedList: Task[] = [];
    const usedTasks = new Set<string>();
    
    // 1. 优先推荐高优先级事项
    const highPriorityTasks = tasks.filter(task => 
      task.priority === 'high' && !usedTasks.has(task.id)
    );
    for (const task of highPriorityTasks.slice(0, 2)) {
      recommendedList.push(task);
      usedTasks.add(task.id);
      if (recommendedList.length >= recommendCount) break;
    }
    
    // 2. 推荐有具体时间的事项
    if (recommendedList.length < recommendCount) {
      const timedTasks = tasks.filter(task => 
        task.startTime && !task.isAnytime && !usedTasks.has(task.id)
      );
      for (const task of timedTasks.slice(0, 2)) {
        recommendedList.push(task);
        usedTasks.add(task.id);
        if (recommendedList.length >= recommendCount) break;
      }
    }
    
    // 3. 推荐中优先级事项
    if (recommendedList.length < recommendCount) {
      const mediumPriorityTasks = tasks.filter(task => 
        task.priority === 'medium' && !usedTasks.has(task.id)
      );
      for (const task of mediumPriorityTasks.slice(0, 2)) {
        recommendedList.push(task);
        usedTasks.add(task.id);
        if (recommendedList.length >= recommendCount) break;
      }
    }
    
    // 4. 填充剩余位置（随机选择或按创建顺序）
    if (recommendedList.length < recommendCount) {
      const remainingTasks = tasks.filter(task => !usedTasks.has(task.id));
      for (const task of remainingTasks.slice(0, recommendCount - recommendedList.length)) {
        recommendedList.push(task);
        usedTasks.add(task.id);
      }
    }
    
    return recommendedList;
  };

  // 获取今日事项和推荐事项的逻辑
  const todayTasks = state.tasks.filter(task => !task.completed);
  const initialRecommendedTasks = getRecommendedTask(todayTasks);

  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>(initialRecommendedTasks);

  // 处理卡片模式的滑动
  const handleCardSwipe = (dir: 'left' | 'right') => {
    if (recommendedTasks.length === 0) return;

    if (dir === 'left') {
      // 左滑跳过 - 从推荐列表移除
      const currentTask = recommendedTasks[0];
      if (currentTask) {
        setRecommendedTasks(prev => prev.filter(task => task.id !== currentTask.id));
      }
    } else if (dir === 'right') {
      // 右滑开始专注 - 导航到专注模式
      const currentTask = recommendedTasks[0];
      if (currentTask) {
        navigate(`/focus/${currentTask.id}`);
        setRecommendedTasks(prev => prev.filter(task => task.id !== currentTask.id));
      }
    }
  };

  // 处理完成事项
  const handleComplete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
    setTimeout(() => {
      dispatch({ type: 'COMPLETE_TASK', payload: id });
      
      // 从推荐列表中移除已完成的事项
      setRecommendedTasks(prev => prev.filter(task => task.id !== id));
    }, 800); // 调整延迟时间
  };

  // 获取更多推荐
  const handleGetMoreRecommendations = () => {
    const newRecommendations = getRecommendedTask(todayTasks);
    setRecommendedTasks(newRecommendations);
  };

  // 处理跳过（便利贴模式）
  const handleSkip = (id: string) => {
    setRecommendedTasks(prev => prev.filter(task => task.id !== id));
  };

  // 处理开始专注（便利贴模式）
  const handleFocus = (id: string) => {
    navigate(`/focus/${id}`);
    setRecommendedTasks(prev => prev.filter(task => task.id !== id));
  };

  // 处理创建新事项
  const handleCreateTask = () => {
    navigate('/new-task');
  };

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
            onRetry={refreshTasks}
            isLoading={isLoading}
          />
        ) : /* 空状态 */ todayTasks.length === 0 && !isLoading ? (
          <EmptyState onCreateTask={handleCreateTask} />
        ) : /* 推荐事项 */ recommendedTasks.length === 0 ? (
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
