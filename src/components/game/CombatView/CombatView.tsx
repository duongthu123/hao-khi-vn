'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Unit } from '@/types/unit';
import { Hero, Ability } from '@/types/hero';
import { CombatEvent } from '@/types/combat';
import { Button } from '@/components/ui/Button';
import { StatusEffectIndicator } from '@/components/game/StatusEffectIndicator/StatusEffectIndicator';
import { CombatAnimations } from '@/components/game/CombatAnimations';
import { cn } from '@/lib/utils';

export interface CombatViewProps {
  units: Unit[];
  combatLog: CombatEvent[];
  selectedUnit: Unit | null;
  selectedHero: Hero | null;
  onUnitSelect: (unit: Unit | null) => void;
  onAttack: (unitId: string, targetId: string) => void;
  onMove: (unitId: string, x: number, y: number) => void;
  onDefend: (unitId: string) => void;
  onAbilityActivate: (abilityId: string, targetX: number, targetY: number) => void;
  maxLogEntries?: number;
  showDetailedStats?: boolean;
  enableAnimations?: boolean;
}

const formatCombatEvent = (event: CombatEvent): string => {
  const time = new Date(event.timestamp).toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  switch (event.type) {
    case 'attack': return `[${time}] Đơn vị ${event.sourceId?.slice(-4)} tấn công ${event.targetId?.slice(-4)}`;
    case 'damage': return `[${time}] Gây ${event.value} sát thương`;
    case 'heal': return `[${time}] Hồi ${event.value} máu`;
    case 'death': return `[${time}] Đơn vị ${event.targetId?.slice(-4)} đã bị tiêu diệt`;
    case 'ability-used': return `[${time}] Kỹ năng ${event.data?.abilityName || 'không rõ'} được kích hoạt`;
    case 'status-applied': return `[${time}] Hiệu ứng ${event.data?.statusType} được áp dụng`;
    case 'unit-spawned': return `[${time}] Đơn vị mới xuất hiện`;
    default: return `[${time}] Sự kiện chiến đấu`;
  }
};

const getEventColor = (type: CombatEvent['type']): string => {
  switch (type) {
    case 'attack': return 'text-orange-400';
    case 'damage': return 'text-red-400';
    case 'heal': return 'text-green-400';
    case 'death': return 'text-red-600 font-bold';
    case 'ability-used': return 'text-purple-400';
    case 'status-applied': return 'text-blue-400';
    default: return 'text-gray-400';
  }
};

