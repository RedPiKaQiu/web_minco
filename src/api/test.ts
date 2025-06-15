// 测试相关 API 接口
import { fetchApi, ApiResponse } from './index';

// 测试连接响应数据
interface TestConnectResponseDto {
  status: string;      // 状态
  message: string;     // 消息
  uuid?: string;       // 用户UUID（如果提供）
}

/**
 * 测试与后端的连接状态
 * @param uuid 用户标识符（可选，如果不提供则自动生成）
 * @returns 连接测试结果
 */
export async function testConnection(uuid?: string): Promise<TestConnectResponseDto> {
  try {
    // 如果没有提供uuid，则自动生成一个测试用的uuid
    const testUuid = uuid || `test-connection-${Date.now()}`;
    
    const response = await fetchApi<ApiResponse<TestConnectResponseDto>>('/test/connect_test', {
      method: 'POST',
      body: JSON.stringify({ uuid: testUuid }),
    });
    
    // 检查业务状态码
    if (response.code === 0 && response.data) {
      return response.data;
    } else {
      // 如果后端返回错误，抛出错误信息
      throw new Error(response.message || '连接测试失败');
    }
  } catch (error) {
    // 网络错误或其他错误，返回错误格式
    throw new Error(error instanceof Error ? error.message : '连接失败，请检查后端服务是否正常运行');
  }
} 