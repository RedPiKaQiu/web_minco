import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { state } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果用户未登录，重定向到登录页面
    if (!state.isAuthenticated || !state.user) {
      navigate('/login', { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate]);

  // 如果用户未登录，返回null（因为会重定向）
  if (!state.isAuthenticated || !state.user) {
    return null;
  }

  // 如果用户已登录，渲染子组件
  return <>{children}</>;
};

export default AuthGuard; 