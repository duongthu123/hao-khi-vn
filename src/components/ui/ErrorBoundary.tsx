'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: React.ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Base Error Boundary component that catches React errors in child components
 * Provides Vietnamese language error messages and recovery options
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Import error logger dynamically to avoid issues
    import('@/lib/utils/errorLogger').then(({ logError }) => {
      logError(error, {
        component: 'ErrorBoundary',
        action: 'componentDidCatch',
        state: {
          componentStack: errorInfo.componentStack,
        },
      }, 'high');
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state if resetKeys change
    if (this.state.hasError && this.props.resetKeys) {
      const prevKeys = prevProps.resetKeys || [];
      const currentKeys = this.props.resetKeys;
      
      if (prevKeys.length !== currentKeys.length || 
          prevKeys.some((key, index) => key !== currentKeys[index])) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error,
          this.state.errorInfo ?? { componentStack: '' },
          this.reset
        );
      }

      // Default fallback UI with Vietnamese messages
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  reset: () => void;
}

function DefaultErrorFallback({ error, errorInfo, reset }: DefaultErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleReturnToMenu = () => {
    window.location.href = '/';
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vietnam-50 to-vietnam-100 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-vietnamese p-6 tablet:p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
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
        </div>

        {/* Error Title */}
        <h1 className="text-2xl tablet:text-3xl font-bold text-center text-gray-900 mb-4">
          Đã xảy ra lỗi
        </h1>
        <p className="text-center text-gray-600 mb-6">
          An error occurred / Une erreur s'est produite
        </p>

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-red-800 mb-2">
            Thông báo lỗi / Error message:
          </p>
          <p className="text-sm text-red-700 font-mono break-words">
            {error.message || 'Lỗi không xác định / Unknown error'}
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && errorInfo && (
          <details className="mb-6">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
              Chi tiết kỹ thuật / Technical details
            </summary>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-64">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                {errorInfo.componentStack}
              </pre>
            </div>
          </details>
        )}

        {/* Recovery Options */}
        <div className="space-y-3">
          <p className="text-sm text-gray-600 text-center mb-4">
            Vui lòng chọn một trong các tùy chọn sau:
            <br />
            <span className="text-xs">Please choose one of the following options:</span>
          </p>

          <div className="grid grid-cols-1 tablet:grid-cols-2 gap-3">
            {/* Try Again Button */}
            <Button
              onClick={reset}
              variant="primary"
              className="w-full"
              aria-label="Thử lại - Try again"
            >
              <svg
                className="w-5 h-5 mr-2"
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

            {/* Reload Page Button */}
            <Button
              onClick={handleReload}
              variant="secondary"
              className="w-full"
              aria-label="Tải lại trang - Reload page"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Tải lại trang / Reload Page
            </Button>
          </div>

          {/* Return to Menu Button */}
          <Button
            onClick={handleReturnToMenu}
            variant="ghost"
            className="w-full"
            aria-label="Quay về menu chính - Return to main menu"
          >
            <svg
              className="w-5 h-5 mr-2"
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
            Quay về menu chính / Return to Main Menu
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Nếu lỗi vẫn tiếp tục xảy ra, vui lòng thử xóa dữ liệu trình duyệt hoặc liên hệ hỗ trợ.
            <br />
            If the error persists, please try clearing browser data or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
