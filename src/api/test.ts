// 测试相关 API 接口
import { fetchApi } from './index';
import { ApiResponse } from '../types';

// 测试连接请求参数
interface TestConnectRequestDto {
  uuid?: string;  // 可选的用户UUID
}

// 测试连接响应数据
interface TestConnectResponseDto {
  status: string;      // 状态
  message: string;     // 消息
  uuid?: string;       // 用户UUID（如果提供）
}

/**
 * 测试与后端的连接状态
 * @param uuid 用户标识符（可选）
 * @returns 连接测试结果
 */
export async function testConnection(uuid?: string): Promise<TestConnectResponseDto> {
  try {
    const response = await fetchApi<ApiResponse<TestConnectResponseDto>>('/test/connect_test', {
      method: 'POST',
      body: JSON.stringify({ uuid }),
    });
    
    // 检查业务状态码
    if (response.code === 0) {
      return response.data || {
        status: 'success',
        message: 'Connection successful',
        uuid
      };
    } else {
      // 业务逻辑错误
      throw new Error(response.message || '连接测试失败');
    }
  } catch (error) {
    // 网络错误或其他错误，返回错误格式
    throw new Error(error instanceof Error ? error.message : '连接失败，请检查后端服务是否正常运行');
  }
} 