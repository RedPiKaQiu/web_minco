/**
 * 登录页面，提供用户账号密码登录和短信验证码登录功能
 */
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // 需要安装: npm install uuid @types/uuid
import { useUser } from '../context/UserContext';
import { useState, useEffect } from 'react';
import { testConnection } from '../api/test';
import { login, register } from '../api/user';
import { resetMockData } from '../api/mock';
import { User } from '../types';

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
      navigate('/home', { replace: true });
    }
  }, [state.isAuthenticated, state.user, navigate]);

  const handleTestLogin = () => {
    try {
      // 创建测试用户数据
      const testUser = {
        id: uuidv4(),
        username: 'Shell',
        email: 'shell@test.com',
        nickname: 'Shell',
        gender: 'female' as const,
        age: 25,
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // 设置测试用户的access_token（确保AppContext能正常工作）
      localStorage.setItem('access_token', 'test-token-' + Date.now());

      // 清空所有表单状态
      setUsername('');
      setPassword('');
      setLoginError('');
      setRegisterError('');

      // 分发登录操作
      dispatch({ type: 'LOGIN', payload: testUser });
      
      console.log('✅ 测试用户登录成功', testUser);
      
      // 导航到主页 - 直接导航到/home避免重定向竞态
      navigate('/home', { replace: true });
    } catch (error) {
      console.error('❌ 测试用户登录失败:', error);
      setLoginError('测试用户登录失败，请稍后重试');
      // 清除可能的问题状态
      handleClearLoginState();
    }
  };

  // 清除登录状态的辅助函数
  const handleClearLoginState = () => {
    try {
      // 清除所有本地存储的认证信息
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      
      // 清除测试数据（可选，避免污染下次登录）
      localStorage.removeItem('mock_tasks');
      localStorage.removeItem('mock_projects');
      
      // 清除缓存数据
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('timeline-tasks-') || key.startsWith('timeline-cache-metadata')) {
          localStorage.removeItem(key);
        }
      });
      
      // 重置用户状态
      dispatch({ type: 'LOGOUT' });
      
      console.log('🧹 已清除登录状态和缓存数据');
    } catch (error) {
      console.error('❌ 清除登录状态失败:', error);
    }
  };

  // 在组件挂载时设置全局错误处理
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('🚨 全局错误捕获:', event.error);
      
      // 检查是否是时间相关的错误
      if (event.error && (
        event.error.message?.includes('Invalid time value') ||
        event.error.message?.includes('format') ||
        event.error.message?.includes('parseISO')
      )) {
        console.log('🔧 检测到时间格式错误，清除登录状态');
        setLoginError('检测到数据格式错误，已自动清除登录状态，请重新登录');
        handleClearLoginState();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 未处理的Promise拒绝:', event.reason);
      
      // 检查是否是时间相关的错误
      if (event.reason && (
        event.reason.message?.includes('Invalid time value') ||
        event.reason.message?.includes('format') ||
        event.reason.message?.includes('parseISO')
      )) {
        console.log('🔧 检测到时间格式错误，清除登录状态');
        setLoginError('检测到数据格式错误，已自动清除登录状态，请重新登录');
        handleClearLoginState();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [dispatch]);

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
    
    console.log('🔐 开始登录:', { username, password: '***' });
    
    try {
      const response = await login({ username, password });
      console.log('✅ 登录API完整响应:', JSON.stringify(response, null, 2));
      
      if (response && response.access_token) {
        console.log('✅ 登录成功，处理用户数据');
        
        let userData: User;
        
        // 处理API返回的实际格式：{access_token, token_type, user_id, username}
        if (response.user) {
          // 标准格式：有完整的user对象
          userData = response.user;
          console.log('👤 使用API返回的用户数据:', userData);
        } else if (response.user_id && response.username) {
          // 实际API格式：从user_id和username构建用户对象
          userData = {
            id: String(response.user_id),
            username: response.username,
            email: response.username, // 假设username就是email
            created_at: new Date().toISOString()
          };
          console.log('🔧 从响应数据构建用户对象:', userData);
        } else {
          // 备用方案：使用输入的用户名创建基本用户对象
          userData = {
            id: `user-${Date.now()}`,
            username: username,
            email: username.includes('@') ? username : `${username}@example.com`,
            created_at: new Date().toISOString()
          };
          console.log('🆘 使用备用用户数据:', userData);
        }
        
        // 更新用户状态
        dispatch({ type: 'LOGIN', payload: userData });
        console.log('📝 用户状态已更新:', userData);
        
        // 清空表单数据
        setUsername('');
        setPassword('');
        setLoginError('');
        
        // 稍微延迟导航，确保状态更新完成
        setTimeout(() => {
          console.log('🚀 现在导航到主页');
          navigate('/home', { replace: true });
        }, 100);
      } else {
        console.error('❌ 登录响应缺少access_token:', response);
        setLoginError('服务器响应格式错误，请稍后重试');
      }
    } catch (error) {
      console.error('❌ 登录失败:', error);
      if (error instanceof Error) {
        setLoginError(error.message);
      } else {
        setLoginError('登录失败，请检查网络连接和后端服务状态');
      }
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
    
    console.log('📝 开始注册:', { email, fullName, password: '***' });
    
    try {
      const userData = {
        username: email, // 使用邮箱作为用户名
        email,
        password,
        full_name: fullName
      };

      const response = await register(userData);
      console.log('✅ 注册API完整响应:', JSON.stringify(response, null, 2));
      
      if (response && response.access_token) {
        console.log('✅ 注册成功，显示成功页面');
        
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
        
        console.log('✅ 注册成功状态已更新，showRegisterSuccess=true');
      } else {
        console.error('❌ 注册响应缺少access_token:', response);
        setRegisterError('服务器响应格式错误，请稍后重试');
      }
    } catch (error) {
      console.error('❌ 注册失败:', error);
      if (error instanceof Error) {
        setRegisterError(error.message);
      } else {
        setRegisterError('注册失败，请稍后重试或使用其他邮箱');
      }
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
        
        {/* 调试信息面板 */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs border">
          <div className="font-medium text-gray-700 mb-2">🔍 调试信息</div>
          <div className="space-y-1 text-gray-600">
            <div>认证状态: {state.isAuthenticated ? '✅ 已认证' : '❌ 未认证'}</div>
            <div>用户信息: {state.user ? `✅ 存在 (${state.user.username})` : '❌ 不存在'}</div>
            <div>Token: {localStorage.getItem('access_token') ? '✅ 存在' : '❌ 不存在'}</div>
            <div>显示状态: {
              showRegisterSuccess ? '注册成功页面' : 
              showLoginForm ? '登录表单' : 
              showRegisterForm ? '注册表单' : '主界面'
            }</div>
          </div>
        </div>
        
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
            
            {/* 重置测试数据按钮 */}
            <button
              onClick={resetMockData}
              className="w-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-primary-light)/10] mt-2"
            >
              重置测试数据
            </button>
            
            {/* 清除缓存数据按钮 */}
            <button
              onClick={handleClearLoginState}
              className="w-full border border-orange-500 text-orange-500 bg-transparent rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-orange-50 mt-2"
            >
              清除缓存数据
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
            
            <h2 className="text-xl font-semibold text-app text-center">🎉 注册成功！</h2>
            
            <div className="text-center mb-4">
              <p className="text-app-secondary mb-2">
                您的账号 <span className="font-medium text-app">{registeredEmail}</span> 已注册成功！
              </p>
              <p className="text-sm text-app-secondary">
                现在可以使用您的账号登录了
              </p>
            </div>
            
            <button
              onClick={showLoginFormHandler}
              className="w-full bg-[var(--color-button-primary)] text-[var(--color-button-text)] rounded-[var(--button-radius)] py-3 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-button-primary-hover)] shadow-[var(--button-shadow)] flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              立即登录
            </button>
            
            <button
              type="button"
              onClick={backToMainHandler}
              className="w-full border border-[var(--color-primary)] text-[var(--color-primary)] bg-transparent rounded-[var(--button-radius)] py-2 font-medium transition-all duration-[var(--transition-normal)] hover:bg-[var(--color-primary-light)/10]"
            >
              稍后登录
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