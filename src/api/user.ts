// 用户相关 API 接口
import { fetchApi } from './index';
import { User } from '../types';

interface LoginResponse {
  status: 'success' | 'error';
  user?: User;
  token?: string;
  message?: string;
}

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果和用户信息
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  try {
    return await fetchApi<LoginResponse>('/user/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    return {
      status: 'error',
      message: '登录失败，请稍后重试',
    };
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