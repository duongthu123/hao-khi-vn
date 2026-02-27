# Mobile Menu System

Complete mobile-optimized menu system for the Vietnamese Historical Strategy Game.

## Overview

The Mobile Menu System provides a comprehensive navigation solution that automatically adapts between mobile and desktop layouts. It includes:

- **Hamburger Menu**: Swipeable drawer navigation for mobile devices
- **Bottom Navigation Bar**: Quick access to main game sections
- **Full-Screen Modals**: Mobile-optimized modal dialogs
- **Responsive Behavior**: Automatic switching based on screen size

## Requirements

Implements **Requirement 20.8**: Mobile-optimized menu system

## Components

### MobileMenuSystem

Main component that integrates all mobile navigation features.

```tsx
import { MobileMenuSystem } from '@/components/layout/MobileMenuSystem';

<MobileMenuSystem
  menuItems={menuItems}
  bottomBarItems={bottomBarItems}
  activeItemId="game"
>
  <GameContent />
</MobileMenuSystem>
```

**Props:**
- `menuItems`: Navigation items for hamburger menu
- `bottomBarItems`: Items for bottom navigation bar (max 5 recommended)
- `activeItemId`: Currently active item ID
- `children`: Main content area
- `className`: Custom CSS classes

### Modal with Full-Screen Variants

Enhanced Modal component with mobile-specific full-screen options.

```tsx
import { Modal } from '@/components/ui/Modal';

// Full-screen on mobile, regular on tablet/desktop
<Modal
  open={isOpen}
  onOpenChange={setIsOpen}
  fullScreenOnMobile
  title="Settings"
>
  <SettingsContent />
</Modal>

// Always full-screen
<Modal
  open={isOpen}
  onOpenChange={setIsOpen}
  fullScreen
  title="Game View"
>
  <GameContent />
</Modal>
```

**Props:**
- `fullScreenOnMobile`: Full-screen on mobile, regular on tablet+
- `fullScreen`: Always full-screen regardless of screen size

### useMobileMenu Hook

Custom hook for managing mobile menu state.

```tsx
import { useMobileMenu } from '@/components/layout/MobileMenuSystem';

function MyComponent() {
  const {
    activeView,
    setActiveView,
    openModal,
    closeModal,
    modalState
  } = useMobileMenu();

  return (
    <MobileMenuSystem
      menuItems={menuItems}
      activeItemId={activeView}
    >
      <Modal
        open={modalState.isOpen && modalState.modalId === 'settings'}
        onOpenChange={closeModal}
        fullScreenOnMobile
      >
        <SettingsContent />
      </Modal>
    </MobileMenuSystem>
  );
}
```

## Responsive Breakpoints

The system uses the following breakpoints defined in `tailwind.config.ts`:

- **Mobile**: 320px+ (hamburger menu + bottom bar visible)
- **Tablet**: 768px+ (hamburger menu hidden, bottom bar hidden)
- **Desktop**: 1024px+ (full desktop layout)

## Features

### 1. Hamburger Menu

- Touch-friendly 44x44px minimum button size
- Swipeable drawer with smooth animations
- Automatic close on item selection
- Keyboard accessible (Escape to close)

### 2. Bottom Navigation Bar

- Fixed position at bottom of screen
- Touch-optimized buttons (44x44px minimum)
- Icon + label for clarity
- Active state highlighting
- Hidden on tablet and larger screens

### 3. Full-Screen Modals

- Automatic full-screen on mobile devices
- Regular modal on tablet/desktop
- Smooth transitions
- Backdrop with blur effect
- Keyboard accessible

### 4. Responsive Behavior

- Automatic layout switching based on screen size
- Touch-friendly interactions on mobile
- Mouse-optimized on desktop
- Orientation change support

## Usage Examples

### Basic Navigation

```tsx
const menuItems = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: '🏠',
    onClick: () => navigate('/'),
  },
  {
    id: 'game',
    label: 'Chơi game',
    icon: '🎮',
    onClick: () => navigate('/game'),
  },
];

<MobileMenuSystem menuItems={menuItems}>
  <MainContent />
</MobileMenuSystem>
```

### With Bottom Navigation

```tsx
const bottomBarItems = [
  {
    id: 'map',
    label: 'Bản đồ',
    icon: '🗺️',
    onClick: () => setView('map'),
  },
  {
    id: 'combat',
    label: 'Chiến đấu',
    icon: '⚔️',
    onClick: () => setView('combat'),
  },
  {
    id: 'resources',
    label: 'Tài nguyên',
    icon: '💰',
    onClick: () => setView('resources'),
  },
];

<MobileMenuSystem
  menuItems={menuItems}
  bottomBarItems={bottomBarItems}
  activeItemId={currentView}
>
  <GameContent />
</MobileMenuSystem>
```

### With Full-Screen Modals

```tsx
function GameScreen() {
  const { openModal, closeModal, modalState } = useMobileMenu();

  const menuItems = [
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      onClick: () => openModal('settings'),
    },
  ];

  return (
    <MobileMenuSystem menuItems={menuItems}>
      <GameContent />
      
      <Modal
        open={modalState.isOpen && modalState.modalId === 'settings'}
        onOpenChange={closeModal}
        fullScreenOnMobile
        title="Cài đặt"
      >
        <SettingsForm />
      </Modal>
    </MobileMenuSystem>
  );
}
```

### Complete Example

See `MobileMenuSystem.example.tsx` for a comprehensive demonstration including:
- Multiple navigation items
- Bottom navigation bar
- Multiple modals with different configurations
- State management
- Responsive behavior

## Accessibility

The mobile menu system follows accessibility best practices:

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **ARIA Labels**: Proper labels for screen readers
- **Focus Management**: Automatic focus trapping in modals
- **Touch Targets**: Minimum 44x44px touch targets
- **Screen Reader Support**: Semantic HTML and ARIA attributes

## Testing

Run tests with:

```bash
npm test mobile-menu-system.test.tsx
```

Tests cover:
- Component rendering
- User interactions
- State management
- Responsive behavior
- Accessibility features

## Integration with Existing Components

The mobile menu system integrates with:

- **MobileNavigation**: Provides hamburger menu and bottom bar
- **SwipeableDrawer**: Handles swipe gestures
- **Modal**: Enhanced with full-screen variants
- **GameLayout**: Can be used alongside or replace existing layout

## Performance

- Smooth 60 FPS animations
- Lazy loading of drawer content
- Optimized re-renders with React hooks
- Efficient event handling

## Browser Support

- iOS Safari 12+
- Android Chrome 80+
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Vietnamese Language Support

All text labels support Vietnamese diacritics:
- Proper font rendering
- Correct line height for readability
- Touch-friendly text sizes

## Future Enhancements

Potential improvements:
- Gesture-based navigation (swipe between views)
- Customizable bottom bar position
- Persistent menu state across sessions
- Animation customization options
