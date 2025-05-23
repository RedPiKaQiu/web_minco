// API 基础配置和公共方法

// API 基础 URL
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// 获取token
const getToken = () => {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('token_type');
  return token ? `${tokenType || 'Bearer'} ${token}` : null;
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
      throw new Error(
        errorData.message || `API请求失败: ${response.status} ${response.statusText}`
      );
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API 请求失败: ${endpoint}`, error);
    throw error;
  }
} 