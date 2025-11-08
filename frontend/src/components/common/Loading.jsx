import React from 'react';
import { useTranslation } from 'react-i18next';

const Loading = () => {
  const { t } = useTranslation();
  
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{t('common.loading')}</p>
    </div>
  );
};

export default Loading;
