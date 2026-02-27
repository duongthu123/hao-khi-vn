'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface MenuLayoutProps {
  children: ReactNode;
  backgroundImage?: string;
  className?: string;
}

export function MenuLayout({ children, className }: MenuLayoutProps) {
  const particleRef = useRef<HTMLDivElement>(null);

  // Ember particle effect from original game
  useEffect(() => {
    const container = particleRef.current;
    if (!container) return;

    const interval = setInterval(() => {
      const ember = document.createElement('div');
      ember.className = 'hkda-ember';
      ember.style.left = Math.random() * 100 + '%';
      ember.style.setProperty('--drift', (Math.random() * 100 - 50) + 'px');
      ember.style.animationDuration = (3 + Math.random() * 4) + 's';
      container.appendChild(ember);
      setTimeout(() => ember.remove(), 7000);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 w-screen h-screen overflow-hidden bg-[#1a1a1a]',
        'font-[Merriweather,serif] text-white',
        className
      )}
      role="main"
      aria-label="Menu screen"
    >
      {/* Sky layer - dark red radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(circle at 50% 30%, #4a0404 0%, #000000 70%)' }}
        aria-hidden="true"
      />

      {/* River layer */}
      <div
        className="absolute left-0 w-full h-1/2 bottom-0 pointer-events-none z-[2] opacity-90"
        style={{ background: 'linear-gradient(to top, #0b1e29 0%, rgba(11,46,61,0.8) 60%, transparent 100%)' }}
        aria-hidden="true"
      />

      {/* Stakes layer */}
      <div
        className="absolute left-0 w-full pointer-events-none z-[2] opacity-50"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 50px, #000 50px, #2e1a12 60px)',
          height: '20%',
          top: '60%',
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        }}
        aria-hidden="true"
      />

      {/* Hero silhouette area */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[500px] z-[5] flex items-end justify-center" aria-hidden="true">
        <div
          className="w-[200px] h-[400px] bg-black"
          style={{
            clipPath: 'polygon(20% 100%, 80% 100%, 60% 10%, 40% 0%)',
            boxShadow: '0 0 20px rgba(0,0,0,0.8)',
          }}
        />
        {/* Flag */}
        <div
          className="absolute top-[50px] left-[70%] bg-[#8b0000] text-[#ffd700] px-2 py-4 font-[Dancing_Script,cursive] text-lg border-2 border-[#ffd700]"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            transformOrigin: 'top left',
            animation: 'hkda-flagWave 3s ease-in-out infinite',
          }}
        >
          Phá cường địch<br />Báo hoàng ân
        </div>
      </div>

      {/* Ember particles container */}
      <div ref={particleRef} className="absolute inset-0 pointer-events-none z-[10]" aria-hidden="true" />

      {/* Content overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-[20] w-full h-full flex items-start justify-end p-[10%]"
      >
        <div className="w-[300px] text-center">
          {children}
        </div>
      </motion.div>

      {/* Version info */}
      <div className="absolute bottom-2.5 right-2.5 text-white/30 text-xs z-[20]">
        Ver 1.0 - Sử Việt Hùng Ca
      </div>
    </div>
  );
}
