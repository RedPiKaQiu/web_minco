/**
 * 个人资料页面，显示用户信息、使用统计和账户设置功能
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { resetMockData, isTestUser } from '../api/mock';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useUser();
  const { 
    currentTime, 
    setCurrentTime,
    isAutoThemeEnabled,
    setIsAutoThemeEnabled
  } = useTheme();
  
  const [dailyPlanTime, setDailyPlanTime] = useState("08:00");
  const [dailyReviewTime, setDailyReviewTime] = useState("21:00");

  // 检查是否为测试用户
  const userIsTest = isTestUser();

  // 不强制重定向，而是显示未登录状态或登录界面

  const handleLogout = () => {
    // 清除所有存储的数据
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('access_token');
    
    // 清除应用状态数据
    localStorage.removeItem('appState');
    
    // 如果是测试用户，也清除测试数据
    if (userIsTest) {
      localStorage.removeItem('mock_tasks');
      localStorage.removeItem('mock_projects');
    }
    
    // 分发登出操作
    dispatch({ type: 'LOGOUT' });
    
    // 导航到登录页面
    navigate('/login', { replace: true });
  };

  // 重置测试数据
  const handleResetTestData = () => {
    resetMockData();
    alert('测试数据已重置！');
  };

  // 处理时间变更
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(e.target.value);
  };

  // 处理自动主题切换开关
  const handleAutoThemeToggle = () => {
    setIsAutoThemeEnabled(!isAutoThemeEnabled);
  };
  
  // 认证检查已由AuthGuard处理，这里不需要重复检查
  // 因为AuthGuard确保了用户已登录，所以这里可以安全地使用state.user
  const user = state.user!;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-md mx-auto px-4 pb-20">

          {/* 测试用户提示卡片 */}
          {userIsTest && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <div className="flex items-center">
                <span className="text-yellow-600 text-lg mr-2">🧪</span>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-yellow-800">测试模式</h3>
                  <p className="text-xs text-yellow-600 mt-1">
                    您当前使用的是测试账户，所有数据都保存在本地，不会同步到服务器
                  </p>
                </div>
              </div>
              <button
                onClick={handleResetTestData}
                className="mt-3 w-full px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
              >
                重置测试数据
              </button>
            </div>
          )}

          {/* 用户资料卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {(user.nickname || user.username)[0]?.toUpperCase() || 'U'}
                </span>
              </div>

              <div className="ml-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900">{user.nickname || user.username}</h2>
                  {userIsTest && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">
                      测试用户
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {user.gender && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                      {user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                    {user.age ? `${user.age}岁` : '年龄未设置'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">长期目标</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="mr-2">🏃</span>
                    <span>保持身体健康</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="mr-2">📚</span>
                    <span>持续学习成长</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">近期重点</h3>
                <ul className="space-y-2">
                  <li className="flex items-center text-gray-700">
                    <span className="mr-2">📝</span>
                    <span>完成重要项目</span>
                  </li>
                  <li className="flex items-center text-gray-700">
                    <span className="mr-2">🏆</span>
                    <span>提升工作效率</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 设置卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900">设置</h2>

            <div className="space-y-4">
              {/* 每日规划时间 */}
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">
                  每日规划时间
                </label>
                <select 
                  value={dailyPlanTime} 
                  onChange={(e) => setDailyPlanTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="07:00">07:00</option>
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  每天在这个时间，系统会提醒你规划当天的重要事项
                </p>
              </div>

              {/* 每日回顾时间 */}
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">
                  每日回顾时间
                </label>
                <select 
                  value={dailyReviewTime} 
                  onChange={(e) => setDailyReviewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                  <option value="23:00">23:00</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  每天在这个时间，系统会提醒你回顾当天的完成情况
                </p>
              </div>

              {/* 当前时间设置 */}
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">
                  当前时间
                </label>
                <input
                  type="time"
                  value={currentTime}
                  onChange={handleTimeChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  设置当前时间，晚上8点后将自动切换为暗色主题
                </p>
              </div>

              {/* 自动主题切换 */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium text-gray-700">
                    自动切换主题
                  </label>
                  <button 
                    onClick={handleAutoThemeToggle}
                    className={`w-12 h-6 rounded-full relative transition-all duration-300 touch-target no-tap-highlight ${
                      isAutoThemeEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute w-4 h-4 bg-white rounded-full transition-all duration-300 top-1 ${
                      isAutoThemeEnabled ? 'left-7' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                {isAutoThemeEnabled && (
                  <p className="text-sm text-gray-500 mt-1">
                    自动主题切换已启用，根据时间自动调整主题
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 退出登录按钮 */}
          <button 
            onClick={handleLogout}
            className="w-full py-3 text-center bg-red-500 text-white rounded-xl font-medium transition-all hover:bg-red-600 touch-target no-tap-highlight shadow-sm"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 