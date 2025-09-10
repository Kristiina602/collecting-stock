import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <div className={`language-switcher ${className}`}>
      <button
        onClick={() => changeLanguage('en')}
        className={`lang-button ${currentLanguage === 'en' ? 'active' : ''}`}
        title="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('fi')}
        className={`lang-button ${currentLanguage === 'fi' ? 'active' : ''}`}
        title="Vaihda suomeksi"
      >
        FI
      </button>
    </div>
  );
};
