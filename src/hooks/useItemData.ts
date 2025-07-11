/**
 * 任务数据管理Hook集合，提供首页、时间轴、项目页面的数据加载和缓存功能
 */
import { useState, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { 
  getTodayTasks, 
  getTasksByDate,
  getWeekTasks,
  getProjectTasks,
  getProjectProgress,
  getUnassignedCategoryTasks,
  TaskFilterBuilder,
  TaskFilters
} from '../api/items';
import { Item } from '../types';
import { useAppContext } from '../context/AppContext';
import { localDateToBeijingString } from '../utils/timezone';
import { ApiError } from '../api/index';

/**
 * 前端推荐算法 - 从今日任务中筛选推荐
 * 三层降级策略：
 * 1. 策略1: 优先推荐高优先级任务（≥4）
 * 2. 策略2: 推荐中等优先级任务（=3）
 * 3. 策略3: 推荐所有剩余任务，有时间的优先
 */
const generateRecommendationsFromTasks = (allTasks: Item[]): Item[] => {
  console.log('🧠 generateRecommendationsFromTasks: 开始生成推荐', { 
    totalTasks: allTasks.length 
  });
  
  // 只筛选未完成的任务
  const incompleteTasks = allTasks.filter(task => task.status_id !== 3);
  console.log('📋 未完成任务数量:', incompleteTasks.length);
  
  if (incompleteTasks.length === 0) {
    console.log('✅ 所有任务都已完成，无推荐');
    return [];
  }
  
  // 策略1: 高优先级任务（≥4）
  const highPriorityTasks = incompleteTasks.filter(task => task.priority >= 4);
  if (highPriorityTasks.length > 0) {
    console.log('🔥 策略1: 找到高优先级任务', { count: highPriorityTasks.length });
    return highPriorityTasks
      .sort((a, b) => b.priority - a.priority) // 按优先级降序排列
      .slice(0, 5); // 最多返回5个
  }
  
  // 策略2: 中等优先级任务（=3）
  const mediumPriorityTasks = incompleteTasks.filter(task => task.priority === 3);
  if (mediumPriorityTasks.length > 0) {
    console.log('⭐ 策略2: 找到中等优先级任务', { count: mediumPriorityTasks.length });
    // 优先推荐有时间安排的任务
    const withTime = mediumPriorityTasks.filter(task => task.start_time);
    const withoutTime = mediumPriorityTasks.filter(task => !task.start_time);
    return [...withTime, ...withoutTime].slice(0, 5);
  }
  
  // 策略3: 所有剩余任务，有时间的优先
  console.log('📅 策略3: 推荐所有剩余任务', { count: incompleteTasks.length });
  const withTime = incompleteTasks.filter(task => task.start_time);
  const withoutTime = incompleteTasks.filter(task => !task.start_time);
  
  return [...withTime, ...withoutTime].slice(0, 5);
};

// 首页数据hook
export const useHomePageTasks = () => {
  const { isTestUser } = useAppContext();
  const [todayTasks, setTodayTasks] = useState<Item[]>([]);
  const [recommendedTasks, setRecommendedTasks] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 使用与时间轴页面相同的缓存配置
  const TASK_CACHE_PREFIX = 'timeline-tasks-';
  const CACHE_METADATA_KEY = 'timeline-cache-metadata';
  
  // 使用 useRef 追踪加载状态，避免依赖循环
  const isLoadingRef = useRef(false);
  const isTestUserRef = useRef(isTestUser);
  
  // 更新 ref 值
  isTestUserRef.current = isTestUser;

  // 获取缓存元数据
  const getCacheMetadata = useCallback(() => {
    try {
      const metadata = sessionStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      console.error('读取缓存元数据失败:', error);
      return {};
    }
  }, []);

  // 检查今日任务缓存
  const checkTodayCache = useCallback((): Item[] | null => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      const metadata = getCacheMetadata();
      const cacheTimestamp = metadata[today];
      
      if (!cacheTimestamp) {
        console.log('📦 useHomePageTasks: 未找到今日缓存');
        return null;
      }

      const age = Date.now() - cacheTimestamp;
      // 今日数据永不过期
      
      const cachedData = sessionStorage.getItem(TASK_CACHE_PREFIX + today);
      if (cachedData) {
        const tasks = JSON.parse(cachedData) as Item[];
        console.log('📦 useHomePageTasks: 使用今日缓存数据', { 
          taskCount: tasks.length,
          cacheAge: Math.round(age / 1000) + 's'
        });
        return tasks;
      }
    } catch (error) {
      console.error('读取今日缓存失败:', error);
    }
    
    return null;
  }, [getCacheMetadata]);

  // 缓存今日任务数据
  const cacheTodayTasks = useCallback((tasks: Item[]) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const timestamp = Date.now();
    
    try {
      // 缓存任务数据（与时间轴页面使用相同的缓存格式）
      sessionStorage.setItem(TASK_CACHE_PREFIX + today, JSON.stringify(tasks));
      
      // 更新缓存元数据
      const metadata = getCacheMetadata();
      metadata[today] = timestamp;
      sessionStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
      
      console.log('💾 useHomePageTasks: 缓存今日任务数据', { 
        taskCount: tasks.length
      });
    } catch (error) {
      console.error('缓存今日任务失败:', error);
    }
  }, [getCacheMetadata]);

  const loadTodayTasks = useCallback(async (forceReload: boolean = false) => {
    const currentIsTestUser = isTestUserRef.current;
    
    // 防止重复调用
    if (isLoadingRef.current) {
      console.log('⏳ useHomePageTasks: 正在加载中，跳过重复调用');
      return;
    }

    console.log('🏠 useHomePageTasks: 开始加载数据', { isTestUser: currentIsTestUser, forceReload });
    
    // 如果不是强制重新加载，先检查缓存
    if (!forceReload) {
      const cachedTasks = checkTodayCache();
      if (cachedTasks) {
        setTodayTasks(cachedTasks);
        const recommendations = generateRecommendationsFromTasks(cachedTasks);
        setRecommendedTasks(recommendations);
        console.log('📦 useHomePageTasks: 使用今日缓存数据', { 
          taskCount: cachedTasks.length 
        });
        return;
      }
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);

    // 检查是否为测试用户
    if (currentIsTestUser) {
      console.log('🧪 useHomePageTasks: 检测到测试用户，使用mock数据');
      
      try {
        // 使用mock数据
        const { mockGetItems } = await import('../api/mock');
        const mockResponse = await mockGetItems({
          date: new Date().toISOString().split('T')[0],
          is_completed: false,
          sort_by: 'priority',
          order: 'desc',
          limit: 50
        });
        
        const tasks = mockResponse.items || [];
        console.log('📅 获取到mock今日任务:', { count: tasks.length });
        setTodayTasks(tasks);
        
        // 缓存mock数据
        cacheTodayTasks(tasks);
        
        // 从今日任务中生成推荐
        const recommendations = generateRecommendationsFromTasks(tasks);
        console.log('🎯 生成推荐任务:', { count: recommendations.length });
        setRecommendedTasks(recommendations);
        
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : '获取mock数据失败';
        setError(errorMessage);
        console.error('❌ 获取mock数据失败:', err);
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
      return;
    }
    
    setError(null);
    
    try {
      console.log('🏠 useHomePageTasks: 开始从后端加载今日任务');
      
      // 只获取今日任务
      const todayResponse = await getTodayTasks();
      const tasks = todayResponse.items || [];
      
      console.log('📅 获取到今日任务:', { count: tasks.length });
      setTodayTasks(tasks);
      
      // 缓存今日任务数据供时间轴页面使用
      cacheTodayTasks(tasks);
      
      // 从今日任务中生成推荐
      const recommendations = generateRecommendationsFromTasks(tasks);
      console.log('🎯 生成推荐任务:', { count: recommendations.length });
      setRecommendedTasks(recommendations);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取今日任务失败';
      setError(errorMessage);
      console.error('❌ 获取首页任务失败:', err);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [checkTodayCache, cacheTodayTasks]); // 依赖缓存相关函数

  // 获取更多推荐任务
  const getMoreRecommendations = useCallback(async () => {
    try {
      console.log('🔄 刷新推荐任务');
      
      // 重新从今日任务中生成推荐
      const newRecommendations = generateRecommendationsFromTasks(todayTasks);
      console.log('🎯 刷新后的推荐:', { count: newRecommendations.length });
      
      return newRecommendations;
    } catch (err: unknown) {
      console.error('❌ 获取更多推荐失败:', err);
      return [];
    }
  }, [todayTasks]); // 依赖todayTasks，当今日任务变化时重新生成推荐

  // 强制刷新缓存数据到状态
  const refreshFromCache = useCallback(() => {
    try {
      const cachedTasks = checkTodayCache();
      if (cachedTasks) {
        setTodayTasks(cachedTasks);
        const recommendations = generateRecommendationsFromTasks(cachedTasks);
        setRecommendedTasks(recommendations);
        console.log('🔄 useHomePageTasks: 从缓存刷新今日任务', { 
          taskCount: cachedTasks.length 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('从缓存刷新失败:', error);
      return false;
    }
  }, [checkTodayCache]);

  // 在认证失败时清理所有缓存
  const handleAuthError = useCallback(() => {
    // 清理timeline缓存
    sessionStorage.removeItem('timeline-cache-metadata');
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('timeline-tasks-')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  return {
    todayTasks,
    recommendedTasks,
    isLoading,
    error,
    loadTodayTasks,
    getMoreRecommendations,
    setRecommendedTasks,
    refreshFromCache,
    handleAuthError
  };
};

// 时间轴页面数据hook
export const useTimelineTasks = () => {
  // 使用 useMemo 确保初始日期只创建一次
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [allTasks, setAllTasks] = useState<Item[]>([]);
  const [weekTasks, setWeekTasks] = useState<Record<string, Item[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 全局任务数据缓存配置
  const TASK_CACHE_PREFIX = 'timeline-tasks-';
  const CACHE_METADATA_KEY = 'timeline-cache-metadata';
  const MAX_CACHE_ENTRIES = 20;
  const CACHE_EXPIRE_TIME = 30 * 60 * 1000; // 30分钟过期
  
  // 使用 useRef 追踪已加载的日期，避免重复调用
  const loadedDateRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  // 从所有任务中分离未完成和已完成任务
  const incompleteTasks = allTasks.filter(task => task.status_id !== 3);
  const completedTasks = allTasks.filter(task => task.status_id === 3);

  // 获取缓存元数据
  const getCacheMetadata = useCallback(() => {
    try {
      const metadata = sessionStorage.getItem(CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      console.error('读取缓存元数据失败:', error);
      return {};
    }
  }, []);

  // 更新缓存元数据
  const updateCacheMetadata = useCallback((dateKey: string, timestamp: number) => {
    try {
      const metadata = getCacheMetadata();
      metadata[dateKey] = timestamp;
      sessionStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('更新缓存元数据失败:', error);
    }
  }, [getCacheMetadata]);

  // 清理过期和过量的缓存
  const cleanupCache = useCallback(() => {
    try {
      const metadata = getCacheMetadata();
      const now = Date.now();
      const today = format(new Date(), 'yyyy-MM-dd');
      const entries = Object.entries(metadata);

      // 过滤出有效的缓存条目
      const validEntries = entries.filter(([dateKey, timestamp]) => {
        const age = now - (timestamp as number);
        // 今日数据永不过期，其他数据30分钟过期
        return dateKey === today || age < CACHE_EXPIRE_TIME;
      });

      // 如果有效条目超过最大限制，清理最旧的非今日数据
      if (validEntries.length > MAX_CACHE_ENTRIES) {
        // 分离今日数据和其他数据
        const todayEntries = validEntries.filter(([dateKey]) => dateKey === today);
        const otherEntries = validEntries.filter(([dateKey]) => dateKey !== today);
        
        // 按时间戳排序，保留最新的数据
        otherEntries.sort((a, b) => (b[1] as number) - (a[1] as number));
        const keepCount = MAX_CACHE_ENTRIES - todayEntries.length;
        const entriesToKeep = [...todayEntries, ...otherEntries.slice(0, keepCount)];
        
        // 清理要删除的缓存
        const dateKeysToKeep = new Set(entriesToKeep.map(([dateKey]) => dateKey));
        entries.forEach(([dateKey]) => {
          if (!dateKeysToKeep.has(dateKey)) {
            sessionStorage.removeItem(TASK_CACHE_PREFIX + dateKey);
            console.log('🗑️ TimelineTasks: 清理过期缓存', { dateKey });
          }
        });

        // 更新元数据
        const newMetadata = Object.fromEntries(entriesToKeep);
        sessionStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(newMetadata));
        
        console.log('🧹 TimelineTasks: 缓存清理完成', { 
          total: entries.length,
          kept: entriesToKeep.length,
          cleaned: entries.length - entriesToKeep.length
        });
      } else {
        // 只清理过期的数据
        const expiredEntries = entries.filter(([dateKey, timestamp]) => {
          const age = now - (timestamp as number);
          return dateKey !== today && age >= CACHE_EXPIRE_TIME;
        });

        expiredEntries.forEach(([dateKey]) => {
          sessionStorage.removeItem(TASK_CACHE_PREFIX + dateKey);
          delete metadata[dateKey];
        });

        if (expiredEntries.length > 0) {
          sessionStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
          console.log('🗑️ TimelineTasks: 清理过期缓存', { 
            expired: expiredEntries.length 
          });
        }
      }
    } catch (error) {
      console.error('缓存清理失败:', error);
    }
  }, [getCacheMetadata]);

  // 检查缓存数据
  const checkCache = useCallback((date: Date): Item[] | null => {
    const dateKey = format(date, 'yyyy-MM-dd');
    
    try {
      const metadata = getCacheMetadata();
      const cacheTimestamp = metadata[dateKey];
      
      if (!cacheTimestamp) {
        return null;
      }

      const age = Date.now() - cacheTimestamp;
      const today = format(new Date(), 'yyyy-MM-dd');
      const isToday = dateKey === today;
      
      // 今日数据永不过期，其他数据检查过期时间
      if (!isToday && age >= CACHE_EXPIRE_TIME) {
        console.log('⏰ TimelineTasks: 缓存已过期', { 
          dateKey,
          age: Math.round(age / 1000) + 's'
        });
        return null;
      }

      const cachedData = sessionStorage.getItem(TASK_CACHE_PREFIX + dateKey);
      if (cachedData) {
        const tasks = JSON.parse(cachedData) as Item[];
        console.log('📦 TimelineTasks: 使用缓存数据', { 
          dateKey,
          taskCount: tasks.length,
          isToday,
          cacheAge: Math.round(age / 1000) + 's'
        });
        return tasks;
      }
    } catch (error) {
      console.error('读取缓存失败:', error);
    }
    
    return null;
  }, [getCacheMetadata]);

  // 缓存任务数据
  const cacheTasksData = useCallback((date: Date, tasks: Item[]) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const timestamp = Date.now();
    
    try {
      // 执行清理（在缓存新数据前）
      cleanupCache();
      
      // 缓存任务数据
      sessionStorage.setItem(TASK_CACHE_PREFIX + dateKey, JSON.stringify(tasks));
      
      // 更新元数据
      updateCacheMetadata(dateKey, timestamp);
      
      const isToday = dateKey === format(new Date(), 'yyyy-MM-dd');
      console.log('💾 TimelineTasks: 缓存任务数据', { 
        dateKey,
        taskCount: tasks.length,
        isToday
      });
    } catch (error) {
      console.error('缓存任务数据失败:', error);
    }
  }, [cleanupCache, updateCacheMetadata]);

  // 加载指定日期的任务
  const loadTasksByDate = useCallback(async (date: Date, forceReload: boolean = false) => {
    // 将本地时间转换为北京时间字符串
    const beijingDateStr = localDateToBeijingString(date);
    
    // 如果已经加载过这个北京时间日期的数据，且不是强制重载，跳过
    if (loadedDateRef.current === beijingDateStr && !isLoadingRef.current && !forceReload) {
      console.log('💾 TimelineTasks: 数据已加载，跳过重复调用', { 
        localDate: format(date, 'yyyy-MM-dd'),
        beijingDate: beijingDateStr 
      });
      return;
    }
    
    // 防止重复调用
    if (isLoadingRef.current) {
      console.log('⏳ TimelineTasks: 正在加载中，跳过重复调用', { 
        localDate: format(date, 'yyyy-MM-dd'),
        beijingDate: beijingDateStr 
      });
      return;
    }
    
    // 如果不是强制重载，检查是否可以复用缓存数据
    if (!forceReload) {
      const cachedTasks = checkCache(date);
      if (cachedTasks) {
        setAllTasks(cachedTasks);
        loadedDateRef.current = beijingDateStr;
        console.log('📦 TimelineTasks: 使用缓存数据', { 
          localDate: format(date, 'yyyy-MM-dd'),
          beijingDate: beijingDateStr,
          taskCount: cachedTasks.length 
        });
        return;
      }
    }
    
    console.log('📅 TimelineTasks: 开始加载任务', { 
      localDate: format(date, 'yyyy-MM-dd'),
      beijingDate: beijingDateStr 
    });
    
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // 使用单个接口获取所有任务（不传 isCompleted 参数）
      const response = await getTasksByDate(beijingDateStr);
      
      const tasks = response.items || [];
      setAllTasks(tasks);
      loadedDateRef.current = beijingDateStr;
      
      // 缓存任务数据
      cacheTasksData(date, tasks);
      
      const incomplete = tasks.filter(task => task.status_id !== 3);
      const completed = tasks.filter(task => task.status_id === 3);
      
      console.log('✅ TimelineTasks: 任务加载完成', { 
        localDate: format(date, 'yyyy-MM-dd'),
        beijingDate: beijingDateStr,
        total: tasks.length,
        incomplete: incomplete.length,
        completed: completed.length
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        // 给用户更友好的提示
        setError('登录已过期，正在重新登录...');
        // 触发重新登录流程
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        const errorMessage = err instanceof Error ? err.message : '获取任务失败';
        setError(errorMessage);
        console.error('获取时间轴任务失败:', err);
      }
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [checkCache, cacheTasksData]);

  // 加载一周的任务
  const loadWeekTasks = async (startDate: Date) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const weekData = await getWeekTasks(startDate);
      
      // 转换为所需格式
      const weekTasksMap: Record<string, Item[]> = {};
      Object.entries(weekData).forEach(([date, response]) => {
        weekTasksMap[date] = response.items || [];
      });
      
      setWeekTasks(weekTasksMap);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取周任务失败';
      setError(errorMessage);
      console.error('获取周任务失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新选中日期并加载对应任务
  const updateSelectedDate = useCallback((date: Date) => {
    setSelectedDate(date);
    // 重置缓存，强制重新加载新日期的数据
    loadedDateRef.current = null;
    loadTasksByDate(date);
  }, [loadTasksByDate]);

  // 手动清理缓存的接口
  const clearAllCache = useCallback(() => {
    try {
      const metadata = getCacheMetadata();
      Object.keys(metadata).forEach(dateKey => {
        sessionStorage.removeItem(TASK_CACHE_PREFIX + dateKey);
      });
      sessionStorage.removeItem(CACHE_METADATA_KEY);
      console.log('🧹 TimelineTasks: 手动清理所有缓存');
    } catch (error) {
      console.error('手动清理缓存失败:', error);
    }
  }, [getCacheMetadata]);

  // 获取缓存状态信息
  const getCacheInfo = useCallback(() => {
    try {
      const metadata = getCacheMetadata();
      const entries = Object.entries(metadata);
      const now = Date.now();
      const today = format(new Date(), 'yyyy-MM-dd');
      
      return {
        totalEntries: entries.length,
        todayCached: metadata[today] ? true : false,
        entries: entries.map(([dateKey, timestamp]) => ({
          date: dateKey,
          age: Math.round((now - (timestamp as number)) / 1000),
          isToday: dateKey === today
        }))
      };
    } catch (error) {
      console.error('获取缓存信息失败:', error);
      return { totalEntries: 0, todayCached: false, entries: [] };
    }
  }, [getCacheMetadata]);

  // 强制刷新当前日期的缓存数据到组件状态
  const refreshFromCache = useCallback(() => {
    try {
      const cachedTasks = checkCache(selectedDate);
      if (cachedTasks) {
        setAllTasks(cachedTasks);
        console.log('🔄 TimelineTasks: 从缓存刷新任务数据', { 
          date: format(selectedDate, 'yyyy-MM-dd'),
          taskCount: cachedTasks.length 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('从缓存刷新失败:', error);
      return false;
    }
  }, [checkCache, selectedDate]);

  return {
    selectedDate,
    incompleteTasks,
    completedTasks,
    weekTasks,
    isLoading,
    error,
    loadTasksByDate,
    loadWeekTasks,
    updateSelectedDate,
    setSelectedDate,
    clearAllCache,
    getCacheInfo,
    refreshFromCache
  };
};

// 项目页面数据hook
export const useProjectTasks = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1); // 默认生活分类
  const [projectTasks, setProjectTasks] = useState<Record<string, Item[]>>({});
  const [categoryTasks, setCategoryTasks] = useState<Item[]>([]);
  const [projectProgress, setProjectProgress] = useState<Record<string, { total: number; completed: number; progress: number }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 项目页面缓存配置
  const PROJECT_CACHE_PREFIX = 'project-category-tasks-';
  const PROJECT_CACHE_METADATA_KEY = 'project-cache-metadata';
  const MAX_CACHE_ENTRIES = 10;
  const CACHE_EXPIRE_TIME = 15 * 60 * 1000; // 15分钟过期

  // 使用 useRef 追踪已加载的分类，避免重复调用
  const loadedCategoryRef = useRef<number | null>(null);
  const isLoadingRef = useRef(false);

  // 获取缓存元数据
  const getCacheMetadata = useCallback(() => {
    try {
      const metadata = sessionStorage.getItem(PROJECT_CACHE_METADATA_KEY);
      return metadata ? JSON.parse(metadata) : {};
    } catch (error) {
      console.error('读取项目缓存元数据失败:', error);
      return {};
    }
  }, []);

  // 更新缓存元数据
  const updateCacheMetadata = useCallback((categoryKey: string, timestamp: number) => {
    try {
      const metadata = getCacheMetadata();
      metadata[categoryKey] = timestamp;
      sessionStorage.setItem(PROJECT_CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('更新项目缓存元数据失败:', error);
    }
  }, [getCacheMetadata]);

  // 清理过期和过量的缓存
  const cleanupCache = useCallback(() => {
    try {
      const metadata = getCacheMetadata();
      const now = Date.now();
      const entries = Object.entries(metadata);

      // 过滤出有效的缓存条目
      const validEntries = entries.filter(([, timestamp]) => {
        const age = now - (timestamp as number);
        return age < CACHE_EXPIRE_TIME;
      });

      // 如果有效条目超过最大限制，清理最旧的数据
      if (validEntries.length > MAX_CACHE_ENTRIES) {
        // 按时间戳排序，保留最新的数据
        validEntries.sort((a, b) => (b[1] as number) - (a[1] as number));
        const entriesToKeep = validEntries.slice(0, MAX_CACHE_ENTRIES);
        
        // 清理要删除的缓存
        const categoryKeysToKeep = new Set(entriesToKeep.map(([categoryKey]) => categoryKey));
        entries.forEach(([categoryKey]) => {
          if (!categoryKeysToKeep.has(categoryKey)) {
            sessionStorage.removeItem(PROJECT_CACHE_PREFIX + categoryKey);
            console.log('🗑️ ProjectTasks: 清理过期缓存', { categoryKey });
          }
        });

        // 更新元数据
        const newMetadata = Object.fromEntries(entriesToKeep);
        sessionStorage.setItem(PROJECT_CACHE_METADATA_KEY, JSON.stringify(newMetadata));
        
        console.log('🧹 ProjectTasks: 缓存清理完成', { 
          total: entries.length,
          kept: entriesToKeep.length,
          cleaned: entries.length - entriesToKeep.length
        });
      } else {
        // 只清理过期的数据
        const expiredEntries = entries.filter(([, timestamp]) => {
          const age = now - (timestamp as number);
          return age >= CACHE_EXPIRE_TIME;
        });

        expiredEntries.forEach(([categoryKey]) => {
          sessionStorage.removeItem(PROJECT_CACHE_PREFIX + categoryKey);
          delete metadata[categoryKey];
        });

        if (expiredEntries.length > 0) {
          sessionStorage.setItem(PROJECT_CACHE_METADATA_KEY, JSON.stringify(metadata));
          console.log('🗑️ ProjectTasks: 清理过期缓存', { 
            expired: expiredEntries.length 
          });
        }
      }
    } catch (error) {
      console.error('项目缓存清理失败:', error);
    }
  }, [getCacheMetadata]);

  // 检查缓存数据
  const checkCache = useCallback((categoryId: number): Item[] | null => {
    const categoryKey = `category-${categoryId}`;
    
    try {
      const metadata = getCacheMetadata();
      const cacheTimestamp = metadata[categoryKey];
      
      if (!cacheTimestamp) {
        return null;
      }

      const age = Date.now() - cacheTimestamp;
      
      // 检查过期时间
      if (age >= CACHE_EXPIRE_TIME) {
        console.log('⏰ ProjectTasks: 缓存已过期', { 
          categoryKey,
          age: Math.round(age / 1000) + 's'
        });
        return null;
      }

      const cachedData = sessionStorage.getItem(PROJECT_CACHE_PREFIX + categoryKey);
      if (cachedData) {
        const tasks = JSON.parse(cachedData) as Item[];
        console.log('📦 ProjectTasks: 使用缓存数据', { 
          categoryKey,
          taskCount: tasks.length,
          cacheAge: Math.round(age / 1000) + 's'
        });
        return tasks;
      }
    } catch (error) {
      console.error('读取项目缓存失败:', error);
    }
    
    return null;
  }, [getCacheMetadata]);

  // 缓存任务数据
  const cacheTasksData = useCallback((categoryId: number, tasks: Item[]) => {
    const categoryKey = `category-${categoryId}`;
    const timestamp = Date.now();
    
    try {
      // 执行清理（在缓存新数据前）
      cleanupCache();
      
      // 缓存任务数据
      sessionStorage.setItem(PROJECT_CACHE_PREFIX + categoryKey, JSON.stringify(tasks));
      
      // 更新元数据
      updateCacheMetadata(categoryKey, timestamp);
      
      console.log('💾 ProjectTasks: 缓存分类任务数据', { 
        categoryKey,
        taskCount: tasks.length
      });
    } catch (error) {
      console.error('缓存分类任务数据失败:', error);
    }
  }, [cleanupCache, updateCacheMetadata]);

  // 强制刷新当前分类的缓存数据到组件状态
  const refreshFromCache = useCallback(() => {
    try {
      const cachedTasks = checkCache(selectedCategoryId);
      if (cachedTasks) {
        setCategoryTasks(cachedTasks);
        console.log('🔄 ProjectTasks: 从缓存刷新分类任务数据', { 
          categoryId: selectedCategoryId,
          taskCount: cachedTasks.length 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('从项目缓存刷新失败:', error);
      return false;
    }
  }, [checkCache, selectedCategoryId]);

  // 清理所有缓存
  const clearAllCache = useCallback(() => {
    try {
      const metadata = getCacheMetadata();
      const entries = Object.keys(metadata);
      
      // 清理所有缓存数据
      entries.forEach(categoryKey => {
        sessionStorage.removeItem(PROJECT_CACHE_PREFIX + categoryKey);
      });
      
      // 清理元数据
      sessionStorage.removeItem(PROJECT_CACHE_METADATA_KEY);
      
      console.log('🧹 ProjectTasks: 清理所有缓存', { cleared: entries.length });
      
      return entries.length;
    } catch (error) {
      console.error('清理所有项目缓存失败:', error);
      return 0;
    }
  }, [getCacheMetadata]);

  // 获取缓存信息
  const getCacheInfo = useCallback(() => {
    try {
      const metadata = getCacheMetadata();
      const now = Date.now();
      const entries = Object.entries(metadata);
      
      return {
        totalEntries: entries.length,
        currentCategoryCached: metadata[`category-${selectedCategoryId}`] ? true : false,
        entries: entries.map(([categoryKey, timestamp]) => ({
          category: categoryKey,
          age: Math.round((now - (timestamp as number)) / 1000),
          isExpired: (now - (timestamp as number)) >= CACHE_EXPIRE_TIME
        }))
      };
    } catch (error) {
      console.error('获取项目缓存信息失败:', error);
      return { totalEntries: 0, currentCategoryCached: false, entries: [] };
    }
  }, [getCacheMetadata, selectedCategoryId]);

  // 加载指定项目的任务
  const loadProjectTasks = useCallback(async (projectId: string, options?: {
    isCompleted?: boolean;
    priority?: number;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getProjectTasks(projectId, options);
      
      setProjectTasks(prev => ({
        ...prev,
        [projectId]: response.items || []
      }));
      
      return response.items || [];
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '获取项目任务失败';
      setError(errorMessage);
      console.error('获取项目任务失败:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 加载项目进度
  const loadProjectProgress = useCallback(async (projectId: string) => {
    try {
      const progress = await getProjectProgress(projectId);
      
      setProjectProgress(prev => ({
        ...prev,
        [projectId]: progress
      }));
      
      return progress;
    } catch (err: unknown) {
      console.error('获取项目进度失败:', err);
      return { total: 0, completed: 0, progress: 0 };
    }
  }, []);

  // 加载分类下的未分配任务（带缓存）
  const loadCategoryTasks = useCallback(async (categoryId: number, forceRefresh: boolean = false) => {
    // 防止重复加载
    if (isLoadingRef.current && loadedCategoryRef.current === categoryId) {
      console.log('📂 ProjectTasks: 正在加载中，跳过重复请求', { categoryId });
      return;
    }

    // 如果不强制刷新，先检查缓存
    if (!forceRefresh) {
      const cachedTasks = checkCache(categoryId);
      if (cachedTasks) {
        setCategoryTasks(cachedTasks);
        setSelectedCategoryId(categoryId);
        loadedCategoryRef.current = categoryId;
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    isLoadingRef.current = true;
    
    try {
      console.log('📡 ProjectTasks: 从API加载分类任务', { categoryId, forceRefresh });
      
      // 获取该分类下未分配给项目的任务
      const incompleteResponse = await getUnassignedCategoryTasks(categoryId, false);
      const tasks = incompleteResponse.items || [];
      
      // 缓存数据
      cacheTasksData(categoryId, tasks);
      
      // 更新状态
      setCategoryTasks(tasks);
      setSelectedCategoryId(categoryId);
      loadedCategoryRef.current = categoryId;
      
      console.log('✅ ProjectTasks: 分类任务加载完成', { 
        categoryId,
        taskCount: tasks.length
      });
    } catch (err: unknown) {
      if (err instanceof ApiError && err.statusCode === 401) {
        // 给用户更友好的提示
        setError('登录已过期，正在重新登录...');
        // 触发重新登录流程
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        const errorMessage = err instanceof Error ? err.message : '获取事项失败';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [checkCache, cacheTasksData]);

  // 获取高优先级项目任务
  const getHighPriorityProjectTasks = useCallback(async (projectId: string) => {
    return loadProjectTasks(projectId, {
      priority: 5,
      isCompleted: false
    });
  }, []);

  return {
    selectedCategoryId,
    projectTasks,
    categoryTasks,
    projectProgress,
    isLoading,
    error,
    loadProjectTasks,
    loadProjectProgress,
    loadCategoryTasks,
    getHighPriorityProjectTasks,
    setSelectedCategoryId,
    refreshFromCache,
    clearAllCache,
    getCacheInfo
  };
};

// 通用任务筛选hook
export const useTaskFilter = () => {
  const [tasks, setTasks] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeFilter = async (builder: TaskFilterBuilder) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await builder.execute();
      setTasks(response.items || []);
      return response;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '筛选任务失败';
      setError(errorMessage);
      console.error('任务筛选失败:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayImportantTasks = () => {
    return executeFilter(TaskFilters.todayImportant());
  };

  const getProjectPendingTasks = (projectId: string) => {
    return executeFilter(TaskFilters.projectPending(projectId));
  };

  const getCategoryPendingTasks = (categoryId: number) => {
    return executeFilter(TaskFilters.categoryPending(categoryId));
  };

  const getTodayCategoryTasks = (categoryId: number) => {
    return executeFilter(TaskFilters.todayCategory(categoryId));
  };

  return {
    tasks,
    isLoading,
    error,
    executeFilter,
    getTodayImportantTasks,
    getProjectPendingTasks,
    getCategoryPendingTasks,
    getTodayCategoryTasks,
    setTasks
  };
}; 