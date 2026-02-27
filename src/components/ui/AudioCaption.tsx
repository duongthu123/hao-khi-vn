'use client';

/**
 * AudioCaption Component
 * Provides text captions and descriptions for audio content
 * Validates Requirement 22.5: Text alternatives for audio content
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AudioCaptionProps {
  /** The text caption to display */
  caption: string;
  /** Duration to show the caption in milliseconds */
  duration?: number;
  /** Position of the caption */
  position?: 'top' | 'bottom' | 'center';
  /** Whether to show the caption */
  show?: boolean;
  /** Callback when caption finishes displaying */
  onComplete?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AudioCaption component for displaying text alternatives for audio content
 */
export function AudioCaption({
  caption,
  duration = 3000,
  position = 'bottom',
  show = true,
  onComplete,
  className,
}: AudioCaptionProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);

    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  const positionClasses = {
    top: 'top-4',
    center: 'top-1/2 -translate-y-1/2',
    bottom: 'bottom-4',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none',
            positionClasses[position],
            className
          )}
          role="status"
          aria-live="polite"
          aria-label={`Mô tả âm thanh: ${caption}`}
        >
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg max-w-md text-center">
            <p className="text-sm font-medium">{caption}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook for managing audio captions
 */
export function useAudioCaption() {
  const [caption, setCaption] = useState<string>('');
  const [showCaption, setShowCaption] = useState(false);

  const displayCaption = (text: string, duration?: number) => {
    setCaption(text);
    setShowCaption(true);

    if (duration) {
      setTimeout(() => {
        setShowCaption(false);
      }, duration);
    }
  };

  const hideCaption = () => {
    setShowCaption(false);
  };

  return {
    caption,
    showCaption,
    displayCaption,
    hideCaption,
  };
}

/**
 * Sound effect descriptions in Vietnamese
 */
export const SOUND_DESCRIPTIONS: Record<string, string> = {
  'attack-melee': 'Âm thanh tấn công cận chiến',
  'attack-ranged': 'Âm thanh tấn công tầm xa',
  'hit-light': 'Âm thanh trúng đòn nhẹ',
  'hit-heavy': 'Âm thanh trúng đòn mạnh',
  'death': 'Âm thanh tử trận',
  'ability-cast': 'Âm thanh kích hoạt kỹ năng',
  'ability-impact': 'Âm thanh kỹ năng trúng đích',
  'heal': 'Âm thanh hồi máu',
  'buff': 'Âm thanh tăng cường',
  'debuff': 'Âm thanh suy yếu',
  'rank-up': 'Âm thanh thăng cấp',
  'level-up': 'Âm thanh lên bậc',
  'victory': 'Âm thanh chiến thắng',
  'defeat': 'Âm thanh thất bại',
  'coin': 'Âm thanh nhận vàng',
  'resource': 'Âm thanh nhận tài nguyên',
  'notification': 'Âm thanh thông báo',
  'menu-open': 'Âm thanh mở menu',
  'menu-close': 'Âm thanh đóng menu',
  'button-click': 'Âm thanh nhấn nút',
};

/**
 * Get description for a sound effect
 */
export function getSoundDescription(soundId: string): string {
  return SOUND_DESCRIPTIONS[soundId] || 'Âm thanh trò chơi';
}
