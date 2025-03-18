import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import SailingPage from './pages/SailingPage';
import IdeasPage from './pages/IdeasPage';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import BottomNavigation from './components/BottomNavigation';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={
              <>
                <HomePage />
                <BottomNavigation />
              </>
            } />
            <Route path="/sailing" element={<SailingPage />} />
            <Route path="/ideas" element={
              <>
                <IdeasPage />
                <BottomNavigation />
              </>
            } />
            <Route path="/journal" element={
              <>
                <JournalPage />
                <BottomNavigation />
              </>
            } />
            <Route path="/profile" element={
              <>
                <ProfilePage />
                <BottomNavigation />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
