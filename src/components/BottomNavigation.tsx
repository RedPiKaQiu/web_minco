/**
 * 底部导航栏组件，提供首页、时间轴、项目、个人等主要页面的导航
 */
import { Home, Clock, FolderKanban, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: '首页', icon: Home, path: '/home' },
    { id: 'timeline', label: '时间轴', icon: Clock, path: '/timeline' },
    { id: 'projects', label: '项目', icon: FolderKanban, path: '/projects' },
    { id: 'profile', label: '我的', icon: User, path: '/profile' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="bottom-navigation">
      <div className="flex justify-around items-center h-full px-4" style={{ paddingBottom: 'var(--safe-area-bottom)' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors touch-target no-tap-highlight ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation; 