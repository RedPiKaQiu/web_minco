// 测试相关 API 接口
import { fetchApi } from './index';

interface ConnectTestResponse {
  status: 'success' | 'error';
  message?: string;
}

/**
 * 测试与后端的连接状态
 * @param uuid 用户标识符
 * @returns 连接测试结果
 */
export async function testConnection(uuid: string): Promise<ConnectTestResponse> {
  try {
    return await fetchApi<ConnectTestResponse>('/test/connect_test', {
      method: 'POST',
      body: JSON.stringify({ uuid }),
    });
  } catch (error) {
    // 在发生错误时返回统一的错误格式
    return {
      status: 'error',
      message: '连接失败，请检查后端服务是否正常运行',
    };
  }
} 