'use client';

/**
 * MobileNavigation Component
 * 
 * Mobile-optimized navigation with:
 * - Hamburger menu button (44x44px minimum)
 * - Swipeable drawer
 * - Touch-friendly navigation items
 * - Bottom navigation bar for quick access
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { cn } from '@/lib/utils';

export interface NavigationItem {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
}

export interface MobileNavigationProps {
  /** Navigation items for the drawer */
  items: NavigationItem[];
  /** Bottom bar items (max 5 recommended) */
  bottomBarItems?: NavigationItem[];
  /** Active item ID */
  activeItemId?: string;
  /** Custom className */
  className?: string;
}

/**
 * Mobile navigation with hamburger menu and bottom bar
 */
export function MobileNavigation({
  items,
  bottomBarItems,
  activeItemId,
  className = '',
}: MobileNavigationProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleItemClick = (item: NavigationItem) => {
    item.onClick();
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button - Touch-friendly 44x44px minimum */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={cn(
          'fixed top-4 left-4 z-30',
          'min-w-[44px] min-h-[44px] w-12 h-12',
          'flex items-center justify-center',
          'bg-white rounded-lg shadow-lg',
          'hover:bg-gray-50 active:bg-gray-100',
          'transition-colors',
          'tablet:hidden', // Hide on tablet and larger
          className
        )}
        aria-label="Open navigation menu"
        aria-expanded={isDrawerOpen}
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Swipeable Navigation Drawer */}
      <SwipeableDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="left"
        swipeThreshold={50}
      >
        <nav className="space-y-2" role="navigation" aria-label="Main navigation">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={cn(
                'w-full min-h-[44px] px-4 py-3',
                'flex items-center gap-3',
                'text-left text-base font-medium',
                'rounded-lg transition-colors',
                'hover:bg-gray-100 active:bg-gray-200',
                activeItemId === item.id
                  ? 'bg-vietnam-50 text-vietnam-600'
                  : 'text-gray-700'
              )}
              aria-current={activeItemId === item.id ? 'page' : undefined}
            >
              {item.icon && (
                <span className="text-xl" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </SwipeableDrawer>

      {/* Bottom Navigation Bar - Touch-friendly */}
      {bottomBarItems && bottomBarItems.length > 0 && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className={cn(
            'fixed bottom-0 left-0 right-0 z-30',
            'bg-white border-t border-gray-200 shadow-lg',
            'tablet:hidden', // Hide on tablet and larger
          )}
          role="navigation"
          aria-label="Bottom navigation"
        >
          <div className="flex justify-around items-center h-16">
            {bottomBarItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  'flex-1 min-h-[44px] min-w-[44px]',
                  'flex flex-col items-center justify-center gap-1',
                  'transition-colors',
                  'hover:bg-gray-50 active:bg-gray-100',
                  activeItemId === item.id
                    ? 'text-vietnam-600'
                    : 'text-gray-600'
                )}
                aria-current={activeItemId === item.id ? 'page' : undefined}
                aria-label={item.label}
              >
                {item.icon && (
                  <span className="text-2xl" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </motion.nav>
      )}
    </>
  );
}
