import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // 需要安装: npm install uuid @types/uuid
import { useUser } from '../context/UserContext';
import { useState, useEffect } from 'react';
import { testConnection } from '../api/test';
import { login, register } from '../api/user';

const LoginPage = () => {
  const { state, dispatch } = useUser();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState<'未连接' | '连接中...' | '连接成功' | '连接失败'>('未连接');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  // 如果用户已登录，重定向到主页
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      navigate('/', { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate]);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    
    try {
      const response = await login(username, password);
      
      if (response.access_token) {
        // 将token存储到localStorage
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('token_type', response.token_type);
        
        // 创建临时用户数据 (实际项目中应该有一个获取用户信息的API)
        const tempUser = {
          id: 'logged-user',
          nickname: username,
          gender: 'other' as const,
          age: 30,
          createdAt: new Date().toISOString()
        };
        
        // 登录成功，更新用户状态
        dispatch({ type: 'LOGIN', payload: tempUser });
        
        // 导航到主页
        navigate('/');
      }
    } catch (error) {
      console.error('登录失败:', error);
      setLoginError('登录失败，请检查用户名和密码');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    // 表单验证
    if (password !== confirmPassword) {
      setRegisterError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setRegisterError('密码长度不能少于6个字符');
      return;
    }

    setIsRegistering(true);
    
    try {
      const userData = {
        email,
        password,
        full_name: fullName
      };

      const response = await register(userData);
      
      if (response.access_token) {
        // 注册成功，但不直接登录
        // 保存注册的邮箱，用于显示成功消息
        setRegisteredEmail(email);
        
        // 显示注册成功界面
        setShowRegisterSuccess(true);
        setShowRegisterForm(false);
        
        // 清空表单数据
        setEmail('');
        setFullName('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('注册失败:', error);
      setRegisterError('注册失败，请稍后重试或使用其他邮箱');
    } finally {
      setIsRegistering(false);
    }
  };

  const showLoginFormHandler = () => {
    setShowLoginForm(true);
    setShowRegisterForm(false);
    setShowRegisterSuccess(false);
    // 清空表单错误
    setLoginError('');
    setRegisterError('');
  };

  const showRegisterFormHandler = () => {
    setShowRegisterForm(true);
    setShowLoginForm(false);
    setShowRegisterSuccess(false);
    // 清空表单错误
    setLoginError('');
    setRegisterError('');
  };

  const backToMainHandler = () => {
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setShowRegisterSuccess(false);
    // 清空表单
    setUsername('');
    setPassword('');
    setEmail('');
    setFullName('');
    setConfirmPassword('');
    // 清空表单错误
    setLoginError('');
    setRegisterError('');
  };

  return (
    <div className="h-screen bg-app flex flex-col items-center justify-center p-[var(--spacing-page)]">
      <div className="bg-card rounded-[var(--radius-large)] shadow-[var(--shadow-md)] w-full max-w-sm p-[var(--spacing-card)]">
        <h1 className="text-2xl font-bold text-center text-app mb-8">航行者</h1>
        
        {!showLoginForm && !showRegisterForm && !showRegisterSuccess ? (
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
            
            {/* 微信登录按钮 */}
            <button
              className="w-full bg-[#07C160] text-white rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[#06AE56] flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.69 4.46c-4.4 0-8 2.73-8 6.11 0 1.84 1.15 3.51 2.93 4.58a.32.32 0 0 1 .12.38l-.53 1.73c-.04.12.1.23.21.17l1.97-1.08a.34.34 0 0 1 .3-.02 9.49 9.49 0 0 0 3 .47c.44 0 .87-.03 1.29-.09" />
                <path d="M19.99 13.67c0-3.06-3.05-5.56-6.82-5.56s-6.82 2.5-6.82 5.56c0 3.07 3.05 5.56 6.82 5.56.72 0 1.42-.09 2.09-.24a.256.256 0 0 1 .22.01l1.37.77c.1.05.22-.04.19-.15l-.38-1.26a.248.248 0 0 1 .09-.28c1.28-.9 2.1-2.17 2.24-3.58" />
                <path d="M8 9h-.5a.5.5 0 0 0 0 1h.5a.5.5 0 0 0 0-1m3 0h-.5a.5.5 0 0 0 0 1h.5a.5.5 0 0 0 0-1m3 3.5a.5.5 0 0 0-.5-.5h-.5a.5.5 0 0 0 0 1h.5a.5.5 0 0 0 .5-.5m3 0a.5.5 0 0 0-.5-.5h-.5a.5.5 0 0 0 0 1h.5a.5.5 0 0 0 .5-.5" />
              </svg>
              微信登录
            </button>
            
            {/* 账号密码登录入口 */}
            <button
              onClick={showLoginFormHandler}
              className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-button-primary-hover)] shadow-[var(--button-shadow)]"
            >
              账号密码登录
            </button>
            
            {/* 测试用户登录按钮 */}
            <button
              onClick={handleTestLogin}
              className="w-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-primary-light)/10] mt-2"
            >
              测试用户登录
            </button>
          </div>
        ) : showLoginForm ? (
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="username" className="text-sm text-app-secondary mb-1">
                用户名/邮箱
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-app border border-[var(--color-border)] rounded-[var(--input-radius)] py-2 px-3 text-app focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="password" className="text-sm text-app-secondary mb-1">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-app border border-[var(--color-border)] rounded-[var(--input-radius)] py-2 px-3 text-app focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            
            {loginError && (
              <div className="text-red-500 text-sm text-center">{loginError}</div>
            )}
            
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-button-primary-hover)] shadow-[var(--button-shadow)]"
            >
              {isLoggingIn ? '登录中...' : '登录'}
            </button>
            
            <button
              type="button"
              onClick={backToMainHandler}
              className="w-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--button-radius)] py-2 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-primary-light)/10]"
            >
              返回
            </button>
            
            <div className="text-center text-sm text-app-secondary mt-2">
              没有账号？ 
              <button 
                type="button"
                onClick={showRegisterFormHandler}
                className="text-[var(--color-primary)] ml-1">
                立即注册
              </button>
            </div>
          </form>
        ) : showRegisterSuccess ? (
          <div className="flex flex-col gap-4 items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-app text-center">注册成功！</h2>
            
            <p className="text-app-secondary text-center mb-2">
              您的账号 <span className="font-medium text-app">{registeredEmail}</span> 已注册成功。
            </p>
            
            <button
              onClick={showLoginFormHandler}
              className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-button-primary-hover)] shadow-[var(--button-shadow)]"
            >
              返回登录
            </button>
            
            <button
              type="button"
              onClick={backToMainHandler}
              className="w-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--button-radius)] py-2 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-primary-light)/10]"
            >
              返回首页
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="email" className="text-sm text-app-secondary mb-1">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-app border border-[var(--color-border)] rounded-[var(--input-radius)] py-2 px-3 text-app focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="fullName" className="text-sm text-app-secondary mb-1">
                姓名(选填)
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-app border border-[var(--color-border)] rounded-[var(--input-radius)] py-2 px-3 text-app focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="register-password" className="text-sm text-app-secondary mb-1">
                密码
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-app border border-[var(--color-border)] rounded-[var(--input-radius)] py-2 px-3 text-app focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            
            <div className="flex flex-col">
              <label htmlFor="confirm-password" className="text-sm text-app-secondary mb-1">
                确认密码
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-app border border-[var(--color-border)] rounded-[var(--input-radius)] py-2 px-3 text-app focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            
            {registerError && (
              <div className="text-red-500 text-sm text-center">{registerError}</div>
            )}
            
            <button
              type="submit"
              disabled={isRegistering}
              className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-button-primary-hover)] shadow-[var(--button-shadow)]"
            >
              {isRegistering ? '注册中...' : '注册'}
            </button>
            
            <button
              type="button"
              onClick={backToMainHandler}
              className="w-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--button-radius)] py-2 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-primary-light)/10]"
            >
              返回
            </button>
            
            <div className="text-center text-sm text-app-secondary mt-2">
              已有账号？ 
              <button 
                type="button"
                onClick={showLoginFormHandler}
                className="text-[var(--color-primary)] ml-1">
                立即登录
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 