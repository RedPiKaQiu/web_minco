/**
 * 推荐缓存工具函数
 * 实现推荐结果的智能缓存，避免不必要的重复调用
 */
import { Item } from '../types';

// 推荐缓存配置
const RECOMMENDATION_CACHE_KEY = 'homepage-recommendations';
const RECOMMENDATION_CACHE_METADATA_KEY = 'homepage-recommendations-metadata';
const RECOMMENDATION_CACHE_EXPIRE = 10 * 60 * 1000; // 10分钟过期

export interface RecommendationCache {
  recommendations: Item[];
  method: 'ai' | 'local';
  taskHash: string; // 任务数据的哈希值，用于检测变化
  timestamp: number;
  userContext?: any;
  count: number;
}

/**
 * 生成任务数据的哈希值
 * 用于检测任务数据是否发生变化
 */
export const generateTaskHash = (tasks: Item[]): string => {
  if (!tasks || tasks.length === 0) {
    return 'empty';
  }
  
  const hashData = tasks
    .map(task => `${task.id}-${task.status_id}-${task.priority}-${task.updated_at}`)
    .sort() // 排序确保一致性
    .join('|');
  
  return btoa(hashData).substring(0, 16); // 简化哈希
};

/**
 * 获取推荐缓存
 */
export const getRecommendationCache = (): RecommendationCache | null => {
  try {
    const cached = sessionStorage.getItem(RECOMMENDATION_CACHE_KEY);
    if (!cached) {
      return null;
    }
    
    const data = JSON.parse(cached) as RecommendationCache;
    
    // 检查是否过期
    if (Date.now() - data.timestamp > RECOMMENDATION_CACHE_EXPIRE) {
      console.log('💾 推荐缓存已过期，清理缓存');
      clearRecommendationCache();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('读取推荐缓存失败:', error);
    clearRecommendationCache();
    return null;
  }
};

/**
 * 缓存推荐结果
 */
export const cacheRecommendations = (
  recommendations: Item[], 
  tasks: Item[], 
  method: 'ai' | 'local',
  userContext?: any
): void => {
  try {
    const cache: RecommendationCache = {
      recommendations,
      method,
      taskHash: generateTaskHash(tasks),
      timestamp: Date.now(),
      userContext,
      count: recommendations.length
    };
    
    sessionStorage.setItem(RECOMMENDATION_CACHE_KEY, JSON.stringify(cache));
    
    // 更新缓存元数据
    const metadata = {
      lastUpdate: Date.now(),
      taskCount: tasks.length,
      recommendationCount: recommendations.length,
      method
    };
    sessionStorage.setItem(RECOMMENDATION_CACHE_METADATA_KEY, JSON.stringify(metadata));
    
    console.log('💾 推荐结果已缓存', {
      count: recommendations.length,
      method,
      taskHash: cache.taskHash
    });
  } catch (error) {
    console.error('缓存推荐结果失败:', error);
  }
};

/**
 * 检查是否需要更新推荐
 */
export const shouldUpdateRecommendations = (
  tasks: Item[], 
  method: 'ai' | 'local',
  userContext?: any
): boolean => {
  const cached = getRecommendationCache();
  
  if (!cached) {
    console.log('📋 没有推荐缓存，需要生成');
    return true;
  }
  
  const currentHash = generateTaskHash(tasks);
  
  // 检查任务数据是否变化
  if (cached.taskHash !== currentHash) {
    console.log('📋 任务数据已变化，需要更新推荐', {
      oldHash: cached.taskHash,
      newHash: currentHash
    });
    return true;
  }
  
  // 检查推荐方法是否变化
  if (cached.method !== method) {
    console.log('📋 推荐方法已变化，需要更新推荐', {
      oldMethod: cached.method,
      newMethod: method
    });
    return true;
  }
  
  // 检查用户上下文是否显著变化
  if (userContext && cached.userContext) {
    const contextChanged = 
      userContext.mood !== cached.userContext.mood ||
      Math.abs(userContext.energy_level - cached.userContext.energy_level) > 2 ||
      Math.abs(userContext.available_time - cached.userContext.available_time) > 30;
    
    if (contextChanged) {
      console.log('📋 用户上下文已变化，需要更新推荐');
      return true;
    }
  }
  
  console.log('📋 推荐缓存有效，无需更新');
  return false;
};

/**
 * 清除推荐缓存
 */
export const clearRecommendationCache = (): void => {
  try {
    sessionStorage.removeItem(RECOMMENDATION_CACHE_KEY);
    sessionStorage.removeItem(RECOMMENDATION_CACHE_METADATA_KEY);
    console.log('🗑️ 推荐缓存已清除');
  } catch (error) {
    console.error('清除推荐缓存失败:', error);
  }
};

/**
 * 获取缓存统计信息
 */
export const getRecommendationCacheInfo = () => {
  try {
    const cache = getRecommendationCache();
    const metadata = sessionStorage.getItem(RECOMMENDATION_CACHE_METADATA_KEY);
    
    if (!cache || !metadata) {
      return {
        hasCache: false,
        age: 0,
        count: 0,
        method: null
      };
    }
    
    const age = Date.now() - cache.timestamp;
    
    return {
      hasCache: true,
      age: Math.round(age / 1000), // 秒
      count: cache.count,
      method: cache.method,
      taskHash: cache.taskHash
    };
  } catch (error) {
    console.error('获取推荐缓存信息失败:', error);
    return {
      hasCache: false,
      age: 0,
      count: 0,
      method: null
    };
  }
}; 