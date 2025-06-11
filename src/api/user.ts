// 用户相关 API 接口
import { fetchApi } from './index';
import { User, ApiResponse } from '../types';

// 登录响应数据（根据API文档）
interface AuthResponseDto {
  access_token: string;    // 访问令牌
  token_type: string;      // 令牌类型，默认"bearer"
  user_id: number;         // 用户ID
  username: string;        // 用户名
}

// 登录请求参数（根据API文档）
interface LoginRequestDto {
  username: string;        // 用户名
  password: string;        // 密码
}

interface UserCreatePayload {
  email: string;
  password: string;
  full_name?: string;
}

/**
 * 用户登录
 * @param username 用户名
 * @param password 密码
 * @returns 登录结果和用户信息
 */
export async function login(username: string, password: string): Promise<AuthResponseDto> {
  try {
    const loginData: LoginRequestDto = {
      username,
      password
    };
    
    const response = await fetchApi<ApiResponse<AuthResponseDto>>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    // 检查业务状态码
    if (response.code === 0) {
      return response.data!;
    } else {
      throw new Error(response.message || '登录失败');
    }
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
export async function register(userData: UserCreatePayload): Promise<AuthResponseDto> {
  try {
    const response = await fetchApi<ApiResponse<AuthResponseDto>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // 检查业务状态码
    if (response.code === 0) {
      return response.data!;
    } else {
      throw new Error(response.message || '注册失败');
    }
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
    const response = await fetchApi<ApiResponse<any>>('/auth/logout', {
      method: 'POST',
    });

    // 检查业务状态码
    if (response.code !== 0) {
      throw new Error(response.message || '登出失败');
    }
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