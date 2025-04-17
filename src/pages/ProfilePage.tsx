import { ArrowLeft, Moon, Sun, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUser();
  const { 
    currentTime, 
    setCurrentTime,
    isAutoThemeEnabled,
    setIsAutoThemeEnabled
  } = useTheme();

  const handleBack = () => {
    navigate(-1);
  };
  
  const handleLogout = () => {
    // 分发登出操作
    dispatch({ type: 'LOGOUT' });
    
    // 导航到登录页面
    navigate('/login', { replace: true });
  };

  // 处理时间变更
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(e.target.value);
  };

  // 处理自动主题切换开关
  const handleAutoThemeToggle = () => {
    setIsAutoThemeEnabled(!isAutoThemeEnabled);
  };
  
  return (
    <div className="h-screen bg-app pb-safe">
      {/* 顶部导航栏 */}
      <div className="bg-card flex items-center justify-between p-4 border-b border-app-border">
        <button onClick={handleBack} className="p-2">
          <ArrowLeft size={24} className="text-app" />
        </button>
        <h1 className="text-xl font-medium text-app">我的</h1>
        <div className="w-10"></div> {/* 占位保持标题居中 */}
      </div>
      
      {/* 个人资料区域 */}
      <div className="p-4">
        <div className="bg-card rounded-[var(--radius-medium)] shadow-[var(--shadow-sm)] p-[var(--spacing-card)] mb-4 flex items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {state.user?.nickname[0] || 'U'}
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-app">{state.user?.nickname || '用户'}</h2>
            <p className="text-app-secondary text-sm">
              {state.user?.gender === 'male' ? '男' : state.user?.gender === 'female' ? '女' : '其他'} · {state.user?.age || '--'}岁
            </p>
          </div>
        </div>
        
        {/* 设置区域 */}
        <div className="bg-card rounded-[var(--radius-medium)] shadow-[var(--shadow-sm)] overflow-hidden mb-4">
          <h3 className="text-app font-medium p-[var(--spacing-card)] border-b border-app-border">设置</h3>
          
          {/* 时间设置 */}
          <div className="p-[var(--spacing-card)] border-b border-app-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="text-primary mr-2" size={20} />
                <span className="text-app">当前时间</span>
              </div>
              <input
                type="time"
                value={currentTime}
                onChange={handleTimeChange}
                className="bg-card text-app border border-app-border rounded-lg px-2 py-1 text-sm"
              />
            </div>
            <p className="text-xs text-app-secondary mt-1">
              设置当前时间，晚上8点后将自动切换为暗色主题
            </p>
          </div>
          
          {/* 自动主题切换 */}
          <div className="p-[var(--spacing-card)] border-b border-app-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isAutoThemeEnabled ? (
                  <Moon className="text-primary mr-2" size={20} />
                ) : (
                  <Sun className="text-primary mr-2" size={20} />
                )}
                <span className="text-app">自动切换主题</span>
              </div>
              <button 
                onClick={handleAutoThemeToggle}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                  isAutoThemeEnabled ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full transition-all duration-300 top-1 ${
                  isAutoThemeEnabled ? 'left-7' : 'left-1'
                }`}></div>
              </button>
            </div>
          </div>
          
          {/* 主题设置 */}
          <div className="p-[var(--spacing-card)] border-b border-app-border">
            <div className="flex items-center justify-between">
              <span className="text-app">主题设置</span>
              <ThemeSelector />
            </div>
            {isAutoThemeEnabled && (
              <p className="text-xs text-app-secondary mt-1">
                自动主题切换已启用，白天将使用此主题
              </p>
            )}
          </div>
          
          {/* 通知设置 */}
          <div className="p-[var(--spacing-card)] border-b border-app-border">
            <div className="flex items-center justify-between">
              <span className="text-app">通知</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* 关于 */}
          <div className="p-[var(--spacing-card)]">
            <div className="flex items-center justify-between">
              <span className="text-app">关于</span>
              <span className="text-app-secondary text-sm">v1.0.0</span>
            </div>
          </div>
        </div>
        
        {/* 退出按钮 */}
        <button 
          onClick={handleLogout}
          className="w-full py-3 text-center bg-red-500 text-white rounded-[var(--radius-medium)] transition-all duration-[var(--transition-normal)] hover:bg-red-600"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 