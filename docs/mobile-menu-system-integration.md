# Mobile Menu System Integration Guide

This guide explains how to integrate the mobile-optimized menu system into the Vietnamese Historical Strategy Game.

## Overview

The mobile menu system provides:
- **Hamburger menu** for mobile navigation
- **Bottom navigation bar** for quick access to game sections
- **Full-screen modals** optimized for mobile devices
- **Responsive behavior** that adapts to screen size

## Implementation Summary

### Components Created

1. **MobileMenuSystem** (`src/components/layout/MobileMenuSystem.tsx`)
   - Main integration component
   - Combines hamburger menu and bottom navigation
   - Manages responsive layout

2. **Enhanced Modal** (`src/components/ui/Modal.tsx`)
   - Added `fullScreenOnMobile` prop for mobile-optimized modals
   - Added `fullScreen` prop for always full-screen modals
   - Responsive styling that adapts to screen size

3. **useMobileMenu Hook** (`src/components/layout/MobileMenuSystem.tsx`)
   - State management for mobile menu
   - Modal control utilities
   - Active view tracking

### Existing Components Used

- **MobileNavigation** - Hamburger menu and bottom bar
- **SwipeableDrawer** - Swipeable drawer functionality
- **GameLayout** - Base layout structure

## Integration Steps

### 1. Basic Integration

Replace or enhance existing navigation with the mobile menu system:

```tsx
// src/app/game/page.tsx
'use client';

import { MobileMenuSystem, useMobileMenu } from '@/components/layout/MobileMenuSystem';
import { Modal } from '@/components/ui/Modal';

export default function GamePage() {
  const { activeView, setActiveView, openModal, closeModal, modalState } = useMobileMenu();

  const menuItems = [
    {
      id: 'home',
      label: 'Trang chủ',
      icon: '🏠',
      onClick: () => setActiveView('home'),
    },
    {
      id: 'game',
      label: 'Chơi game',
      icon: '🎮',
      onClick: () => setActiveView('game'),
    },
    {
      id: 'collection',
      label: 'Bộ sưu tập',
      icon: '🏛️',
      onClick: () => openModal('collection'),
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      onClick: () => openModal('settings'),
    },
  ];

  const bottomBarItems = [
    {
      id: 'map',
      label: 'Bản đồ',
      icon: '🗺️',
      onClick: () => setActiveView('map'),
    },
    {
      id: 'combat',
      label: 'Chiến đấu',
      icon: '⚔️',
      onClick: () => setActiveView('combat'),
    },
    {
      id: 'resources',
      label: 'Tài nguyên',
      icon: '💰',
      onClick: () => setActiveView('resources'),
    },
  ];

  return (
    <MobileMenuSystem
      menuItems={menuItems}
      bottomBarItems={bottomBarItems}
      activeItemId={activeView}
    >
      {/* Game content based on active view */}
      {activeView === 'map' && <GameMap />}
      {activeView === 'combat' && <CombatView />}
      {activeView === 'resources' && <ResourceDisplay />}

      {/* Full-screen modals for mobile */}
      <Modal
        open={modalState.isOpen && modalState.modalId === 'settings'}
        onOpenChange={closeModal}
        fullScreenOnMobile
        title="Cài đặt"
      >
        <SettingsMenu />
      </Modal>

      <Modal
        open={modalState.isOpen && modalState.modalId === 'collection'}
        onOpenChange={closeModal}
        fullScreenOnMobile
        title="Bộ sưu tập"
      >
        <CollectionView />
      </Modal>
    </MobileMenuSystem>
  );
}
```

### 2. Integration with Zustand Store

Connect the mobile menu system to the game's state management:

```tsx
// src/store/slices/uiSlice.ts
import { StateCreator } from 'zustand';

export interface UIState {
  activeView: string;
  activeModal: string | null;
  // ... other UI state
}

export interface UIActions {
  setActiveView: (view: string) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  // ... other actions
}

export type UISlice = UIState & UIActions;

export const createUISlice: StateCreator<UISlice> = (set) => ({
  activeView: 'home',
  activeModal: null,
  
  setActiveView: (view) => set({ activeView: view }),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
});
```

```tsx
// Usage in component
import { useStore } from '@/store';

function GamePage() {
  const { activeView, setActiveView, activeModal, openModal, closeModal } = useStore();

  const menuItems = [
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: '⚙️',
      onClick: () => openModal('settings'),
    },
  ];

  return (
    <MobileMenuSystem menuItems={menuItems} activeItemId={activeView}>
      <Modal
        open={activeModal === 'settings'}
        onOpenChange={(open) => !open && closeModal()}
        fullScreenOnMobile
        title="Cài đặt"
      >
        <SettingsMenu />
      </Modal>
    </MobileMenuSystem>
  );
}
```

### 3. Game-Specific Navigation Items

Create navigation items specific to the game:

