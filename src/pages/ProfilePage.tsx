import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';

const ProfilePage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="h-screen bg-app">
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
        <div className="bg-card rounded-lg shadow-sm p-4 mb-4 flex items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
            S
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-app">Shell</h2>
            <p className="text-app-secondary text-sm">专注效率，提升每一天</p>
          </div>
        </div>
        
        {/* 设置区域 */}
        <div className="bg-card rounded-lg shadow-sm overflow-hidden mb-4">
          <h3 className="text-app font-medium p-4 border-b border-app-border">设置</h3>
          
          {/* 主题设置 */}
          <div className="p-4 border-b border-app-border">
            <div className="flex items-center justify-between">
              <span className="text-app">主题设置</span>
              <ThemeSelector />
            </div>
          </div>
          
          {/* 其他设置项 */}
          <div className="p-4 border-b border-app-border">
            <div className="flex items-center justify-between">
              <span className="text-app">通知</span>
              <div className="w-12 h-6 bg-gray-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-app">关于</span>
              <span className="text-app-secondary text-sm">v1.0.0</span>
            </div>
          </div>
        </div>
        
        {/* 退出按钮 */}
        <button className="w-full py-3 text-center bg-red-500 text-white rounded-lg">
          退出登录
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 