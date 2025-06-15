// 事项管理 API 接口
import { fetchApi, ApiResponse } from './index';
import { Item, ItemListResponse } from '../types';

// 创建事项请求参数
export interface CreateItemRequest {
  title: string; // 必填
  description?: string;
  emoji?: string;
  category_id: number; // 必填, 1:生活, 2:健康, 3:工作, 4:学习, 5:放松, 6:探索
  project_id?: string;
  start_time?: string; // ISO 8601 格式
  end_time?: string; // ISO 8601 格式
  estimated_duration?: number; // 分钟
  time_slot_id?: number; // 1:上午, 2:中午, 3:下午, 4:晚上, 5:随时
  priority: number; // 必填, 1-5, 5为最高
  status_id?: number; // 可选, 默认为1:pending
  sub_tasks?: string[];
}

// 更新事项请求参数
export interface UpdateItemRequest {
  title?: string;
  description?: string;
  emoji?: string;
  category_id?: number;
  project_id?: string;
  start_time?: string;
  end_time?: string;
  estimated_duration?: number;
  time_slot_id?: number;
  priority?: number;
  status_id?: number;
  sub_tasks?: string[];
}

// 获取事项列表查询参数
export interface GetItemsQuery {
  date?: string; // YYYY-MM-DD
  project_id?: string;
  category_id?: number;
  status_id?: number;
  priority?: number;
  is_completed?: boolean;
  time_slot_id?: number;
  sort_by?: string; // created_at, start_time, priority
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * 创建新事项 [P0]
 * @param itemData 事项数据
 * @returns 创建的事项
 */
export async function createItem(itemData: CreateItemRequest): Promise<Item> {
  try {
    const response = await fetchApi<ApiResponse<Item>>('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '创建事项失败');
    }
  } catch (error) {
    console.error('创建事项失败:', error);
    throw error;
  }
}

/**
 * 获取事项列表 [P0]
 * @param query 查询参数
 * @returns 事项列表和分页信息
 */
export async function getItems(query: GetItemsQuery = {}): Promise<ItemListResponse> {
  try {
    const params = new URLSearchParams();
    
    // 构建查询参数
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    const queryString = params.toString();
    const endpoint = queryString ? `/items?${queryString}` : '/items';
    
    const response = await fetchApi<ApiResponse<ItemListResponse>>(endpoint, {
      method: 'GET',
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || '获取事项列表失败');
    }
  } catch (error) {
    console.error('获取事项列表失败:', error);
    throw error;
  }
}

/**
 * 获取单个事项详情 [P0]
 * @param itemId 事项ID
 * @returns 事项详情
 */
export async function getItem(itemId: string): Promise<Item> {
  try {
    const response = await fetchApi<ApiResponse<Item>>(`/items/${itemId}`, {
      method: 'GET',
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || `获取事项${itemId}失败`);
    }
  } catch (error) {
    console.error(`获取事项${itemId}失败:`, error);
    throw error;
  }
}

/**
 * 更新事项信息 [P0]
 * @param itemId 事项ID
 * @param itemData 更新的事项数据
 * @returns 更新后的事项部分信息
 */
export async function updateItem(itemId: string, itemData: UpdateItemRequest): Promise<{ id: string; title: string; updated_at: string }> {
  try {
    const response = await fetchApi<ApiResponse<{ id: string; title: string; updated_at: string }>>(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || `更新事项${itemId}失败`);
    }
  } catch (error) {
    console.error(`更新事项${itemId}失败:`, error);
    throw error;
  }
}

/**
 * 删除事项 [P0]
 * @param itemId 事项ID
 */
export async function deleteItem(itemId: string): Promise<void> {
  try {
    const response = await fetchApi<ApiResponse<void>>(`/items/${itemId}`, {
      method: 'DELETE',
    });

    if (response.code !== 0) {
      throw new Error(response.message || `删除事项${itemId}失败`);
    }
  } catch (error) {
    console.error(`删除事项${itemId}失败:`, error);
    throw error;
  }
} 