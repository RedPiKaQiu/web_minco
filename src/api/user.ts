/**
 * 用户相关API接口，提供登录、注册、用户信息管理等功能
 */
// 用户相关 API 接口
import { fetchApi, ApiResponse, ApiError } from './index';
import { User } from '../types';

// 登录请求参数（根据API文档）
export interface LoginRequest {
  username: string;    // 用户名或邮箱
  password: string;    // 密码
  remember_me?: boolean; // 是否记住登录状态，默认false
}

// 登录响应数据（根据API文档和实际响应更新）
export interface LoginResponse {
  access_token: string;  // JWT令牌
  token_type: string;    // 令牌类型
  expires_in?: number;   // token有效期(秒) - 可选，因为实际API可能不返回
  user?: User;           // 用户信息 - 可选，标准格式
  // 实际API返回的格式
  user_id?: number;      // 用户ID - 实际API返回的格式
  username?: string;     // 用户名 - 实际API返回的格式
}

// 注册请求参数
export interface RegisterRequest {
  username: string;        // 用户名 (必填, 3-20字符)
  email: string;          // 邮箱 (必填, 用于登录)
  password: string;       // 密码 (必填, 8-50字符)
  full_name?: string;     // 真实姓名 (可选)
  personal_tags?: string[]; // 个人标签 (可选)
  long_term_goals?: string[]; // 长期目标 (可选)
  timezone?: string;      // 时区 (可选, 默认"Asia/Shanghai")
}

/**
 * 用户登录 [P0]
 * @param loginData 登录数据
 * @returns 登录结果和用户信息
 */
export async function login(loginData: LoginRequest): Promise<LoginResponse> {
  try {
    const response = await fetchApi<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    });

    // 检查业务状态码 - 根据API文档，成功是code=0
    if (response.code === 0 && response.data) {
      // 保存token到localStorage
      localStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } else {
      throw new ApiError(response.message || '登录失败', response.code, 400);
    }
  } catch (error) {
    console.error('登录失败:', error);
    
    if (error instanceof ApiError) {
      // 根据API文档处理特定的登录错误
      if (error.statusCode === 400) {
        // 常见登录错误映射
        const errorMessages: Record<string, string> = {
          '用户名或密码错误': '用户名或密码错误，请检查后重试',
          '用户不存在': '该用户不存在，请检查用户名或邮箱',
          '密码错误': '密码错误，请重新输入',
          '账户已被禁用': '账户已被禁用，请联系管理员',
          '请求参数不能为空': '用户名和密码不能为空'
        };
        
        const friendlyMessage = errorMessages[error.message] || error.message;
        throw new ApiError(friendlyMessage, error.code, error.statusCode);
      }
      throw error;
    }
    
    throw new ApiError('登录失败，请稍后重试', 500, 500);
  }
}

/**
 * 用户注册
 * @param userData 用户数据
 * @returns 注册结果
 */
export async function register(userData: RegisterRequest): Promise<LoginResponse> {
  try {
    const response = await fetchApi<ApiResponse<LoginResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // 检查业务状态码 - 根据API文档，成功是code=0
    if (response.code === 0 && response.data) {
      // 保存token到localStorage
      localStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } else {
      throw new ApiError(response.message || '注册失败', response.code, 400);
    }
  } catch (error) {
    console.error('注册失败:', error);
    
    if (error instanceof ApiError) {
      // 根据API文档处理特定的注册错误
      if (error.statusCode === 400) {
        // 常见注册错误映射
        const errorMessages: Record<string, string> = {
          '用户名已存在': '该用户名已被使用，请选择其他用户名',
          '邮箱已被注册': '该邮箱已被注册，请使用其他邮箱或尝试登录',
          '密码长度不足': '密码长度至少需要8个字符',
          '邮箱格式不正确': '请输入正确的邮箱格式',
          '用户名长度必须在3-20字符之间': '用户名长度必须在3-20字符之间'
        };
        
        const friendlyMessage = errorMessages[error.message] || error.message;
        throw new ApiError(friendlyMessage, error.code, error.statusCode);
      }
      throw error;
    }
    
    throw new ApiError('注册失败，请稍后重试', 500, 500);
  }
}

/**
 * 获取用户信息 [P0]
 * @returns 用户详细信息
 */
export async function getUserProfile(): Promise<User> {
  try {
    const response = await fetchApi<ApiResponse<User>>('/user/profile', {
      method: 'GET',
    });

    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      throw new ApiError(response.message || '获取用户信息失败', response.code, 400);
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 401) {
        throw new ApiError('登录已过期，请重新登录', error.code, error.statusCode);
      }
      throw error;
    }
    
    throw new ApiError('获取用户信息失败，请稍后重试', 500, 500);
  }
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    // 调用后端登出接口
    await fetchApi<ApiResponse<void>>('/auth/logout', { 
      method: 'POST' 
    });
    
    // 清除本地存储的token
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('appState');
  } catch (error) {
    console.error('登出失败:', error);
    
    // 即使后端登出失败，也要清除本地token
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('appState');
    
    if (error instanceof ApiError) {
      // 如果是401错误，说明token已经无效，不需要抛出错误
      if (error.statusCode === 401) {
        return;
      }
      throw new ApiError('登出失败，但已清除本地登录状态', error.code, error.statusCode);
    }
    
    throw new ApiError('登出失败，但已清除本地登录状态', 500, 500);
  }
}

/**
 * 测试用户登录（模拟）- 保持兼容性
 * @returns 测试用户信息
 */
export function getTestUser(): User {
  return {
    id: 'user-123',
    username: 'Shell',
    email: 'shell@example.com',
    full_name: 'Shell User',
    personal_tags: ['测试用户'],
    long_term_goals: ['保持身体健康', '持续学习成长'],
    recent_focus: ['完成重要项目', '提升工作效率'],
    daily_plan_time: '08:00',
    daily_review_time: '21:00',
    timezone: 'Asia/Shanghai',
    created_at: new Date().toISOString()
  };
}

// 新增自动刷新token的函数
export async function refreshToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const response = await fetchApi<ApiResponse<LoginResponse>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.code === 0 && response.data) {
      localStorage.setItem('access_token', response.data.access_token);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
} 