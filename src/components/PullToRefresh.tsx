/**
 * 通用下拉刷新组件，支持触摸手势和loading状态显示
 */
import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, className = '' }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  
  const PULL_THRESHOLD = 80; // 触发刷新的最小距离
  const MAX_PULL_DISTANCE = 120; // 最大拉取距离

  // 检查是否可以下拉（页面在顶部）
  const canPull = (): boolean => {
    if (window.scrollY > 0) return false;
    if (document.documentElement.scrollTop > 0) return false;
    return true;
  };

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canPull()) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || !canPull() || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    
    // 只处理向下拉的情况
    if (deltaY > 0) {
      e.preventDefault(); // 阻止默认的滚动行为
      const distance = Math.min(deltaY * 0.5, MAX_PULL_DISTANCE);
      setPullDistance(distance);
    }
  };

  // 触摸结束
  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    // 如果拉取距离超过阈值，触发刷新
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('刷新失败:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    // 重置拉取距离
    setPullDistance(0);
  };

  // 计算刷新指示器的状态
  const getRefreshIndicatorState = () => {
    if (isRefreshing) {
      return {
        text: '正在刷新...',
        showSpinner: true
      };
    } else if (pullDistance >= PULL_THRESHOLD) {
      return {
        text: '松开刷新',
        showSpinner: false
      };
    } else if (pullDistance > 0) {
      return {
        text: '下拉刷新',
        showSpinner: false
      };
    } else {
      return {
        text: '下拉刷新',
        showSpinner: false
      };
    }
  };

  const indicatorState = getRefreshIndicatorState();

  return (
    <>
      {/* 刷新指示器 - 固定在顶部，只在需要时显示 */}
      {(pullDistance > 0 || isRefreshing) && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-4 bg-white border-b border-gray-200"
          style={{
            opacity: pullDistance > 0 ? Math.min(pullDistance / PULL_THRESHOLD, 1) : 1,
            transition: isPulling ? 'none' : 'opacity 0.3s ease-out'
          }}
        >
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="relative">
              <RotateCcw 
                className={`h-4 w-4 ${indicatorState.showSpinner ? 'animate-spin' : ''}`}
                style={{
                  transform: !indicatorState.showSpinner ? `rotate(${pullDistance * 2}deg)` : 'none'
                }}
              />
            </div>
            <span className="text-sm font-medium">{indicatorState.text}</span>
          </div>
        </div>
      )}

      {/* 内容区域 - 完全独立的容器 */}
      <div 
        ref={containerRef}
        className={className}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateY(${Math.min(pullDistance, MAX_PULL_DISTANCE)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
          paddingTop: (pullDistance > 0 || isRefreshing) ? '60px' : '0px'
        }}
      >
        {children}
      </div>
    </>
  );
};

export default PullToRefresh; 