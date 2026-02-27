/**
 * useNotifications Hook Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../useNotifications';
import { useGameStore } from '@/store';

describe('useNotifications', () => {
  beforeEach(() => {
    // Clear notifications before each test
    const { clearNotifications } = useGameStore.getState();
    clearNotifications();
  });

  it('shows success notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showSuccess('Operation successful');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[0].message).toBe('Operation successful');
  });

  it('shows error notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showError('Operation failed');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('error');
    expect(result.current.notifications[0].message).toBe('Operation failed');
  });

  it('shows warning notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showWarning('Warning message');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('warning');
    expect(result.current.notifications[0].message).toBe('Warning message');
  });

  it('shows info notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showInfo('Info message');
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('info');
    expect(result.current.notifications[0].message).toBe('Info message');
  });

  it('shows notification with custom type', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification({
        message: 'Custom notification',
        type: 'warning',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].type).toBe('warning');
    expect(result.current.notifications[0].message).toBe('Custom notification');
  });

  it('shows notification with custom duration', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showSuccess('Success with custom duration', 10000);
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].duration).toBe(10000);
  });

  it('removes notification by id', () => {
    const { result } = renderHook(() => useNotifications());

    let notificationId: string;

    act(() => {
      notificationId = result.current.showSuccess('Test notification');
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('clears all notifications', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showSuccess('Notification 1');
      result.current.showError('Notification 2');
      result.current.showInfo('Notification 3');
    });

    expect(result.current.notifications).toHaveLength(3);

    act(() => {
      result.current.clearNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('handles multiple notifications', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showSuccess('Success 1');
      result.current.showError('Error 1');
      result.current.showWarning('Warning 1');
      result.current.showInfo('Info 1');
    });

    expect(result.current.notifications).toHaveLength(4);
    expect(result.current.notifications[0].type).toBe('success');
    expect(result.current.notifications[1].type).toBe('error');
    expect(result.current.notifications[2].type).toBe('warning');
    expect(result.current.notifications[3].type).toBe('info');
  });

  it('returns notification id when showing notification', () => {
    const { result } = renderHook(() => useNotifications());

    let id: string;

    act(() => {
      id = result.current.showSuccess('Test');
    });

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(result.current.notifications[0].id).toBe(id);
  });

  it('defaults to info type when type is not specified', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification({
        message: 'Default type notification',
      });
    });

    expect(result.current.notifications[0].type).toBe('info');
  });
});
