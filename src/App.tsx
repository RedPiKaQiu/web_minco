import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage'; // 新增
import SailingPage from './pages/SailingPage';
import IdeasPage from './pages/IdeasPage';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import AiChatPage from './pages/AiChatPage'; // 新增聊天页面
import NewTaskPage from './pages/NewTaskPage';
import ReviewPage from './pages/ReviewPage'; // 新增回顾页面
import NightPage from './pages/NightPage'; // 新增晚安页面
import BottomNavigation from './components/BottomNavigation';
import { UserProvider } from './context/UserContext';
import LoginPage from './pages/LoginPage';
import { useUser } from './context/UserContext';

// 添加CSS样式，通过类名控制导航栏的隐藏
const navStyles = `
  body.hide-navigation .navigation-container {
    display: none;
  }
`;

// 创建一个路由保护组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { state } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [state.isAuthenticated, navigate]);
  
  return state.isAuthenticated ? <>{children}</> : null;
};

// 将BottomNavigation抽取成一个独立组件，可以根据路由条件渲染
const NavigationWrapper = () => {
  const location = useLocation();
  
  // 只在登录页面不显示底部导航
  if (location.pathname === '/login') {
    return null;
  }
  
  return (
    <div className="navigation-container">
      <BottomNavigation />
    </div>
  );
};

function App() {
  // 添加样式到document中
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = navStyles;
    document.head.appendChild(styleTag);

    // 强制使用海洋主题
    if (!localStorage.getItem('theme')) {
      localStorage.setItem('theme', 'ocean');
    }

    return () => {
      styleTag.remove();
    };
  }, []);

  return (
    <UserProvider>
      <ThemeProvider>
        <AppProvider>
          <Router>
            <div className="app-container">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <StartPage />
                  </ProtectedRoute>
                } />
                <Route path="/home" element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                } />
                <Route path="/sailing" element={<SailingPage />} />
                <Route path="/ai-chat" element={<AiChatPage />} /> {/* 聊天页面 */}
                <Route path="/review" element={<ReviewPage />} /> {/* 回顾页面 */}
                <Route path="/night" element={<NightPage />} /> {/* 晚安页面 */}
                <Route path="/ideas" element={
                  <ProtectedRoute>
                    <IdeasPage />
                  </ProtectedRoute>
                } />
                <Route path="/journal" element={
                  <ProtectedRoute>
                    <JournalPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/new-task" element={<NewTaskPage />} />
              </Routes>
              <NavigationWrapper />
            </div>
          </Router>
        </AppProvider>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;
