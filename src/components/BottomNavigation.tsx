import { Link, useLocation } from 'react-router-dom';
import { Package, Ship, Calendar, BookOpen, User } from 'lucide-react';

const BottomNavigation = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center bg-gray-50">
      <div className="app-container flex justify-around items-center h-16 px-2 bg-white border-t border-gray-200">
        <Link to="/ideas" className={`nav-item ${path === '/ideas' ? 'active' : ''}`}>
          <Package size={20} />
          <span className="mt-1">想法仓库</span>
        </Link>
        <Link to="/sailing" className={`nav-item ${path === '/sailing' ? 'active' : ''}`}>
          <Ship size={20} />
          <span className="mt-1">航行</span>
        </Link>
        <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center -mt-4">
            <Calendar size={20} className="text-white" />
          </div>
          <span className="mt-1">今日</span>
        </Link>
        <Link to="/journal" className={`nav-item ${path === '/journal' ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span className="mt-1">航海日志</span>
        </Link>
        <Link to="/profile" className={`nav-item ${path === '/profile' ? 'active' : ''}`}>
          <User size={20} />
          <span className="mt-1">我的</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNavigation; 