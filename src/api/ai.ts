/**
 * AI功能API接口，提供智能对话、推荐建议等AI服务
 */
import { fetchApi, ApiResponse, ApiError } from './index';

// AI聊天请求参数
export interface AiChatRequest {
  message: string; // 用户消息 (必填)
  context?: { // 聊天上下文 (可选)
    recent_tasks?: string[]; // 最近的任务ID列表
    current_projects?: string[]; // 当前项目ID列表
    user_mood?: string; // 用户当前心情，如 "focused", "tired", "anxious"
    available_time?: number; // 可用时间（分钟）
  };
  session_id?: string; // 会话ID，用于维护上下文
}

// 建议操作
export interface SuggestedAction {
  type: string; // 操作类型，如 "task_breakdown", "create_task", "start_focus"
  task_id?: string; // 相关任务ID
  project_id?: string; // 相关项目ID
  label: string; // 操作标签
  payload?: { // 操作参数
    action?: string;
    [key: string]: any;
  };
}

// AI聊天响应
export interface AiChatResponse {
  reply: string; // AI回复内容
  suggested_actions?: SuggestedAction[]; // 建议操作列表
  quick_replies?: string[]; // 快速回复选项
  session_id: string; // 会话ID
  context_updated: boolean; // 上下文是否已更新
}

/**
 * AI聊天对话 [P1]
 * @param chatData 聊天请求数据
 * @returns AI回复和建议操作
 */
export async function chatWithAi(chatData: AiChatRequest): Promise<AiChatResponse> {
  try {
    const response = await fetchApi<ApiResponse<AiChatResponse>>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new ApiError(response.message || 'AI聊天请求失败', response.code, 400);
    }
  } catch (error) {
    console.error('AI聊天失败:', error);
    
    if (error instanceof ApiError) {
      // 处理AI聊天特定错误
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      
      if (error.statusCode === 500) {
        // 提供降级回复
        return {
          reply: '抱歉，我暂时无法处理您的请求。请稍后再试。',
          suggested_actions: [],
          quick_replies: ['重新尝试', '查看任务', '联系支持'],
          session_id: chatData.session_id || generateSessionId(),
          context_updated: false
        };
      }
      
      throw error;
    }
    
    // 网络错误或其他错误的降级处理  
    return {
      reply: '抱歉，我暂时无法处理您的请求。请检查网络连接后重试。',
      suggested_actions: [],
      quick_replies: ['重新尝试'],
      session_id: chatData.session_id || generateSessionId(),
      context_updated: false
    };
  }
}

// AI推荐请求参数
export interface AiRecommendationRequest {
  task_ids?: string[]; // 可选：指定事项ID列表，为空则获取今日所有事项
  user_context?: { // 可选：用户上下文
    mood?: 'focused' | 'tired' | 'energetic' | 'anxious'; // 心情：focused, tired, energetic, anxious
    energy_level?: number; // 精力水平：1-10
    available_time?: number; // 可用时间（分钟）
    location?: string; // 位置
    current_time?: string; // 当前时间(ISO格式)
  };
  count?: number; // 推荐数量：1-10，默认3
  recommendation_type?: 'smart' | 'priority' | 'time_based' | 'mood_based'; // 推荐类型
}

// AI推荐响应中的单个推荐项
export interface AiRecommendationItem {
  item: {
    id: string;
    title: string;
    description?: string;
    emoji?: string;
    category_id: number;
    project_id?: string;
    start_time?: string;
    end_time?: string;
    estimated_duration?: number;
    time_slot_id?: number;
    priority: number;
    status_id: number;
    is_overdue?: boolean;
    sub_tasks?: any[];
    created_at: string;
    updated_at: string;
    completed_at?: string;
  };
  reason: string; // AI推荐理由
  confidence_score: number; // 置信度
  priority_score?: number; // 优先级评分
  time_match_score?: number; // 时间匹配评分
  suggested_duration?: number; // 建议时长
}

