// AI功能 API 接口
import { fetchApi, ApiResponse } from './index';
import { Item } from '../types';

// AI推荐请求参数
export interface AiRecommendationRequest {
  user_context: {
    current_time: string; // ISO 8601 格式
    mood?: 'focused' | 'tired' | 'energetic';
    available_time?: number; // 分钟
  };
  count?: number; // 期望推荐数量，默认3
}

// AI推荐响应数据
export interface AiRecommendationData {
  recommendations: {
    task: Item;
    reason: string;
    confidence: number;
  }[];
  total_available: number;
}

// 简化的推荐查询参数（兼容原有接口）
export interface GetRecommendationsQuery {
  count?: number; // 期望推荐数量，默认3
  current_mood?: 'focused' | 'tired' | 'energetic';
  available_time_minutes?: number;
}

/**
 * 智能推荐 [P0]
 * @param request 推荐请求参数
 * @returns AI推荐的事项列表
 */
export async function getAiRecommendations(request: AiRecommendationRequest): Promise<AiRecommendationData> {
  try {
    const response = await fetchApi<ApiResponse<AiRecommendationData>>('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    // 检查响应格式
    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'AI推荐失败');
    }
  } catch (error) {
    console.error('获取AI推荐失败:', error);
    throw error;
  }
}

/**
 * 获取推荐事项列表（兼容接口）[P0]
 * @param query 推荐查询参数
 * @returns AI推荐的事项列表
 */
export async function getRecommendations(query: GetRecommendationsQuery = {}): Promise<AiRecommendationData> {
  try {
    // 转换参数格式
    const request: AiRecommendationRequest = {
      user_context: {
        current_time: new Date().toISOString(),
        mood: query.current_mood,
        available_time: query.available_time_minutes,
      },
      count: query.count,
    };
    
    return await getAiRecommendations(request);
  } catch (error) {
    console.error('获取推荐事项失败:', error);
    throw error;
  }
} 