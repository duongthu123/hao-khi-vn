/**
 * Tests for useSwipeGesture hook
 */

import { renderHook, act } from '@testing-library/react';
import { useSwipeGesture } from '../useSwipeGesture';
import { TouchEvent } from 'react';

// Mock touch event helper
function createTouchEvent(
  type: 'touchstart' | 'touchmove' | 'touchend',
  clientX: number,
  clientY: number
): Partial<TouchEvent> {
  return {
    touches: type !== 'touchend' ? [{ clientX, clientY } as Touch] : [],
    preventDefault: vi.fn(),
  } as Partial<TouchEvent>;
}

describe('useSwipeGesture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should detect swipe left gesture', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, threshold: 50 })
    );

    // Start touch at x=200
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 200, 100) as TouchEvent);
    });

    // Move to x=100 (swipe left 100px)
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 100, 100) as TouchEvent);
    });

    // End touch
    act(() => {
      result.current.onTouchEnd(createTouchEvent('touchend', 100, 100) as TouchEvent);
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });

  it('should detect swipe right gesture', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeRight, threshold: 50 })
    );

    // Start touch at x=100
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 100, 100) as TouchEvent);
    });

    // Move to x=200 (swipe right 100px)
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 200, 100) as TouchEvent);
    });

    // End touch
    act(() => {
      result.current.onTouchEnd(createTouchEvent('touchend', 200, 100) as TouchEvent);
    });

    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });

  it('should detect swipe up gesture', () => {
    const onSwipeUp = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeUp, threshold: 50 })
    );

    // Start touch at y=200
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 100, 200) as TouchEvent);
    });

    // Move to y=100 (swipe up 100px)
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 100, 100) as TouchEvent);
    });

    // End touch
    act(() => {
      result.current.onTouchEnd(createTouchEvent('touchend', 100, 100) as TouchEvent);
    });

    expect(onSwipeUp).toHaveBeenCalledTimes(1);
  });

  it('should detect swipe down gesture', () => {
    const onSwipeDown = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeDown, threshold: 50 })
    );

    // Start touch at y=100
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 100, 100) as TouchEvent);
    });

    // Move to y=200 (swipe down 100px)
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 100, 200) as TouchEvent);
    });

    // End touch
    act(() => {
      result.current.onTouchEnd(createTouchEvent('touchend', 100, 200) as TouchEvent);
    });

    expect(onSwipeDown).toHaveBeenCalledTimes(1);
  });

  it('should not trigger swipe if below threshold', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, threshold: 50 })
    );

    // Start touch
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 100, 100) as TouchEvent);
    });

    // Move only 30px (below 50px threshold)
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 70, 100) as TouchEvent);
    });

    // End touch
    act(() => {
      result.current.onTouchEnd(createTouchEvent('touchend', 70, 100) as TouchEvent);
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should not trigger swipe if duration exceeds maxDuration', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, threshold: 50, maxDuration: 300 })
    );

    // Start touch
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 200, 100) as TouchEvent);
    });

    // Advance time by 400ms (exceeds 300ms maxDuration)
    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Move and end touch
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 100, 100) as TouchEvent);
      result.current.onTouchEnd(createTouchEvent('touchend', 100, 100) as TouchEvent);
    });

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should prioritize horizontal swipe over vertical when both occur', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeUp = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, onSwipeUp, threshold: 50 })
    );

    // Start touch
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 200, 200) as TouchEvent);
    });

    // Move diagonally but more horizontal (left 100px, up 30px)
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 100, 170) as TouchEvent);
    });

    // End touch
    act(() => {
      result.current.onTouchEnd(createTouchEvent('touchend', 100, 170) as TouchEvent);
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeUp).not.toHaveBeenCalled();
  });

  it('should prioritize vertical swipe over horizontal when both occur', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeUp = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, onSwipeUp, threshold: 50 })
    );

    // Start touch
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 200, 200) as TouchEvent);
    });

    // Move diagonally but more vertical (left 30px, up 100px)
    act(() => {
      result.current.onTouchMove(createTouchEvent('touchmove', 170, 100) as TouchEvent);
    });

    // End touch
    act(() => {
      result.current.onTouchEnd(createTouchEvent('touchend', 170, 100) as TouchEvent);
    });

    expect(onSwipeUp).toHaveBeenCalledTimes(1);
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('should handle preventDefault option', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({ preventDefault: true })
    );

    const event = createTouchEvent('touchstart', 100, 100) as TouchEvent;
    
    act(() => {
      result.current.onTouchStart(event);
    });

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not call preventDefault when option is false', () => {
    const { result } = renderHook(() =>
      useSwipeGesture({ preventDefault: false })
    );

    const event = createTouchEvent('touchstart', 100, 100) as TouchEvent;
    
    act(() => {
      result.current.onTouchStart(event);
    });

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should handle multiple consecutive swipes', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipeGesture({ onSwipeLeft, onSwipeRight, threshold: 50 })
    );

    // First swipe left
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 200, 100) as TouchEvent);
      result.current.onTouchMove(createTouchEvent('touchmove', 100, 100) as TouchEvent);
      result.current.onTouchEnd(createTouchEvent('touchend', 100, 100) as TouchEvent);
    });

    // Second swipe right
    act(() => {
      result.current.onTouchStart(createTouchEvent('touchstart', 100, 100) as TouchEvent);
      result.current.onTouchMove(createTouchEvent('touchmove', 200, 100) as TouchEvent);
      result.current.onTouchEnd(createTouchEvent('touchend', 200, 100) as TouchEvent);
    });

    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).toHaveBeenCalledTimes(1);
  });
});
