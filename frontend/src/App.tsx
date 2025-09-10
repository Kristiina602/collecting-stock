import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Icon, MushroomIcon } from './components/Icon';
import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import './App.css';

const AppContent: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const handleUserCreated = () => {
    // User creation is handled in the home page
    // No need to track selectedUser at App level anymore
  };

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div></div>
          <h1 className="icon-with-text" style={{ justifyContent: 'center', margin: 0 }}>
            <Icon name="berry" size={32} />
            <MushroomIcon species="chanterelle" size={32} />
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
        </div>
      </nav>

      <Routes>
        <Route 
          path="/" 
          element={<HomePage onUserCreated={handleUserCreated} />} 
        />
        <Route 
          path="/collections" 
          element={<CollectionsPage />} 
        />
      </Routes>
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
