/**
 * 卡片模式组件，以卡片形式展示推荐任务，支持左右滑动操作
 */
import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Task } from '../types';
import { getItemIcon } from '../utils/taskIcons';

interface CardModeProps {
  tasks: Task[];
  onComplete: (id: string, e: React.MouseEvent) => void;
  onSwipe: (direction: 'left' | 'right') => void;
  generateRecommendReason: () => string;
}

export const CardMode = ({ tasks, onComplete, onSwipe, generateRecommendReason }: CardModeProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [exitX, setExitX] = useState(0);
  
  // 触摸相关状态
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  // 处理滑动
  const handleSwipe = (dir: 'left' | 'right') => {
    if (tasks.length === 0) return;

    setDirection(dir);
    setExitX(dir === 'left' ? -100 : 100);

    setTimeout(() => {
      onSwipe(dir);
      setDirection(null);
      
      // 重置索引
      if (currentIndex >= tasks.length - 1) {
        setCurrentIndex(0);
      }
    }, 300);
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

  const safeIndex = Math.min(currentIndex, tasks.length - 1);
  const currentItem = tasks[safeIndex];

  if (!currentItem) return null;

  return (
    <>
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
              onClick={(e) => onComplete(currentItem.id, e)}
              className="rounded-full h-8 w-8 border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center touch-target no-tap-highlight"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col h-full">
            <div className="text-3xl mb-2">{getItemIcon(currentItem)}</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">{currentItem.title}</h3>

            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-gray-100 rounded-full text-sm border">
                {currentItem.category || '未分类'}
              </span>
            </div>

            {currentItem.duration && (
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Clock className="h-4 w-4 mr-1" />
                {currentItem.duration}
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
      </div>

      {/* 指示器和提示 */}
      <div className="flex flex-col items-center mt-4">
        <div className="text-sm text-gray-500 mb-2">
          <span>← 跳过</span>
          <span className="mx-2">|</span>
          <span>开始 →</span>
        </div>
        <div className="flex justify-center">
          {tasks.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-1.5 rounded-full mx-1 ${
                i === safeIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}; 