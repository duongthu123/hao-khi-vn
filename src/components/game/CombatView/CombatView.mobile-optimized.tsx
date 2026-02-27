'use client';

/**
 * Mobile-Optimized CombatView Component
 * Main interface for combat interactions with mobile collapsible panels
 * 
 * Validates Requirements:
 * - 2.2: Component modularization
 * - 13.5: Combat interface with unit controls and combat log
 * - 20.3: Scale UI elements appropriately for mobile
 * - 20.5: Maintain readability of Vietnamese text on small screens
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unit } from '@/types/unit';
import { Hero, Ability } from '@/types/hero';
import { CombatEvent } from '@/types/combat';
import { Button } from '@/components/ui/Button';
import { StatusEffectIndicator } from '@/components/game/StatusEffectIndicator/StatusEffectIndicator';
import { CombatAnimations } from '@/components/game/CombatAnimations';
import { cn } from '@/lib/utils';

export interface CombatViewProps {
  /** Array of all units in combat */
  units: Unit[];
  /** Combat log events */
  combatLog: CombatEvent[];
  /** Currently selected unit */
  selectedUnit: Unit | null;
  /** Selected hero with abilities */
  selectedHero: Hero | null;
  /** Callback when a unit is selected */
  onUnitSelect: (unit: Unit | null) => void;
  /** Callback when attack command is issued */
  onAttack: (unitId: string, targetId: string) => void;
  /** Callback when move command is issued */
  onMove: (unitId: string, x: number, y: number) => void;
  /** Callback when defend command is issued */
  onDefend: (unitId: string) => void;
  /** Callback when an ability is activated */
  onAbilityActivate: (abilityId: string, targetX: number, targetY: number) => void;
  /** Optional: Maximum number of log entries to display */
  maxLogEntries?: number;
  /** Optional: Show detailed unit stats */
  showDetailedStats?: boolean;
  /** Optional: Enable combat animations */
  enableAnimations?: boolean;
}

/**
 * Format combat event for display
 */
