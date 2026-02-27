/**
 * CollectionView Component
 * Displays hero collection grid with unlock status, completion percentage,
 * and museum interface for viewing collected heroes with lore
 * 
 * Optimized with React.memo, useMemo, and useCallback for performance
 */

'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore as useStore } from '@/store';
import { ALL_HEROES, getHeroById } from '@/constants/heroes';
import { Hero, HeroFaction, HeroRarity } from '@/types/hero';
import { RadarChart } from '@/components/ui/RadarChart';

interface CollectionViewProps {
  className?: string;
}

export const CollectionView = memo(function CollectionView({ className = '' }: CollectionViewProps) {
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null);
  const [factionFilter, setFactionFilter] = useState<HeroFaction | 'all'>('all');
  const [rarityFilter, setRarityFilter] = useState<HeroRarity | 'all'>('all');

  const collectedHeroIds = useStore(useShallow((state) => state.getCollectedHeroIds()));
  const completionPercentage = useStore((state) => state.collection.completionPercentage);
  const hasHero = useStore((state) => state.hasHero);

  const selectedHero = useMemo(() => 
    selectedHeroId ? getHeroById(selectedHeroId) : null,
    [selectedHeroId]
  );

  // Filter heroes based on faction and rarity - memoized for performance
  const filteredHeroes = useMemo(() => {
    return ALL_HEROES.filter((hero) => {
      if (factionFilter !== 'all' && hero.faction !== factionFilter) return false;
      if (rarityFilter !== 'all' && hero.rarity !== rarityFilter) return false;
      return true;
    });
  }, [factionFilter, rarityFilter]);

  const getRarityColor = useCallback((rarity: HeroRarity): string => {
    switch (rarity) {
      case HeroRarity.LEGENDARY:
        return 'from-yellow-500 to-orange-500';
      case HeroRarity.EPIC:
        return 'from-purple-500 to-pink-500';
      case HeroRarity.RARE:
        return 'from-blue-500 to-cyan-500';
      case HeroRarity.COMMON:
        return 'from-gray-400 to-gray-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  }, []);

  const getRarityBorder = useCallback((rarity: HeroRarity): string => {
    switch (rarity) {
      case HeroRarity.LEGENDARY:
        return 'border-yellow-500';
      case HeroRarity.EPIC:
        return 'border-purple-500';
      case HeroRarity.RARE:
        return 'border-blue-500';
      case HeroRarity.COMMON:
        return 'border-gray-400';
      default:
        return 'border-gray-400';
    }
  }, []);

  // Memoized callbacks for filter changes
  const handleFactionFilterAll = useCallback(() => setFactionFilter('all'), []);
  const handleFactionFilterVietnamese = useCallback(() => setFactionFilter(HeroFaction.VIETNAMESE), []);
  const handleFactionFilterMongol = useCallback(() => setFactionFilter(HeroFaction.MONGOL), []);
  
  const handleRarityFilterAll = useCallback(() => setRarityFilter('all'), []);
  const handleRarityFilterLegendary = useCallback(() => setRarityFilter(HeroRarity.LEGENDARY), []);
  const handleRarityFilterEpic = useCallback(() => setRarityFilter(HeroRarity.EPIC), []);
  const handleRarityFilterRare = useCallback(() => setRarityFilter(HeroRarity.RARE), []);

  const handleHeroSelect = useCallback((heroId: string) => {
    setSelectedHeroId(heroId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedHeroId(null);
  }, []);

  return (
    <div className={`flex flex-col h-full bg-[#2c3e50] text-white ${className}`}>
      {/* Header with completion percentage */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">Bảo Tàng Anh Hùng</h1>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-slate-300 mb-2">
              <span>Tiến độ sưu tập</span>
              <span className="font-semibold">{completionPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">
              {collectedHeroIds.length}/{ALL_HEROES.length}
            </div>
            <div className="text-xs text-slate-400">Anh hùng</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-slate-700 flex gap-4 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={handleFactionFilterAll}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              factionFilter === 'all'
                ? 'bg-yellow-500 text-slate-900'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={handleFactionFilterVietnamese}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              factionFilter === HeroFaction.VIETNAMESE
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Đại Việt
          </button>
          <button
            onClick={handleFactionFilterMongol}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              factionFilter === HeroFaction.MONGOL
                ? 'bg-red-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Mông Cổ
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleRarityFilterAll}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              rarityFilter === 'all'
                ? 'bg-yellow-500 text-slate-900'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Tất cả độ hiếm
          </button>
          <button
            onClick={handleRarityFilterLegendary}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              rarityFilter === HeroRarity.LEGENDARY
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Huyền thoại
          </button>
          <button
            onClick={handleRarityFilterEpic}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              rarityFilter === HeroRarity.EPIC
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Sử thi
          </button>
          <button
            onClick={handleRarityFilterRare}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              rarityFilter === HeroRarity.RARE
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Hiếm
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Hero Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <HeroGrid
            heroes={filteredHeroes}
            selectedHeroId={selectedHeroId}
            hasHero={hasHero}
            onHeroSelect={handleHeroSelect}
            getRarityColor={getRarityColor}
            getRarityBorder={getRarityBorder}
          />
        </div>

        {/* Hero Detail Panel */}
        <AnimatePresence mode="wait">
          {selectedHero && (
            <motion.div
              key={selectedHero.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-96 border-l border-slate-700 bg-slate-800/50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={handleCloseDetail}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                >
                  ✕
                </button>

                {/* Hero portrait */}
                <div className={`relative aspect-square rounded-lg overflow-hidden border-4 ${getRarityBorder(selectedHero.rarity)} mb-4`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(selectedHero.rarity)} opacity-30`} />
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <div className="text-8xl">
                      {selectedHero.faction === HeroFaction.VIETNAMESE ? '🛡️' : '⚔️'}
                    </div>
                  </div>
                </div>

                {/* Hero name and faction */}
                <h2 className="text-2xl font-bold text-yellow-400 mb-1">{selectedHero.nameVietnamese}</h2>
                <p className="text-sm text-slate-400 mb-1">{selectedHero.name}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedHero.faction === HeroFaction.VIETNAMESE
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {selectedHero.faction === HeroFaction.VIETNAMESE ? 'Đại Việt' : 'Mông Cổ'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold bg-gradient-to-r ${getRarityColor(selectedHero.rarity)} text-white`}>
                    {selectedHero.rarity === HeroRarity.LEGENDARY && 'Huyền thoại'}
                    {selectedHero.rarity === HeroRarity.EPIC && 'Sử thi'}
                    {selectedHero.rarity === HeroRarity.RARE && 'Hiếm'}
                    {selectedHero.rarity === HeroRarity.COMMON && 'Thường'}
                  </span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Mô tả</h3>
                  <p className="text-sm text-slate-400">{selectedHero.descriptionVietnamese}</p>
                </div>

                {/* Stats radar chart */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Chỉ số</h3>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <RadarChart
                      stats={[selectedHero.stats]}
                      colors={[selectedHero.faction === HeroFaction.VIETNAMESE ? '#3b82f6' : '#ef4444']}
                      animated={true}
                    />
                  </div>
                </div>

                {/* Abilities */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Kỹ năng</h3>
                  <div className="space-y-3">
                    {selectedHero.abilities.map((ability) => (
                      <div key={ability.id} className="bg-slate-900/50 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-yellow-400">{ability.nameVietnamese}</h4>
                            <p className="text-xs text-slate-500">{ability.name}</p>
                          </div>
                          <div className="text-xs text-slate-400">
                            <div>CD: {ability.cooldown}s</div>
                            <div>Cost: {ability.cost}</div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-400">{ability.descriptionVietnamese}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Historical context */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Bối cảnh lịch sử</h3>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 leading-relaxed">{selectedHero.historicalContextVietnamese}</p>
                  </div>
                </div>

                {/* Unlock status */}
                {!hasHero(selectedHero.id) && selectedHero.unlockCondition && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2">Điều kiện mở khóa</h3>
                    <p className="text-xs text-slate-400">
                      {selectedHero.unlockCondition.type === 'level' &&
                        `Đạt cấp độ ${selectedHero.unlockCondition.requirement}`}
                      {selectedHero.unlockCondition.type === 'achievement' &&
                        `Hoàn thành thành tựu: ${selectedHero.unlockCondition.requirement}`}
                      {selectedHero.unlockCondition.type === 'quest' &&
                        `Hoàn thành nhiệm vụ: ${selectedHero.unlockCondition.requirement}`}
                      {selectedHero.unlockCondition.type === 'gacha' && 'Nhận từ hệ thống gacha'}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

// Memoized HeroGrid component for better performance with large lists
interface HeroGridProps {
  heroes: Hero[];
  selectedHeroId: string | null;
  hasHero: (heroId: string) => boolean;
  onHeroSelect: (heroId: string) => void;
  getRarityColor: (rarity: HeroRarity) => string;
  getRarityBorder: (rarity: HeroRarity) => string;
}

const HeroGrid = memo(function HeroGrid({
  heroes,
  selectedHeroId,
  hasHero,
  onHeroSelect,
  getRarityColor,
  getRarityBorder,
}: HeroGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {heroes.map((hero) => (
        <HeroCard
          key={hero.id}
          hero={hero}
          isSelected={selectedHeroId === hero.id}
          isUnlocked={hasHero(hero.id)}
          onSelect={onHeroSelect}
          getRarityColor={getRarityColor}
          getRarityBorder={getRarityBorder}
        />
      ))}
    </div>
  );
});

// Memoized HeroCard component to prevent unnecessary re-renders
interface HeroCardProps {
  hero: Hero;
  isSelected: boolean;
  isUnlocked: boolean;
  onSelect: (heroId: string) => void;
  getRarityColor: (rarity: HeroRarity) => string;
  getRarityBorder: (rarity: HeroRarity) => string;
}

const HeroCard = memo(function HeroCard({
  hero,
  isSelected,
  isUnlocked,
  onSelect,
  getRarityColor,
  getRarityBorder,
}: HeroCardProps) {
  const handleClick = useCallback(() => {
    onSelect(hero.id);
  }, [hero.id, onSelect]);

  return (
    <motion.button
      onClick={handleClick}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? `${getRarityBorder(hero.rarity)} ring-4 ring-yellow-400/50`
          : getRarityBorder(hero.rarity)
      } ${isUnlocked ? 'opacity-100' : 'opacity-40'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Rarity gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(hero.rarity)} opacity-20`} />

      {/* Hero portrait placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
        <div className="text-4xl">
          {hero.faction === HeroFaction.VIETNAMESE ? '🛡️' : '⚔️'}
        </div>
      </div>

      {/* Lock overlay for locked heroes */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-4xl">🔒</div>
        </div>
      )}

      {/* Hero name */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
        <div className="text-xs font-semibold text-white text-center truncate">
          {hero.nameVietnamese}
        </div>
      </div>

      {/* Rarity indicator */}
      <div className="absolute top-1 right-1">
        <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getRarityColor(hero.rarity)}`} />
      </div>
    </motion.button>
  );
});
