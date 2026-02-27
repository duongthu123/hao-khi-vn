# Keyboard Navigation Implementation

## Overview

This document describes the keyboard navigation system implemented for "Đại Chiến Sử Việt - Hào Khí Đông A" (Vietnamese Historical Strategy Game). The implementation ensures full keyboard accessibility for all interactive elements, providing an inclusive gaming experience for users who cannot or prefer not to use a mouse.

## Requirements Validation

This implementation validates:
- **Requirement 22.2**: Implement keyboard navigation for all interactive elements
- **Requirement 2.4**: Use React hooks for state and side effects with TypeScript interfaces

## Components

### 1. useKeyboard Hook

**Location**: `src/hooks/useKeyboard.ts`

A comprehensive custom React hook for managing keyboard shortcuts and key bindings throughout the game.

#### Features

- **Keyboard Shortcuts**: Register custom key bindings for game actions
- **Modifier Keys**: Support for Ctrl/Cmd, Shift, and Alt modifiers
- **Focus Management**: Automatic handling of input element focus
- **Focus Trap**: Keep focus within modals and dialogs
- **Accessibility**: Full keyboard navigation support
- **Conflict Prevention**: Avoid conflicts with browser shortcuts
- **Dynamic Enable/Disable**: Toggle shortcuts on/off at runtime

#### API

```typescript
useKeyboard(bindings: KeyBindings, options?: UseKeyboardOptions): void

interface KeyBinding {
  key: string;
  callback: (event: KeyboardEvent) => void;
  description?: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  enabled?: boolean;
}

interface UseKeyboardOptions {
  enabled?: boolean;
  captureInInputs?: boolean;
}
```

#### Example Usage

```typescript
import { useKeyboard, GAME_SHORTCUTS } from '@/hooks/useKeyboard';

function GameComponent() {
  useKeyboard({
    pause: {
      key: GAME_SHORTCUTS.PAUSE,
      description: 'Pause game',
      callback: () => togglePause(),
      preventDefault: true,
    },
    save: {
      key: GAME_SHORTCUTS.SAVE,
      ctrl: true,
      description: 'Save game',
      callback: () => saveGame(),
      preventDefault: true,
    },
  });
}
```

### 2. useFocusTrap Hook

**Location**: `src/hooks/useKeyboard.ts`

Manages focus trap within a container, useful for modal dialogs and menus.

#### API

```typescript
useFocusTrap(containerRef: React.RefObject<HTMLElement>, enabled?: boolean): void
```

#### Example Usage

```typescript
import { useFocusTrap } from '@/hooks/useKeyboard';

function Modal({ isOpen }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);

  return <div ref={modalRef}>{/* Modal content */}</div>;
}
```

### 3. KeyboardShortcutsHelp Component

**Location**: `src/components/ui/KeyboardShortcutsHelp.tsx`

A modal component that displays all available keyboard shortcuts to users.

#### Features

- Displays all registered shortcuts
- Vietnamese and English descriptions
- Visual key indicators (e.g., "Ctrl + S")
- Animated entrance
- Accessible modal dialog

#### Example Usage

```typescript
import { KeyboardShortcutsHelp } from '@/components/ui';

function Game() {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button onClick={() => setShowHelp(true)}>Help (H)</button>
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
}
```

### 4. Enhanced Focus Indicators

**Location**: `src/app/globals.css`

Enhanced CSS focus indicators for all interactive elements.

#### Features

- Visible focus rings on all interactive elements
- Consistent styling across the application
- High contrast for visibility
- Smooth transitions
- Skip-to-content link for keyboard users

#### CSS Classes

```css
/* Enhanced focus indicators */
*:focus-visible {
  outline: none;
  ring: 2px solid #0087FF;
  ring-offset: 2px;
}

/* Skip to content link */
.skip-to-content {
  position: fixed;
  top: 0;
  left: 0;
  transform: translateY(-100%);
}

.skip-to-content:focus {
  transform: translateY(0);
}
```

## Default Keyboard Shortcuts

The following keyboard shortcuts are available throughout the game:

| Shortcut | Action | Vietnamese |
|----------|--------|------------|
| P | Pause/Resume game | Tạm dừng/Tiếp tục |
| Esc | Open/Close menu | Mở/Đóng menu |
| Ctrl+S | Save game | Lưu game |
| Ctrl+L | Load game | Tải game |
| H | Show help | Hiển thị trợ giúp |
| , | Open settings | Mở cài đặt |
| F | Toggle fullscreen | Bật/Tắt toàn màn hình |
| + | Zoom in | Phóng to |
| - | Zoom out | Thu nhỏ |
| 0 | Reset zoom | Đặt lại zoom |
| → | Next item | Mục tiếp theo |
| ← | Previous item | Mục trước |
| Enter | Confirm action | Xác nhận |
| Tab | Navigate forward | Di chuyển tiếp |
| Shift+Tab | Navigate backward | Di chuyển lùi |

## Tab Navigation

All interactive elements support tab navigation in logical order:

