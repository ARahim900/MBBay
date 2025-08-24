import React from 'react';
import { ContractorErrorBoundary } from './ErrorBoundary';
import { ToastProvider } from './ErrorToast';
import { ContractorTrackerDashboard } from '../ContractorTrackerDashboard';

/**
 * ContractorDashboardWrapper - Wraps the contractor dashboard with error handling
 * Provides comprehensive error boundaries, toast notifications, and offline support
 */
export const ContractorDashboardWrapper: React.FC = () => {
  return (
    <ToastProvider>
      <ContractorErrorBoundary
        onError={(error, errorInfo) => {
          // Log error for monitoring
          console.error('Contractor Dashboard Error:', error, errorInfo);
          
          // In production, send to error tracking service
          if (process.env.NODE_ENV === 'production') {
            // Example: Sentry.captureException(error, { extra: errorInfo });
          }
        }}
      >
        <ContractorTrackerDashboard />
      </ContractorErrorBoundary>
    </ToastProvider>
  );
};

export default ContractorDashboardWrapper;