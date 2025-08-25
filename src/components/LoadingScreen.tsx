import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-64',
    lg: 'h-screen'
  };

  const spinnerSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} bg-gray-50 dark:bg-gray-900`}>
      <div className="text-center">
        <Loader2 className={`${spinnerSizes[size]} text-blue-500 animate-spin mx-auto mb-4`} />
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;