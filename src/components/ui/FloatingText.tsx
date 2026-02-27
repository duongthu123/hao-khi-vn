'use client';

/**
 * FloatingText Component
 * Animated floating text for resource gains/losses
 * 
 * Validates Requirements 14.4 (resource display), 6.5 (resource change animations)
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResourceType } from '@/types/resource';
import { useAnimations } from '@/hooks/useAnimations';

export interface FloatingTextItem {
  id: string;
  text: string;
  type: 'gain' | 'loss';
  resourceType?: ResourceType;
  x?: number;
  y?: number;
}

interface FloatingTextProps {
  items: FloatingTextItem[];
  onComplete: (id: string) => void;
}

export type { FloatingTextProps, FloatingTextItem };

/**
 * Get color based on type and resource
 */
const getTextColor = (type: 'gain' | 'loss', resourceType?: ResourceType): string => {
  if (type === 'loss') {
    return 'text-red-400';
  }

  // Gain colors based on resource type
  switch (resourceType) {
    case ResourceType.FOOD:
      return 'text-amber-400';
    case ResourceType.GOLD:
      return 'text-yellow-400';
    case ResourceType.ARMY:
      return 'text-red-400';
    default:
      return 'text-green-400';
  }
};

/**
 * Get icon based on resource type
 */
const getResourceIcon = (resourceType?: ResourceType): string => {
  switch (resourceType) {
    case ResourceType.FOOD:
      return '🌾';
    case ResourceType.GOLD:
      return '💰';
    case ResourceType.ARMY:
      return '⚔️';
    default:
      return '';
  }
};

/**
 * Single floating text item
 */
const FloatingTextElement: React.FC<{
  item: FloatingTextItem;
  onComplete: (id: string) => void;
}> = ({ item, onComplete }) => {
  const color = getTextColor(item.type, item.resourceType);
  const icon = getResourceIcon(item.resourceType);

  useEffect(() => {
    // Auto-remove after animation completes
    const timer = setTimeout(() => {
      onComplete(item.id);
    }, 2000);

    return () => clearTimeout(timer);
  }, [item.id, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: -80,
        scale: [0.5, 1.2, 1, 0.8],
      }}
      transition={{
        duration: 2,
        ease: 'easeOut',
        times: [0, 0.2, 0.8, 1],
      }}
      className={`
        absolute pointer-events-none
        ${color}
        font-bold text-2xl
        drop-shadow-lg
        whitespace-nowrap
      `}
      style={{
        left: item.x !== undefined ? `${item.x}px` : '50%',
        top: item.y !== undefined ? `${item.y}px` : '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {item.type === 'gain' ? '+' : '-'}
      {item.text}
    </motion.div>
  );
};

/**
 * FloatingText container
 */
export const FloatingText: React.FC<FloatingTextProps> = ({ items, onComplete }) => {
  const shouldAnimate = useAnimations();
  
  // Don't render floating text when animations are disabled
  if (!shouldAnimate) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {items.map((item) => (
          <FloatingTextElement key={item.id} item={item} onComplete={onComplete} />
        ))}
      </AnimatePresence>
    </div>
  );
};

/**
 * Hook for managing floating text
 */
export const useFloatingText = () => {
  const [items, setItems] = useState<FloatingTextItem[]>([]);

  const addFloatingText = (
    text: string,
    type: 'gain' | 'loss',
    resourceType?: ResourceType,
    x?: number,
    y?: number
  ) => {
    const id = `floating-${Date.now()}-${Math.random()}`;
    const newItem: FloatingTextItem = { id, text, type, resourceType, x, y };
    
    setItems((prev) => [...prev, newItem]);
    
    return id;
  };

  const removeFloatingText = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return {
    items,
    addFloatingText,
    removeFloatingText,
  };
};

export default FloatingText;
