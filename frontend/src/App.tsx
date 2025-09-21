import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { CreateUserDialog } from './components/CreateUserDialog';
import { LoginDialog } from './components/LoginDialog';
import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { PriceMonitoringPage } from './pages/PriceMonitoringPage';
import { User } from './types';
import './App.css';

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [newlyCreatedUser, setNewlyCreatedUser] = useState<User | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const handleUserCreated = (user: User) => {
    setNewlyCreatedUser(user);
    setLoggedInUser(null); // Clear logged in user when creating new user
    // Navigate to Collections page after successful user creation
    navigate('/collections');
  };

  const handleUserLoggedIn = (user: User) => {
    setLoggedInUser(user);
    setNewlyCreatedUser(null); // Clear newly created user when logging in
    // Navigate to Collections page after successful login
    navigate('/collections');
  };

  const openCreateUserDialog = () => {
    setIsCreateUserDialogOpen(true);
  };

  const closeCreateUserDialog = () => {
    setIsCreateUserDialogOpen(false);
  };

  const openLoginDialog = () => {
    setIsLoginDialogOpen(true);
  };

  const closeLoginDialog = () => {
    setIsLoginDialogOpen(false);
  };

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div></div>
          <h1 className="icon-with-text" style={{ justifyContent: 'center', margin: 0 }}>
            {t('app.title')}
          </h1>
          <LanguageSwitcher />
        </div>
        <p>{t('app.subtitle')}</p>
      </header>

      <nav className="navigation">
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            {t('navigation.home')}
          </Link>
          <Link 
            to="/collections" 
            className={`nav-link ${location.pathname === '/collections' ? 'active' : ''}`}
          >
            {t('navigation.collections')}
          </Link>
          <Link 
            to="/price-monitoring" 
            className={`nav-link ${location.pathname === '/price-monitoring' ? 'active' : ''}`}
          >
            {t('navigation.priceMonitoring')}
          </Link>
          {location.pathname === '/' && (
            <div className="nav-links-right">
              <button 
                className="nav-link" 
                onClick={openLoginDialog}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '12px' }}
              >
                {t('user.login')}
              </button>
              <button 
                className="nav-link" 
                onClick={openCreateUserDialog}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {t('user.createAccount')}
              </button>
            </div>
          )}
        </div>
      </nav>

      <Routes>
        <Route 
          path="/" 
          element={<HomePage />} 
        />
        <Route 
          path="/collections" 
          element={<CollectionsPage preSelectedUser={newlyCreatedUser || loggedInUser} />} 
        />
        <Route 
          path="/price-monitoring" 
          element={<PriceMonitoringPage />} 
        />
      </Routes>

      <CreateUserDialog 
        isOpen={isCreateUserDialogOpen}
        onClose={closeCreateUserDialog}
        onUserCreated={handleUserCreated}
      />
      
      <LoginDialog 
        isOpen={isLoginDialogOpen}
        onClose={closeLoginDialog}
        onUserLoggedIn={handleUserLoggedIn}
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
