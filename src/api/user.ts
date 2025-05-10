// 用户相关 API 接口
import { fetchApi } from './index';
import { User } from '../types';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface UserCreatePayload {
  email: string;
  password: string;
  full_name?: string;
}

/**
 * 用户登录
 * @param username 用户名/邮箱
 * @param password 密码
 * @returns 登录结果和用户信息
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    // 注意：登录API使用了x-www-form-urlencoded格式
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 用户注册
 * @param userData 用户数据
 * @returns 注册结果
 */
export async function register(userData: UserCreatePayload): Promise<LoginResponse> {
  try {
    return await fetchApi<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error('注册失败:', error);
    throw error;
  }
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await fetchApi('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('登出失败:', error);
    throw error;
  }
}

/**
 * 测试用户登录（模拟）
 * @returns 测试用户信息
 */
export function getTestUser(): User {
  return {
    id: 'user-123',
    nickname: 'Shell',
    gender: 'female',
    age: 25,
    createdAt: new Date().toISOString()
  };
} 