const formatCombatEvent = (event: CombatEvent): string => {
  const time = new Date(event.timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  switch (event.type) {
    case 'attack':
      return `[${time}] Đơn vị ${event.sourceId?.slice(-4)} tấn công ${event.targetId?.slice(-4)}`;
    case 'damage':
      return `[${time}] Gây ${event.value} sát thương`;
    case 'heal':
      return `[${time}] Hồi ${event.value} máu`;
    case 'death':
      return `[${time}] Đơn vị ${event.targetId?.slice(-4)} đã bị tiêu diệt`;
    case 'ability-used':
      return `[${time}] Kỹ năng ${event.data?.abilityName || 'không rõ'} được kích hoạt`;
    case 'status-applied':
      return `[${time}] Hiệu ứng ${event.data?.statusType} được áp dụng`;
    case 'unit-spawned':
      return `[${time}] Đơn vị mới xuất hiện`;
    default:
      return `[${time}] Sự kiện chiến đấu`;
  }
};

/**
 * Get color class for combat event type
 */
const getEventColor = (type: CombatEvent['type']): string => {
  switch (type) {
    case 'attack':
      return 'text-orange-400';
    case 'damage':
      return 'text-red-400';
    case 'heal':
      return 'text-green-400';
    case 'death':
      return 'text-red-600 font-bold';
    case 'ability-used':
      return 'text-purple-400';
    case 'status-applied':
      return 'text-blue-400';
    default:
      return 'text-gray-400';
  }
};

export const CombatView: React.FC<CombatViewProps> = ({
  units,
  combatLog,
  selectedUnit,
  selectedHero,
  onUnitSelect,
  onAttack,
  onMove: _onMove,
  onDefend,
  onAbilityActivate,
  maxLogEntries = 50,
  showDetailedStats = true,
  enableAnimations = true,
}) => {
  const [targetingMode, setTargetingMode] = useState<'attack' | 'ability' | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);
  const [showCombatLog, setShowCombatLog] = useState(false);
  const [showAbilities, setShowAbilities] = useState(false);

  // Filter and limit combat log
  const displayedLog = useMemo(() => {
    return combatLog.slice(-maxLogEntries).reverse();
  }, [combatLog, maxLogEntries]);

  // Get player and AI units
  const playerUnits = useMemo(() => units.filter(u => u.owner === 'player'), [units]);
  const aiUnits = useMemo(() => units.filter(u => u.owner === 'ai'), [units]);

  // Handle ability button click
  const handleAbilityClick = (ability: Ability) => {
    setSelectedAbility(ability);
    setTargetingMode('ability');
    setShowAbilities(false); // Close abilities panel on mobile
  };

  // Handle attack button click
  const handleAttackClick = () => {
    if (selectedUnit) {
      setTargetingMode('attack');
    }
  };

  // Handle target selection (for abilities or attacks)
  const handleTargetSelect = (targetUnit: Unit) => {
    if (!selectedUnit) return;

    if (targetingMode === 'attack') {
      onAttack(selectedUnit.id, targetUnit.id);
      setTargetingMode(null);
    } else if (targetingMode === 'ability' && selectedAbility) {
      onAbilityActivate(selectedAbility.id, targetUnit.position.x, targetUnit.position.y);
      setTargetingMode(null);
      setSelectedAbility(null);
    }
  };

  // Cancel targeting mode
  const cancelTargeting = () => {
    setTargetingMode(null);
    setSelectedAbility(null);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative">
      {/* Combat Animations Overlay */}
      <CombatAnimations 
        events={combatLog} 
        enabled={enableAnimations}
        scale={1}
        offset={{ x: 0, y: 0 }}
      />

      {/* Header */}
      <div className="px-3 py-2 mobile:px-4 mobile:py-3 bg-gradient-vietnamese border-b border-vietnam-600 flex items-center justify-between">
        <h2 className="text-base mobile:text-lg tablet:text-xl font-bold">Giao diện chiến đấu</h2>
        
        {/* Mobile toggle buttons */}
        <div className="flex gap-2 tablet:hidden">
          <button
            onClick={() => setShowCombatLog(!showCombatLog)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Nhật ký"
            title="Nhật ký chiến đấu"
          >
            📜
          </button>
          {selectedHero && (
            <button
              onClick={() => setShowAbilities(!showAbilities)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Kỹ năng"
              title="Kỹ năng anh hùng"
            >
              ⚡
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel - Combat Log (Desktop always visible, Mobile overlay) */}
        <div className={cn(
          'border-r border-gray-700 flex flex-col bg-gray-900',
          'tablet:w-80 tablet:relative',
          'hidden tablet:flex',
          showCombatLog && 'mobile:flex mobile:absolute mobile:inset-0 mobile:z-30'
        )}>
          <div className="px-3 py-2 mobile:px-4 mobile:py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-sm mobile:text-base">Nhật ký chiến đấu</h3>
            {showCombatLog && (
              <button
                onClick={() => setShowCombatLog(false)}
                className="tablet:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Đóng"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <AnimatePresence initial={false}>
              {displayedLog.map((event, index) => (
                <motion.div
                  key={`${event.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'text-xs mobile:text-sm px-2 py-1 rounded bg-gray-800/50 leading-relaxed',
                    getEventColor(event.type)
                  )}
                >
                  {formatCombatEvent(event)}
                </motion.div>
              ))}
            </AnimatePresence>
            {displayedLog.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                Chưa có sự kiện chiến đấu
              </div>
            )}
          </div>
        </div>

        {/* Center Panel - Unit Selection and Controls */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Selected Unit Info */}
          {selectedUnit ? (
            <div className="p-3 mobile:p-4 bg-gray-800 border-b border-gray-700">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-bold text-sm mobile:text-base tablet:text-lg">
                      Đơn vị {selectedUnit.type}
                    </h3>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
                      selectedUnit.owner === 'player' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-red-600 text-white'
                    )}>
                      {selectedUnit.owner === 'player' ? 'Người chơi' : 'Đối thủ'}
                    </span>
                  </div>

                  {/* Health Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Máu</span>
                      <span className="font-medium">{selectedUnit.health} / {selectedUnit.maxHealth}</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full',
                          selectedUnit.health / selectedUnit.maxHealth > 0.5
                            ? 'bg-green-500'
                            : selectedUnit.health / selectedUnit.maxHealth > 0.25
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${(selectedUnit.health / selectedUnit.maxHealth) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  {showDetailedStats && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-700/50 rounded px-2 py-1.5">
                        <div className="text-xs text-gray-400">Tấn công</div>
                        <div className="font-bold text-sm mobile:text-base">{selectedUnit.attack}</div>
                      </div>
                      <div className="bg-gray-700/50 rounded px-2 py-1.5">
                        <div className="text-xs text-gray-400">Phòng thủ</div>
                        <div className="font-bold text-sm mobile:text-base">{selectedUnit.defense}</div>
                      </div>
                      <div className="bg-gray-700/50 rounded px-2 py-1.5">
                        <div className="text-xs text-gray-400">Tốc độ</div>
                        <div className="font-bold text-sm mobile:text-base">{selectedUnit.speed}</div>
                      </div>
                    </div>
                  )}

                  {/* Status Effects */}
                  {selectedUnit.status.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Hiệu ứng trạng thái</div>
                      <StatusEffectIndicator 
                        effects={selectedUnit.status} 
                        size="md"
                        showDuration={true}
                      />
                    </div>
                  )}

                  {/* Unit Controls */}
                  {selectedUnit.owner === 'player' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAttackClick}
                        disabled={targetingMode !== null}
                        className="flex-1 text-sm"
                      >
                        ⚔️ Tấn công
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onDefend(selectedUnit.id)}
                        disabled={targetingMode !== null}
                        className="flex-1 text-sm"
                      >
                        🛡️ Phòng thủ
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnitSelect(null)}
                  className="text-gray-400 hover:text-white flex-shrink-0"
                >
                  ✕
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 mobile:p-4 bg-gray-800 border-b border-gray-700 text-center text-gray-500 text-sm mobile:text-base">
              Chọn một đơn vị để xem thông tin
            </div>
          )}

          {/* Targeting Mode Indicator */}
          {targetingMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-2 mobile:px-4 mobile:py-2 bg-yellow-600 text-white text-xs mobile:text-sm font-semibold flex justify-between items-center gap-2"
            >
              <span className="flex-1 min-w-0 truncate leading-relaxed">
                {targetingMode === 'attack' 
                  ? '🎯 Chọn mục tiêu để tấn công' 
                  : `🎯 Chọn vị trí cho kỹ năng: ${selectedAbility?.nameVietnamese}`}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelTargeting}
                className="text-white hover:bg-yellow-700 flex-shrink-0 text-xs"
              >
                Hủy
              </Button>
            </motion.div>
          )}

          {/* Unit Lists */}
          <div className="flex-1 overflow-y-auto p-3 mobile:p-4">
            {/* Player Units */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 text-sm mobile:text-base text-blue-400">
                Đơn vị của bạn ({playerUnits.length})
              </h4>
              <div className="grid grid-cols-1 mobile:grid-cols-2 gap-2">
                {playerUnits.map((unit) => (
                  <motion.button
                    key={unit.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => targetingMode ? handleTargetSelect(unit) : onUnitSelect(unit)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-colors min-h-[44px]',
                      selectedUnit?.id === unit.id
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-700 bg-gray-800 hover:border-blue-400'
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{unit.type}</span>
                      <StatusEffectIndicator effects={unit.status} size="sm" showDuration={false} />
                    </div>
                    <div className="text-xs text-gray-400">
                      HP: {unit.health}/{unit.maxHealth}
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* AI Units */}
            <div>
              <h4 className="font-semibold mb-2 text-sm mobile:text-base text-red-400">
                Đơn vị đối thủ ({aiUnits.length})
              </h4>
              <div className="grid grid-cols-1 mobile:grid-cols-2 gap-2">
                {aiUnits.map((unit) => (
                  <motion.button
                    key={unit.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => targetingMode ? handleTargetSelect(unit) : onUnitSelect(unit)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-colors min-h-[44px]',
                      selectedUnit?.id === unit.id
                        ? 'border-red-500 bg-red-900/30'
                        : 'border-gray-700 bg-gray-800 hover:border-red-400'
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{unit.type}</span>
                      <StatusEffectIndicator effects={unit.status} size="sm" showDuration={false} />
                    </div>
                    <div className="text-xs text-gray-400">
                      HP: {unit.health}/{unit.maxHealth}
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Hero Abilities (Desktop always visible, Mobile overlay) */}
        {selectedHero && (
          <div className={cn(
            'border-l border-gray-700 flex flex-col bg-gray-900',
            'tablet:w-80 tablet:relative',
            'hidden tablet:flex',
            showAbilities && 'mobile:flex mobile:absolute mobile:inset-0 mobile:z-30'
          )}>
            <div className="px-3 py-2 mobile:px-4 mobile:py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mobile:text-base">Kỹ năng anh hùng</h3>
                <p className="text-xs text-gray-400 mt-1 truncate">{selectedHero.nameVietnamese}</p>
              </div>
              {showAbilities && (
                <button
                  onClick={() => setShowAbilities(false)}
                  className="tablet:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                  aria-label="Đóng"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {selectedHero.abilities.map((ability) => (
                <motion.div
                  key={ability.id}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    'p-3 rounded-lg border-2 cursor-pointer transition-colors',
                    selectedAbility?.id === ability.id
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-gray-700 bg-gray-800 hover:border-purple-400'
                  )}
                  onClick={() => handleAbilityClick(ability)}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h4 className="font-semibold text-sm flex-1 min-w-0 leading-relaxed">
                      {ability.nameVietnamese}
                    </h4>
                    <span className="text-xs bg-purple-600 px-2 py-0.5 rounded flex-shrink-0 whitespace-nowrap">
                      {ability.cost} MP
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                    {ability.descriptionVietnamese}
                  </p>
                  <div className="flex justify-between text-xs flex-wrap gap-1">
                    <span className="text-gray-500">Hồi chiêu: {ability.cooldown}s</span>
                    <span className="text-purple-400">
                      {ability.effect.type === 'damage' && '⚔️ Sát thương'}
                      {ability.effect.type === 'heal' && '💚 Hồi máu'}
                      {ability.effect.type === 'buff' && '↑ Tăng cường'}
                      {ability.effect.type === 'debuff' && '↓ Suy yếu'}
                    </span>
                  </div>
                </motion.div>
              ))}
              {selectedHero.abilities.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                  Anh hùng này không có kỹ năng
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombatView;
