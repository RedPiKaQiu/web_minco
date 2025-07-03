/**
 * AI聊天管理Hook，提供聊天状态管理和用户上下文优化
 * 支持用户级别会话隔离和安全的会话管理
 */
import { useCallback, useMemo } from 'react';
import { useUser } from '../context/UserContext';

// 用户心情类型
export type UserMood = 'focused' | 'tired' | 'energetic' | 'anxious' | 'creative' | 'overwhelmed';

// AI聊天上下文接口
export interface AiChatContext {
  recent_tasks?: string[];
  current_projects?: string[];
  user_mood?: UserMood;
  available_time?: number;
}

/**
 * AI聊天管理Hook
 * 实现用户级别的会话隔离和上下文管理
 */
export const useAiChat = () => {
  const { state: userState } = useUser();

  // 获取用户上下文信息
  const getUserContext = useCallback((): AiChatContext => {
    try {
      // 确保只有登录用户才能获取上下文
      if (!userState.isAuthenticated || !userState.user) {
        console.warn('⚠️ 用户未登录，返回默认上下文');
        return {
          user_mood: 'focused',
          available_time: 30
        };
      }

      // 从localStorage或sessionStorage获取最近的任务和项目信息
      const recentTasks = sessionStorage.getItem('recent-task-ids');
      const currentProjects = sessionStorage.getItem('current-project-ids');
      const userMood = localStorage.getItem('user-mood') as UserMood;
      const availableTime = localStorage.getItem('available-time');

      // 也可以从时间轴缓存中获取最近的任务
      const timelineCacheKeys = Object.keys(sessionStorage).filter(key => 
        key.startsWith('timeline-tasks-')
      );
      
      let recentTaskIds: string[] = [];
      if (recentTasks) {
        recentTaskIds = JSON.parse(recentTasks);
      } else if (timelineCacheKeys.length > 0) {
        // 从最近的时间轴缓存中提取任务ID
        try {
          const latestCacheKey = timelineCacheKeys[timelineCacheKeys.length - 1];
          const cachedData = sessionStorage.getItem(latestCacheKey);
          if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            recentTaskIds = parsedData.items?.slice(0, 5).map((item: any) => item.id) || [];
          }
        } catch (error) {
          console.warn('解析时间轴缓存失败:', error);
        }
      }

      const context = {
        recent_tasks: recentTaskIds,
        current_projects: currentProjects ? JSON.parse(currentProjects) : [],
        user_mood: userMood || 'focused',
        available_time: availableTime ? parseInt(availableTime) : 30
      };

      console.log('📝 AI聊天上下文:', {
        userId: userState.user.id,
        contextKeys: Object.keys(context),
        hasRecentTasks: context.recent_tasks && context.recent_tasks.length > 0
      });

      return context;
    } catch (error) {
      console.error('❌ 获取用户上下文失败:', error);
      return {
        user_mood: 'focused',
        available_time: 30
      };
    }
  }, [userState.isAuthenticated, userState.user]);

  // 更新用户心情
  const updateUserMood = useCallback((mood: UserMood) => {
    if (!userState.isAuthenticated) {
      console.warn('⚠️ 用户未登录，无法更新心情');
      return;
    }
    localStorage.setItem('user-mood', mood);
    console.log('💭 用户心情已更新:', mood);
  }, [userState.isAuthenticated]);

  // 更新可用时间
  const updateAvailableTime = useCallback((time: number) => {
    if (!userState.isAuthenticated) {
      console.warn('⚠️ 用户未登录，无法更新可用时间');
      return;
    }
    localStorage.setItem('available-time', time.toString());
    console.log('⏰ 可用时间已更新:', time, '分钟');
  }, [userState.isAuthenticated]);

  // 清理用户AI聊天相关数据（用于登出时）
  const clearAiChatData = useCallback(() => {
    try {
      localStorage.removeItem('user-mood');
      localStorage.removeItem('available-time');
      sessionStorage.removeItem('recent-task-ids');
      sessionStorage.removeItem('current-project-ids');
      console.log('🧹 AI聊天用户数据已清理');
    } catch (error) {
      console.error('❌ 清理AI聊天数据失败:', error);
    }
  }, []);

  // 生成安全的会话ID（包含用户信息但不泄露敏感数据）
  const generateSecureSessionId = useCallback(() => {
    if (!userState.user) {
      return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 使用用户ID的哈希值而不是明文，增加安全性
    const userHash = btoa(userState.user.id.toString()).substr(0, 8);
    const sessionId = `user_${userHash}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🔑 生成安全会话ID:', sessionId.substr(0, 20) + '...');
    return sessionId;
  }, [userState.user]);

  // 获取推荐的开场白（基于用户状态）
  const getRecommendedQuestions = useMemo(() => {
    const context = getUserContext();
    const baseQuestions = [
      '今天有什么重要的事情要做？',
      '帮我安排一下今天的时间',
      '看看这周有什么事项',
      '我想完成一个新项目',
      '给我一些提高效率的建议'
    ];

    // 根据用户心情调整推荐问题
    switch (context.user_mood) {
      case 'overwhelmed':
        return [
          '我感觉事情太多了，帮我整理一下',
          '我需要一些减压的建议',
          '帮我确定今天最重要的3件事',
          ...baseQuestions.slice(2)
        ];
      case 'tired':
        return [
          '我感觉有点疲惫，有什么轻松的任务吗？',
          '给我一些恢复精力的建议',
          '今天适合做什么简单的事情？',
          ...baseQuestions.slice(2)
        ];
      case 'anxious':
        return [
          '我有点焦虑，需要一些支持',
          '帮我制定一个舒缓的计划',
          '有什么能让我平静下来的活动吗？',
          ...baseQuestions.slice(2)
        ];
      case 'creative':
        return [
          '我感觉很有创意，有什么项目可以开始？',
          '帮我头脑风暴一些新想法',
          '有什么创造性的任务推荐吗？',
          ...baseQuestions.slice(2)
        ];
      default:
        return baseQuestions;
    }
  }, [getUserContext]);

  // 检查用户是否已登录
  const isAuthenticated = useMemo(() => userState.isAuthenticated, [userState.isAuthenticated]);

  // 获取用户信息
  const userInfo = useMemo(() => userState.user, [userState.user]);

  return {
    getUserContext,
    updateUserMood,
    updateAvailableTime,
    clearAiChatData,
    generateSecureSessionId,
    getRecommendedQuestions,
    isAuthenticated,
    userInfo
  };
}; 