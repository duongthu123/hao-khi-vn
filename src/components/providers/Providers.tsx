'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { ReactNode } from 'react';
import { queryClient } from '@/lib/query-client';
import { useGameStore } from '@/store';
import { ErrorBoundary } from '@/components/ui';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const animationsEnabled = useGameStore((state) => state.ui.settings.animationsEnabled);
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MotionConfig
          // Respect both user settings and browser preference
          // "user" respects prefers-reduced-motion, "always" forces reduced motion
          reducedMotion={animationsEnabled ? "user" : "always"}
          transition={
            animationsEnabled
              ? {
                  // Default transition for smooth 60 FPS animations
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8
                }
              : {
                  // Instant transitions when animations are disabled
                  duration: 0
                }
          }
          // Enable hardware acceleration for better performance
          features={{
            // Use GPU acceleration when available
            useGPU: true
          }}
        >
          {children}
        </MotionConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
