// API 基础配置和公共方法

// 环境配置
export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production'
}

// API 配置
interface ApiConfig {
  development: string;
  production: string;
}

const API_CONFIG: ApiConfig = {
  development: 'http://localhost:8000/api/v1',  // 开发环境URL
  production: 'https://api.minco.app/api/v1'    // 生产环境URL
};

// 获取当前环境
const getCurrentEnvironment = (): Environment => {
  // 1. 优先使用环境变量
  if (import.meta.env.VITE_API_ENV) {
    return import.meta.env.VITE_API_ENV as Environment;
  }
  
  // 2. 根据 NODE_ENV 自动判断
  if (import.meta.env.PROD) {
    return Environment.PRODUCTION;
  }
  
  // 3. 默认使用开发环境
  return Environment.DEVELOPMENT;
};

// 当前环境
export const CURRENT_ENV = getCurrentEnvironment();

// API 基础 URL (根据环境自动选择)
export const API_BASE_URL = API_CONFIG[CURRENT_ENV];

// 环境切换函数（用于调试和测试）
export const getApiUrl = (env?: Environment): string => {
  return API_CONFIG[env || CURRENT_ENV];
};

// 打印当前API配置信息
console.log(`🚀 API配置信息:`, {
  environment: CURRENT_ENV,
  apiUrl: API_BASE_URL,
  isDevelopment: CURRENT_ENV === Environment.DEVELOPMENT,
  isProduction: CURRENT_ENV === Environment.PRODUCTION
});

// 统一的API响应格式
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}



interface RequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

// 通用请求封装
export async function fetchApi<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  };

  // 添加认证头
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`🌐 API调用: ${config.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...config,
    headers,
  });

  if (!response.ok) {
    // 处理HTTP错误
    if (response.status === 401) {
      // 未授权，可能token过期
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('appState'); // 清除应用状态
      throw new Error('认证失败，请重新登录');
    }
    
    if (response.status === 403) {
      throw new Error('权限不足');
    }
    
    if (response.status === 404) {
      throw new Error('资源不存在');
    }
    
    if (response.status >= 500) {
      throw new Error('服务器错误，请稍后重试');
    }
    
    throw new Error(`请求失败: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ API响应:`, data);
  return data;
}

// 分页信息
export interface PaginationInfo {
  total_items: number;
  total_pages: number;
  current_page: number;
  limit: number;
}

// 导出所有API接口 - 现在使用拦截器版本
export * from './interceptor';
export * from './user';
export * from './test';
export * from './ai';
export * from './focus';

// 同时导出原始API（用于特殊需求）
export * as OriginalItemsAPI from './items'; 