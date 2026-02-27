# useKeyboard Hook

A comprehensive keyboard navigation and shortcut management system for the Vietnamese Historical Strategy Game.

## Overview

The `useKeyboard` hook provides a flexible and accessible way to manage keyboard shortcuts throughout the game. It handles key bindings, modifier keys, focus management, and ensures compatibility with screen readers and assistive technologies.

## Features

- ✅ **Keyboard Shortcuts**: Register custom key bindings for game actions
- ✅ **Modifier Keys**: Support for Ctrl/Cmd, Shift, and Alt modifiers
- ✅ **Focus Management**: Automatic handling of input element focus
- ✅ **Focus Trap**: Keep focus within modals and dialogs
- ✅ **Accessibility**: Full keyboard navigation support
- ✅ **Conflict Prevention**: Avoid conflicts with browser shortcuts
- ✅ **Dynamic Enable/Disable**: Toggle shortcuts on/off at runtime

## Basic Usage

```tsx
import { useKeyboard, GAME_SHORTCUTS } from '@/hooks/useKeyboard';

function GameComponent() {
  const { togglePause, openMenu } = useGameActions();

  useKeyboard({
    pause: {
      key: GAME_SHORTCUTS.PAUSE,
      description: 'Pause game',
      callback: () => togglePause(),
      preventDefault: true,
    },
    menu: {
      key: GAME_SHORTCUTS.MENU,
      description: 'Open menu',
      callback: () => openMenu(),
      preventDefault: true,
    },
  });

  return <div>Game content</div>;
}
```

## Key Bindings

### KeyBinding Interface

```typescript
interface KeyBinding {
  key: string;              // Key to bind (e.g., 'p', 'Escape', 'ArrowUp')
  callback: (event: KeyboardEvent) => void;  // Function to execute
  description?: string;     // Human-readable description
  ctrl?: boolean;          // Require Ctrl/Cmd key
  shift?: boolean;         // Require Shift key
  alt?: boolean;           // Require Alt key
  preventDefault?: boolean; // Prevent default browser behavior
  enabled?: boolean;       // Whether binding is active
}
```

### Example: Save Game with Ctrl+S

```tsx
useKeyboard({
  save: {
    key: 's',
    ctrl: true,
    description: 'Save game',
    callback: () => saveGame(),
    preventDefault: true, // Prevent browser save dialog
  },
});
```

## Modifier Keys

### Ctrl/Cmd Key

```tsx
useKeyboard({
  save: {
    key: 's',
    ctrl: true,  // Ctrl on Windows/Linux, Cmd on Mac
    callback: () => saveGame(),
  },
});
```

### Shift Key

```tsx
useKeyboard({
  quickSave: {
    key: 's',
    shift: true,
    callback: () => quickSave(),
  },
});
```

### Multiple Modifiers

```tsx
useKeyboard({
  advancedAction: {
    key: 'a',
    ctrl: true,
    shift: true,
    callback: () => performAdvancedAction(),
  },
});
```

## Options

### UseKeyboardOptions

```typescript
interface UseKeyboardOptions {
  enabled?: boolean;        // Enable/disable all shortcuts (default: true)
  captureInInputs?: boolean; // Capture keys in input fields (default: false)
}
```

### Example: Conditional Shortcuts

```tsx
const isPaused = useGameStore((state) => state.game.isPaused);

useKeyboard(
  {
    resume: {
      key: 'p',
      callback: () => resumeGame(),
    },
  },
  { enabled: isPaused } // Only active when paused
);
```

## Focus Trap

Use `useFocusTrap` to keep keyboard focus within a modal or dialog:

```tsx
import { useFocusTrap } from '@/hooks/useKeyboard';

function Modal({ isOpen, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useFocusTrap(modalRef, isOpen);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      <button onClick={onClose}>Close</button>
      <button>Action 1</button>
      <button>Action 2</button>
    </div>
  );
}
```

## Common Game Shortcuts

The hook provides predefined shortcuts via `GAME_SHORTCUTS`:

```typescript
const GAME_SHORTCUTS = {
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
};
```

## Display Key Names

Use `getKeyDisplayName` to show shortcuts to users:

```tsx
import { getKeyDisplayName } from '@/hooks/useKeyboard';

function ShortcutHelp() {
  return (
    <div>
      <p>Pause: {getKeyDisplayName('p')}</p>
      <p>Save: {getKeyDisplayName('s', { ctrl: true })}</p>
      <p>Navigate: {getKeyDisplayName('ArrowRight')}</p>
    </div>
  );
}
```

