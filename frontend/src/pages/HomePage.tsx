import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserForm } from '../components/UserForm';
import { User } from '../types';

interface HomePageProps {
  onUserCreated: (user: User) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onUserCreated }) => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      <div className="welcome-section">
        <h2>{t('app.welcome')}</h2>
        <p>{t('app.welcomeDescription')}</p>
      </div>
      
      <div className="main-content">
        <div>
          <UserForm onUserCreated={onUserCreated} />
        </div>
      </div>
    </div>
  );
};
