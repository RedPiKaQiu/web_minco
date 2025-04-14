import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage'; // 新增
import SailingPage from './pages/SailingPage';
import IdeasPage from './pages/IdeasPage';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import EmptySchedulePage from './pages/EmptySchedulePage'; // 新增
import AiChatPage from './pages/AiChatPage'; // 新增聊天页面
import NewTaskPage from './pages/NewTaskPage';
import BottomNavigation from './components/BottomNavigation';

// 添加CSS样式，通过类名控制导航栏的隐藏
const navStyles = `
  body.hide-navigation .navigation-container {
    display: none;
  }
`;

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
    <ThemeProvider>
      <AppProvider>
        <Router>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<StartPage />} /> {/* 默认起始页 */}
              <Route path="/home" element={
                <>
                  <HomePage />
                </>
              } />
              <Route path="/empty-schedule" element={<EmptySchedulePage />} /> {/* 新增空日程页面 */}
              <Route path="/sailing" element={<SailingPage />} />
              <Route path="/ai-chat" element={<AiChatPage />} /> {/* 聊天页面 */}
              <Route path="/ideas" element={
                <>
                  <IdeasPage />
                </>
              } />
              <Route path="/journal" element={
                <>
                  <JournalPage />
                </>
              } />
              <Route path="/profile" element={
                <>
                  <ProfilePage />
                </>
              } />
              <Route path="/new-task" element={<NewTaskPage />} />
            </Routes>
            <div className="navigation-container">
              <BottomNavigation /> {/* 确保导航栏始终显示 */}
            </div>
          </div>
        </Router>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
