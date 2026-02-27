/**
 * Network Error Alert Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NetworkErrorAlert, NetworkStatusIndicator } from '../NetworkErrorAlert';
import { createNetworkError } from '@/lib/utils/networkErrorHandler';

describe('NetworkErrorAlert', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });
  });

  it('should not render when no error and online', () => {
    const { container } = render(<NetworkErrorAlert error={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render error message', () => {
    const error = createNetworkError(new Response(null, { status: 500 }));

    render(<NetworkErrorAlert error={error} />);

    expect(screen.getByText(/Lỗi máy chủ/i)).toBeInTheDocument();
  });

  it('should show retry button for retryable errors', () => {
    const error = createNetworkError(new Response(null, { status: 500 }));
    const onRetry = vi.fn();

    render(<NetworkErrorAlert error={error} onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /thử lại/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should not show retry button for non-retryable errors without onRetry', () => {
    const error = createNetworkError(new Response(null, { status: 404 }));

    render(<NetworkErrorAlert error={error} />);

    expect(screen.queryByRole('button', { name: /thử lại/i })).not.toBeInTheDocument();
  });

  it('should show dismiss button when onDismiss provided', () => {
    const error = createNetworkError(new Response(null, { status: 500 }));
    const onDismiss = vi.fn();

    render(<NetworkErrorAlert error={error} onDismiss={onDismiss} />);

    // Get the button with text "Đóng" (not the X button)
    const dismissButton = screen.getByRole('button', { name: 'Đóng' });
    fireEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should show X button when onDismiss provided', () => {
    const error = createNetworkError(new Response(null, { status: 500 }));
    const onDismiss = vi.fn();

    render(<NetworkErrorAlert error={error} onDismiss={onDismiss} />);

    const closeButton = screen.getByRole('button', { name: /đóng thông báo/i });
    fireEvent.click(closeButton);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should display offline indicator when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const error = createNetworkError(new Response(null, { status: 500 }));

    render(<NetworkErrorAlert error={error} showOfflineIndicator={true} />);

    expect(screen.getByText(/ngoại tuyến/i)).toBeInTheDocument();
  });

  it('should not display offline indicator when showOfflineIndicator is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const error = createNetworkError(new Response(null, { status: 500 }));

    render(<NetworkErrorAlert error={error} showOfflineIndicator={false} />);

    expect(screen.queryByText(/ngoại tuyến/i)).not.toBeInTheDocument();
  });

  it('should show offline message when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    render(<NetworkErrorAlert error={null} />);

    expect(screen.getByText(/kết nối mạng/i)).toBeInTheDocument();
  });

  it('should update when online status changes', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const { rerender } = render(<NetworkErrorAlert error={null} />);

    expect(screen.getByText(/kết nối mạng/i)).toBeInTheDocument();

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });

    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText(/kết nối mạng/i)).not.toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', () => {
    const error = createNetworkError(new Response(null, { status: 500 }));

    render(<NetworkErrorAlert error={error} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('should apply custom className', () => {
    const error = createNetworkError(new Response(null, { status: 500 }));

    const { container } = render(
      <NetworkErrorAlert error={error} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('NetworkStatusIndicator', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });
  });

  it('should not render when online', () => {
    const { container } = render(<NetworkStatusIndicator />);

    expect(container.firstChild).toBeNull();
  });

  it('should render when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);

    expect(screen.getByText(/ngoại tuyến/i)).toBeInTheDocument();
  });

  it('should update when online status changes', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);

    expect(screen.getByText(/ngoại tuyến/i)).toBeInTheDocument();

    // Simulate coming back online
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
      configurable: true,
    });

    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.queryByText(/ngoại tuyến/i)).not.toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    render(<NetworkStatusIndicator />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('should be positioned fixed at bottom right', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
      configurable: true,
    });

    const { container } = render(<NetworkStatusIndicator />);

    expect(container.firstChild).toHaveClass('fixed', 'bottom-4', 'right-4');
  });
});
