/**
 * 下拉刷新指示器组件
 * 提供简洁一致的视觉反馈，对用户完全透明
 */
import React from 'react';

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  startY: number;
}

interface PullToRefreshIndicatorProps {
  pullState: PullToRefreshState;
  getStatusText: () => string;
  threshold?: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({ 
  pullState, 
  getStatusText, 
  threshold = 80 
}) => {
  // 只有在拉拽或刷新时才显示
  if (pullState.pullDistance === 0 && !pullState.isRefreshing) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-2 z-50 transition-all duration-200"
      style={{ 
        transform: `translateY(${pullState.pullDistance - 60}px)`,
        opacity: pullState.pullDistance / threshold
      }}
    >
      <div className="flex items-center space-x-2">
        {/* 刷新中的旋转动画 */}
        {pullState.isRefreshing && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
        <span className="text-sm">{getStatusText()}</span>
      </div>
    </div>
  );
};

export default PullToRefreshIndicator; 