export const CombatView = memo(function CombatView({
  units, combatLog, selectedUnit, selectedHero,
  onUnitSelect, onAttack, onMove: _onMove, onDefend, onAbilityActivate,
  maxLogEntries = 50, showDetailedStats = true, enableAnimations = true,
}: CombatViewProps) {
  const [targetingMode, setTargetingMode] = useState<'attack' | 'ability' | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<Ability | null>(null);

  const displayedLog = useMemo(() => combatLog.slice(-maxLogEntries).reverse(), [combatLog, maxLogEntries]);
  const playerUnits = useMemo(() => units.filter(u => u.owner === 'player'), [units]);
  const aiUnits = useMemo(() => units.filter(u => u.owner === 'ai'), [units]);

  const handleAbilityClick = useCallback((ability: Ability) => {
    setSelectedAbility(ability);
    setTargetingMode('ability');
  }, []);

  const handleAttackClick = useCallback(() => {
    if (selectedUnit) setTargetingMode('attack');
  }, [selectedUnit]);

  const handleTargetSelect = useCallback((targetUnit: Unit) => {
    if (!selectedUnit) return;
    if (targetingMode === 'attack') {
      onAttack(selectedUnit.id, targetUnit.id);
      setTargetingMode(null);
    } else if (targetingMode === 'ability' && selectedAbility) {
      onAbilityActivate(selectedAbility.id, targetUnit.position.x, targetUnit.position.y);
      setTargetingMode(null);
      setSelectedAbility(null);
    }
  }, [selectedUnit, targetingMode, selectedAbility, onAttack, onAbilityActivate]);

  const cancelTargeting = useCallback(() => { setTargetingMode(null); setSelectedAbility(null); }, []);
  const handleDefend = useCallback(() => { if (selectedUnit) onDefend(selectedUnit.id); }, [selectedUnit, onDefend]);

  return (
    <div className="flex flex-col h-full bg-cover bg-center bg-no-repeat text-white relative" style={{ backgroundColor: '#111' }}>
      <CombatAnimations events={combatLog} enabled={enableAnimations} scale={1} offset={{ x: 0, y: 0 }} />

      {/* Top HUD - Player HP */}
      <div className="absolute top-5 left-5 flex gap-2.5 z-10">
        <div className="w-[70px] h-[70px] rounded-full border-[3px] border-[#f1c40f] overflow-hidden bg-black">
          <div className="w-full h-full flex items-center justify-center text-2xl">⚔️</div>
        </div>
        <div>
          <div className="w-[200px] h-5 bg-[#27ae60] border border-white" />
          <div className="text-white text-sm">HP: 1000/1000</div>
        </div>
      </div>

      {/* Retreat button */}
      <button
        onClick={() => onUnitSelect(null)}
        className="fixed top-2.5 left-1/2 -translate-x-1/2 z-[999] bg-[#c0392b] text-white border-none py-2.5 px-5 font-bold rounded-[5px]"
        style={{ fontFamily: "'Oswald', sans-serif" }}
      >
        RÚT LUI
      </button>

      {/* Combat center - Direction indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] flex justify-center items-center pointer-events-none">
        <div className="relative w-[200px] h-[200px] opacity-70">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[80px] bg-white/10 border-[3px] border-white/30 rounded-[10px_10px_30px_30px]" />
          <div className="absolute top-[80px] left-0 w-[80px] h-[60px] bg-white/10 border-[3px] border-white/30 rounded-[30px_10px_10px_30px]" />
          <div className="absolute top-[80px] right-0 w-[80px] h-[60px] bg-white/10 border-[3px] border-white/30 rounded-[10px_30px_30px_10px]" />
        </div>
      </div>

      {/* Bottom right - Skill bar */}
      <div className="absolute bottom-[30px] right-[30px] flex flex-col items-end gap-2.5">
        <div className="bg-black/70 py-1 px-2.5 border border-[#f1c40f] rounded-[5px] font-bold text-[#f1c40f]">
          ⚔️ Độ bền: 100/100
        </div>
        <div className="flex gap-2.5">
          {['Q', 'W', 'E'].map(key => (
            <div key={key} className="skill-slot">{key}</div>
          ))}
          <div className="skill-slot skill-slot-ult">R</div>
        </div>
      </div>

      {/* Floating text container */}
      <div id="floating-text-container" className="absolute inset-0 pointer-events-none z-[250]" />

      {/* Combat Log Panel */}
      <div className="absolute top-[100px] left-0 w-72 h-[calc(100%-200px)] bg-black/70 border-r border-[#555] flex flex-col z-10">
        <div className="px-4 py-2 bg-[#3e2723] border-b border-[#8d6e63]">
          <h3 className="font-bold text-sm text-[#f1c40f]" style={{ fontFamily: "'Oswald', sans-serif" }}>Nhật ký chiến đấu</h3>
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
                className={cn('text-xs px-2 py-1 rounded bg-black/50', getEventColor(event.type))}
              >
                {formatCombatEvent(event)}
              </motion.div>
            ))}
          </AnimatePresence>
          {displayedLog.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">Chưa có sự kiện chiến đấu</div>
          )}
        </div>
      </div>

      {/* Selected Unit Info */}
      {selectedUnit && (
        <div className="absolute bottom-[100px] left-1/2 -translate-x-1/2 bg-black/80 border-2 border-[#f1c40f] rounded-[10px] p-4 min-w-[300px] z-20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg text-[#f1c40f]" style={{ fontFamily: "'Oswald', sans-serif" }}>
              Đơn vị {selectedUnit.type}
            </h3>
            <span className={cn(
              'px-2 py-0.5 rounded text-xs font-bold',
              selectedUnit.owner === 'player' ? 'bg-blue-600' : 'bg-red-600'
            )}>
              {selectedUnit.owner === 'player' ? 'Người chơi' : 'Đối thủ'}
            </span>
          </div>

          {/* HP Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span>Máu</span>
              <span>{selectedUnit.health}/{selectedUnit.maxHealth}</span>
            </div>
            <div className="h-2.5 bg-[#555] border border-white rounded-sm overflow-hidden">
              <motion.div
                className={cn(
                  'h-full',
                  selectedUnit.health / selectedUnit.maxHealth > 0.5 ? 'bg-[#27ae60]'
                    : selectedUnit.health / selectedUnit.maxHealth > 0.25 ? 'bg-[#f1c40f]' : 'bg-[#e74c3c]'
                )}
                animate={{ width: `${(selectedUnit.health / selectedUnit.maxHealth) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {showDetailedStats && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Tấn công', value: selectedUnit.attack },
                { label: 'Phòng thủ', value: selectedUnit.defense },
                { label: 'Tốc độ', value: selectedUnit.speed },
              ].map(stat => (
                <div key={stat.label} className="bg-black/50 rounded px-2 py-1 text-center">
                  <div className="text-xs text-gray-400">{stat.label}</div>
                  <div className="font-bold text-[#f1c40f]">{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {selectedUnit.status.length > 0 && (
            <StatusEffectIndicator effects={selectedUnit.status} size="md" showDuration={true} />
          )}

          {selectedUnit.owner === 'player' && (
            <div className="flex gap-2 mt-3">
              <Button variant="primary" size="sm" onClick={handleAttackClick} disabled={targetingMode !== null}>
                ⚔️ Tấn công
              </Button>
              <Button variant="secondary" size="sm" onClick={handleDefend} disabled={targetingMode !== null}>
                🛡️ Phòng thủ
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Targeting Mode */}
      {targetingMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 w-full h-10 bg-gradient-to-r from-[#c0392b] to-[#8e44ad] text-white text-sm font-bold flex justify-center items-center z-[950]"
        >
          {targetingMode === 'attack' ? '🎯 Chọn mục tiêu để tấn công' : `🎯 Chọn vị trí cho kỹ năng: ${selectedAbility?.nameVietnamese}`}
          <button onClick={cancelTargeting} className="ml-4 bg-white/20 px-3 py-1 rounded">Hủy</button>
        </motion.div>
      )}

      {/* Hero Abilities Panel */}
      {selectedHero && (
        <div className="absolute top-[100px] right-0 w-72 bg-black/70 border-l border-[#555] flex flex-col z-10 h-[calc(100%-200px)]">
          <div className="px-4 py-2 bg-[#3e2723] border-b border-[#8d6e63]">
            <h3 className="font-bold text-sm text-[#f1c40f]" style={{ fontFamily: "'Oswald', sans-serif" }}>Kỹ năng anh hùng</h3>
            <p className="text-xs text-gray-400 mt-1">{selectedHero.nameVietnamese}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {selectedHero.abilities.map((ability) => (
              <div
                key={ability.id}
                onClick={() => handleAbilityClick(ability)}
                className={cn(
                  'p-3 rounded-[5px] border-2 cursor-pointer transition-all',
                  selectedAbility?.id === ability.id
                    ? 'border-purple-500 bg-purple-900/30'
                    : 'border-[#555] bg-[#34495e] hover:border-[#f1c40f]'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm">{ability.nameVietnamese}</h4>
                  <span className="text-xs bg-purple-600 px-2 py-0.5 rounded">{ability.cost} MP</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{ability.descriptionVietnamese}</p>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Hồi chiêu: {ability.cooldown}s</span>
                  <span className="text-[#f1c40f]">
                    {ability.effect.type === 'damage' && '⚔️ Sát thương'}
                    {ability.effect.type === 'heal' && '💚 Hồi máu'}
                    {ability.effect.type === 'buff' && '↑ Tăng cường'}
                    {ability.effect.type === 'debuff' && '↓ Suy yếu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default CombatView;
