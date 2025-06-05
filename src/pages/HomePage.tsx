import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Check, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';

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
  const { state, dispatch } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [exitX, setExitX] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  
  // 触摸相关状态
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

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

  // 处理滑动
  const handleSwipe = (dir: 'left' | 'right') => {
    if (recommendedTasks.length === 0) return;

    setDirection(dir);
    setExitX(dir === 'left' ? -100 : 100);

    const currentTask = recommendedTasks[currentIndex];
    if (!currentTask) return;

    setTimeout(() => {
      if (dir === 'left') {
        // 左滑跳过 - 从推荐列表移除
        setRecommendedTasks(prev => prev.filter((_, i) => i !== currentIndex));
      } else if (dir === 'right') {
        // 右滑开始专注 - 导航到专注模式
        navigate(`/focus/${currentTask.id}`);
        setRecommendedTasks(prev => prev.filter((_, i) => i !== currentIndex));
      }

      setDirection(null);
      
      // 重置索引
      if (currentIndex >= recommendedTasks.length - 1) {
        setCurrentIndex(0);
      }
    }, 300);
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
      
      // 如果当前显示的是已完成的事项，切换到下一个
      if (currentTask && currentTask.id === id) {
        if (currentIndex >= recommendedTasks.length - 2) {
          setCurrentIndex(0);
        }
      }
    }, 800); // 调整延迟时间
  };

  // 获取更多推荐
  const handleGetMoreRecommendations = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newRecommendations = getRecommendedTask(todayTasks);
      setRecommendedTasks(newRecommendations);
      setCurrentIndex(0);
      setIsLoading(false);
    }, 800);
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.targetTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      setIsDragging(true);
      setDragOffset(deltaX);
      e.preventDefault();
    }

    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;

    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        handleSwipe('right');
      } else {
        handleSwipe('left');
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  const safeIndex = Math.min(currentIndex, recommendedTasks.length - 1);
  const currentTask = recommendedTasks[safeIndex];

  return (
    <div className="page-content safe-area-top">
      {/* 头部区域 */}
      <div className="py-6">
        <div className="text-sm text-gray-500">
          {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
        </div>
        <h1 className="text-2xl font-bold mt-1 text-gray-900">{greeting}</h1>
      </div>

      {/* 决策区域 */}
      <div className="py-4">
        <h2 className="text-lg font-medium mb-4 text-gray-900">现在可以做什么？</h2>

        {recommendedTasks.length === 0 ? (
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
        ) : (
          <div className="relative h-[350px] flex items-center">
            {/* 左箭头 - 跳过 */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={() => handleSwipe('left')}
                className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90 transition-all flex items-center justify-center touch-target no-tap-highlight"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* 右箭头 - 开始专注 */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={() => handleSwipe('right')}
                className="h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white/90 transition-all flex items-center justify-center touch-target no-tap-highlight"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* 事项卡片 */}
            {currentTask && (
              <div
                className={`mx-auto p-6 bg-white rounded-lg shadow-md cursor-grab active:cursor-grabbing w-[85%] max-w-[85%] relative transition-all duration-300 ${
                  direction ? 'opacity-0' : ''
                } ${isDragging ? 'transition-none' : ''} no-select`}
                style={{
                  transform: isDragging 
                    ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)` 
                    : direction 
                    ? `translateX(${exitX}%)` 
                    : undefined
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => handleComplete(currentTask.id, e)}
                    className="rounded-full h-8 w-8 border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center touch-target no-tap-highlight"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-col h-full">
                  <div className="text-3xl mb-2">{currentTask.icon || '📌'}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{currentTask.title}</h3>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm border">
                      {currentTask.type || '未分类'}
                    </span>
                    {currentTask.category && (
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-sm border">
                        {currentTask.category}
                      </span>
                    )}
                  </div>

                  {currentTask.duration && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Clock className="h-4 w-4 mr-1" />
                      {currentTask.duration}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 mt-auto">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">推荐理由：</span>
                      {generateRecommendReason()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {recommendedTasks.length > 0 && (
          <div className="flex flex-col items-center mt-4">
            <div className="text-sm text-gray-500 mb-2">
              <span>← 跳过</span>
              <span className="mx-2">|</span>
              <span>开始 →</span>
            </div>
            <div className="flex justify-center">
              {recommendedTasks.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full mx-1 ${
                    i === safeIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
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
