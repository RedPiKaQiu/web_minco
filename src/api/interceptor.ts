/**
 * API拦截器，为测试用户自动使用模拟API，为真实用户使用真实API
 */
// API拦截器 - 为测试用户自动使用模拟API
import { 
  mockGetItems, 
  mockCreateItem, 
  mockUpdateItem, 
  mockDeleteItem, 
  mockGetItem,
  isTestUser as checkIsTestUser 
} from './mock';
import { 
  getItems as realGetItems,
  createItem as realCreateItem,
  updateItem as realUpdateItem,
  deleteItem as realDeleteItem,
  getItem as realGetItem
} from './items';
import { GetItemsQuery, CreateItemRequest, UpdateItemRequest } from './items';
import { ApiError } from './index';

/**
 * 智能API路由 - 根据用户类型选择使用模拟API或真实API
 */

export const getItems = async (query?: GetItemsQuery) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 获取事项列表 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  try {
    if (isTest) {
      return await mockGetItems(query);
    } else {
      return await realGetItems(query);
    }
  } catch (error) {
    // 确保错误正确传递
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取事项列表失败',
      500,
      500
    );
  }
};

export const createItem = async (itemData: CreateItemRequest) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 创建事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  try {
    if (isTest) {
      return await mockCreateItem(itemData);
    } else {
      return await realCreateItem(itemData);
    }
  } catch (error) {
    // 确保错误正确传递
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '创建事项失败',
      500,
      500
    );
  }
};

export const updateItem = async (itemId: string, itemData: UpdateItemRequest) => {
  const isTest = checkIsTestUser();
  
  // 获取当前用户信息用于调试
  const userData = localStorage.getItem('user');
  console.log(`🔍 当前用户信息:`, userData ? JSON.parse(userData) : null);
  console.log(`🔍 isTestUser() 判断结果:`, isTest);
  console.log(`🔀 API拦截器: 更新事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  console.log(`📝 更新事项参数:`, { itemId, itemData });
  
  try {
    if (isTest) {
      console.log('📱 调用模拟API: mockUpdateItem');
      return await mockUpdateItem(itemId, itemData);
    } else {
      console.log('🌐 调用真实API: realUpdateItem');
      return await realUpdateItem(itemId, itemData);
    }
  } catch (error) {
    console.error('❌ API拦截器捕获错误:', error);
    // 确保错误正确传递
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '更新事项失败',
      500,
      500
    );
  }
};

export const deleteItem = async (itemId: string) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 删除事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  try {
    if (isTest) {
      return await mockDeleteItem(itemId);
    } else {
      return await realDeleteItem(itemId);
    }
  } catch (error) {
    // 确保错误正确传递
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '删除事项失败',
      500,
      500
    );
  }
};

export const getItem = async (itemId: string) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 获取单个事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  try {
    if (isTest) {
      return await mockGetItem(itemId);
    } else {
      return await realGetItem(itemId);
    }
  } catch (error) {
    // 确保错误正确传递
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : '获取事项详情失败',
      500,
      500
    );
  }
}; 