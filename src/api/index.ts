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

// API错误类，用于包装错误信息
export class ApiError extends Error {
  public code: number;
  public statusCode: number;
  
  constructor(message: string, code: number, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
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

  try {
    const response = await fetch(url, {
      ...config,
      headers,
    });

    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      // JSON解析失败，可能是网络错误或服务器异常
      throw new ApiError(
        '服务器响应格式错误',
        500,
        response.status
      );
    }

    if (!response.ok) {
      // 根据API文档处理不同的HTTP错误状态码
      switch (response.status) {
        case 400:
          // 业务逻辑错误，使用服务器返回的具体错误信息
          throw new ApiError(
            data.message || '请求参数错误',
            data.code || 400,
            response.status
          );
        
        case 401:
          // 未授权，token过期或无效
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('appState');
          throw new ApiError(
            data.message || '用户未登录',
            data.code || 401,
            response.status
          );
        
        case 403:
          // 权限不足
          throw new ApiError(
            data.message || '权限不足',
            data.code || 403,
            response.status
          );
        
        case 404:
          // 资源不存在
          throw new ApiError(
            data.message || '资源不存在',
            data.code || 404,
            response.status
          );
        
        case 500:
        default:
          // 服务器内部错误
          throw new ApiError(
            data.message || '服务器内部错误',
            data.code || 500,
            response.status
          );
      }
    }

    console.log(`✅ API响应:`, data);
    return data;
  } catch (error) {
    // 网络错误或其他未捕获的错误
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 网络连接错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        '网络连接失败，请检查网络状态',
        0,
        0
      );
    }
    
    // 其他未知错误
    throw new ApiError(
      error instanceof Error ? error.message : '未知错误',
      500,
      500
    );
  }
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