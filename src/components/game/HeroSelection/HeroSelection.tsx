'use client';

import { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { Hero, HeroFaction } from '@/types/hero';
import { useGameStore } from '@/store';
import { ALL_HEROES } from '@/constants/heroes';
import { cn } from '@/lib/utils';

export interface HeroSelectionProps {
  onConfirm?: () => void;
  className?: string;
}

export const HeroSelection = memo(function HeroSelection({ onConfirm, className }: HeroSelectionProps) {
  const { hero, selectHero, isHeroUnlocked, loadHeroes, unlockHero } = useGameStore();
  const [selectedFaction, setSelectedFaction] = useState<HeroFaction | 'all'>('all');

  const availableHeroes = hero.availableHeroes ?? [];

  // Load heroes into store and unlock all on mount
  useEffect(() => {
    if (availableHeroes.length === 0) {
      loadHeroes(ALL_HEROES);
      ALL_HEROES.forEach((h) => unlockHero(h.id));
    }
  }, [availableHeroes.length, loadHeroes, unlockHero]);

  const filteredHeroes = useMemo(() => {
    if (selectedFaction === 'all') return availableHeroes;
    return availableHeroes.filter((h: Hero) => h.faction === selectedFaction);
  }, [availableHeroes, selectedFaction]);

  const handleHeroClick = useCallback((heroToSelect: Hero) => {
    if (isHeroUnlocked(heroToSelect.id)) selectHero(heroToSelect);
  }, [isHeroUnlocked, selectHero]);

  const handleConfirm = useCallback(() => {
    if (hero.selectedHero && onConfirm) onConfirm();
  }, [hero.selectedHero, onConfirm]);

  return (
    <div className={cn('game-screen bg-black text-white', className)}>
      <h1 className="text-[#f1c40f] text-[3em] mb-10" style={{ textShadow: '2px 2px 0 #000', fontFamily: "'Oswald', sans-serif" }}>
        CHỌN PHE THAM CHIẾN
      </h1>

      {/* Faction Filter */}
      <div className="flex gap-3 mb-8 flex-wrap justify-center">
        {(['all', HeroFaction.VIETNAMESE, HeroFaction.MONGOL] as const).map((faction) => (
          <button
            key={faction}
            onClick={() => setSelectedFaction(faction)}
            className={cn(
              'px-5 py-2 rounded font-bold uppercase transition-all',
              selectedFaction === faction
                ? 'bg-[#c0392b] text-white border-2 border-[#f1c40f]'
                : 'bg-[#333] text-[#ccc] border-2 border-[#555] hover:border-[#f1c40f]'
            )}
            style={{ fontFamily: "'Oswald', sans-serif" }}
          >
            {faction === 'all' ? 'Tất cả' : faction === HeroFaction.VIETNAMESE ? 'Đại Việt' : 'Nguyên Mông'}
          </button>
        ))}
      </div>

      {/* Hero Grid */}
      <div className="flex gap-10 flex-wrap justify-center">
        {filteredHeroes.map((heroItem: Hero) => {
          const unlocked = isHeroUnlocked(heroItem.id);
          const isSelected = hero.selectedHero?.id === heroItem.id;

          return (
            <HeroCard
              key={heroItem.id}
              hero={heroItem}
              unlocked={unlocked}
              selected={isSelected}
              onClick={() => handleHeroClick(heroItem)}
            />
          );
        })}
      </div>

      {/* Selected Hero Info */}
      {hero.selectedHero && (
        <div className="mt-8 bg-[rgba(30,30,30,0.95)] border-2 border-[#f1c40f] rounded-[10px] p-8 flex gap-8 max-w-[800px] w-[70%]">
          <div className="flex-1 text-left">
            <h2 className="text-[#f1c40f] text-[2.5em] border-b border-[#555] mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
              {hero.selectedHero.nameVietnamese}
            </h2>
            <p className="text-[#ccc] text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              {hero.selectedHero.descriptionVietnamese}
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => {}}
                className="bg-[#555] text-white border-none py-3 px-6 rounded-[5px] font-bold"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                Quay Lại
              </button>
              <button
                onClick={handleConfirm}
                className="bg-[#27ae60] text-white border-none py-3 px-6 rounded-[5px] font-bold flex-1"
                style={{ fontFamily: "'Oswald', sans-serif" }}
              >
                XUẤT BINH
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

interface HeroCardProps {
  hero: Hero;
  unlocked: boolean;
  selected: boolean;
  onClick: () => void;
}

const HeroCard = memo(function HeroCard({ hero, unlocked, selected, onClick }: HeroCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!unlocked}
      className={cn(
        'bg-[#333] border-2 rounded-[10px] p-4 w-[220px] text-center cursor-pointer transition-all',
        'shadow-[0_5px_15px_black] hover:translate-y-[-10px]',
        unlocked ? '' : 'cursor-not-allowed opacity-60 grayscale',
        selected
          ? 'border-[#f1c40f] shadow-[0_0_20px_#f1c40f]'
          : 'border-[#555] hover:border-[#f1c40f] hover:shadow-[0_0_20px_#f1c40f]'
      )}
    >
      {/* Hero Portrait */}
      <div className="w-full h-[250px] rounded-[5px] overflow-hidden bg-black mb-2">
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
          <span className="text-5xl font-bold text-white/50">
            {hero.nameVietnamese.charAt(0)}
          </span>
        </div>
        {!unlocked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
        )}
      </div>

      <h2 className="text-white text-lg font-bold" style={{ fontFamily: "'Oswald', sans-serif" }}>
        {hero.faction === HeroFaction.VIETNAMESE ? 'Đại Việt' : 'Nguyên Mông'}
      </h2>

      <div className="text-[#ccc] text-sm border-t border-[#555] pt-2 mt-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        <p><strong>Tướng:</strong> {hero.nameVietnamese}</p>
        <p className="text-[#f1c40f] italic mt-1">
          🔥 <strong>Tuyệt Chiêu:</strong> {hero.abilities?.[0]?.nameVietnamese || 'Đặc biệt'}
        </p>
      </div>

      <div className={cn(
        'mt-4 py-2.5 rounded-[5px] font-bold',
        hero.faction === HeroFaction.VIETNAMESE ? 'bg-[#c0392b]' : 'bg-[#555]'
      )}>
        Chọn Phe Này
      </div>
    </button>
  );
});

function getRarityStars(rarity: Hero['rarity']): number {
  switch (rarity) {
    case 'common': return 1;
    case 'rare': return 2;
    case 'epic': return 3;
    case 'legendary': return 4;
    default: return 1;
  }
}
