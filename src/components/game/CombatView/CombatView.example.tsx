/**
 * CombatView Component Usage Example
 * Demonstrates how to integrate CombatView with game state
 */

'use client';

import React, { useState } from 'react';
import { CombatView } from './CombatView';
import { Unit, UnitType, Direction, UnitOwner, StatusEffectType } from '@/types/unit';
import { Hero, HeroFaction, HeroRarity } from '@/types/hero';
import { CombatEvent, CombatEventType } from '@/types/combat';

/**
 * Example usage of CombatView component
 * This demonstrates how to connect the component to your game state
 */
export const CombatViewExample: React.FC = () => {
  // Example units
  const [units] = useState<Unit[]>([
    {
      id: 'player-unit-1',
      type: UnitType.INFANTRY,
      faction: 'vietnamese',
      position: { x: 10, y: 10 },
      health: 80,
      maxHealth: 100,
      attack: 50,
      defense: 30,
      speed: 20,
      direction: Direction.NORTH,
      status: [],
      owner: UnitOwner.PLAYER,
    },
    {
      id: 'player-unit-2',
      type: UnitType.ARCHER,
      faction: 'vietnamese',
      position: { x: 12, y: 10 },
      health: 60,
      maxHealth: 80,
      attack: 40,
      defense: 20,
      speed: 25,
      direction: Direction.NORTH,
      status: [
        {
          type: StatusEffectType.BUFF,
          duration: 10,
          stat: 'attack',
          value: 0.2,
          source: 'hero-ability',
        },
      ],
      owner: UnitOwner.PLAYER,
    },
    {
      id: 'ai-unit-1',
      type: UnitType.CAVALRY,
      faction: 'mongol',
      position: { x: 20, y: 20 },
      health: 90,
      maxHealth: 120,
      attack: 60,
      defense: 25,
      speed: 35,
      direction: Direction.SOUTH,
      status: [],
      owner: UnitOwner.AI,
    },
    {
      id: 'ai-unit-2',
      type: UnitType.INFANTRY,
      faction: 'mongol',
      position: { x: 22, y: 20 },
      health: 40,
      maxHealth: 100,
      attack: 50,
      defense: 30,
      speed: 20,
      direction: Direction.SOUTH,
      status: [
        {
          type: StatusEffectType.POISON,
          duration: 5,
          value: 10,
          source: 'ability-poison',
        },
      ],
      owner: UnitOwner.AI,
    },
  ]);

  // Example hero
  const [selectedHero] = useState<Hero>({
    id: 'hero-tran-hung-dao',
    name: 'Tran Hung Dao',
    nameVietnamese: 'Trần Hưng Đạo',
    faction: HeroFaction.VIETNAMESE,
    rarity: HeroRarity.LEGENDARY,
    stats: {
      attack: 90,
      defense: 80,
      speed: 70,
      leadership: 95,
      intelligence: 85,
    },
    abilities: [
      {
        id: 'ability-thunder-strike',
        name: 'Thunder Strike',
        nameVietnamese: 'Sấm Sét',
        description: 'Deals massive area damage to enemies',
        descriptionVietnamese: 'Gây sát thương diện rộng cho kẻ địch',
        cooldown: 10,
        cost: 50,
        effect: {
          type: 'damage',
          value: 100,
          radius: 5,
        },
      },
      {
        id: 'ability-rally',
        name: 'Rally',
        nameVietnamese: 'Tập Hợp',
        description: 'Boosts attack of nearby allies',
        descriptionVietnamese: 'Tăng sức tấn công cho đồng minh gần đó',
        cooldown: 15,
        cost: 30,
        effect: {
          type: 'buff',
          stat: 'attack',
          value: 20,
          duration: 10,
        },
      },
    ],
    portrait: '/heroes/tran-hung-dao.png',
    description: 'Legendary Vietnamese general who defeated three Mongol invasions',
    descriptionVietnamese: 'Danh tướng Việt Nam đánh bại ba lần xâm lược của quân Mông Cổ',
    historicalContext: 'Led Vietnamese forces to victory in the Mongol invasions of 1258, 1285, and 1288',
    historicalContextVietnamese: 'Lãnh đạo quân đội Việt Nam giành chiến thắng trong các cuộc xâm lược của Mông Cổ năm 1258, 1285 và 1288',
  });

  // Example combat log
  const [combatLog] = useState<CombatEvent[]>([
    {
      type: CombatEventType.UNIT_SPAWNED,
      timestamp: Date.now() - 30000,
      data: { unitType: 'infantry' },
    },
    {
      type: CombatEventType.ATTACK,
      timestamp: Date.now() - 20000,
      sourceId: 'player-unit-1',
      targetId: 'ai-unit-1',
    },
    {
      type: CombatEventType.DAMAGE,
      timestamp: Date.now() - 19500,
      sourceId: 'player-unit-1',
      targetId: 'ai-unit-1',
      value: 25,
    },
    {
      type: CombatEventType.ABILITY_USED,
      timestamp: Date.now() - 15000,
      sourceId: 'hero-tran-hung-dao',
      data: { abilityName: 'Thunder Strike' },
    },
    {
      type: CombatEventType.DAMAGE,
      timestamp: Date.now() - 14500,
      targetId: 'ai-unit-2',
      value: 100,
    },
    {
      type: CombatEventType.STATUS_APPLIED,
      timestamp: Date.now() - 10000,
      sourceId: 'player-unit-2',
      targetId: 'ai-unit-2',
      data: { statusType: 'poison' },
    },
  ]);

  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  // Handler functions
  const handleUnitSelect = (unit: Unit | null) => {
    setSelectedUnit(unit);
    console.log('Unit selected:', unit?.id);
  };

  const handleAttack = (unitId: string, targetId: string) => {
    console.log(`Unit ${unitId} attacks ${targetId}`);
    // In a real implementation, this would:
    // 1. Call the combat engine to process the attack
    // 2. Update unit health in the state
    // 3. Add combat events to the log
    // 4. Trigger animations
  };

  const handleMove = (unitId: string, x: number, y: number) => {
    console.log(`Unit ${unitId} moves to (${x}, ${y})`);
    // In a real implementation, this would:
    // 1. Validate the move is legal
    // 2. Update unit position in the state
    // 3. Trigger movement animation
  };

  const handleDefend = (unitId: string) => {
    console.log(`Unit ${unitId} enters defensive stance`);
    // In a real implementation, this would:
    // 1. Apply defense buff to the unit
    // 2. Update unit status in the state
    // 3. Add combat event to the log
  };

  const handleAbilityActivate = (abilityId: string, targetX: number, targetY: number) => {
    console.log(`Ability ${abilityId} activated at (${targetX}, ${targetY})`);
    // In a real implementation, this would:
    // 1. Validate ability can be cast (cooldown, resources)
    // 2. Call resolveAbility from combat engine
    // 3. Apply ability effects to affected units
    // 4. Update state with new unit health/status
    // 5. Add combat events to the log
    // 6. Trigger ability animation
  };

  return (
    <div className="h-screen">
      <CombatView
        units={units}
        combatLog={combatLog}
        selectedUnit={selectedUnit}
        selectedHero={selectedHero}
        onUnitSelect={handleUnitSelect}
        onAttack={handleAttack}
        onMove={handleMove}
        onDefend={handleDefend}
        onAbilityActivate={handleAbilityActivate}
        maxLogEntries={50}
        showDetailedStats={true}
      />
    </div>
  );
};

