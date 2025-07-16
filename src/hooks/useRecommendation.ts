/**
 * 推荐Hook - 封装推荐服务的使用
 * 提供简单的接口来获取和管理推荐任务
 */
import { useState, useCallback, useRef, useMemo } from 'react';
import { Item } from '../types';
import { 
  RecommendationService, 
  RecommendationConfig, 
  RecommendationResult, 
  RecommendationMethod 
} from '../services/RecommendationService';
import { useAppContext } from '../context/AppContext';

/**
 * 推荐Hook
 */
export const useRecommendation = (initialConfig?: Partial<RecommendationConfig>) => {
  const { isTestUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RecommendationResult | null>(null);
  
  // 创建推荐服务实例
  const recommendationService = useRef<RecommendationService>(
    new RecommendationService(initialConfig)
  );

  // 获取推荐方法：测试用户使用本地，正式用户默认使用AI
  const getPreferredMethod = useCallback((): RecommendationMethod => {
    if (isTestUser) {
      return 'local'; // 测试用户只使用本地推荐
    }
    
    // 正式用户默认使用AI推荐
    return 'ai';
  }, [isTestUser]);



  // 从localStorage获取用户上下文
  const getUserContext = useCallback(() => {
    try {
      const mood = localStorage.getItem('user_mood') as 'focused' | 'tired' | 'energetic' | 'anxious';
      const energyLevel = localStorage.getItem('user_energy_level');
      const availableTime = localStorage.getItem('user_available_time');
      const location = localStorage.getItem('user_location');

      return {
        mood: mood || 'focused',
        energy_level: energyLevel ? parseInt(energyLevel) : 7,
        available_time: availableTime ? parseInt(availableTime) : 60,
        location: location || '办公室'
      };
    } catch (error) {
      console.error('获取用户上下文失败:', error);
      return {
        mood: 'focused' as const,
        energy_level: 7,
        available_time: 60,
        location: '办公室'
      };
    }
  }, []);

  // 获取推荐
  const getRecommendations = useCallback(async (
    tasks: Item[], 
    config?: Partial<RecommendationConfig>
  ): Promise<RecommendationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // 合并配置
      const finalConfig: Partial<RecommendationConfig> = {
        method: getPreferredMethod(),
        count: 3,
        userContext: getUserContext(),
        recommendationType: 'smart',
        ...config
      };

      console.log('🎯 useRecommendation: 开始获取推荐', {
        taskCount: tasks.length,
        method: finalConfig.method,
        config: finalConfig
      });

      const result = await recommendationService.current.getRecommendations(tasks, finalConfig);
      setLastResult(result);
      
      console.log('✅ useRecommendation: 推荐获取成功', {
        method: result.method,
        count: result.recommendations.length,
        processingTime: result.processingTime
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取推荐失败';
      setError(errorMessage);
      console.error('❌ useRecommendation: 获取推荐失败', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getPreferredMethod, getUserContext]);



  // 获取AI推荐（强制使用AI）
  const getAiRecommendations = useCallback(async (
    tasks: Item[], 
    userContext?: RecommendationConfig['userContext']
  ): Promise<RecommendationResult> => {
    return getRecommendations(tasks, {
      method: 'ai',
      userContext: userContext || getUserContext()
    });
  }, [getRecommendations, getUserContext]);

  // 获取本地推荐（强制使用本地算法）
  const getLocalRecommendations = useCallback(async (
    tasks: Item[], 
    userContext?: RecommendationConfig['userContext']
  ): Promise<RecommendationResult> => {
    return getRecommendations(tasks, {
      method: 'local',
      userContext: userContext || getUserContext()
    });
  }, [getRecommendations, getUserContext]);

  // 更新用户上下文
  const updateUserContext = useCallback((context: Partial<RecommendationConfig['userContext']>) => {
    if (!context) return;
    
    try {
      if (context.mood) {
        localStorage.setItem('user_mood', context.mood);
      }
      if (context.energy_level !== undefined) {
        localStorage.setItem('user_energy_level', context.energy_level.toString());
      }
      if (context.available_time !== undefined) {
        localStorage.setItem('user_available_time', context.available_time.toString());
      }
      if (context.location) {
        localStorage.setItem('user_location', context.location);
      }
      console.log('✅ useRecommendation: 用户上下文已更新', context);
    } catch (error) {
      console.error('更新用户上下文失败:', error);
    }
  }, []);

  // 获取当前配置（移除 lastResult 依赖，避免循环更新）
  const currentConfig = useMemo(() => {
    return recommendationService.current.getConfig();
  }, []); // 配置在创建时就确定，不需要动态更新

  // 获取当前推荐方法
  const currentMethod = useMemo(() => {
    return getPreferredMethod();
  }, [getPreferredMethod]);

  // 检查是否支持AI推荐
  const isAiSupported = useMemo(() => {
    return !isTestUser; // 测试用户不支持AI推荐
  }, [isTestUser]);

  // 生成推荐理由（用于显示）
  const generateRecommendReason = useCallback(() => {
    const reasons = [
      '现在是完成这个事项的好时机',
      '这个事项优先级较高',
      '完成这个事项会让你感觉很棒',
      '这个事项不会花费太多时间',
      '现在精力充沛，适合处理这个事项'
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }, []);

  return {
    // 状态
    isLoading,
    error,
    lastResult,
    currentConfig,
    currentMethod,
    isAiSupported,

    // 方法
    getRecommendations,
    getAiRecommendations,
    getLocalRecommendations,
    updateUserContext,
    getUserContext,
    generateRecommendReason,

    // 清理
    clearError: () => setError(null),
    clearLastResult: () => setLastResult(null)
  };
}; 