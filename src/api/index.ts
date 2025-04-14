// API 基础配置和公共方法

// API 基础 URL
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 通用请求方法
export async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API 请求失败: ${endpoint}`, error);
    throw error;
  }
} 