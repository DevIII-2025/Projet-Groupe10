import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50">
      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-8 animate-bounce">
        CritiQ
      </div>
      <LoadingSpinner size="large" color="blue" />
      <div className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">
        Chargement...
      </div>
    </div>
  );
};

export default PageLoader; 