// 专注功能 API 接口
import { fetchApi, ApiResponse } from './index';
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
      throw new Error(response.message || '开始专注失败');
    }
  } catch (error) {
    console.error('开始专注失败:', error);
    throw error;
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
      throw new Error(response.message || '结束专注失败');
    }
  } catch (error) {
    console.error('结束专注失败:', error);
    throw error;
  }
} 