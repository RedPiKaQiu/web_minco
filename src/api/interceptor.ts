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

/**
 * 智能API路由 - 根据用户类型选择使用模拟API或真实API
 */

export const getItems = async (query?: GetItemsQuery) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 获取事项列表 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  if (isTest) {
    return await mockGetItems(query);
  } else {
    return await realGetItems(query);
  }
};

export const createItem = async (itemData: CreateItemRequest) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 创建事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  if (isTest) {
    return await mockCreateItem(itemData);
  } else {
    return await realCreateItem(itemData);
  }
};

export const updateItem = async (itemId: string, itemData: UpdateItemRequest) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 更新事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  if (isTest) {
    return await mockUpdateItem(itemId, itemData);
  } else {
    return await realUpdateItem(itemId, itemData);
  }
};

export const deleteItem = async (itemId: string) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 删除事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  if (isTest) {
    return await mockDeleteItem(itemId);
  } else {
    return await realDeleteItem(itemId);
  }
};

export const getItem = async (itemId: string) => {
  const isTest = checkIsTestUser();
  console.log(`🔀 API拦截器: 获取单个事项 - ${isTest ? '使用模拟API' : '使用真实API'}`);
  
  if (isTest) {
    return await mockGetItem(itemId);
  } else {
    return await realGetItem(itemId);
  }
}; 