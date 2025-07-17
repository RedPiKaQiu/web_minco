/**
 * 首页页面，导航栏点击首页显示，展示今日推荐任务和快速操作
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTaskCompletion } from '../hooks/useItemCompletion';
import { useHomePageTasks } from '../hooks/useItemData';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Loader2, Grid3X3, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { CardMode } from '../components/CardMode';
import { StickyNoteBoard } from '../components/StickyNoteBoard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import PullToRefreshIndicator from '../components/PullToRefreshIndicator';
import { adaptItemToTask, adaptRecommendationItemToTask } from '../utils/itemAdapters';

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
    refreshFromCache,
    recommendation
  } = useHomePageTasks();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [showFireworks, setShowFireworks] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'card' | 'sticky'>('card');

  // 🔧 调试功能：检查数据一致性
  const checkDataConsistency = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    console.log('🔍 数据一致性检查开始...');
    
    // 检查当前页面状态
    console.log('📊 当前页面状态:', {
      todayTasksCount: apiTodayTasks.length,
      recommendedTasksCount: apiRecommendedTasks.length,
      todayTaskIds: apiTodayTasks.map(t => t.id),
      isTestUser
    });
    
    // 检查缓存状态
    const cacheKey = `timeline-tasks-${today}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const cachedTasks = JSON.parse(cachedData);
        console.log('💾 缓存数据状态:', {
          cacheKey,
          cachedTasksCount: cachedTasks.length,
          cachedTaskIds: cachedTasks.map((t: any) => String(t.id)),
          cachedTaskTitles: cachedTasks.map((t: any) => String(t.title))
        });
        
        // 🔍 详细分析每个任务
        console.log('📋 任务详细分析:');
        cachedTasks.forEach((task: any, index: number) => {
          const taskDate = task.start_time ? task.start_time.split('T')[0] : 'null';
          const createdDate = task.created_at ? task.created_at.split('T')[0] : 'null';
          const updatedDate = task.updated_at ? task.updated_at.split('T')[0] : 'null';
          const titleLower = (task.title || '').toLowerCase();
          const isFutureTask = titleLower.includes('明天') || 
                             titleLower.includes('下周') || 
                             titleLower.includes('明日') ||
                             titleLower.includes('tomorrow') ||
                             titleLower.includes('next');
          
          const shouldBeFiltered = !task.start_time && 
                                 (isFutureTask || 
                                  (createdDate !== today && updatedDate !== today));
          
          console.log(`  ${index + 1}. "${task.title}":`, {
            taskDate,
            createdDate,
            updatedDate,
            isFutureTask,
            shouldBeFiltered: shouldBeFiltered ? '❌ 应被过滤' : '✅ 应保留',
            reason: shouldBeFiltered 
              ? (isFutureTask ? '标题暗示未来任务' : '非今日创建/更新的无日期任务')
              : (task.start_time ? '有明确今日时间' : '今日创建/更新的无日期任务')
          });
        });
        
        // 对比数据一致性
        const stateIds = new Set(apiTodayTasks.map(t => t.id));
        const cacheIds = new Set(cachedTasks.map((t: any) => t.id));
        const onlyInState = [...stateIds].filter(id => !cacheIds.has(id));
                 const onlyInCache = [...cacheIds].filter(id => !stateIds.has(String(id)));
        
        if (onlyInState.length > 0 || onlyInCache.length > 0) {
          console.warn('⚠️ 数据不一致发现:', {
            onlyInPageState: onlyInState,
            onlyInCache: onlyInCache
          });
        } else {
          console.log('✅ 页面状态与缓存数据一致');
        }
      } catch (error) {
        console.error('❌ 缓存数据解析失败:', error);
      }
    } else {
      console.log('❌ 今日缓存不存在');
    }
    
    // 检查所有缓存
    console.log('🗂️ 所有相关缓存:');
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('timeline-tasks-') || key.includes('recommendation')) {
        try {
          const data = sessionStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
              console.log(`📦 ${key}: ${parsed.length}个任务`);
            } else {
              console.log(`📦 ${key}:`, parsed);
            }
          }
        } catch (error) {
          console.error(`❌ ${key} 解析失败:`, error);
        }
      }
    });
  }, [apiTodayTasks, apiRecommendedTasks, isTestUser]);

  // 🛠️ 强制清理和重置功能
  const forceResetData = useCallback(async () => {
    console.log('🔄 强制重置数据...');
    
    // 清理所有相关缓存
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('timeline-tasks-') || 
          key.includes('cache') || 
          key.includes('recommendation')) {
        sessionStorage.removeItem(key);
        console.log('🗑️ 已清理:', key);
      }
    });
    
    // 强制重新加载数据
    try {
      await loadTodayTasks(true);
      console.log('✅ 数据重置完成');
    } catch (error) {
      console.error('❌ 数据重置失败:', error);
    }
  }, [loadTodayTasks]);

  // 开发环境下添加调试按钮（双击页面标题触发）
  const handleTitleDoubleClick = useCallback(() => {
    if (import.meta.env.DEV) {
      const choice = window.confirm('选择调试操作:\n确定 = 检查数据一致性\n取消 = 强制重置数据');
      if (choice) {
        checkDataConsistency();
      } else {
        forceResetData();
      }
    }
  }, [checkDataConsistency, forceResetData]);

  // 创建稳定的函数引用
  const loadTodayTasksRef = useRef(loadTodayTasks);
  const refreshFromCacheRef = useRef(refreshFromCache);
  
  // 更新ref中的函数引用
  loadTodayTasksRef.current = loadTodayTasks;
  refreshFromCacheRef.current = refreshFromCache;

  // 转换API数据为Task格式
  const todayTasks = apiTodayTasks.map(adaptItemToTask);
  const recommendedTasks = apiRecommendedTasks.map(adaptRecommendationItemToTask);
  
  // 获取缓存时间戳
  const getCacheTimestamp = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const metadata = sessionStorage.getItem('timeline-cache-metadata');
    if (metadata) {
      try {
        const parsed = JSON.parse(metadata);
        return parsed[today] || 0;
      } catch (error) {
        console.error('解析缓存元数据失败:', error);
        return 0;
      }
    }
    return 0;
  }, []);
  
  // 智能刷新处理：下拉刷新专用，总是强制重新获取最新数据和推荐
  const handleSmartRefresh = useCallback(async () => {
    console.log('🏠 HomePage: 开始下拉刷新，强制获取最新数据');
    
    try {
      // 清理今日任务和推荐缓存，确保获取最新数据
      const today = format(new Date(), 'yyyy-MM-dd');
      sessionStorage.removeItem(`timeline-tasks-${today}`);
      sessionStorage.removeItem('homepage-recommendations');
      
      // 强制重新加载今日任务和推荐
      await loadTodayTasks(true);
      
      console.log('✅ HomePage: 下拉刷新完成');
    } catch (error) {
      console.error('❌ HomePage: 下拉刷新失败', error);
      throw error;
    }
  }, [loadTodayTasks]);
  
  // 使用下拉刷新hook
  const { pullToRefreshState, getPullToRefreshStatusText } = usePullToRefresh({
    onRefresh: handleSmartRefresh,
    getCacheTimestamp,
    pageKey: 'homepage',
    containerSelector: '.page-content'
  });
  
  // 更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 页面加载时的数据获取策略（只在组件挂载时执行一次）
  useEffect(() => {
    // 创建稳定的函数引用，避免闭包问题
    const initializeData = async () => {
      console.log('🏠 HomePage: 组件挂载，初始化数据加载');
      
      // 检查是否需要清理缓存（用户刚登录）
      const needClearCache = localStorage.getItem('clearCacheOnNextLoad');
      if (needClearCache) {
        console.log('🧹 HomePage: 检测到需要清理缓存标记，清理旧缓存数据');
        // 清理可能的旧缓存数据，防止数据泄露
        sessionStorage.removeItem('timeline-cache-metadata');
        sessionStorage.removeItem('project-cache-metadata');
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('timeline-tasks-') || 
              key.startsWith('project-category-tasks-') || 
              key.includes('task') || 
              key.includes('item') || 
              key.includes('cache')) {
            sessionStorage.removeItem(key);
          }
        });
        // 移除标记，避免重复清理
        localStorage.removeItem('clearCacheOnNextLoad');
        console.log('✅ HomePage: 旧缓存清理完成，强制从后端加载');
        await loadTodayTasksRef.current(true); // 强制重新加载
      } else {
        console.log('🏠 HomePage: 正常页面访问，优先使用缓存');
        // 先尝试从缓存刷新，如果没有缓存再从后端加载
        try {
          const refreshed = await refreshFromCacheRef.current();
          if (!refreshed) {
            console.log('📡 HomePage: 缓存不可用，从后端加载');
            await loadTodayTasksRef.current();
          } else {
            console.log('✅ HomePage: 缓存数据加载完成');
          }
        } catch (error) {
          console.error('❌ HomePage: 缓存刷新失败，从后端加载', error);
          await loadTodayTasksRef.current();
        }
      }
    };

    initializeData();
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // 智能事件监听，大幅减少不必要的推荐接口调用
  useEffect(() => {
    let isHandling = false;
    let lastRefreshTime = 0;
    const REFRESH_THROTTLE = 5 * 60 * 1000; // 提升到5分钟节流
    let lastVisibilityState = document.visibilityState;

    const handleRefresh = async () => {
      const now = Date.now();
      
      // 更严格的节流控制
      if (isHandling || now - lastRefreshTime < REFRESH_THROTTLE) {
        console.log('🏠 HomePage: 刷新被节流，跳过（上次刷新：%ds前）', 
          Math.round((now - lastRefreshTime) / 1000));
        return;
      }
      
      isHandling = true;
      lastRefreshTime = now;
      
      try {
        // 只刷新任务缓存，推荐通过智能检测决定是否更新
        const refreshed = await refreshFromCacheRef.current();
        if (!refreshed) {
          console.log('📡 HomePage: 缓存不可用，重新加载任务');
          await loadTodayTasksRef.current();
        }
      } catch (error) {
        console.error('❌ HomePage: 智能刷新失败', error);
      } finally {
        isHandling = false;
      }
    };

    // 更智能的可见性监听
    const handleVisibilityChange = () => {
      const currentState = document.visibilityState;
      
      // 只在真正从隐藏变为可见时才处理
      if (lastVisibilityState === 'hidden' && currentState === 'visible') {
        console.log('🔄 HomePage: 页面变为可见（从隐藏状态）');
        handleRefresh();
      }
      
      lastVisibilityState = currentState;
    };

    // 任务缓存更新事件（降低频率）
    const handleTaskCacheUpdated = async (event: Event) => {
      const customEvent = event as CustomEvent;
      // 只处理来自其他页面的缓存更新
      if (customEvent.detail && customEvent.detail.source !== 'homepage') {
        console.log('📢 HomePage: 收到来自其他页面的任务更新事件', customEvent.detail);
        
        // 新增任务等重要操作应绕过节流机制，立即刷新
        const isImportantUpdate = customEvent.detail.action === 'add' || 
                                 customEvent.detail.action === 'delete' ||
                                 customEvent.detail.action === 'statusChange';
        
        if (isImportantUpdate) {
          console.log('🚀 重要数据变化，绕过节流立即刷新推荐');
          try {
            // 强制清除推荐缓存
            const { clearRecommendationCache } = await import('../utils/recommendationCache');
            clearRecommendationCache();
            
            // 立即刷新数据（绕过节流）
            const refreshed = await refreshFromCacheRef.current();
            if (!refreshed) {
              console.log('📡 HomePage: 缓存刷新失败，重新加载');
              await loadTodayTasksRef.current();
            }
          } catch (error) {
            console.error('❌ HomePage: 立即刷新失败', error);
          }
        } else {
          // 其他非重要更新仍使用节流机制
          handleRefresh();
        }
      }
    };

    // 移除focus监听，只保留visibility监听
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('taskCacheUpdated', handleTaskCacheUpdated as EventListener);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('taskCacheUpdated', handleTaskCacheUpdated as EventListener);
    };
  }, []); // 空依赖数组，避免重复创建监听器

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
        setApiRecommendedTasks(prev => {
          const newList = prev.filter(task => task.id !== id);
          
          // 如果推荐列表变少，智能补充
          if (newList.length <= 1 && todayTasks.length > 0) {
            console.log('📋 推荐数量不足，智能补充新推荐');
            // 清除推荐缓存，确保获取新推荐
            recommendation.clearCache();
            // 触发异步补充推荐
            setTimeout(async () => {
              try {
                const newRecommendations = await getMoreRecommendations();
                setApiRecommendedTasks(newRecommendations);
              } catch (error) {
                console.error('智能补充推荐失败:', error);
              }
            }, 100);
          }
          
          return newList;
        });
        
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
      // 替换当前推荐而不是累加，避免重复key问题
      setApiRecommendedTasks(newRecommendations);
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
    <>
      {/* 下拉刷新指示器 */}
      <PullToRefreshIndicator 
        pullState={pullToRefreshState}
        getStatusText={getPullToRefreshStatusText}
        threshold={80}
      />
      
      <div 
        className="page-content safe-area-top"
        style={{
          transform: `translateY(${pullToRefreshState.pullDistance}px)`,
          transition: pullToRefreshState.isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {/* 头部区域 */}
        <div className="py-6">
          <div className="text-sm text-gray-500">
            {format(currentTime, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
          </div>
          <h1 
            className="text-2xl font-bold mt-1 text-gray-900" 
            onDoubleClick={handleTitleDoubleClick}
            style={{ userSelect: 'none' }}
          >
            {greeting}
          </h1>
          {isTestUser && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              🧪 测试用户模式
            </div>
          )}
        </div>

      {/* 决策区域 */}
      <div className="py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium text-gray-900">现在可以做什么？</h2>
            {/* 推荐方法指示器 - 仅显示当前方法 */}
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <span className={`px-2 py-1 rounded ${
                recommendation.currentMethod === 'ai' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {recommendation.currentMethod === 'ai' ? '🤖 AI智能推荐' : '💻 本地推荐'}
              </span>
            </div>
          </div>
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
        ) : /* 推荐事项为空时的状态 */ recommendedTasks.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            {/* 显示推荐服务返回的具体消息 */}
            <div className="text-2xl mb-2">
              {todayTasks.length === 0 ? '🌸' : '🎉'}
            </div>
            <p className="text-gray-600 mb-4 text-lg font-medium">
              {recommendation.lastResult?.message || 
               (todayTasks.length === 0 
                 ? '今日暂无事项，享受这难得的悠闲时光吧！' 
                 : '太棒了！所有事项都已完成，今天真是高效的一天！')}
            </p>
            <button
              onClick={handleGetMoreRecommendations}
              disabled={isLoading || todayTasks.length === 0}
              className={`px-4 py-2 rounded-lg flex items-center touch-target ${
                todayTasks.length === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在思考...
                </>
              ) : todayTasks.length === 0 ? (
                '暂无事项可推荐'
              ) : (
                '重新获取推荐'
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
    </>
  );
};

export default HomePage; 
