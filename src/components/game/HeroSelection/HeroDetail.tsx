'use client';

import { useState, useMemo, useCallback, memo } from 'react';
import { Hero, HeroFaction } from '@/types/hero';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { RadarChart } from '@/components/ui/RadarChart';
import { cn } from '@/lib/utils';

export interface HeroDetailProps {
  hero: Hero;
  comparisonHeroes?: Hero[];
  onCompare?: (hero: Hero) => void;
  onRemoveComparison?: (heroId: string) => void;
  className?: string;
}

export const HeroDetail = memo(function HeroDetail({
  hero,
  comparisonHeroes = [],
  onCompare: _onCompare,
  onRemoveComparison,
  className,
}: HeroDetailProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'abilities' | 'history'>('stats');
  const isComparing = comparisonHeroes.length > 0;

  // Prepare stats for radar chart - memoized
  const allStats = useMemo(() => 
    [hero, ...comparisonHeroes].map(h => h.stats),
    [hero, comparisonHeroes]
  );
  
  const chartColors = useMemo(() => [
    '#0087FF', // River blue for primary hero
    '#DA251D', // Vietnam red
    '#FFB800', // Imperial gold
    '#41B373', // Bamboo green
    '#A855F7', // Epic purple
  ], []);

  const handleTabStats = useCallback(() => setActiveTab('stats'), []);
  const handleTabAbilities = useCallback(() => setActiveTab('abilities'), []);
  const handleTabHistory = useCallback(() => setActiveTab('history'), []);

  return (
    <div className={cn('w-full', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {hero.nameVietnamese}
                </h2>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    hero.faction === HeroFaction.VIETNAMESE
                      ? 'bg-faction-vietnamese/10 text-faction-vietnamese'
                      : 'bg-faction-mongol/10 text-faction-mongol'
                  )}
                >
                  {hero.faction === HeroFaction.VIETNAMESE ? 'Đại Việt' : 'Mông Cổ'}
                </span>
                <RarityBadge rarity={hero.rarity} />
              </div>
              <p className="text-sm text-gray-600">
                {hero.descriptionVietnamese}
              </p>
            </div>

            {/* Hero Portrait */}
            <div 
              className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-300 to-gray-400 flex-shrink-0"
              role="img"
              aria-label={`Chân dung ${hero.nameVietnamese}, ${hero.faction === HeroFaction.VIETNAMESE ? 'tướng Đại Việt' : 'tướng Mông Cổ'}, độ hiếm ${hero.rarity}`}
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white opacity-50" aria-hidden="true">
                  {hero.nameVietnamese.charAt(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 border-b border-gray-200">
            <TabButton
              active={activeTab === 'stats'}
              onClick={handleTabStats}
            >
              Chỉ số
            </TabButton>
            <TabButton
              active={activeTab === 'abilities'}
              onClick={handleTabAbilities}
            >
              Kỹ năng
            </TabButton>
            <TabButton
              active={activeTab === 'history'}
              onClick={handleTabHistory}
            >
              Lịch sử
            </TabButton>
          </div>
        </CardHeader>

        <CardBody>
          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Radar Chart */}
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <RadarChart
                    stats={allStats}
                    colors={chartColors.slice(0, allStats.length)}
                    animated={true}
                  />
                </div>
              </div>

              {/* Stats Table */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết chỉ số
                </h3>
                <div className="grid gap-2">
                  <StatRow
                    label="Tấn công"
                    value={hero.stats.attack}
                    color="text-red-600"
                    bgColor="bg-red-100"
                  />
                  <StatRow
                    label="Phòng thủ"
                    value={hero.stats.defense}
                    color="text-blue-600"
                    bgColor="bg-blue-100"
                  />
                  <StatRow
                    label="Tốc độ"
                    value={hero.stats.speed}
                    color="text-green-600"
                    bgColor="bg-green-100"
                  />
                  <StatRow
                    label="Lãnh đạo"
                    value={hero.stats.leadership}
                    color="text-yellow-600"
                    bgColor="bg-yellow-100"
                  />
                  <StatRow
                    label="Trí tuệ"
                    value={hero.stats.intelligence}
                    color="text-purple-600"
                    bgColor="bg-purple-100"
                  />
                </div>
              </div>

              {/* Comparison Section */}
              {isComparing && (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    So sánh với
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {comparisonHeroes.map((compHero, index) => (
                      <div
                        key={compHero.id}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: chartColors[index + 1] }}
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {compHero.nameVietnamese}
                        </span>
                        {onRemoveComparison && (
                          <button
                            onClick={() => onRemoveComparison(compHero.id)}
                            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Abilities Tab */}
          {activeTab === 'abilities' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Kỹ năng đặc biệt
              </h3>
              {hero.abilities.length > 0 ? (
                <div className="space-y-3">
                  {hero.abilities.map((ability) => (
                    <AbilityCard key={ability.id} ability={ability} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Tướng này chưa có kỹ năng đặc biệt
                </p>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Bối cảnh lịch sử
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {hero.historicalContextVietnamese}
                </p>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
});

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton = memo(function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors relative',
        active
          ? 'text-vietnam-500'
          : 'text-gray-600 hover:text-gray-900'
      )}
    >
      {children}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vietnam-500" />
      )}
    </button>
  );
});

interface RarityBadgeProps {
  rarity: Hero['rarity'];
}

const RarityBadge = memo(function RarityBadge({ rarity }: RarityBadgeProps) {
  const rarityConfig = {
    common: {
      label: 'Thường',
      color: 'text-rarity-common',
      bgColor: 'bg-rarity-common/10',
      stars: 1,
    },
    rare: {
      label: 'Hiếm',
      color: 'text-rarity-rare',
      bgColor: 'bg-rarity-rare/10',
      stars: 2,
    },
    epic: {
      label: 'Sử thi',
      color: 'text-rarity-epic',
      bgColor: 'bg-rarity-epic/10',
      stars: 3,
    },
    legendary: {
      label: 'Huyền thoại',
      color: 'text-rarity-legendary',
      bgColor: 'bg-rarity-legendary/10',
      stars: 4,
    },
  };

  const config = rarityConfig[rarity];

  return (
    <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full', config.bgColor)}>
      <div className="flex gap-0.5">
        {Array.from({ length: config.stars }).map((_, i) => (
          <svg
            key={i}
            className={cn('w-3 h-3', config.color)}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className={cn('text-xs font-medium', config.color)}>
        {config.label}
      </span>
    </div>
  );
});

interface StatRowProps {
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

const StatRow = memo(function StatRow({ label, value, color, bgColor }: StatRowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 w-24">
        {label}
      </span>
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-500', bgColor)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn('text-sm font-bold w-12 text-right', color)}>
        {value}
      </span>
    </div>
  );
});

interface AbilityCardProps {
  ability: Hero['abilities'][0];
}

const AbilityCard = memo(function AbilityCard({ ability }: AbilityCardProps) {
  const getEffectDescription = () => {
    const { effect } = ability;
    
    switch (effect.type) {
      case 'damage':
        return `Gây ${effect.value} sát thương trong bán kính ${effect.radius}`;
      case 'heal':
        return `Hồi ${effect.value} máu trong bán kính ${effect.radius}`;
      case 'buff':
        return `Tăng ${getStatName(effect.stat)} ${effect.value} trong ${effect.duration}s`;
      case 'debuff':
        return `Giảm ${getStatName(effect.stat)} ${effect.value} trong ${effect.duration}s`;
      default:
        return '';
    }
  };

  const getStatName = (stat: string) => {
    const statNames: Record<string, string> = {
      attack: 'tấn công',
      defense: 'phòng thủ',
      speed: 'tốc độ',
      leadership: 'lãnh đạo',
      intelligence: 'trí tuệ',
    };
    return statNames[stat] || stat;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">
            {ability.nameVietnamese}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            {ability.name}
          </p>
        </div>
        <div className="flex gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{ability.cooldown}s</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <span>{ability.cost}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-2">
        {ability.descriptionVietnamese}
      </p>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-1 bg-vietnam-100 text-vietnam-700 rounded font-medium">
          {getEffectDescription()}
        </span>
      </div>
    </div>
  );
});
