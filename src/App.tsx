import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import ProjectsPage from './pages/ProjectsPage';
import ProfilePage from './pages/ProfilePage';
import NewTaskPage from './pages/NewTaskPage';
import FocusPage from './pages/FocusPage';
import AiChatPage from './pages/AiChatPage';
import BottomNavigation from './components/BottomNavigation';
import FloatingButtons from './components/FloatingButtons';
import './index.css';

function AppContent() {
  const location = useLocation();
  const isAiChatPage = location.pathname === '/ai-chat';

  return (
    <div className="mobile-container">
      <div className="app-page">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/new-task" element={<NewTaskPage />} />
          <Route path="/focus/:taskId" element={<FocusPage />} />
          <Route path="/ai-chat" element={<AiChatPage />} />
        </Routes>
        {!isAiChatPage && <FloatingButtons />}
        {!isAiChatPage && <BottomNavigation />}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <AppProvider>
          <Router>
            <AppContent />
          </Router>
        </AppProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
