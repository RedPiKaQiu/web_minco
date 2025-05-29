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
    <div className="page-content safe-area-top">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between py-6">
        <button onClick={handleBack} className="p-2 touch-target no-tap-highlight">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-medium">我的</h1>
        <div className="w-10"></div> {/* 占位保持标题居中 */}
      </div>
      
      {/* 个人资料区域 */}
      <div>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {state.user?.nickname[0] || 'U'}
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">{state.user?.nickname || '用户'}</h2>
            <p className="text-gray-500 text-sm">
              {state.user?.gender === 'male' ? '男' : state.user?.gender === 'female' ? '女' : '其他'} · {state.user?.age || '--'}岁
            </p>
          </div>
        </div>
        
        {/* 设置区域 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          <h3 className="text-gray-900 font-medium p-4 border-b border-gray-200">设置</h3>
          
          {/* 时间设置 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="text-blue-500 mr-2" size={20} />
                <span className="text-gray-900">当前时间</span>
              </div>
              <input
                type="time"
                value={currentTime}
                onChange={handleTimeChange}
                className="bg-white text-gray-900 border border-gray-300 rounded-lg px-2 py-1 text-sm touch-target"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              设置当前时间，晚上8点后将自动切换为暗色主题
            </p>
          </div>
          
          {/* 自动主题切换 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isAutoThemeEnabled ? (
                  <Moon className="text-blue-500 mr-2" size={20} />
                ) : (
                  <Sun className="text-blue-500 mr-2" size={20} />
                )}
                <span className="text-gray-900">自动切换主题</span>
              </div>
              <button 
                onClick={handleAutoThemeToggle}
                className={`w-12 h-6 rounded-full relative transition-all duration-300 touch-target no-tap-highlight ${
                  isAutoThemeEnabled ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute w-4 h-4 bg-white rounded-full transition-all duration-300 top-1 ${
                  isAutoThemeEnabled ? 'left-7' : 'left-1'
                }`}></div>
              </button>
            </div>
          </div>
          
          {/* 主题设置 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">主题设置</span>
              <ThemeSelector />
            </div>
            {isAutoThemeEnabled && (
              <p className="text-xs text-gray-500 mt-1">
                自动主题切换已启用，白天将使用此主题
              </p>
            )}
          </div>
          
          {/* 通知设置 */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">通知</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* 关于 */}
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-900">关于</span>
              <span className="text-gray-500 text-sm">v1.0.0</span>
            </div>
          </div>
        </div>
        
        {/* 退出按钮 */}
        <button 
          onClick={handleLogout}
          className="w-full py-3 text-center bg-red-500 text-white rounded-lg transition-all hover:bg-red-600 touch-target no-tap-highlight"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 