/**
 * Integration with Zustand Store
 * 
 * In a real application, you would connect CombatView to your Zustand store:
 * 
 * ```typescript
 * import { useStore } from '@/store';
 * 
 * export const CombatViewContainer: React.FC = () => {
 *   // Get state from store
 *   const units = useStore((state) => state.combat.units);
 *   const combatLog = useStore((state) => state.combat.combatLog);
 *   const selectedHero = useStore((state) => state.hero.selectedHero);
 *   
 *   // Get actions from store
 *   const updateUnit = useStore((state) => state.updateUnit);
 *   const logCombatEvent = useStore((state) => state.logCombatEvent);
 *   
 *   // Local state for UI
 *   const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
 *   
 *   const handleAttack = (unitId: string, targetId: string) => {
 *     const attacker = units.find(u => u.id === unitId);
 *     const defender = units.find(u => u.id === targetId);
 *     
 *     if (!attacker || !defender) return;
 *     
 *     // Process attack using combat engine
 *     const result = processAttack(attacker, defender);
 *     
 *     // Update defender health
 *     updateUnit(targetId, { health: defender.health - result.damage });
 *     
 *     // Log combat events
 *     result.events.forEach(event => logCombatEvent(event));
 *     
 *     // Check for death
 *     if (result.isKill) {
 *       removeUnit(targetId);
 *     }
 *   };
 *   
 *   return (
 *     <CombatView
 *       units={units}
 *       combatLog={combatLog}
 *       selectedUnit={selectedUnit}
 *       selectedHero={selectedHero}
 *       onUnitSelect={setSelectedUnit}
 *       onAttack={handleAttack}
 *       // ... other handlers
 *     />
 *   );
 * };
 * ```
 */

export default CombatViewExample;
