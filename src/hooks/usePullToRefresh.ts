/**
 * 通用下拉刷新Hook，提供无感智能节流机制
 * 用户体验：始终显示刷新动画，但内部智能决策是否真正调用API
 */
import { useState, useEffect, useCallback } from 'react';

interface PullToRefreshState {
  isPulling: boolean;
  pullDistance: number;
  isRefreshing: boolean;
  startY: number;
}

interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  getCacheTimestamp: () => number;
  threshold?: number;
  containerSelector?: string;
  pageKey: string; // 用于区分不同页面的刷新记录
}

interface SmartRefreshDecision {
  useCache: boolean;        // 是否使用缓存数据
  callAPI: boolean;         // 是否调用API
  simulateDelay: number;    // 模拟刷新延迟（毫秒）
}

// 智能刷新决策算法
const makeSmartRefreshDecision = (
  lastRefreshTime: number,
  lastCacheTime: number,
  pageKey: string
): SmartRefreshDecision => {
  const now = Date.now();
  const timeSinceLastRefresh = now - lastRefreshTime;
  const timeSinceLastCache = now - lastCacheTime;
  
  // 检查最近是否有重要的数据变化（新增、删除、状态变更任务）
  const lastImportantUpdate = localStorage.getItem(`last-important-update-${pageKey}`);
  const timeSinceImportantUpdate = lastImportantUpdate ? 
    now - parseInt(lastImportantUpdate, 10) : Infinity;
  
  // 如果30秒内有重要数据变化，强制调用API
  if (timeSinceImportantUpdate < 30 * 1000) {
    console.log(`⚡ 检测到最近有重要数据变化（${Math.round(timeSinceImportantUpdate/1000)}s前），强制调用API`);
    return {
      useCache: false,
      callAPI: true,
      simulateDelay: 0
    };
  }
  
  // 30秒内：纯缓存，短延迟模拟
  if (timeSinceLastRefresh < 30 * 1000) {
    return {
      useCache: true,
      callAPI: false,
      simulateDelay: 800 // 模拟网络延迟
    };
  }
  
  // 5分钟内：缓存+长延迟模拟，给用户真实感
  if (timeSinceLastCache < 5 * 60 * 1000) {
    return {
      useCache: true,
      callAPI: false,
      simulateDelay: 1500 // 稍长的模拟延迟
    };
  }
  
  // 真正的API调用
  return {
    useCache: false,
    callAPI: true,
    simulateDelay: 0
  };
};

