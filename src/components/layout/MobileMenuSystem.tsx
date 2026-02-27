'use client';

/**
 * MobileMenuSystem Component
 * 
 * Complete mobile-optimized menu system that provides:
 * - Hamburger menu for mobile navigation
 * - Bottom navigation bar for quick access to main sections
 * - Full-screen modals for mobile devices
 * - Responsive behavior switching between desktop and mobile layouts
 * 
 * This component integrates:
 * - MobileNavigation for hamburger menu and bottom bar
 * - Modal with full-screen mobile variant
 * - Responsive breakpoints (mobile: 320px+, tablet: 768px+, desktop: 1024px+)
 * 
 * Requirements: 20.8
 */

import React, { useState, ReactNode } from 'react';
import { MobileNavigation, NavigationItem } from './MobileNavigation';
import { cn } from '@/lib/utils';

export interface MobileMenuSystemProps {
  /** Navigation items for the hamburger menu */
  menuItems: NavigationItem[];
  /** Bottom bar items (max 5 recommended for mobile) */
  bottomBarItems?: NavigationItem[];
  /** Active item ID */
  activeItemId?: string;
  /** Children content */
  children?: ReactNode;
  /** Custom className */
  className?: string;
}

/**
 * Complete mobile-optimized menu system
 * 
 * Features:
 * - Hamburger menu with swipeable drawer
 * - Bottom navigation bar for quick access
 * - Full-screen modals on mobile
 * - Automatic responsive behavior
 * 
 * @example
 * ```tsx
 * const menuItems = [
 *   { id: 'home', label: 'Trang chủ', icon: '🏠', onClick: () => navigate('/') },
 *   { id: 'game', label: 'Chơi game', icon: '🎮', onClick: () => navigate('/game') },
 *   { id: 'collection', label: 'Bộ sưu tập', icon: '🏛️', onClick: () => navigate('/collection') },
 * ];
 * 
 * const bottomBarItems = [
 *   { id: 'map', label: 'Bản đồ', icon: '🗺️', onClick: () => setView('map') },
 *   { id: 'combat', label: 'Chiến đấu', icon: '⚔️', onClick: () => setView('combat') },
 *   { id: 'resources', label: 'Tài nguyên', icon: '💰', onClick: () => setView('resources') },
 * ];
 * 
 * <MobileMenuSystem
 *   menuItems={menuItems}
 *   bottomBarItems={bottomBarItems}
 *   activeItemId="game"
 * >
 *   <GameContent />
 * </MobileMenuSystem>
 * ```
 */
export function MobileMenuSystem({
  menuItems,
  bottomBarItems,
  activeItemId,
  children,
  className = '',
}: MobileMenuSystemProps) {
  return (
    <div className={cn('relative min-h-screen', className)}>
      {/* Mobile Navigation (Hamburger + Bottom Bar) */}
      <MobileNavigation
        items={menuItems}
        bottomBarItems={bottomBarItems}
        activeItemId={activeItemId}
      />

      {/* Main Content Area */}
      <div className={cn(
        'min-h-screen',
        bottomBarItems && bottomBarItems.length > 0 ? 'pb-16 tablet:pb-0' : ''
      )}>
        {children}
      </div>
    </div>
  );
}

/**
 * Hook for managing mobile menu state
 * 
 * @example
 * ```tsx
 * const { activeView, setActiveView, openModal, closeModal, modalState } = useMobileMenu();
 * 
 * const menuItems = [
 *   { id: 'settings', label: 'Cài đặt', icon: '⚙️', onClick: () => openModal('settings') },
 * ];
 * 
 * <MobileMenuSystem menuItems={menuItems} activeItemId={activeView}>
 *   <Modal
 *     open={modalState.isOpen && modalState.modalId === 'settings'}
 *     onOpenChange={closeModal}
 *     fullScreenOnMobile
 *     title="Cài đặt"
 *   >
 *     <SettingsContent />
 *   </Modal>
 * </MobileMenuSystem>
 * ```
 */
export function useMobileMenu() {
  const [activeView, setActiveView] = useState<string>('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    modalId: string | null;
  }>({
    isOpen: false,
    modalId: null,
  });

  const openModal = (modalId: string) => {
    setModalState({ isOpen: true, modalId });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, modalId: null });
  };

  return {
    activeView,
    setActiveView,
    openModal,
    closeModal,
    modalState,
  };
}