```tsx
// src/config/navigation.ts
import { NavigationItem } from '@/components/layout/MobileNavigation';

export const gameMenuItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: '🏠',
    onClick: () => {}, // Will be set in component
  },
  {
    id: 'hero-selection',
    label: 'Chọn tướng',
    icon: '🦸',
    onClick: () => {},
  },
  {
    id: 'game',
    label: 'Chơi game',
    icon: '🎮',
    onClick: () => {},
  },
  {
    id: 'collection',
    label: 'Bộ sưu tập',
    icon: '🏛️',
    onClick: () => {},
  },
  {
    id: 'profile',
    label: 'Hồ sơ',
    icon: '👤',
    onClick: () => {},
  },
  {
    id: 'research',
    label: 'Nghiên cứu',
    icon: '🔬',
    onClick: () => {},
  },
  {
    id: 'quiz',
    label: 'Câu đố',
    icon: '📚',
    onClick: () => {},
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: '⚙️',
    onClick: () => {},
  },
  {
    id: 'save-load',
    label: 'Lưu/Tải',
    icon: '💾',
    onClick: () => {},
  },
];

export const gameBottomBarItems: NavigationItem[] = [
  {
    id: 'map',
    label: 'Bản đồ',
    icon: '🗺️',
    onClick: () => {},
  },
  {
    id: 'combat',
    label: 'Chiến đấu',
    icon: '⚔️',
    onClick: () => {},
  },
  {
    id: 'resources',
    label: 'Tài nguyên',
    icon: '💰',
    onClick: () => {},
  },
  {
    id: 'heroes',
    label: 'Tướng',
    icon: '🦸',
    onClick: () => {},
  },
  {
    id: 'buildings',
    label: 'Công trình',
    icon: '🏰',
    onClick: () => {},
  },
];
```

### 4. Full-Screen Modal Examples

Different modal configurations for different use cases:

```tsx
// Settings modal - full-screen on mobile
<Modal
  open={isSettingsOpen}
  onOpenChange={setIsSettingsOpen}
  fullScreenOnMobile
  title="Cài đặt"
  description="Tùy chỉnh trải nghiệm game"
>
  <SettingsMenu />
</Modal>

// Hero selection - always full-screen
<Modal
  open={isHeroSelectionOpen}
  onOpenChange={setIsHeroSelectionOpen}
  fullScreen
  title="Chọn tướng"
>
  <HeroSelection />
</Modal>

// Quick info - regular modal
<Modal
  open={isInfoOpen}
  onOpenChange={setIsInfoOpen}
  title="Thông tin"
>
  <QuickInfo />
</Modal>
```

## Responsive Behavior

The system automatically adapts based on screen size:

### Mobile (< 768px)
- Hamburger menu button visible
- Bottom navigation bar visible
- Full-screen modals (when `fullScreenOnMobile` is true)
- Touch-optimized interactions

### Tablet (768px - 1023px)
- Hamburger menu hidden
- Bottom navigation bar hidden
- Regular modals
- Can use desktop layout or custom tablet layout

### Desktop (≥ 1024px)
- Full desktop navigation
- Regular modals
- Mouse-optimized interactions

## Accessibility Features

The mobile menu system includes:

- **Keyboard Navigation**: All elements are keyboard accessible
- **ARIA Labels**: Proper labels for screen readers
- **Focus Management**: Automatic focus trapping in modals
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Screen Reader Support**: Semantic HTML and ARIA attributes

## Performance Considerations

- Smooth 60 FPS animations
- Lazy loading of drawer content
- Optimized re-renders
- Efficient event handling

## Testing

Run the test suite:

```bash
npm test mobile-menu-system.test.tsx
```

All 18 tests should pass, covering:
- Component rendering
- User interactions
- State management
- Responsive behavior
- Accessibility

## Migration from Existing Layout

If you're migrating from the existing GameLayout:

1. Keep GameLayout for desktop
2. Use MobileMenuSystem for mobile
3. Conditionally render based on screen size
4. Or fully replace with MobileMenuSystem

Example hybrid approach:

```tsx
'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { GameLayout } from '@/components/layout/GameLayout';
import { MobileMenuSystem } from '@/components/layout/MobileMenuSystem';

export default function GamePage() {
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (isMobile) {
    return (
      <MobileMenuSystem menuItems={menuItems} bottomBarItems={bottomBarItems}>
        <GameContent />
      </MobileMenuSystem>
    );
  }

  return (
    <GameLayout header={<Header />} sidebar={<Sidebar />}>
      <GameContent />
    </GameLayout>
  );
}
```

## Next Steps

1. Integrate into main game page
2. Connect to Zustand store
3. Add game-specific navigation items
4. Test on real mobile devices
5. Gather user feedback
6. Iterate and improve

## Resources

- [MobileMenuSystem.README.md](../src/components/layout/MobileMenuSystem.README.md) - Component documentation
- [MobileMenuSystem.example.tsx](../src/components/layout/MobileMenuSystem.example.tsx) - Complete example
- [mobile-menu-system.test.tsx](../src/__tests__/mobile-menu-system.test.tsx) - Test suite

## Requirements Met

✅ **Requirement 20.8**: Mobile-optimized menu system
- Hamburger menu for mobile navigation
- Bottom navigation bar for mobile
- Full-screen modals for mobile
- Responsive behavior switching between desktop and mobile

## Task Completion

Task 14.4 "Implement mobile-optimized menu system" is complete with:
- Hamburger menu component ✅
- Bottom navigation bar ✅
- Full-screen modal variants ✅
- Responsive behavior ✅
- Comprehensive tests ✅
- Documentation ✅
- Integration examples ✅