// AI推荐响应
export interface AiRecommendationResponse {
  recommendations: AiRecommendationItem[];
  message: string; // AI推荐说明
  total_available: number; // 可用任务总数
  recommendation_metadata?: {
    recommendation_type: string;
    ai_model_used: string;
    user_context_provided: boolean;
  };
  ai_model_used: string; // AI模型名称
  processing_time_ms: number; // 处理时间
}

/**
 * 获取AI智能推荐 [P0]
 * @param requestData 推荐请求数据
 * @returns AI推荐的任务列表
 */
export async function getAiRecommendations(requestData: AiRecommendationRequest = {}): Promise<AiRecommendationResponse> {
  try {
    const response = await fetchApi<ApiResponse<AiRecommendationResponse>>('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new ApiError(response.message || '获取AI推荐失败', response.code, 400);
    }
  } catch (error) {
    console.error('获取AI推荐失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      throw error;
    }
    
    throw new ApiError('获取AI推荐失败，请稍后重试', 500, 500);
  }
}

// 任务分析请求参数
export interface TaskAnalysisRequest {
  task_description: string; // 任务描述
}

// 任务分析响应
export interface TaskAnalysisResponse {
  suggested_category: string; // 建议分类
  estimated_duration: number; // 预估时长（分钟）
  suggested_emoji: string; // 建议表情符号
  sub_tasks: string[]; // 子任务列表
  best_time_slot: string; // 最佳时间段
}

/**
 * AI任务智能分析 [P1]
 * @param analysisData 分析请求数据
 * @returns AI分析结果
 */
export async function analyzeTask(analysisData: TaskAnalysisRequest): Promise<TaskAnalysisResponse> {
  try {
    const response = await fetchApi<ApiResponse<TaskAnalysisResponse>>('/ai/task-analysis', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new ApiError(response.message || 'AI任务分析失败', response.code, 400);
    }
  } catch (error) {
    console.error('AI任务分析失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      throw error;
    }
    
    throw new ApiError('AI任务分析失败，请稍后重试', 500, 500);
  }
}

// 任务拆解请求参数
export interface TaskBreakdownRequest {
  task_id: string; // 任务ID
  complexity_level: 'simple' | 'medium' | 'complex'; // 复杂度级别
}

// 任务拆解响应
export interface TaskBreakdownResponse {
  parent_task: {
    id: string;
    title: string;
  };
  sub_tasks: Array<{
    title: string;
    estimated_duration: number; // 分钟
    order: number; // 顺序
  }>;
  estimated_total_time: number; // 总预估时间（分钟）
}

/**
 * AI任务拆解 [P1]
 * @param breakdownData 拆解请求数据
 * @returns AI拆解结果
 */
export async function breakdownTask(breakdownData: TaskBreakdownRequest): Promise<TaskBreakdownResponse> {
  try {
    const response = await fetchApi<ApiResponse<TaskBreakdownResponse>>('/ai/task-breakdown', {
      method: 'POST',
      body: JSON.stringify(breakdownData),
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new ApiError(response.message || 'AI任务拆解失败', response.code, 400);
    }
  } catch (error) {
    console.error('AI任务拆解失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      throw error;
    }
    
    throw new ApiError('AI任务拆解失败，请稍后重试', 500, 500);
  }
}

// 辅助函数：生成会话ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 辅助函数：获取用户上下文
export function getUserContext(): {
  recent_tasks?: string[];
  current_projects?: string[];
  user_mood?: string;
  available_time?: number;
} {
  try {
    // 从localStorage或其他地方获取用户上下文
    const appState = JSON.parse(localStorage.getItem('appState') || '{}');
    
    return {
      recent_tasks: appState.recentTasks || [],
      current_projects: appState.currentProjects || [],
      user_mood: appState.userMood || 'focused',
      available_time: appState.availableTime || 30
    };
  } catch (error) {
    console.error('获取用户上下文失败:', error);
    return {};
  }
} 