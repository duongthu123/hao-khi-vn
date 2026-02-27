'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallbackMessage?: string;
}

/**
 * Lightweight Error Boundary for individual components
 * Shows minimal error UI without disrupting the entire page
 */
export function ComponentErrorBoundary({ 
  children, 
  componentName = 'component',
  fallbackMessage 
}: ComponentErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Use error logger for centralized logging
    import('@/lib/utils/errorLogger').then(({ logError }) => {
      logError(error, {
        component: componentName,
        action: 'handleError',
        state: {
          componentStack: errorInfo.componentStack,
        },
      }, 'medium');
    });
  };

  const renderFallback = (error: Error, _errorInfo: React.ErrorInfo, reset: () => void) => {
    return (
      <div 
        className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start">
          {/* Warning Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="ml-3 flex-1">
            {/* Error Message */}
            <h3 className="text-sm font-medium text-yellow-800">
              {fallbackMessage || `Không thể tải ${componentName}`}
            </h3>
            <p className="text-xs text-yellow-700 mt-1">
              {fallbackMessage ? '' : `Unable to load ${componentName}`}
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-yellow-600 mt-2 font-mono">
                {error.message}
              </p>
            )}

            {/* Retry Button */}
            <button
              onClick={reset}
              className="mt-3 text-xs font-medium text-yellow-800 hover:text-yellow-900 underline focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded"
              aria-label="Thử lại - Try again"
            >
              Thử lại / Try again
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary
      fallback={renderFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}
