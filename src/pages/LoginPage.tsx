import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // 需要安装: npm install uuid @types/uuid
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import { testConnection } from '../api/test';

const LoginPage = () => {
  const { dispatch } = useUser();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'未连接' | '连接中...' | '连接成功' | '连接失败'>('未连接');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleTestLogin = () => {
    // 创建测试用户数据
    const testUser = {
      id: uuidv4(),
      nickname: 'Shell',
      gender: 'female' as const,
      age: 25,
      createdAt: new Date().toISOString()
    };

    // 分发登录操作
    dispatch({ type: 'LOGIN', payload: testUser });
    
    // 导航到开始页面
    navigate('/');
  };

  const handleTestConnection = async () => {
    setConnectionStatus('连接中...');
    setIsConnecting(true);
    
    try {
      // 使用封装的 API 调用
      const mockUuid = 'user-123';
      const result = await testConnection(mockUuid);
      
      if (result.status === 'success') {
        setConnectionStatus('连接成功');
      } else {
        setConnectionStatus('连接失败');
      }
    } catch (error) {
      console.error('连接测试失败:', error);
      setConnectionStatus('连接失败');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="h-screen bg-app flex flex-col items-center justify-center p-[var(--spacing-page)]">
      <div className="bg-card rounded-[var(--radius-large)] shadow-[var(--shadow-md)] w-full max-w-sm p-[var(--spacing-card)]">
        <h1 className="text-2xl font-bold text-center text-app mb-8">航行者</h1>
        
        <div className="flex flex-col gap-4">
          {/* 连接状态显示 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-app-secondary text-sm">后端连接状态:</span>
            <span className={`text-sm font-medium ${
              connectionStatus === '连接成功' ? 'text-green-500' : 
              connectionStatus === '连接失败' ? 'text-red-500' :
              connectionStatus === '连接中...' ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {connectionStatus}
            </span>
          </div>
          
          {/* 测试连接按钮 */}
          <button
            onClick={handleTestConnection}
            disabled={isConnecting}
            className={`w-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] ${
              isConnecting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[var(--color-primary-light)/10]'
            }`}
          >
            {isConnecting ? '连接中...' : '测试连接'}
          </button>
          
          {/* 测试用户登录按钮 */}
          <button
            onClick={handleTestLogin}
            className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-button-primary-hover)] shadow-[var(--button-shadow)]"
          >
            测试用户登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 