export const usePullToRefresh = (config: PullToRefreshConfig) => {
  const {
    onRefresh,
    getCacheTimestamp,
    threshold = 80,
    containerSelector = '.page-content',
    pageKey
  } = config;
  
  // 下拉刷新状态
  const [pullToRefreshState, setPullToRefreshState] = useState<PullToRefreshState>({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    startY: 0
  });
  
  // 获取上次刷新时间
  const getLastRefreshTime = useCallback(() => {
    const key = `last-refresh-${pageKey}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 0;
  }, [pageKey]);
  
  // 保存刷新时间
  const saveRefreshTime = useCallback((timestamp: number) => {
    const key = `last-refresh-${pageKey}`;
    localStorage.setItem(key, timestamp.toString());
  }, [pageKey]);
  
  // 智能刷新：对用户完全透明
  const handleSmartRefresh = useCallback(async () => {
    const lastRefreshTime = getLastRefreshTime();
    const lastCacheTime = getCacheTimestamp();
    
    const decision = makeSmartRefreshDecision(lastRefreshTime, lastCacheTime, pageKey);
    
    console.log(`🔄 ${pageKey}: 智能刷新决策`, {
      useCache: decision.useCache,
      callAPI: decision.callAPI,
      simulateDelay: decision.simulateDelay,
      timeSinceLastRefresh: `${Math.round((Date.now() - lastRefreshTime) / 1000)}s`,
      timeSinceLastCache: `${Math.round((Date.now() - lastCacheTime) / 1000)}s`
    });
    
    if (decision.useCache) {
      // 使用缓存但模拟刷新体验
      console.log(`💾 ${pageKey}: 使用缓存数据，模拟刷新延迟 ${decision.simulateDelay}ms`);
      
      // 模拟网络延迟，让用户感觉在刷新
      await new Promise(resolve => setTimeout(resolve, decision.simulateDelay));
      
      // 触发缓存刷新（如果有新数据会更新UI），但不强制API调用
      try {
        await onRefresh();
      } catch (error) {
        // 缓存刷新失败也不影响用户体验
        console.log(`📦 ${pageKey}: 缓存刷新完成`);
      }
    } else {
      // 真正的API刷新
      console.log(`📡 ${pageKey}: 执行真实API刷新`);
      const refreshStartTime = Date.now();
      
      await onRefresh();
      
      // 保存真实刷新时间
      saveRefreshTime(refreshStartTime);
    }
    
    console.log(`✅ ${pageKey}: 用户刷新体验完成`);
  }, [pageKey, getLastRefreshTime, getCacheTimestamp, onRefresh, saveRefreshTime]);
  
  // 状态文本：始终保持一致
  const getPullToRefreshStatusText = useCallback(() => {
    if (pullToRefreshState.isRefreshing) return '正在刷新...';
    if (pullToRefreshState.pullDistance >= threshold) return '松开刷新';
    if (pullToRefreshState.pullDistance > 0) return '下拉刷新';
    return '';
  }, [pullToRefreshState, threshold]);
  
  // 触摸事件处理
  useEffect(() => {
    const containerElement = document.querySelector(containerSelector);
    if (!containerElement) return;

    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      const target = touchEvent.target as HTMLElement;
      
      // 避免与任务卡片或其他交互元素冲突
      if (target.closest('[data-task-item]') || target.closest('[data-interactive]')) {
        return;
      }
      
      // 只有在页面顶部时才能触发下拉刷新
      if (window.scrollY === 0 && document.documentElement.scrollTop === 0) {
        setPullToRefreshState(prev => ({
          ...prev,
          isPulling: true,
          startY: touchEvent.touches[0].clientY,
          pullDistance: 0
        }));
      }
    };

    const handleTouchMove = (e: Event) => {
      const touchEvent = e as TouchEvent;
      
      if (!pullToRefreshState.isPulling || pullToRefreshState.isRefreshing) return;
      
      const target = touchEvent.target as HTMLElement;
      if (target.closest('[data-task-item]') || target.closest('[data-interactive]')) {
        return;
      }
      
      const currentY = touchEvent.touches[0].clientY;
      const deltaY = currentY - pullToRefreshState.startY;
      
      if (deltaY > 0) {
        e.preventDefault();
        const distance = Math.min(deltaY * 0.4, 100);
        setPullToRefreshState(prev => ({
          ...prev,
          pullDistance: distance
        }));
      }
    };

    const handleTouchEnd = async () => {
      if (!pullToRefreshState.isPulling) return;
      
      setPullToRefreshState(prev => ({ ...prev, isPulling: false }));
      
      if (pullToRefreshState.pullDistance >= threshold && !pullToRefreshState.isRefreshing) {
        setPullToRefreshState(prev => ({ ...prev, isRefreshing: true }));
        
        try {
          await handleSmartRefresh();
        } catch (error) {
          console.error(`❌ ${pageKey}: 刷新失败`, error);
        } finally {
          setPullToRefreshState(prev => ({ 
            ...prev, 
            isRefreshing: false, 
            pullDistance: 0 
          }));
        }
      } else {
        setPullToRefreshState(prev => ({ ...prev, pullDistance: 0 }));
      }
    };

    // 添加事件监听器，指定passive: false以允许preventDefault
    containerElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    containerElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    containerElement.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      containerElement.removeEventListener('touchstart', handleTouchStart);
      containerElement.removeEventListener('touchmove', handleTouchMove);
      containerElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    containerSelector, 
    pullToRefreshState.isPulling, 
    pullToRefreshState.isRefreshing, 
    pullToRefreshState.startY, 
    pullToRefreshState.pullDistance, 
    handleSmartRefresh, 
    threshold,
    pageKey
  ]);
  
  return {
    pullToRefreshState,
    getPullToRefreshStatusText
  };
}; 