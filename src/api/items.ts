// 事项管理 API 接口
import { fetchApi, ApiResponse, ApiError } from './index';
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
      throw new ApiError(response.message || '创建事项失败', response.code, 400);
    }
  } catch (error) {
    console.error('创建事项失败:', error);
    
    if (error instanceof ApiError) {
      // 根据API文档处理特定的创建事项错误
      if (error.statusCode === 400) {
        // 常见创建事项错误映射
        const errorMessages: Record<string, string> = {
          '标题不能为空': '事项标题不能为空，请输入标题',
          '分类ID无效': '请选择有效的事项分类',
          '优先级无效': '优先级必须在1-5之间',
          '时间格式错误': '时间格式不正确，请重新选择',
          '事项创建失败': '创建事项失败，请检查输入信息'
        };
        
        const friendlyMessage = errorMessages[error.message] || error.message;
        throw new ApiError(friendlyMessage, error.code, error.statusCode);
      }
      
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      
      throw error;
    }
    
    throw new ApiError('创建事项失败，请稍后重试', 500, 500);
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
      throw new ApiError(response.message || '获取事项列表失败', response.code, 400);
    }
  } catch (error) {
    console.error('获取事项列表失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      throw error;
    }
    
    throw new ApiError('获取事项列表失败，请稍后重试', 500, 500);
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
      throw new ApiError(response.message || `获取事项${itemId}失败`, response.code, 400);
    }
  } catch (error) {
    console.error(`获取事项${itemId}失败:`, error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      
      if (error.statusCode === 404) {
        throw new ApiError('事项不存在或已被删除', error.code, error.statusCode);
      }
      
      throw error;
    }
    
    throw new ApiError(`获取事项详情失败，请稍后重试`, 500, 500);
  }
}

/**
 * 更新事项信息 [P0]
 * @param itemId 事项ID
 * @param itemData 更新的事项数据
 * @returns 更新后的事项部分信息
 */
export async function updateItem(itemId: string, itemData: UpdateItemRequest): Promise<{ id: string; title: string; updated_at: string }> {
  console.log(`🌐 realUpdateItem 被调用:`, { itemId, itemData });
  
  try {
    console.log(`📤 发送PUT请求到: /items/${itemId}`);
    console.log(`📋 请求体数据:`, JSON.stringify(itemData));
    
    const response = await fetchApi<ApiResponse<{ id: string; title: string; updated_at: string }>>(`/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });

    console.log(`📨 收到服务器响应:`, response);

    if (response.code === 0 && response.data) {
      console.log(`✅ 更新事项成功:`, response.data);
      return response.data;
    } else {
      console.error(`❌ 服务器返回错误:`, response);
      throw new ApiError(response.message || `更新事项${itemId}失败`, response.code, 400);
    }
  } catch (error) {
    console.error(`❌ realUpdateItem 异常:`, error);
    console.error(`🔍 错误详情:`, {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    if (error instanceof ApiError) {
      if (error.statusCode === 400) {
        // 常见更新事项错误映射
        const errorMessages: Record<string, string> = {
          '标题不能为空': '事项标题不能为空',
          '分类ID无效': '请选择有效的事项分类',
          '优先级无效': '优先级必须在1-5之间',
          '时间格式错误': '时间格式不正确，请重新选择',
          '更新事项失败': '更新失败，请检查输入信息'
        };
        
        const friendlyMessage = errorMessages[error.message] || error.message;
        throw new ApiError(friendlyMessage, error.code, error.statusCode);
      }
      
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      
      if (error.statusCode === 404) {
        throw new ApiError('事项不存在或已被删除', error.code, error.statusCode);
      }
      
      throw error;
    }
    
    throw new ApiError(`更新事项失败，请稍后重试`, 500, 500);
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
      throw new ApiError(response.message || `删除事项${itemId}失败`, response.code, 400);
    }
  } catch (error) {
    console.error(`删除事项${itemId}失败:`, error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      
      if (error.statusCode === 404) {
        throw new ApiError('事项不存在或已被删除', error.code, error.statusCode);
      }
      
      throw error;
    }
    
    throw new ApiError(`删除事项失败，请稍后重试`, 500, 500);
  }
} 