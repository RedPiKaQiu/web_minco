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

// 获取token - 统一使用access_token
const getToken = () => {
  const token = localStorage.getItem('access_token');
  return token ? `Bearer ${token}` : null;
};

// 通用请求方法
export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // 如果存在token，添加Authorization头
  const token = getToken();
  if (token) {
    defaultHeaders['Authorization'] = token;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // 根据API文档的错误响应格式处理
      if (errorData.code !== undefined && errorData.message) {
        throw new Error(errorData.message);
      }
      
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API 请求失败: ${endpoint}`, error);
    throw error;
  }
}

// 导出所有API接口
export * from './items';
export * from './ai';
export * from './focus';
export * from './user';
export * from './test'; 