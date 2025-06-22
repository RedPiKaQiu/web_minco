// 专注功能 API 接口
import { fetchApi, ApiResponse, ApiError } from './index';
import { Item } from '../types';

// 开始专注请求参数
export interface StartFocusRequest {
  task_id: string;
  duration: number; // 秒
  mode: 'pomodoro' | 'free';
}

// 开始专注响应
export interface StartFocusResponse {
  session_id: string;
  start_time: string; // ISO 8601 格式
  end_time: string; // ISO 8601 格式
  task: Item;
}

// 结束专注请求参数
export interface EndFocusRequest {
  actual_duration: number; // 秒
  completed: boolean;
  interruptions?: number;
}

/**
 * 开始专注 [P0]
 * @param request 开始专注请求参数
 * @returns 专注会话信息
 */
export async function startFocus(request: StartFocusRequest): Promise<StartFocusResponse> {
  try {
    const response = await fetchApi<ApiResponse<StartFocusResponse>>('/focus/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new ApiError(response.message || '开始专注失败', response.code, 400);
    }
  } catch (error) {
    console.error('开始专注失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      
      if (error.statusCode === 404) {
        throw new ApiError('任务不存在或已被删除', error.code, error.statusCode);
      }
      
      if (error.statusCode === 400) {
        // 专注功能相关的错误处理
        const errorMessages: Record<string, string> = {
          '任务不存在': '选择的任务不存在，请重新选择',
          '开始专注失败': '开始专注失败，请检查任务是否可用',
          '专注时长无效': '专注时长设置不正确',
          '专注模式无效': '专注模式选择不正确'
        };
        
        const friendlyMessage = errorMessages[error.message] || error.message;
        throw new ApiError(friendlyMessage, error.code, error.statusCode);
      }
      
      throw error;
    }
    
    throw new ApiError('开始专注失败，请稍后重试', 500, 500);
  }
}

/**
 * 结束专注 [P0]
 * @param sessionId 专注会话ID
 * @param request 结束专注请求参数
 * @returns void
 */
export async function endFocus(sessionId: string, request: EndFocusRequest): Promise<void> {
  try {
    const response = await fetchApi<ApiResponse<void>>(`/focus/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (response.code !== 0) {
      throw new ApiError(response.message || '结束专注失败', response.code, 400);
    }
  } catch (error) {
    console.error('结束专注失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      
      if (error.statusCode === 404) {
        throw new ApiError('专注会话不存在或已结束', error.code, error.statusCode);
      }
      
      if (error.statusCode === 400) {
        // 结束专注相关的错误处理
        const errorMessages: Record<string, string> = {
          '专注会话不存在': '专注会话不存在或已结束',
          '结束专注失败': '结束专注失败，请稍后重试',
          '专注时长无效': '专注时长记录不正确'
        };
        
        const friendlyMessage = errorMessages[error.message] || error.message;
        throw new ApiError(friendlyMessage, error.code, error.statusCode);
      }
      
      throw error;
    }
    
    throw new ApiError('结束专注失败，请稍后重试', 500, 500);
  }
} 