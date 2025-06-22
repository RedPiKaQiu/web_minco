/**
 * 认证守卫组件，保护需要登录才能访问的页面和功能
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { state } = useUser();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 给用户状态一点时间初始化
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // 只有在初始化后才进行认证检查
    if (isInitialized && (!state.isAuthenticated || !state.user)) {
      console.log('🔐 AuthGuard: 用户未认证，重定向到登录页面');
      navigate('/login', { replace: true });
    }
  }, [isInitialized, state.isAuthenticated, state.user, navigate]);

  // 如果还没有初始化，显示加载状态
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 如果用户未登录，返回null（因为会重定向）
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  // 如果用户已登录，渲染子组件
  return <>{children}</>;
};

export default AuthGuard; 