/**
 * Network Error Handler Utility
 * 
 * Handles network failures for cloud saves with retry logic, offline detection,
 * and user-friendly error messages in Vietnamese.
 * 
 * Validates: Requirements 23.8
 */

import { logError, type ErrorContext } from './errorLogger';

export type NetworkErrorType = 
  | 'offline'
  | 'timeout'
  | 'server_error'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limit'
  | 'unknown';

export interface NetworkError extends Error {
  type: NetworkErrorType;
  statusCode?: number;
  retryable: boolean;
  retryAfter?: number; // milliseconds
}

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: NetworkErrorType[];
}

export interface NetworkErrorHandlerOptions {
  retryConfig?: Partial<RetryConfig>;
  onRetry?: (attempt: number, error: NetworkError) => void;
  onMaxRetriesReached?: (error: NetworkError) => void;
  context?: ErrorContext;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableErrors: ['offline', 'timeout', 'server_error', 'rate_limit'],
};

/**
 * Vietnamese error messages for network errors
 */
const ERROR_MESSAGES: Record<NetworkErrorType, string> = {
  offline: 'Không có kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.',
  timeout: 'Yêu cầu hết thời gian chờ. Vui lòng thử lại.',
  server_error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  not_found: 'Không tìm thấy tài nguyên được yêu cầu.',
  unauthorized: 'Bạn cần đăng nhập để thực hiện thao tác này.',
  forbidden: 'Bạn không có quyền truy cập tài nguyên này.',
  rate_limit: 'Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.',
  unknown: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
};

/**
 * Detect if the browser is currently offline
 */
export function isOffline(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return !navigator.onLine;
}

/**
 * Create a NetworkError from a standard Error or Response
 */
export function createNetworkError(
  error: Error | Response | unknown,
  type?: NetworkErrorType
): NetworkError {
  let errorType: NetworkErrorType = type || 'unknown';
  let statusCode: number | undefined;
  let message = '';
  let retryable = false;

  // Check if offline
  if (isOffline()) {
    errorType = 'offline';
    message = ERROR_MESSAGES.offline;
    retryable = true;
  }
  // Handle Response objects
  else if (error instanceof Response) {
    statusCode = error.status;
    
    if (statusCode === 408 || statusCode === 504) {
      errorType = 'timeout';
      retryable = true;
    } else if (statusCode === 404) {
      errorType = 'not_found';
      retryable = false;
    } else if (statusCode === 401) {
      errorType = 'unauthorized';
      retryable = false;
    } else if (statusCode === 403) {
      errorType = 'forbidden';
      retryable = false;
    } else if (statusCode === 429) {
      errorType = 'rate_limit';
      retryable = true;
    } else if (statusCode >= 500) {
      errorType = 'server_error';
      retryable = true;
    }
    
    message = ERROR_MESSAGES[errorType];
  }
  // Handle Error objects
  else if (error instanceof Error) {
    message = error.message;
    
    // Check for timeout errors
    if (message.toLowerCase().includes('timeout') || 
        message.toLowerCase().includes('timed out')) {
      errorType = 'timeout';
      retryable = true;
    }
    // Check for network errors
    else if (message.toLowerCase().includes('network') ||
             message.toLowerCase().includes('fetch')) {
      errorType = isOffline() ? 'offline' : 'server_error';
      retryable = true;
    }
    
    message = ERROR_MESSAGES[errorType] || message;
  }
  // Handle unknown errors
  else {
    message = ERROR_MESSAGES.unknown;
  }

  const networkError = new Error(message) as NetworkError;
  networkError.type = errorType;
  networkError.statusCode = statusCode;
  networkError.retryable = retryable;
  networkError.name = 'NetworkError';

  return networkError;
}

/**
 * Calculate delay for exponential backoff
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a network operation with retry logic
 * 
 * @example
 * ```typescript
 * const data = await withRetry(
 *   async () => {
 *     const response = await fetch('/api/save');
 *     if (!response.ok) throw response;
 *     return response.json();
 *   },
 *   {
 *     retryConfig: { maxRetries: 3 },
 *     onRetry: (attempt) => console.log(`Retry attempt ${attempt}`),
 *     context: { component: 'SaveSystem', action: 'cloudSave' }
 *   }
 * );
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: NetworkErrorHandlerOptions = {}
): Promise<T> {
  const config: RetryConfig = {
    ...DEFAULT_RETRY_CONFIG,
    ...options.retryConfig,
  };

  let lastError: NetworkError | null = null;
  let attempt = 0;

  while (attempt <= config.maxRetries) {
    try {
      // First attempt or retry
      if (attempt > 0) {
        const delay = calculateBackoffDelay(attempt, config);
        await sleep(delay);
        
        if (options.onRetry) {
          options.onRetry(attempt, lastError!);
        }
      }

      attempt++;
      return await operation();
    } catch (error) {
      lastError = createNetworkError(error);
      
      // Log the error
      logError(lastError, {
        ...options.context,
        action: options.context?.action || 'networkRequest',
        attempt,
        maxRetries: config.maxRetries,
      }, 'medium');

      // Check if we should retry
      const shouldRetry = 
        lastError.retryable &&
        config.retryableErrors.includes(lastError.type) &&
        attempt <= config.maxRetries;

      if (!shouldRetry) {
        break;
      }
    }
  }

  // Max retries reached or non-retryable error
  if (options.onMaxRetriesReached && lastError) {
    options.onMaxRetriesReached(lastError);
  }

  throw lastError;
}

/**
 * Get user-friendly error message in Vietnamese
 */
export function getErrorMessage(error: NetworkError | Error): string {
  if ('type' in error && error.type) {
    return ERROR_MESSAGES[error.type] || error.message;
  }
  return error.message || ERROR_MESSAGES.unknown;
}

/**
 * Check if an error is retryable
 */
export function isRetryable(error: NetworkError | Error): boolean {
  if ('retryable' in error) {
    return error.retryable;
  }
  return false;
}

/**
 * Setup online/offline event listeners
 * Returns a cleanup function to remove listeners
 */
export function setupOnlineOfflineListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    console.log('[Network] Connection restored');
    onOnline();
  };

  const handleOffline = () => {
    console.log('[Network] Connection lost');
    onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Network Error Handler class for managing network state
 */
export class NetworkErrorHandler {
  private isOnline: boolean = true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private cleanup?: () => void;

  constructor() {
    this.isOnline = !isOffline();
    this.setupListeners();
  }

  private setupListeners(): void {
    this.cleanup = setupOnlineOfflineListeners(
      () => this.setOnlineStatus(true),
      () => this.setOnlineStatus(false)
    );
  }

  private setOnlineStatus(status: boolean): void {
    if (this.isOnline !== status) {
      this.isOnline = status;
      this.notifyListeners();
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  /**
   * Subscribe to online/offline status changes
   */
  subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current status
    listener(this.isOnline);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Destroy the handler and cleanup listeners
   */
  destroy(): void {
    if (this.cleanup) {
      this.cleanup();
    }
    this.listeners.clear();
  }
}

// Singleton instance
let networkErrorHandler: NetworkErrorHandler | null = null;

/**
 * Get the singleton NetworkErrorHandler instance
 */
export function getNetworkErrorHandler(): NetworkErrorHandler {
  if (!networkErrorHandler) {
    networkErrorHandler = new NetworkErrorHandler();
  }
  return networkErrorHandler;
}
