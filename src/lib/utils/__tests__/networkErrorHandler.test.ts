/**
 * Network Error Handler Tests
 * 
 * Tests for network error detection, retry logic, and offline mode handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createNetworkError,
  withRetry,
  isOffline,
  getErrorMessage,
  isRetryable,
  setupOnlineOfflineListeners,
  NetworkErrorHandler,
  getNetworkErrorHandler,
  type NetworkError,
} from '../networkErrorHandler';

describe('networkErrorHandler', () => {
  describe('isOffline', () => {
    it('should return false when navigator.onLine is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      expect(isOffline()).toBe(false);
    });

    it('should return true when navigator.onLine is false', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      expect(isOffline()).toBe(true);
    });
  });

  describe('createNetworkError', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    it('should create offline error when navigator is offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const error = createNetworkError(new Error('Network error'));

      expect(error.type).toBe('offline');
      expect(error.retryable).toBe(true);
      expect(error.message).toContain('kết nối mạng');
    });

    it('should create timeout error for 408 status', () => {
      const response = new Response(null, { status: 408 });
      const error = createNetworkError(response);

      expect(error.type).toBe('timeout');
      expect(error.statusCode).toBe(408);
      expect(error.retryable).toBe(true);
    });

    it('should create timeout error for 504 status', () => {
      const response = new Response(null, { status: 504 });
      const error = createNetworkError(response);

      expect(error.type).toBe('timeout');
      expect(error.statusCode).toBe(504);
      expect(error.retryable).toBe(true);
    });

    it('should create not_found error for 404 status', () => {
      const response = new Response(null, { status: 404 });
      const error = createNetworkError(response);

      expect(error.type).toBe('not_found');
      expect(error.statusCode).toBe(404);
      expect(error.retryable).toBe(false);
    });

    it('should create unauthorized error for 401 status', () => {
      const response = new Response(null, { status: 401 });
      const error = createNetworkError(response);

      expect(error.type).toBe('unauthorized');
      expect(error.statusCode).toBe(401);
      expect(error.retryable).toBe(false);
    });

    it('should create forbidden error for 403 status', () => {
      const response = new Response(null, { status: 403 });
      const error = createNetworkError(response);

      expect(error.type).toBe('forbidden');
      expect(error.statusCode).toBe(403);
      expect(error.retryable).toBe(false);
    });

    it('should create rate_limit error for 429 status', () => {
      const response = new Response(null, { status: 429 });
      const error = createNetworkError(response);

      expect(error.type).toBe('rate_limit');
      expect(error.statusCode).toBe(429);
      expect(error.retryable).toBe(true);
    });

    it('should create server_error for 500+ status codes', () => {
      const response = new Response(null, { status: 500 });
      const error = createNetworkError(response);

      expect(error.type).toBe('server_error');
      expect(error.statusCode).toBe(500);
      expect(error.retryable).toBe(true);
    });

    it('should detect timeout from error message', () => {
      const error = createNetworkError(new Error('Request timed out'));

      expect(error.type).toBe('timeout');
      expect(error.retryable).toBe(true);
    });

    it('should detect network error from error message', () => {
      const error = createNetworkError(new Error('Network request failed'));

      expect(error.type).toBe('server_error');
      expect(error.retryable).toBe(true);
    });

    it('should create unknown error for unrecognized errors', () => {
      const error = createNetworkError(new Error('Something went wrong'));

      expect(error.type).toBe('unknown');
    });

    it('should handle unknown error types', () => {
      const error = createNetworkError({ unknown: 'error' });

      expect(error.type).toBe('unknown');
      expect(error.message).toContain('không xác định');
    });
  });

  describe('withRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await withRetry(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Response(null, { status: 500 }))
        .mockResolvedValueOnce('success');

      const promise = withRetry(operation, {
        retryConfig: { maxRetries: 3, initialDelay: 100 },
      });

      // Fast-forward through retry delay
      await vi.advanceTimersByTimeAsync(100);

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should use exponential backoff', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Response(null, { status: 500 }))
        .mockRejectedValueOnce(new Response(null, { status: 500 }))
        .mockResolvedValueOnce('success');

      const promise = withRetry(operation, {
        retryConfig: {
          maxRetries: 3,
          initialDelay: 100,
          backoffMultiplier: 2,
        },
      });

      // First retry: 100ms
      await vi.advanceTimersByTimeAsync(100);
      // Second retry: 200ms
      await vi.advanceTimersByTimeAsync(200);

      const result = await promise;

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should respect maxDelay', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Response(null, { status: 500 }))
        .mockResolvedValueOnce('success');

      const promise = withRetry(operation, {
        retryConfig: {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 500,
          backoffMultiplier: 2,
        },
      });

      // Should use maxDelay (500ms) instead of calculated delay (1000ms)
      await vi.advanceTimersByTimeAsync(500);

      const result = await promise;

      expect(result).toBe('success');
    });

    it('should not retry non-retryable errors', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Response(null, { status: 404 }));

      await expect(
        withRetry(operation, {
          retryConfig: { maxRetries: 3 },
        })
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const operation = vi
        .fn()
        .mockRejectedValueOnce(new Response(null, { status: 500 }))
        .mockResolvedValueOnce('success');

      const onRetry = vi.fn();

      const promise = withRetry(operation, {
        retryConfig: { maxRetries: 3, initialDelay: 100 },
        onRetry,
      });

      await vi.advanceTimersByTimeAsync(100);
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Object));
    });

    it('should call onMaxRetriesReached when retries exhausted', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Response(null, { status: 500 }));

      const onMaxRetriesReached = vi.fn();

      const promise = withRetry(operation, {
        retryConfig: { maxRetries: 2, initialDelay: 100 },
        onMaxRetriesReached,
      }).catch(() => {}); // Catch to prevent unhandled rejection

      // Advance through all retries
      await vi.advanceTimersByTimeAsync(100); // Retry 1
      await vi.advanceTimersByTimeAsync(200); // Retry 2

      await promise;

      expect(onMaxRetriesReached).toHaveBeenCalledTimes(1);
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should throw last error after max retries', async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Response(null, { status: 500 }));

      const promise = withRetry(operation, {
        retryConfig: { maxRetries: 1, initialDelay: 100 },
      });

      await vi.advanceTimersByTimeAsync(100);

      try {
        await promise;
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.type).toBe('server_error');
        expect(error.statusCode).toBe(500);
      }
    });
  });

  describe('getErrorMessage', () => {
    it('should return Vietnamese message for network errors', () => {
      const error = createNetworkError(new Response(null, { status: 500 }));
      const message = getErrorMessage(error);

      expect(message).toContain('Lỗi máy chủ');
    });

    it('should return error message for regular errors', () => {
      const error = new Error('Custom error');
      const message = getErrorMessage(error);

      expect(message).toBe('Custom error');
    });
  });

  describe('isRetryable', () => {
    it('should return true for retryable network errors', () => {
      const error = createNetworkError(new Response(null, { status: 500 }));

      expect(isRetryable(error)).toBe(true);
    });

    it('should return false for non-retryable network errors', () => {
      const error = createNetworkError(new Response(null, { status: 404 }));

      expect(isRetryable(error)).toBe(false);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');

      expect(isRetryable(error)).toBe(false);
    });
  });

  describe('setupOnlineOfflineListeners', () => {
    it('should call onOnline when online event fires', () => {
      const onOnline = vi.fn();
      const onOffline = vi.fn();

      const cleanup = setupOnlineOfflineListeners(onOnline, onOffline);

      window.dispatchEvent(new Event('online'));

      expect(onOnline).toHaveBeenCalledTimes(1);
      expect(onOffline).not.toHaveBeenCalled();

      cleanup();
    });

    it('should call onOffline when offline event fires', () => {
      const onOnline = vi.fn();
      const onOffline = vi.fn();

      const cleanup = setupOnlineOfflineListeners(onOnline, onOffline);

      window.dispatchEvent(new Event('offline'));

      expect(onOffline).toHaveBeenCalledTimes(1);
      expect(onOnline).not.toHaveBeenCalled();

      cleanup();
    });

    it('should remove listeners on cleanup', () => {
      const onOnline = vi.fn();
      const onOffline = vi.fn();

      const cleanup = setupOnlineOfflineListeners(onOnline, onOffline);
      cleanup();

      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('offline'));

      expect(onOnline).not.toHaveBeenCalled();
      expect(onOffline).not.toHaveBeenCalled();
    });
  });

  describe('NetworkErrorHandler', () => {
    let handler: NetworkErrorHandler;

    beforeEach(() => {
      handler = new NetworkErrorHandler();
    });

    afterEach(() => {
      handler.destroy();
    });

    it('should notify subscribers of online status', () => {
      const listener = vi.fn();

      handler.subscribe(listener);

      expect(listener).toHaveBeenCalledWith(true);
    });

    it('should notify subscribers when status changes', () => {
      const listener = vi.fn();

      handler.subscribe(listener);
      listener.mockClear();

      window.dispatchEvent(new Event('offline'));

      expect(listener).toHaveBeenCalledWith(false);
    });

    it('should return current online status', () => {
      expect(handler.getOnlineStatus()).toBe(true);
    });

    it('should allow unsubscribing', () => {
      const listener = vi.fn();

      const unsubscribe = handler.subscribe(listener);
      listener.mockClear();

      unsubscribe();

      window.dispatchEvent(new Event('offline'));

      expect(listener).not.toHaveBeenCalled();
    });

    it('should cleanup listeners on destroy', () => {
      const listener = vi.fn();

      handler.subscribe(listener);
      handler.destroy();
      listener.mockClear();

      window.dispatchEvent(new Event('offline'));

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('getNetworkErrorHandler', () => {
    it('should return singleton instance', () => {
      const handler1 = getNetworkErrorHandler();
      const handler2 = getNetworkErrorHandler();

      expect(handler1).toBe(handler2);
    });
  });
});
