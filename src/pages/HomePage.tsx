import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Check, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [exitX, setExitX] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
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
      '现在是完成这个任务的好时机',
      '这个任务优先级较高',
      '完成这个任务会让你感觉很棒',
      '这个任务不会花费太多时间',
      '现在精力充沛，适合处理这个任务'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  // 获取推荐任务（模拟AI推荐）
  const getRecommendedTasks = () => {
    const incompleteTasks = state.tasks.filter(task => !task.completed);
    const shuffled = [...incompleteTasks].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 3) + 3; // 3-5个推荐
    return shuffled.slice(0, Math.min(count, incompleteTasks.length)).map(task => ({
      ...task,
      recommendReason: generateRecommendReason()
    }));
  };

  const [recommendedTasks, setRecommendedTasks] = useState(getRecommendedTasks());

  // 处理滑动
  const handleSwipe = (dir: 'left' | 'right') => {
    if (recommendedTasks.length === 0) return;

    setDirection(dir);
    setExitX(dir === 'left' ? -100 : 100);

    const currentTask = recommendedTasks[currentIndex];

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

  // 处理完成任务
  const handleComplete = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // 烟花特效
    const button = e?.currentTarget as HTMLElement;
    if (button) {
      for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#E040FB'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        particle.className = 'absolute rounded-full';
        particle.style.backgroundColor = color;
        particle.style.width = `${2 + Math.random() * 3}px`;
        particle.style.height = `${2 + Math.random() * 3}px`;
        button.appendChild(particle);

        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        particle.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${x}px, ${y}px) scale(0)`, opacity: 0 }
        ], {
          duration: 800 + Math.random() * 700,
          easing: 'cubic-bezier(0, .9, .57, 1)'
        });

        setTimeout(() => particle.remove(), 1500);
      }
    }

    // 完成任务
    dispatch({ type: 'COMPLETE_TASK', payload: id });
    
    // 从推荐列表移除
    setRecommendedTasks(prev => prev.filter((_, i) => i !== currentIndex));
    
    if (currentIndex >= recommendedTasks.length - 1) {
      setCurrentIndex(0);
    }
  };

  // 获取更多推荐
  const handleGetMoreRecommendations = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const newRecommendations = getRecommendedTasks();
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

            {/* 任务卡片 */}
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
                      {currentTask.recommendReason}
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
    </div>
  );
};

export default HomePage; 
