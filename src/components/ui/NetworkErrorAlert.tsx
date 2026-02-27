'use client';

/**
 * Network Error Alert Component
 * 
 * Displays network error messages with retry options
 * Shows appropriate Vietnamese error messages based on error type
 * 
 * Validates: Requirements 23.8
 */

import { useState, useEffect } from 'react';
import { 
  type NetworkError, 
  getErrorMessage, 
  isRetryable,
  isOffline 
} from '@/lib/utils/networkErrorHandler';

export interface NetworkErrorAlertProps {
  error: NetworkError | Error | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showOfflineIndicator?: boolean;
  className?: string;
}

export function NetworkErrorAlert({
  error,
  onRetry,
  onDismiss,
  showOfflineIndicator = true,
  className = '',
}: NetworkErrorAlertProps) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Check initial offline status
    setOffline(isOffline());

    // Listen for online/offline events
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!error && !offline) {
    return null;
  }

  const message = error ? getErrorMessage(error) : 'Không có kết nối mạng';
  const canRetry = error ? isRetryable(error) : false;
  const isNetworkError = error && 'type' in error && error.type;

  return (
    <div
      className={`rounded-lg border p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          {offline || (isNetworkError && error.type === 'offline') ? (
            <svg
              className="h-5 w-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* Error Content */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {offline || (isNetworkError && error.type === 'offline')
              ? 'Mất kết nối'
              : 'Lỗi mạng'}
          </h3>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {message}
          </p>

          {/* Action Buttons */}
          {(canRetry || onRetry || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {(canRetry || onRetry) && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Thử lại"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Thử lại
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Đóng"
                >
                  Đóng
                </button>
              )}
            </div>
          )}
        </div>

        {/* Dismiss Button (X) */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
            aria-label="Đóng thông báo"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Offline Indicator */}
      {showOfflineIndicator && offline && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          Đang ở chế độ ngoại tuyến
        </div>
      )}
    </div>
  );
}

/**
 * Compact Network Status Indicator
 * Shows a small indicator in the corner when offline
 */
export function NetworkStatusIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(isOffline());

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-100 dark:bg-amber-900 px-3 py-2 text-sm text-amber-900 dark:text-amber-100 shadow-lg border border-amber-300 dark:border-amber-700"
      role="status"
      aria-live="polite"
    >
      <svg
        className="h-4 w-4 text-amber-600 dark:text-amber-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
        />
      </svg>
      <span>Ngoại tuyến</span>
    </div>
  );
}
