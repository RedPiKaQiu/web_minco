/**
 * AI聊天管理Hook，提供聊天状态管理和用户上下文优化
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
 */
export const useAiChat = () => {
  const { state: userState } = useUser();

  // 获取用户上下文信息
  const getUserContext = useCallback((): AiChatContext => {
    try {
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

      return {
        recent_tasks: recentTaskIds,
        current_projects: currentProjects ? JSON.parse(currentProjects) : [],
        user_mood: userMood || 'focused',
        available_time: availableTime ? parseInt(availableTime) : 30
      };
    } catch (error) {
      console.error('获取用户上下文失败:', error);
      return {
        user_mood: 'focused',
        available_time: 30
      };
    }
  }, []);

  // 更新用户心情
  const updateUserMood = useCallback((mood: UserMood) => {
    localStorage.setItem('user-mood', mood);
  }, []);

  // 更新可用时间
  const updateAvailableTime = useCallback((time: number) => {
    localStorage.setItem('available-time', time.toString());
  }, []);

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
    getRecommendedQuestions,
    isAuthenticated,
    userInfo
  };
}; 