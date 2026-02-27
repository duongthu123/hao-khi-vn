/**
 * Keyboard Navigation Hook
 * Manages keyboard shortcuts and key bindings for game controls
 * Validates Requirements 22.2 (keyboard navigation), 2.4 (component props)
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Key binding configuration
 */
export interface KeyBinding {
  /**
   * Key or key combination (e.g., 'Escape', 'p', 'Ctrl+s')
   */
  key: string;
  
  /**
   * Callback function to execute when key is pressed
   */
  callback: (event: KeyboardEvent) => void;
  
  /**
   * Optional description for documentation
   */
  description?: string;
  
  /**
   * Whether Ctrl/Cmd key must be pressed
   */
  ctrl?: boolean;
  
  /**
   * Whether Shift key must be pressed
   */
  shift?: boolean;
  
  /**
   * Whether Alt key must be pressed
   */
  alt?: boolean;
  
  /**
   * Whether to prevent default browser behavior
   */
  preventDefault?: boolean;
  
  /**
   * Whether the binding is enabled
   */
  enabled?: boolean;
}

/**
 * Keyboard bindings map
 */
export type KeyBindings = Record<string, KeyBinding>;

/**
 * Options for the keyboard hook
 */
export interface UseKeyboardOptions {
  /**
   * Whether keyboard shortcuts are enabled globally
   */
  enabled?: boolean;
  
  /**
   * Whether to capture events during input focus
   */
  captureInInputs?: boolean;
}

/**
 * Check if an element is an input element
 */
function isInputElement(element: Element | null): boolean {
  if (!element || !element.tagName) return false;
  
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.getAttribute('contenteditable') === 'true'
  );
}

/**
 * Normalize key string for comparison
 */
function normalizeKey(key: string): string {
  // Convert to lowercase for case-insensitive comparison
  return key.toLowerCase();
}

/**
 * Check if key event matches binding
 */
function matchesBinding(event: KeyboardEvent, binding: KeyBinding): boolean {
  const normalizedEventKey = normalizeKey(event.key);
  const normalizedBindingKey = normalizeKey(binding.key);
  
  // Check key match
  if (normalizedEventKey !== normalizedBindingKey) {
    return false;
  }
  
  // Check modifier keys
  if (binding.ctrl && !event.ctrlKey && !event.metaKey) return false;
  if (!binding.ctrl && (event.ctrlKey || event.metaKey)) return false;
  
  if (binding.shift && !event.shiftKey) return false;
  if (!binding.shift && event.shiftKey) return false;
  
  if (binding.alt && !event.altKey) return false;
  if (!binding.alt && event.altKey) return false;
  
  return true;
}

/**
 * Custom hook for managing keyboard shortcuts and key bindings
 * 
 * Provides a flexible system for:
 * - Registering keyboard shortcuts
 * - Handling modifier keys (Ctrl, Shift, Alt)
 * - Preventing conflicts with browser shortcuts
 * - Disabling shortcuts during input focus
 * - Dynamic enable/disable of bindings
 * 
 * @param bindings - Map of key bindings to register
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * useKeyboard({
 *   pause: {
 *     key: 'p',
 *     description: 'Pause game',
 *     callback: () => togglePause(),
 *     preventDefault: true
 *   },
 *   save: {
 *     key: 's',
 *     ctrl: true,
 *     description: 'Save game',
 *     callback: () => saveGame(),
 *     preventDefault: true
 *   }
 * });
 * ```
 */
export function useKeyboard(
  bindings: KeyBindings,
  options: UseKeyboardOptions = {}
): void {
  const {
    enabled = true,
    captureInInputs = false,
  } = options;
  
  // Store bindings in ref to avoid recreating event listener
  const bindingsRef = useRef<KeyBindings>(bindings);
  
  // Update bindings ref when bindings change
  useEffect(() => {
    bindingsRef.current = bindings;
  }, [bindings]);
  
  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip if keyboard shortcuts are disabled
    if (!enabled) return;
    
    // Skip if focus is in an input element (unless captureInInputs is true)
    if (!captureInInputs && isInputElement(event.target as Element)) {
      return;
    }
    
    // Check each binding
    const currentBindings = bindingsRef.current;
    for (const [id, binding] of Object.entries(currentBindings)) {
      // Skip disabled bindings
      if (binding.enabled === false) continue;
      
      // Check if event matches binding
      if (matchesBinding(event, binding)) {
        // Prevent default if specified
        if (binding.preventDefault) {
          event.preventDefault();
        }
        
        // Execute callback
        binding.callback(event);
        
        // Stop checking other bindings
        break;
      }
    }
  }, [enabled, captureInInputs]);
  
  // Register event listener
  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Hook for managing focus trap within a container
 * Useful for modal dialogs and menus
 * 
 * @param containerRef - Ref to the container element
 * @param enabled - Whether focus trap is enabled
 * 
 * @example
 * ```tsx
 * const modalRef = useRef<HTMLDivElement>(null);
 * useFocusTrap(modalRef, isModalOpen);
 * ```
 */
export function useFocusTrap(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled || !containerRef.current) return;
    
    const container = containerRef.current;
    
    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');
      
      return Array.from(container.querySelectorAll(selector));
    };
    
    // Handle tab key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      // Shift + Tab: move to previous element
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      }
      // Tab: move to next element
      else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    // Focus first element on mount
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, enabled]);
}

/**
 * Common keyboard shortcuts for the game
 */
export const GAME_SHORTCUTS = {
  PAUSE: 'p',
  MENU: 'Escape',
  SAVE: 's',
  LOAD: 'l',
  HELP: 'h',
  SETTINGS: ',',
  FULLSCREEN: 'f',
  ZOOM_IN: '+',
  ZOOM_OUT: '-',
  ZOOM_RESET: '0',
  NEXT: 'ArrowRight',
  PREVIOUS: 'ArrowLeft',
  CONFIRM: 'Enter',
  CANCEL: 'Escape',
} as const;

/**
 * Get human-readable key name for display
 */
export function getKeyDisplayName(key: string, modifiers?: {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}): string {
  const parts: string[] = [];
  
  // Add modifiers
  if (modifiers?.ctrl) {
    parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
  }
  if (modifiers?.shift) {
    parts.push('Shift');
  }
  if (modifiers?.alt) {
    parts.push('Alt');
  }
  
  // Add key
  const keyMap: Record<string, string> = {
    'Escape': 'Esc',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    ' ': 'Space',
  };
  
  parts.push(keyMap[key] || key.toUpperCase());
  
  return parts.join(' + ');
}