Output:
- Pause: P
- Save: Ctrl + S (or ⌘ + S on Mac)
- Navigate: →

## Complete Example

```tsx
import { useKeyboard, useFocusTrap, GAME_SHORTCUTS } from '@/hooks/useKeyboard';
import { useGameStore } from '@/store';
import { useRef } from 'react';

function GameInterface() {
  const modalRef = useRef<HTMLDivElement>(null);
  const isPaused = useGameStore((state) => state.game.isPaused);
  const isModalOpen = useGameStore((state) => state.ui.activeModal !== null);
  
  const {
    togglePause,
    openMenu,
    saveGame,
    loadGame,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useGameActions();

  // Main game shortcuts
  useKeyboard(
    {
      pause: {
        key: GAME_SHORTCUTS.PAUSE,
        description: 'Tạm dừng / Pause',
        callback: () => togglePause(),
        preventDefault: true,
      },
      menu: {
        key: GAME_SHORTCUTS.MENU,
        description: 'Mở menu / Open menu',
        callback: () => openMenu(),
        preventDefault: true,
      },
      save: {
        key: GAME_SHORTCUTS.SAVE,
        ctrl: true,
        description: 'Lưu game / Save game',
        callback: () => saveGame(),
        preventDefault: true,
      },
      load: {
        key: GAME_SHORTCUTS.LOAD,
        ctrl: true,
        description: 'Tải game / Load game',
        callback: () => loadGame(),
        preventDefault: true,
      },
      zoomIn: {
        key: GAME_SHORTCUTS.ZOOM_IN,
        description: 'Phóng to / Zoom in',
        callback: () => zoomIn(),
        preventDefault: true,
      },
      zoomOut: {
        key: GAME_SHORTCUTS.ZOOM_OUT,
        description: 'Thu nhỏ / Zoom out',
        callback: () => zoomOut(),
        preventDefault: true,
      },
      resetZoom: {
        key: GAME_SHORTCUTS.ZOOM_RESET,
        description: 'Đặt lại zoom / Reset zoom',
        callback: () => resetZoom(),
        preventDefault: true,
      },
    },
    { enabled: !isModalOpen } // Disable when modal is open
  );

  // Focus trap for modal
  useFocusTrap(modalRef, isModalOpen);

  return (
    <div>
      {/* Game content */}
      {isModalOpen && (
        <div ref={modalRef} role="dialog" aria-modal="true">
          {/* Modal content */}
        </div>
      )}
    </div>
  );
}
```

## Accessibility Considerations

1. **Focus Indicators**: Always provide visible focus indicators (handled by Tailwind's `focus-visible:` utilities)
2. **Tab Order**: Ensure logical tab order through DOM structure
3. **Focus Trap**: Use `useFocusTrap` for modals to prevent focus escaping
4. **Screen Readers**: Shortcuts work alongside screen reader navigation
5. **Input Fields**: Shortcuts are disabled in input fields by default to avoid conflicts

## Best Practices

1. **Prevent Default**: Always set `preventDefault: true` for shortcuts that conflict with browser defaults (Ctrl+S, Ctrl+P, etc.)
2. **Descriptive Names**: Provide clear descriptions for documentation and help screens
3. **Conditional Enabling**: Disable shortcuts when they shouldn't be active (e.g., during modals)
4. **Avoid Conflicts**: Don't override essential browser shortcuts (Ctrl+T, Ctrl+W, etc.)
5. **Document Shortcuts**: Display available shortcuts in a help screen or tooltip

## Testing

The hook includes comprehensive tests covering:
- Basic key press handling
- Modifier key combinations
- Enable/disable functionality
- Input element handling
- Focus trap behavior
- Multiple bindings
- Event cleanup

Run tests:
```bash
npm test useKeyboard
```

## Requirements Validation

This implementation validates:
- **Requirement 22.2**: Keyboard navigation for all interactive elements
- **Requirement 2.4**: Component props with TypeScript interfaces

## Related Hooks

- `useGameLoop`: Game update loop
- `useAutoSave`: Automatic save system
- `useFocusTrap`: Focus management (included in this module)

## Vietnamese Language Support

All shortcuts work seamlessly with Vietnamese keyboard layouts and diacritics. The hook normalizes keys for case-insensitive matching, ensuring compatibility across different keyboard configurations.
