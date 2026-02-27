/**
 * NotificationToast Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationToast } from '../NotificationToast';
import { Notification } from '@/store/slices/uiSlice';

describe('NotificationToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders notifications', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        message: 'Test success',
        createdAt: Date.now(),
        duration: 3000,
      },
    ];

    const onDismiss = vi.fn();

    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    expect(screen.getByText('Test success')).toBeInTheDocument();
  });

  it('renders multiple notifications', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        message: 'Success message',
        createdAt: Date.now(),
        duration: 3000,
      },
      {
        id: '2',
        type: 'error',
        message: 'Error message',
        createdAt: Date.now(),
        duration: 3000,
      },
    ];

    const onDismiss = vi.fn();

    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders empty when no notifications', () => {
    const onDismiss = vi.fn();

    const { container } = render(<NotificationToast notifications={[]} onDismiss={onDismiss} />);

    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', async () => {
    vi.useRealTimers(); // Use real timers for this test
    
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        message: 'Test notification',
        createdAt: Date.now(),
        duration: 3000,
      },
    ];

    const onDismiss = vi.fn();

    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    const dismissButton = screen.getByLabelText('Dismiss notification');
    await userEvent.click(dismissButton);

    expect(onDismiss).toHaveBeenCalledWith('1');
    
    vi.useFakeTimers(); // Restore fake timers for other tests
  });

  it('renders different notification types with correct styling', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'success',
        message: 'Success',
        createdAt: Date.now(),
        duration: 3000,
      },
      {
        id: '2',
        type: 'error',
        message: 'Error',
        createdAt: Date.now(),
        duration: 3000,
      },
      {
        id: '3',
        type: 'warning',
        message: 'Warning',
        createdAt: Date.now(),
        duration: 3000,
      },
      {
        id: '4',
        type: 'info',
        message: 'Info',
        createdAt: Date.now(),
        duration: 3000,
      },
    ];

    const onDismiss = vi.fn();

    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('limits visible notifications based on maxVisible prop', () => {
    const notifications: Notification[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      type: 'info' as const,
      message: `Notification ${i}`,
      createdAt: Date.now(),
      duration: 3000,
    }));

    const onDismiss = vi.fn();

    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} maxVisible={3} />);

    // Should show last 3 notifications
    expect(screen.getByText('Notification 7')).toBeInTheDocument();
    expect(screen.getByText('Notification 8')).toBeInTheDocument();
    expect(screen.getByText('Notification 9')).toBeInTheDocument();

    // Should show hidden count indicator
    expect(screen.getByText('+7 more notifications')).toBeInTheDocument();
  });

  it('shows hidden count indicator with correct singular/plural text', () => {
    const notifications: Notification[] = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      type: 'info' as const,
      message: `Notification ${i}`,
      createdAt: Date.now(),
      duration: 3000,
    }));

    const onDismiss = vi.fn();

    const { rerender } = render(
      <NotificationToast notifications={notifications} onDismiss={onDismiss} maxVisible={5} />
    );

    expect(screen.getByText('+1 more notification')).toBeInTheDocument();

    // Test plural
    const moreNotifications: Notification[] = Array.from({ length: 8 }, (_, i) => ({
      id: `${i}`,
      type: 'info' as const,
      message: `Notification ${i}`,
      createdAt: Date.now(),
      duration: 3000,
    }));

    rerender(
      <NotificationToast notifications={moreNotifications} onDismiss={onDismiss} maxVisible={5} />
    );

    expect(screen.getByText('+3 more notifications')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'error',
        message: 'Error notification',
        createdAt: Date.now(),
        duration: 3000,
      },
      {
        id: '2',
        type: 'success',
        message: 'Success notification',
        createdAt: Date.now(),
        duration: 3000,
      },
    ];

    const onDismiss = vi.fn();

    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);

    // Error should have assertive aria-live
    const errorAlert = screen.getByText('Error notification').closest('[role="alert"]');
    expect(errorAlert).toHaveAttribute('aria-live', 'assertive');

    // Success should have polite aria-live
    const successAlert = screen.getByText('Success notification').closest('[role="alert"]');
    expect(successAlert).toHaveAttribute('aria-live', 'polite');
  });

  it('renders without duration (no auto-dismiss)', () => {
    const notifications: Notification[] = [
      {
        id: '1',
        type: 'info',
        message: 'Persistent notification',
        createdAt: Date.now(),
        // No duration specified
      },
    ];

    const onDismiss = vi.fn();

    render(<NotificationToast notifications={notifications} onDismiss={onDismiss} />);

    expect(screen.getByText('Persistent notification')).toBeInTheDocument();
  });
});
