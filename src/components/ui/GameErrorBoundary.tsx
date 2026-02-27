'use client';

import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { Button } from './Button';

interface GameErrorBoundaryProps {
  children: ReactNode;
  section?: string;
}

/**
 * Specialized Error Boundary for game sections
 * Provides game-specific error handling and recovery options
 */
export function GameErrorBoundary({ children, section = 'game' }: GameErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Use error logger for centralized logging
    import('@/lib/utils/errorLogger').then(({ logError }) => {
      logError(error, {
        component: `GameErrorBoundary-${section}`,
        action: 'handleError',
        state: {
          section,
          componentStack: errorInfo?.componentStack ?? '',
        },
      }, 'high');
    });
  };

  const renderFallback = (error: Error, errorInfo: React.ErrorInfo, reset: () => void) => {
    return (
      <div 
        className="flex items-center justify-center p-6 bg-red-50 border-2 border-red-200 rounded-lg"
        role="alert"
        aria-live="assertive"
      >
        <div className="max-w-lg w-full">
          {/* Error Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
            Lỗi trong phần {getSectionName(section)}
          </h2>
          <p className="text-center text-sm text-gray-600 mb-4">
            Error in {section} section
          </p>

          {/* Error Message */}
          <div className="bg-white border border-red-300 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 break-words">
              {error.message || 'Lỗi không xác định'}
            </p>
          </div>

          {/* Recovery Actions */}
          <div className="space-y-2">
            <Button
              onClick={reset}
              variant="primary"
              className="w-full"
              aria-label="Thử lại phần này - Try this section again"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Thử lại / Try Again
            </Button>

            <Button
              onClick={() => window.location.href = '/'}
              variant="secondary"
              className="w-full"
              aria-label="Quay về menu - Return to menu"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Quay về menu / Return to Menu
            </Button>
          </div>

          {/* Development Details */}
          {process.env.NODE_ENV === 'development' && errorInfo?.componentStack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-900">
                Chi tiết lỗi / Error details
              </summary>
              <div className="mt-2 bg-gray-100 rounded p-2 overflow-auto max-h-32">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </div>
            </details>
          )}
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

/**
 * Get Vietnamese section name for display
 */
function getSectionName(section: string): string {
  const sectionNames: Record<string, string> = {
    game: 'trò chơi',
    map: 'bản đồ',
    combat: 'chiến đấu',
    hero: 'anh hùng',
    resources: 'tài nguyên',
    quiz: 'câu đố',
    collection: 'bộ sưu tập',
    profile: 'hồ sơ',
    research: 'nghiên cứu',
    settings: 'cài đặt',
    menu: 'menu',
  };

  return sectionNames[section] || section;
}
