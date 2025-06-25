/**
 * 事项管理API接口，提供事项的增删改查和高级查询功能
 */
// 事项管理 API 接口
import { fetchApi, ApiResponse, ApiError, API_BASE_URL } from './index';
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
    const response = await fetchApi<ApiResponse<Item>>('/items/create', {
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
    const endpoint = queryString ? `/items/getList?${queryString}` : '/items/getList';
    
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
    const response = await fetchApi<ApiResponse<Item>>(`/items/get/${itemId}`, {
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
    console.log(`📤 发送PUT请求到: /items/update/${itemId}`);
    console.log(`📋 请求体数据:`, JSON.stringify(itemData));
    
    const response = await fetchApi<ApiResponse<{ id: string; title: string; updated_at: string }>>(`/items/update/${itemId}`, {
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
    console.log(`🌐 realDeleteItem 被调用:`, { itemId });
    
    const token = localStorage.getItem('access_token');
    const url = `${API_BASE_URL}/items/delete/${itemId}`;
    
    console.log(`📤 发送DELETE请求到: ${url}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`📨 删除请求响应:`, { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    // 处理204 No Content响应（删除成功）
    if (response.status === 204) {
      console.log(`✅ 删除事项成功: ${itemId}`);
      return;
    }
    
    // 处理其他成功状态码但有响应体的情况
    if (response.ok) {
      try {
        const data = await response.json();
        if (data.code === 0) {
          console.log(`✅ 删除事项成功: ${itemId}`);
          return;
        } else {
          throw new ApiError(data.message || `删除事项${itemId}失败`, data.code, response.status);
        }
      } catch (jsonError) {
        // 如果JSON解析失败但状态码是成功的，认为删除成功
        console.log(`✅ 删除事项成功 (无JSON响应): ${itemId}`);
        return;
      }
    }
    
    // 处理错误响应
    let errorMessage = `删除事项${itemId}失败`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON解析失败，使用默认错误消息
    }
    
    if (response.status === 401) {
      // 清理认证信息
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('appState');
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new ApiError('登录已过期，请重新登录', 401, 401);
    }
    
    if (response.status === 404) {
      throw new ApiError('事项不存在或已被删除', 404, 404);
    }
    
    throw new ApiError(errorMessage, response.status, response.status);
    
  } catch (error) {
    console.error(`❌ realDeleteItem 异常:`, error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 网络错误或其他异常
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('网络连接失败，请检查网络状态', 0, 0);
    }
    
    throw new ApiError(`删除事项失败，请稍后重试`, 500, 500);
  }
} 

/**
 * 获取今日任务（用于首页）
 * @returns 今日的待办任务
 */
export async function getTodayTasks(): Promise<ItemListResponse> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
  
  return getItems({
    date: today,
    is_completed: false,
    sort_by: 'priority',
    order: 'desc',
    limit: 50
  });
}



/**
 * 获取指定日期的任务（用于时间轴页面）
 * @param date 日期字符串（YYYY-MM-DD格式）
 * @param isCompleted 是否完成筛选
 * @returns 指定日期的任务列表
 */
export async function getTasksByDate(date: string, isCompleted?: boolean): Promise<ItemListResponse> {
  const query: GetItemsQuery = {
    date: date,
    sort_by: 'start_time',
    order: 'asc',
    limit: 100
  };
  
  if (isCompleted !== undefined) {
    query.is_completed = isCompleted;
  }
  
  return getItems(query);
}

/**
 * 获取一周的任务数据（用于时间轴页面）
 * @param startDate 周开始日期
 * @returns 一周的任务数据Map
 */
export async function getWeekTasks(startDate: Date): Promise<Record<string, ItemListResponse>> {
  const weekTasks: Record<string, ItemListResponse> = {};
  const promises: Promise<void>[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const promise = getTasksByDate(dateStr).then(data => {
      weekTasks[dateStr] = data;
    });
    
    promises.push(promise);
  }
  
  await Promise.all(promises);
  return weekTasks;
}

/**
 * 获取项目相关任务（用于项目页面）
 * @param projectId 项目ID
 * @param options 额外的筛选选项
 * @returns 项目相关的任务列表
 */
export async function getProjectTasks(projectId: string, options: {
  isCompleted?: boolean;
  priority?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<ItemListResponse> {
  return getItems({
    project_id: projectId,
    is_completed: options.isCompleted,
    priority: options.priority,
    sort_by: options.sortBy || 'priority',
    order: options.order || 'desc',
    limit: 100
  });
}

/**
 * 获取项目进度统计
 * @param projectId 项目ID
 * @returns 项目进度信息
 */
export async function getProjectProgress(projectId: string): Promise<{
  total: number;
  completed: number;
  progress: number;
}> {
  try {
    // 并行获取总任务数和已完成任务数
    const [allTasks, completedTasks] = await Promise.all([
      getItems({ project_id: projectId, limit: 1000 }),
      getItems({ project_id: projectId, is_completed: true, limit: 1000 })
    ]);
    
    const total = allTasks.pagination?.total_items || 0;
    const completed = completedTasks.pagination?.total_items || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, progress };
  } catch (error) {
    console.error('获取项目进度失败:', error);
    return { total: 0, completed: 0, progress: 0 };
  }
}

/**
 * 获取分类任务（用于项目页面的分类筛选）
 * @param categoryId 分类ID
 * @param options 额外筛选选项
 * @returns 分类下的任务列表
 */
export async function getCategoryTasks(categoryId: number, options: {
  projectId?: string;
  isCompleted?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
} = {}): Promise<ItemListResponse> {
  return getItems({
    category_id: categoryId,
    project_id: options.projectId,
    is_completed: options.isCompleted,
    sort_by: options.sortBy || 'created_at',
    order: options.order || 'desc',
    limit: 100
  });
}

/**
 * 获取无项目分配的分类任务（用于项目页面显示未分配事项）
 * @param categoryId 分类ID
 * @param isCompleted 是否完成
 * @returns 未分配给项目的分类任务
 */
export async function getUnassignedCategoryTasks(categoryId: number, isCompleted: boolean = false): Promise<ItemListResponse> {
  // 注意：这里假设没有project_id参数时API返回未分配给项目的任务
  // 如果API不支持这种逻辑，可能需要获取所有任务后在前端过滤
  return getItems({
    category_id: categoryId,
    is_completed: isCompleted,
    sort_by: 'created_at',
    order: 'desc',
    limit: 100
  });
}

/**
 * 筛选参数构建器类
 * 用于灵活构建查询参数
 */
export class TaskFilterBuilder {
  private filters: GetItemsQuery = {};
  
  /**
   * 设置日期筛选
   */
  setDate(date: string): TaskFilterBuilder {
    this.filters.date = date;
    return this;
  }
  
  /**
   * 设置今日筛选
   */
  setToday(): TaskFilterBuilder {
    this.filters.date = new Date().toISOString().split('T')[0];
    return this;
  }
  
  /**
   * 设置项目筛选
   */
  setProject(projectId: string): TaskFilterBuilder {
    this.filters.project_id = projectId;
    return this;
  }
  
  /**
   * 设置分类筛选
   */
  setCategory(categoryId: number): TaskFilterBuilder {
    this.filters.category_id = categoryId;
    return this;
  }
  
  /**
   * 设置完成状态筛选
   */
  setCompleted(isCompleted: boolean): TaskFilterBuilder {
    this.filters.is_completed = isCompleted;
    return this;
  }
  
  /**
   * 设置优先级筛选
   */
  setPriority(priority: number): TaskFilterBuilder {
    this.filters.priority = priority;
    return this;
  }
  
  /**
   * 设置时间段筛选
   */
  setTimeSlot(timeSlotId: number): TaskFilterBuilder {
    this.filters.time_slot_id = timeSlotId;
    return this;
  }
  
  /**
   * 设置排序
   */
  setSort(sortBy: string, order: 'asc' | 'desc' = 'desc'): TaskFilterBuilder {
    this.filters.sort_by = sortBy;
    this.filters.order = order;
    return this;
  }
  
  /**
   * 设置分页
   */
  setPagination(page: number = 1, limit: number = 20): TaskFilterBuilder {
    this.filters.page = page;
    this.filters.limit = limit;
    return this;
  }
  
  /**
   * 构建查询参数
   */
  build(): GetItemsQuery {
    return { ...this.filters };
  }
  
  /**
   * 执行查询
   */
  async execute(): Promise<ItemListResponse> {
    return getItems(this.filters);
  }
}

/**
 * 常用筛选预设
 */
export const TaskFilters = {
  /**
   * 今日重要任务
   */
  todayImportant: () => new TaskFilterBuilder()
    .setToday()
    .setPriority(4)
    .setCompleted(false)
    .setSort('priority', 'desc'),
  
  /**
   * 项目未完成任务
   */
  projectPending: (projectId: string) => new TaskFilterBuilder()
    .setProject(projectId)
    .setCompleted(false)
    .setSort('created_at', 'desc'),
  
  /**
   * 本周任务概览
   */
  weekOverview: () => new TaskFilterBuilder()
    .setSort('start_time', 'asc')
    .setPagination(1, 100),
  
  /**
   * 分类未完成任务
   */
  categoryPending: (categoryId: number) => new TaskFilterBuilder()
    .setCategory(categoryId)
    .setCompleted(false)
    .setSort('priority', 'desc'),
    
  /**
   * 今日指定分类任务
   */
  todayCategory: (categoryId: number) => new TaskFilterBuilder()
    .setToday()
    .setCategory(categoryId)
    .setCompleted(false)
    .setSort('priority', 'desc')
}; 