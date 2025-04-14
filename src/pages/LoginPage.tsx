import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // 需要安装: npm install uuid @types/uuid
import { useUser } from '../context/UserContext';

const LoginPage = () => {
  const { dispatch } = useUser();
  const navigate = useNavigate();

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

  return (
    <div className="h-screen bg-app flex flex-col items-center justify-center p-[var(--spacing-page)]">
      <div className="bg-card rounded-[var(--radius-large)] shadow-[var(--shadow-md)] w-full max-w-sm p-[var(--spacing-card)]">
        <h1 className="text-2xl font-bold text-center text-app mb-8">航行者</h1>
        
        <div className="flex flex-col gap-4">
          {/* 这里可以添加用户名密码输入框和正常登录按钮 */}
          
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