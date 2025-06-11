// 事项相关 API 接口
import { fetchApi } from './index';
import { ApiResponse } from '../types';

// 事项类型，根据API文档
export interface ApiTask {
  title: string;
  description?: string;
  day?: string; // 日期，格式为 YYYY-MM-DD
  start_time?: string; // 开始时间，格式为 HH:MM:SS
  end_time?: string; // 结束时间，格式为 HH:MM:SS
  type?: 'study' | 'career' | 'art' | 'health' | 'other';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  completed?: boolean;
  location?: string;
  participants?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'workdays';
  id?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: number;
}

// 创建事项请求参数
export interface TaskCreatePayload {
  title: string;
  description?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  type?: 'study' | 'career' | 'art' | 'health' | 'other';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  completed?: boolean;
  location?: string;
  participants?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'workdays';
}

// 更新事项请求参数
export interface TaskUpdatePayload {
  title: string;
  description?: string;
  day?: string;
  start_time?: string;
  end_time?: string;
  type?: 'study' | 'career' | 'art' | 'health' | 'other';
  priority?: 'urgent' | 'high' | 'medium' | 'low';
  completed?: boolean;
  location?: string;
  participants?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'workdays';
}

/**
 * 获取事项列表
 * @param skip 跳过数量
 * @param limit 限制数量
 * @returns 事项列表
 */
export async function getTasks(skip = 0, limit = 100): Promise<ApiTask[]> {
  try {
    const response = await fetchApi<ApiResponse<ApiTask[]>>(`/tasks/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });

    // 检查业务状态码
    if (response.code === 0) {
      return response.data || [];
    } else {
      throw new Error(response.message || '获取事项列表失败');
    }
  } catch (error) {
    console.error('获取事项列表失败:', error);
    throw error;
  }
}

/**
 * 创建事项
 * @param taskData 事项数据
 * @returns 创建的事项
 */
export async function createTask(taskData: TaskCreatePayload): Promise<ApiTask> {
  try {
    const response = await fetchApi<ApiResponse<ApiTask>>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });

    // 检查业务状态码
    if (response.code === 0) {
      return response.data!;
    } else {
      throw new Error(response.message || '创建事项失败');
    }
  } catch (error) {
    console.error('创建事项失败:', error);
    throw error;
  }
}

/**
 * 获取单个事项
 * @param taskId 事项ID
 * @returns 事项详情
 */
export async function getTask(taskId: number): Promise<ApiTask> {
  try {
    const response = await fetchApi<ApiResponse<ApiTask>>(`/tasks/${taskId}`, {
      method: 'GET',
    });

    // 检查业务状态码
    if (response.code === 0) {
      return response.data!;
    } else {
      throw new Error(response.message || `获取事项${taskId}失败`);
    }
  } catch (error) {
    console.error(`获取事项${taskId}失败:`, error);
    throw error;
  }
}

/**
 * 更新事项
 * @param taskId 事项ID
 * @param taskData 更新的事项数据
 * @returns 更新后的事项
 */
export async function updateTask(taskId: number, taskData: TaskUpdatePayload): Promise<ApiTask> {
  try {
    const response = await fetchApi<ApiResponse<ApiTask>>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });

    // 检查业务状态码
    if (response.code === 0) {
      return response.data!;
    } else {
      throw new Error(response.message || `更新事项${taskId}失败`);
    }
  } catch (error) {
    console.error(`更新事项${taskId}失败:`, error);
    throw error;
  }
}

/**
 * 删除事项
 * @param taskId 事项ID
 */
export async function deleteTask(taskId: number): Promise<void> {
  try {
    const response = await fetchApi<ApiResponse<any>>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });

    // 检查业务状态码
    if (response.code !== 0) {
      throw new Error(response.message || `删除事项${taskId}失败`);
    }
  } catch (error) {
    console.error(`删除事项${taskId}失败:`, error);
    throw error;
  }
} 