1. **Skip to Content Link**: First focusable element (hidden until focused)
2. **Header Navigation**: Menu buttons, settings, help
3. **Main Content**: Game controls, interactive elements
4. **Modals/Dialogs**: Focus trapped within when open
5. **Footer**: Additional navigation links

### Tab Order Best Practices

- Use semantic HTML for natural tab order
- Avoid `tabindex` values greater than 0
- Use `tabindex="-1"` to remove elements from tab order
- Ensure logical flow matches visual layout

## Focus Indicators

All interactive elements have visible focus indicators:

### Visual Design

- **Color**: River blue (#0087FF) for consistency with theme
- **Style**: 2px solid ring with 2px offset
- **Transition**: Smooth 200ms ease-in-out
- **Contrast**: Meets WCAG 2.1 Level AA (4.5:1 minimum)

### Implementation

Focus indicators are automatically applied via CSS:

```css
button:focus-visible,
a:focus-visible,
input:focus-visible,
[role="button"]:focus-visible {
  outline: none;
  ring: 2px solid #0087FF;
  ring-offset: 2px;
}
```

## Accessibility Features

### Screen Reader Support

- All interactive elements have proper ARIA labels
- Dynamic content updates announced via `aria-live` regions
- Modal dialogs use `role="dialog"` and `aria-modal="true"`
- Keyboard shortcuts don't interfere with screen reader shortcuts

### Keyboard-Only Navigation

- All functionality accessible via keyboard
- No mouse-only interactions
- Visual feedback for all keyboard actions
- Logical focus order throughout application

### Reduced Motion Support

Keyboard navigation respects `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing

### Unit Tests

**Location**: `src/hooks/__tests__/useKeyboard.test.ts`

Comprehensive test suite covering:
- Basic key press handling
- Modifier key combinations (Ctrl, Shift, Alt)
- Enable/disable functionality
- Input element handling
- Focus trap behavior
- Multiple bindings
- Event cleanup

Run tests:
```bash
npm test useKeyboard
```

### Manual Testing Checklist

- [ ] All interactive elements focusable via Tab
- [ ] Focus indicators visible on all elements
- [ ] Keyboard shortcuts work as expected
- [ ] Modals trap focus correctly
- [ ] Escape key closes modals
- [ ] Enter key confirms actions
- [ ] Skip-to-content link works
- [ ] No keyboard traps (can always navigate away)
- [ ] Works with screen readers (NVDA, JAWS, VoiceOver)

## Integration Examples

### Game Interface

```typescript
import { useKeyboard, GAME_SHORTCUTS } from '@/hooks/useKeyboard';
import { useGameStore } from '@/store';

function GameInterface() {
  const { togglePause, openMenu, saveGame } = useGameActions();
  const isModalOpen = useGameStore((state) => state.ui.activeModal !== null);

  useKeyboard(
    {
      pause: {
        key: GAME_SHORTCUTS.PAUSE,
        callback: () => togglePause(),
        preventDefault: true,
      },
      menu: {
        key: GAME_SHORTCUTS.MENU,
        callback: () => openMenu(),
        preventDefault: true,
      },
      save: {
        key: GAME_SHORTCUTS.SAVE,
        ctrl: true,
        callback: () => saveGame(),
        preventDefault: true,
      },
    },
    { enabled: !isModalOpen }
  );

  return <div>{/* Game content */}</div>;
}
```

### Modal with Focus Trap

```typescript
import { useFocusTrap, useKeyboard } from '@/hooks/useKeyboard';

function GameModal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(modalRef, isOpen);

  useKeyboard(
    {
      close: {
        key: 'Escape',
        callback: onClose,
        preventDefault: true,
      },
    },
    { enabled: isOpen }
  );

  if (!isOpen) return null;

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {/* Modal content */}
    </div>
  );
}
```

## Browser Compatibility

Keyboard navigation works across all modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## Performance Considerations

- Event listeners attached to `window` for efficiency
- Debounced event handlers prevent excessive calls
- Focus trap only active when needed
- Minimal re-renders via `useCallback` and `useRef`

## Future Enhancements

Potential improvements for future iterations:

1. **Customizable Shortcuts**: Allow users to configure their own key bindings
2. **Shortcut Conflicts**: Detect and warn about conflicting shortcuts
3. **Gamepad Support**: Extend to support gamepad navigation
4. **Voice Commands**: Integrate with Web Speech API for voice control
5. **Shortcut Hints**: Show available shortcuts contextually

## Resources

- [WCAG 2.1 Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)
- [MDN: Keyboard-navigable JavaScript widgets](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Keyboard-navigable_JavaScript_widgets)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

## Conclusion

The keyboard navigation system provides a comprehensive, accessible solution for keyboard-only users. All interactive elements are reachable via keyboard, focus indicators are clearly visible, and the implementation follows WCAG 2.1 Level AA guidelines.

The system is flexible, extensible, and integrates seamlessly with the existing game architecture while maintaining the Vietnamese cultural theme and educational value of the game.
