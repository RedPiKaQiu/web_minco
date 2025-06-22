import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/HomePage';
import TimelinePage from './pages/TimelinePage';
import ProjectsPage from './pages/ProjectsPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import NewTaskPage from './pages/NewTaskPage';
import FocusPage from './pages/FocusPage';
import AiChatPage from './pages/AiChatPage';
import BottomNavigation from './components/BottomNavigation';
import FloatingButtons from './components/FloatingButtons';
import ItemAddDrawer from './components/ItemAddDrawer';
import AuthGuard from './components/AuthGuard';
import './index.css';

function AppContent() {
  const location = useLocation();
  const [isTaskAddDrawerOpen, setIsTaskAddDrawerOpen] = useState(false);
  
  const isAiChatPage = location.pathname === '/ai-chat';
  const isNewTaskPage = location.pathname === '/new-task';
  const isLoginPage = location.pathname === '/login';
  const shouldHideNavigation = isAiChatPage || isNewTaskPage || isLoginPage;

  return (
    <div className="mobile-container">
      <div className="app-page">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          } />
          <Route path="/timeline" element={
            <AuthGuard>
              <TimelinePage />
            </AuthGuard>
          } />
          <Route path="/projects" element={
            <AuthGuard>
              <ProjectsPage />
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/new-task" element={
            <AuthGuard>
              <NewTaskPage />
            </AuthGuard>
          } />
          <Route path="/focus/:taskId" element={
            <AuthGuard>
              <FocusPage />
            </AuthGuard>
          } />
          <Route path="/ai-chat" element={
            <AuthGuard>
              <AiChatPage />
            </AuthGuard>
          } />
        </Routes>
        {!shouldHideNavigation && (
          <FloatingButtons onOpenTaskDrawer={() => setIsTaskAddDrawerOpen(true)} />
        )}
        {!shouldHideNavigation && <BottomNavigation />}
        <ItemAddDrawer 
          isOpen={isTaskAddDrawerOpen} 
          onClose={() => setIsTaskAddDrawerOpen(false)} 
        />
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
