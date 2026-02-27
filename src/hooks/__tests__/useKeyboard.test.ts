/**
 * Tests for useKeyboard hook
 */

import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboard, useFocusTrap, getKeyDisplayName, GAME_SHORTCUTS } from '../useKeyboard';
import { useRef } from 'react';

describe('useKeyboard', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up
    vi.restoreAllMocks();
  });

  it('should call callback when key is pressed', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        test: {
          key: 'p',
          callback,
        },
      })
    );

    // Simulate key press
    const event = new KeyboardEvent('keydown', { key: 'p' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(event);
  });

  it('should handle case-insensitive keys', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        test: {
          key: 'P',
          callback,
        },
      })
    );

    // Simulate lowercase key press
    const event = new KeyboardEvent('keydown', { key: 'p' });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle Ctrl modifier', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        save: {
          key: 's',
          ctrl: true,
          callback,
        },
      })
    );

    // Simulate Ctrl+S
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);

    // Simulate S without Ctrl
    const event2 = new KeyboardEvent('keydown', { key: 's' });
    window.dispatchEvent(event2);

    // Should not be called again
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle Shift modifier', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        test: {
          key: 'a',
          shift: true,
          callback,
        },
      })
    );

    // Simulate Shift+A
    const event = new KeyboardEvent('keydown', { key: 'a', shiftKey: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle Alt modifier', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        test: {
          key: 'f',
          alt: true,
          callback,
        },
      })
    );

    // Simulate Alt+F
    const event = new KeyboardEvent('keydown', { key: 'f', altKey: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should prevent default when specified', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        test: {
          key: 's',
          ctrl: true,
          preventDefault: true,
          callback,
        },
      })
    );

    // Simulate Ctrl+S
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when disabled', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard(
        {
          test: {
            key: 'p',
            callback,
          },
        },
        { enabled: false }
      )
    );

    // Simulate key press
    const event = new KeyboardEvent('keydown', { key: 'p' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not call callback for disabled binding', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        test: {
          key: 'p',
          callback,
          enabled: false,
        },
      })
    );

    // Simulate key press
    const event = new KeyboardEvent('keydown', { key: 'p' });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('should skip input elements by default', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        test: {
          key: 'p',
          callback,
        },
      })
    );

    // Create input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate key press in input
    const event = new KeyboardEvent('keydown', { key: 'p', bubbles: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();

    // Clean up
    document.body.removeChild(input);
  });

  it('should capture input elements when captureInInputs is true', () => {
    const callback = vi.fn();
    
    renderHook(() =>
      useKeyboard(
        {
          test: {
            key: 'p',
            callback,
          },
        },
        { captureInInputs: true }
      )
    );

    // Create input element
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Simulate key press in input
    const event = new KeyboardEvent('keydown', { key: 'p', bubbles: true });
    Object.defineProperty(event, 'target', { value: input, enumerable: true });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);

    // Clean up
    document.body.removeChild(input);
  });

  it('should handle multiple bindings', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    renderHook(() =>
      useKeyboard({
        pause: {
          key: 'p',
          callback: callback1,
        },
        menu: {
          key: 'Escape',
          callback: callback2,
        },
      })
    );

    // Simulate P key
    const event1 = new KeyboardEvent('keydown', { key: 'p' });
    window.dispatchEvent(event1);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).not.toHaveBeenCalled();

    // Simulate Escape key
    const event2 = new KeyboardEvent('keydown', { key: 'Escape' });
    window.dispatchEvent(event2);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should clean up event listeners on unmount', () => {
    const callback = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() =>
      useKeyboard({
        test: {
          key: 'p',
          callback,
        },
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});

describe('useFocusTrap', () => {
  it('should trap focus within container', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);

    const containerRef = { current: container };
    
    renderHook(() => useFocusTrap(containerRef, true));

    // First element should be focused
    expect(document.activeElement).toBe(button1);

    // Clean up
    document.body.removeChild(container);
  });

  it('should cycle focus on Tab', () => {
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);

    const containerRef = { current: container };
    
    renderHook(() => useFocusTrap(containerRef, true));

    // Focus last element
    button2.focus();

    // Simulate Tab key
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    container.dispatchEvent(event);

    // Should prevent default and focus first element
    expect(preventDefaultSpy).toHaveBeenCalled();

    // Clean up
    document.body.removeChild(container);
  });

  it('should not trap focus when disabled', () => {
    const container = document.createElement('div');
    const button = document.createElement('button');
    
    container.appendChild(button);
    document.body.appendChild(container);

    const containerRef = { current: container };
    
    renderHook(() => useFocusTrap(containerRef, false));

    // Button should not be focused
    expect(document.activeElement).not.toBe(button);

    // Clean up
    document.body.removeChild(container);
  });
});

describe('getKeyDisplayName', () => {
  it('should format key without modifiers', () => {
    expect(getKeyDisplayName('p')).toBe('P');
    expect(getKeyDisplayName('Escape')).toBe('Esc');
  });

  it('should format key with Ctrl modifier', () => {
    const result = getKeyDisplayName('s', { ctrl: true });
    expect(result).toMatch(/Ctrl \+ S|⌘ \+ S/);
  });

  it('should format key with Shift modifier', () => {
    expect(getKeyDisplayName('a', { shift: true })).toBe('Shift + A');
  });

  it('should format key with Alt modifier', () => {
    expect(getKeyDisplayName('f', { alt: true })).toBe('Alt + F');
  });

  it('should format key with multiple modifiers', () => {
    const result = getKeyDisplayName('s', { ctrl: true, shift: true });
    expect(result).toMatch(/Ctrl \+ Shift \+ S|⌘ \+ Shift \+ S/);
  });

  it('should format arrow keys', () => {
    expect(getKeyDisplayName('ArrowUp')).toBe('↑');
    expect(getKeyDisplayName('ArrowDown')).toBe('↓');
    expect(getKeyDisplayName('ArrowLeft')).toBe('←');
    expect(getKeyDisplayName('ArrowRight')).toBe('→');
  });

  it('should format space key', () => {
    expect(getKeyDisplayName(' ')).toBe('Space');
  });
});

describe('GAME_SHORTCUTS', () => {
  it('should define common game shortcuts', () => {
    expect(GAME_SHORTCUTS.PAUSE).toBe('p');
    expect(GAME_SHORTCUTS.MENU).toBe('Escape');
    expect(GAME_SHORTCUTS.SAVE).toBe('s');
    expect(GAME_SHORTCUTS.LOAD).toBe('l');
    expect(GAME_SHORTCUTS.HELP).toBe('h');
    expect(GAME_SHORTCUTS.SETTINGS).toBe(',');
    expect(GAME_SHORTCUTS.FULLSCREEN).toBe('f');
  });
});
