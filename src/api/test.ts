// 测试相关 API 接口
import { fetchApi, ApiResponse, ApiError } from './index';

// 测试连接响应数据
interface TestConnectResponseDto {
  status: string;      // 状态
  message: string;     // 消息
  uuid?: string;       // 用户UUID（如果提供）
}

/**
 * 测试与后端的连接状态 [P0]
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
      throw new ApiError(response.message || '连接测试失败', response.code, 400);
    }
  } catch (error) {
    console.error('连接测试失败:', error);
    
    if (error instanceof ApiError) {
      if (error.statusCode === 500) {
        // 服务器内部错误
        throw new ApiError('服务器连接失败，请检查后端服务是否正常运行', error.code, error.statusCode);
      }
      
      if (error.statusCode === 400) {
        // 请求参数错误
        const errorMessages: Record<string, string> = {
          '连接测试失败': '连接测试失败，请稍后重试',
          '请求参数错误': '测试参数不正确'
        };
        
        const friendlyMessage = errorMessages[error.message] || error.message;
        throw new ApiError(friendlyMessage, error.code, error.statusCode);
      }
      
      // 网络连接错误
      if (error.code === 0) {
        throw new ApiError('网络连接失败，请检查网络状态和后端服务', error.code, error.statusCode);
      }
      
      throw error;
    }
    
    // 兜底错误处理
    throw new ApiError('连接失败，请检查后端服务是否正常运行', 500, 500);
  }
} 