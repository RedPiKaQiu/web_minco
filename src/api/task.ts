// 任务相关 API 接口
import { fetchApi } from './index';

// 任务类型，根据API文档
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

// 创建任务请求参数
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

// 更新任务请求参数
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
 * 获取任务列表
 * @param skip 跳过数量
 * @param limit 限制数量
 * @returns 任务列表
 */
export async function getTasks(skip = 0, limit = 100): Promise<ApiTask[]> {
  try {
    return await fetchApi<ApiTask[]>(`/tasks/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    throw error;
  }
}

/**
 * 创建任务
 * @param taskData 任务数据
 * @returns 创建的任务
 */
export async function createTask(taskData: TaskCreatePayload): Promise<ApiTask> {
  try {
    return await fetchApi<ApiTask>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    throw error;
  }
}

/**
 * 获取单个任务
 * @param taskId 任务ID
 * @returns 任务详情
 */
export async function getTask(taskId: number): Promise<ApiTask> {
  try {
    return await fetchApi<ApiTask>(`/tasks/${taskId}`, {
      method: 'GET',
    });
  } catch (error) {
    console.error(`获取任务${taskId}失败:`, error);
    throw error;
  }
}

/**
 * 更新任务
 * @param taskId 任务ID
 * @param taskData 更新的任务数据
 * @returns 更新后的任务
 */
export async function updateTask(taskId: number, taskData: TaskUpdatePayload): Promise<ApiTask> {
  try {
    return await fetchApi<ApiTask>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  } catch (error) {
    console.error(`更新任务${taskId}失败:`, error);
    throw error;
  }
}

/**
 * 删除任务
 * @param taskId 任务ID
 */
export async function deleteTask(taskId: number): Promise<void> {
  try {
    await fetchApi(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`删除任务${taskId}失败:`, error);
    throw error;
  }
} 