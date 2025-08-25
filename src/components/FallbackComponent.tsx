import React from 'react';
import { AlertCircle, RefreshCw, Database, BarChart3 } from 'lucide-react';

interface FallbackComponentProps {
  title?: string;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  type?: 'error' | 'loading' | 'empty';
}

export const FallbackComponent: React.FC<FallbackComponentProps> = ({
  title = "Unable to Load Module",
  message = "This module is experiencing issues. Please try refreshing the page or contact support.",
  showRetry = true,
  onRetry,
  type = 'error'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />;
      case 'empty':
        return <Database className="w-16 h-16 text-gray-400" />;
      default:
        return <AlertCircle className="w-16 h-16 text-red-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'loading':
        return {
          title: 'text-blue-600 dark:text-blue-400',
          message: 'text-gray-600 dark:text-gray-300',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'empty':
        return {
          title: 'text-gray-600 dark:text-gray-300',
          message: 'text-gray-500 dark:text-gray-400',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
      default:
        return {
          title: 'text-red-600 dark:text-red-400',
          message: 'text-gray-600 dark:text-gray-300',
          button: 'bg-red-600 hover:bg-red-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          {getIcon()}
        </div>
        
        <h3 className={`text-xl font-semibold mb-3 ${colors.title}`}>
          {title}
        </h3>
        
        <p className={`mb-6 ${colors.message}`}>
          {message}
        </p>

        {showRetry && (
          <button
            onClick={onRetry || (() => window.location.reload())}
            className={`inline-flex items-center gap-2 px-6 py-3 ${colors.button} text-white rounded-lg font-medium transition-colors`}
          >
            <RefreshCw className="w-4 h-4" />
            {type === 'loading' ? 'Loading...' : 'Retry'}
          </button>
        )}

        {type === 'empty' && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No data available to display
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FallbackComponent;