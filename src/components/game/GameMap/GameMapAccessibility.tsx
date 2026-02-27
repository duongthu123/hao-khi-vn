'use client';

/**
 * GameMapAccessibility Component
 * Provides text alternatives for visual game map information
 * Validates Requirement 22.5: Text alternatives for visual information
 */

import { Unit } from '@/types/unit';
import { Building } from '@/store/slices/combatSlice';

export interface GameMapAccessibilityProps {
  units: Unit[];
  buildings: Building[];
  selectedUnitId?: string | null;
}

/**
 * Generate text description of the game map state
 */
export function generateMapDescription(
  units: Unit[],
  buildings: Building[]
): string {
  const playerUnits = units.filter(u => u.owner === 'player');
  const enemyUnits = units.filter(u => u.owner === 'ai');
  const playerBuildings = buildings.filter(b => b.owner === 'player');
  const enemyBuildings = buildings.filter(b => b.owner === 'ai');

  const parts: string[] = [];

  // Overall summary
  parts.push(`Bản đồ chiến trường.`);

  // Player forces
  if (playerUnits.length > 0 || playerBuildings.length > 0) {
    parts.push(
      `Quân ta: ${playerUnits.length} đơn vị, ${playerBuildings.length} công trình.`
    );
  }

  // Enemy forces
  if (enemyUnits.length > 0 || enemyBuildings.length > 0) {
    parts.push(
      `Quân địch: ${enemyUnits.length} đơn vị, ${enemyBuildings.length} công trình.`
    );
  }

  return parts.join(' ');
}

/**
 * Generate text description for a specific unit
 */
export function generateUnitDescription(unit: Unit): string {
  const ownerText = unit.owner === 'player' ? 'Quân ta' : 'Quân địch';
  const typeText = getUnitTypeName(unit.type);
  const healthPercent = Math.round((unit.health / unit.maxHealth) * 100);
  const directionText = getDirectionName(unit.direction);

  const parts: string[] = [
    `${ownerText}: ${typeText}.`,
    `Máu: ${healthPercent}%.`,
    `Hướng: ${directionText}.`,
    `Tấn công: ${unit.attack}, Phòng thủ: ${unit.defense}, Tốc độ: ${unit.speed}.`,
  ];

  // Status effects
  if (unit.status && unit.status.length > 0) {
    const statusTexts = unit.status.map(s => getStatusEffectName(s.type));
    parts.push(`Trạng thái: ${statusTexts.join(', ')}.`);
  }

  return parts.join(' ');
}

/**
 * Generate text description for a building
 */
export function generateBuildingDescription(building: Building): string {
  const ownerText = building.owner === 'player' ? 'Quân ta' : 'Quân địch';
  const typeText = getBuildingTypeName(building.type);
  const healthPercent = Math.round((building.health / building.maxHealth) * 100);

  return `${ownerText}: ${typeText}. Máu: ${healthPercent}%.`;
}

/**
 * Get Vietnamese name for unit type
 */
function getUnitTypeName(type: string): string {
  const names: Record<string, string> = {
    infantry: 'Bộ binh',
    cavalry: 'Kỵ binh',
    archer: 'Cung thủ',
    siege: 'Công thành',
  };
  return names[type] || type;
}

/**
 * Get Vietnamese name for direction
 */
function getDirectionName(direction: string): string {
  const names: Record<string, string> = {
    north: 'Bắc',
    south: 'Nam',
    east: 'Đông',
    west: 'Tây',
    northeast: 'Đông Bắc',
    northwest: 'Tây Bắc',
    southeast: 'Đông Nam',
    southwest: 'Tây Nam',
  };
  return names[direction] || direction;
}

/**
 * Get Vietnamese name for status effect
 */
function getStatusEffectName(type: string): string {
  const names: Record<string, string> = {
    stun: 'Choáng',
    poison: 'Độc',
    buff: 'Tăng cường',
    debuff: 'Suy yếu',
    slow: 'Chậm',
    haste: 'Nhanh',
    shield: 'Khiên',
    regeneration: 'Hồi máu',
  };
  return names[type] || type;
}

/**
 * Get Vietnamese name for building type
 */
function getBuildingTypeName(type: string): string {
  const names: Record<string, string> = {
    fortress: 'Thành trì',
    tower: 'Tháp canh',
    barracks: 'Doanh trại',
    archery: 'Trường bắn',
    stable: 'Chuồng ngựa',
    workshop: 'Xưởng chế tạo',
  };
  return names[type] || type;
}

/**
 * GameMapAccessibility component - provides screen reader text for map
 */
export function GameMapAccessibility({
  units,
  buildings,
  selectedUnitId,
}: GameMapAccessibilityProps) {
  const mapDescription = generateMapDescription(units, buildings);
  
  const selectedUnit = selectedUnitId
    ? units.find(u => u.id === selectedUnitId)
    : null;

  return (
    <div className="sr-only" role="status" aria-live="polite">
      <p>{mapDescription}</p>
      {selectedUnit && (
        <p>Đơn vị được chọn: {generateUnitDescription(selectedUnit)}</p>
      )}
    </div>
  );
}

/**
 * Hook for announcing map changes to screen readers
 */
export function useMapAnnouncements() {
  const announce = (message: string) => {
    // Create a temporary live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 1000);
  };

  return { announce };
}

/**
 * Combat event descriptions for screen readers
 */
export const COMBAT_EVENT_DESCRIPTIONS: Record<string, (data: any) => string> = {
  attack: (data) => 
    `${getUnitTypeName(data.attackerType)} tấn công ${getUnitTypeName(data.defenderType)}, gây ${data.damage} sát thương.`,
  death: (data) => 
    `${getUnitTypeName(data.unitType)} đã tử trận.`,
  ability: (data) => 
    `${data.heroName} sử dụng kỹ năng ${data.abilityName}.`,
  heal: (data) => 
    `Hồi ${data.amount} máu.`,
  buff: (data) => 
    `Nhận hiệu ứng tăng cường ${getStatusEffectName(data.effectType)}.`,
  debuff: (data) => 
    `Nhận hiệu ứng suy yếu ${getStatusEffectName(data.effectType)}.`,
  victory: () => 
    `Chiến thắng! Quân ta đã giành được thắng lợi.`,
  defeat: () => 
    `Thất bại. Quân ta đã bị đánh bại.`,
};

/**
 * Generate combat event description
 */
export function generateCombatEventDescription(
  eventType: string,
  data: any
): string {
  const generator = COMBAT_EVENT_DESCRIPTIONS[eventType];
  return generator ? generator(data) : 'Sự kiện chiến đấu.';
}
