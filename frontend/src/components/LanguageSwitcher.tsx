import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ className = '' }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <div className={`language-switcher ${className}`}>
      <span className="language-title">{t('language.title')}</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`lang-button ${currentLanguage === 'en' ? 'active' : ''}`}
        title={t('language.switchToEnglish')}
      >
        {t('language.english')}
      </button>
      <button
        onClick={() => changeLanguage('fi')}
        className={`lang-button ${currentLanguage === 'fi' ? 'active' : ''}`}
        title={t('language.switchToFinnish')}
      >
        {t('language.finnish')}
      </button>
    </div>
  );
};
