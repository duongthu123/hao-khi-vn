'use client';

/**
 * Lazy-loaded heavy components with loading states
 * Implements code splitting for performance optimization
 * 
 * Validates Requirements:
 * - 21.1: Code splitting for route-based lazy loading
 * - 21.2: Lazy load heavy components (map, combat) on demand
 * - 23.7: Loading states for lazy-loaded components
 */

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { GameMapProps } from '@/components/game/GameMap/GameMap';
import { CombatViewProps } from '@/components/game/CombatView/CombatView';
import { CollectionView as CollectionViewType } from '@/components/game/CollectionView/CollectionView';

/**
 * Loading component for GameMap
 */
const GameMapLoading = () => (
  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-white text-lg font-semibold">Đang tải bản đồ...</p>
      <p className="text-gray-400 text-sm mt-2">Loading map...</p>
    </div>
  </div>
);

/**
 * Loading component for CombatView
 */
const CombatViewLoading = () => (
  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mb-4"></div>
      <p className="text-white text-lg font-semibold">Đang tải giao diện chiến đấu...</p>
      <p className="text-gray-400 text-sm mt-2">Loading combat interface...</p>
    </div>
  </div>
);

/**
 * Loading component for CollectionView
 */
const CollectionViewLoading = () => (
  <div className="flex items-center justify-center w-full h-full bg-gradient-to-b from-slate-900 to-slate-800">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mb-4"></div>
      <p className="text-white text-lg font-semibold">Đang tải bảo tàng anh hùng...</p>
      <p className="text-gray-400 text-sm mt-2">Loading hero collection...</p>
    </div>
  </div>
);

/**
 * Lazy-loaded GameMap component with loading state
 * Heavy component with Canvas rendering and quadtree spatial indexing
 */
export const LazyGameMap = dynamic<GameMapProps>(
  () => import('@/components/game/GameMap/GameMap').then((mod) => mod.GameMap),
  {
    loading: () => <GameMapLoading />,
    ssr: false, // Disable SSR for Canvas-based component
  }
);

/**
 * Lazy-loaded CombatView component with loading state
 * Heavy component with combat animations and real-time updates
 */
export const LazyCombatView = dynamic<CombatViewProps>(
  () => import('@/components/game/CombatView/CombatView').then((mod) => mod.CombatView),
  {
    loading: () => <CombatViewLoading />,
    ssr: false, // Disable SSR for interactive combat interface
  }
);

/**
 * Lazy-loaded CollectionView component with loading state
 * Heavy component with hero collection collection grid and detailed hero information
 */
export const LazyCollectionView = dynamic(
  () => import('@/components/game/CollectionView/CollectionView').then((mod) => mod.CollectionView),
  {
    loading: () => <CollectionViewLoading />,
    ssr: false, // Disable SSR for interactive collection interface
  }
);

/**
 * Preload functions for eager loading when needed
 * Call these functions to preload components before they're needed
 */
export const preloadGameMap = () => {
  const component = import('@/components/game/GameMap/GameMap');
  return component;
};

export const preloadCombatView = () => {
  const component = import('@/components/game/CombatView/CombatView');
  return component;
};

export const preloadCollectionView = () => {
  const component = import('@/components/game/CollectionView/CollectionView');
  return component;
};
