'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { useOrientation } from '@/hooks/useOrientation';
import { OrientationTransition } from '@/components/ui/OrientationTransition';

export interface GameLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
  showSidebar?: boolean;
}

export function GameLayout({ children, header, sidebar, showSidebar = true }: GameLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isOrientationTransitioning, setIsOrientationTransitioning] = useState(false);

  // Handle orientation changes
  const { orientation, isPortrait, isLandscape } = useOrientation({
    onChange: (newOrientation) => {
      // Show transition indicator
      setIsOrientationTransitioning(true);
      
      // Close mobile sidebar during orientation change to prevent layout issues
      setIsMobileSidebarOpen(false);
      
      // Hide transition after a brief delay
      setTimeout(() => {
        setIsOrientationTransitioning(false);
      }, 300);
      
      console.log('Orientation changed to:', newOrientation);
    },
    debounceDelay: 100,
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Orientation transition overlay */}
      <AnimatePresence>
        {isOrientationTransitioning && (
          <OrientationTransition duration={300} />
        )}
      </AnimatePresence>

      {/* Header */}
      {header && (
        <header className="flex-shrink-0 bg-black/85 border-b border-[#f1c40f] text-[#f1c40f] z-10" role="banner">
          <div className="flex items-center justify-between px-3 py-2 tablet:px-4 tablet:py-3">
            {/* Mobile menu button */}
            {showSidebar && sidebar && (
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="tablet:hidden p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Mở menu"
                aria-expanded={isMobileSidebarOpen}
                aria-controls="mobile-sidebar"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            
            {/* Header content */}
            <div className="flex-1">
              {header}
            </div>
          </div>
        </header>
      )}

      {/* Main content area with sidebar - adapts to orientation */}
      <div 
        className={cn(
          'flex-1 flex overflow-hidden',
          // Orientation-specific adjustments
          isPortrait && 'flex-col',
          isLandscape && 'flex-row'
        )}
        data-orientation={orientation}
      >
        {/* Desktop Sidebar - hidden on mobile */}
        {showSidebar && sidebar && (
          <aside
            className={cn(
              'flex-shrink-0 bg-[#2c3e50] border-r border-[#555] overflow-y-auto text-white',
              'w-64 desktop:w-80',
              'hidden tablet:block'
            )}
            role="complementary"
            aria-label="Sidebar navigation"
          >
            {sidebar}
          </aside>
        )}

        {/* Mobile Sidebar - swipeable drawer */}
        {showSidebar && sidebar && (
          <SwipeableDrawer
            isOpen={isMobileSidebarOpen}
            onClose={() => setIsMobileSidebarOpen(false)}
            position="left"
            className="tablet:hidden"
          >
            <nav 
              id="mobile-sidebar"
              className="h-full bg-[#2c3e50] overflow-y-auto text-white"
              role="navigation"
              aria-label="Mobile navigation menu"
            >
              {/* Close button */}
              <div className="sticky top-0 bg-[#3e2723] border-b border-[#8d6e63] p-3 flex justify-between items-center z-10">
                <h2 className="text-lg font-bold text-[#f1c40f]">Menu</h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Đóng menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              {/* Sidebar content */}
              <div className="p-3">
                {sidebar}
              </div>
            </nav>
          </SwipeableDrawer>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#1a1a1a] text-white" role="main" aria-label="Main game content">
          {children}
        </main>
      </div>
    </div>
  );
}
