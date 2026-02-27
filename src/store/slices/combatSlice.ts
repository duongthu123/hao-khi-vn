/**
 * Combat state slice
 * Manages units, buildings, active effects, and combat log
 */

import { StateCreator } from 'zustand';
import { Unit } from '@/types/unit';

export interface Building {
  id: string;
  type: string;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  owner: 'player' | 'ai';
}

export interface Effect {
  id: string;
  type: string;
  position: { x: number; y: number };
  duration: number;
  startTime: number;
}

export interface CombatEvent {
  id: string;
  timestamp: number;
  type: 'attack' | 'damage' | 'death' | 'ability' | 'spawn';
  message: string;
  data?: unknown;
}

export interface AIState {
  lastSpawnTime: number;
  lastUpdateTime: number;
  resources: {
    food: number;
    gold: number;
    army: number;
  };
  fortressPosition: { x: number; y: number };
}

export interface CombatSlice {
  combat: {
    units: Unit[];
    buildings: Building[];
    activeEffects: Effect[];
    combatLog: CombatEvent[];
    aiState: AIState;
  };
  
  // AI actions
  updateAIState: (updates: Partial<AIState>) => void;
  updateAIResources: (resources: Partial<AIState['resources']>) => void;
  
  // Unit actions
  addUnit: (unit: Unit) => void;
  removeUnit: (unitId: string) => void;
  updateUnit: (unitId: string, updates: Partial<Unit>) => void;
  clearUnits: () => void;
  
  // Building actions
  addBuilding: (building: Building) => void;
  removeBuilding: (buildingId: string) => void;
  updateBuilding: (buildingId: string, updates: Partial<Building>) => void;
  
  // Effect actions
  addEffect: (effect: Effect) => void;
  removeEffect: (effectId: string) => void;
  clearExpiredEffects: (currentTime: number) => void;
  
  // Combat log actions
  logCombatEvent: (event: Omit<CombatEvent, 'id' | 'timestamp'>) => void;
  clearCombatLog: () => void;
  
  // Selectors
  getUnitById: (unitId: string) => Unit | undefined;
  getPlayerUnits: () => Unit[];
  getAIUnits: () => Unit[];
  getBuildingById: (buildingId: string) => Building | undefined;
}

const initialCombatState = {
  units: [],
  buildings: [],
  activeEffects: [],
  combatLog: [],
  aiState: {
    lastSpawnTime: 0,
    lastUpdateTime: 0,
    resources: {
      food: 200,
      gold: 150,
      army: 0,
    },
    fortressPosition: { x: 800, y: 400 }, // Default fortress position
  },
};

export const createCombatSlice: StateCreator<CombatSlice> = (set, get) => ({
  combat: initialCombatState,
  
  // AI actions
  updateAIState: (updates) =>
    set((state) => ({
      combat: {
        ...state.combat,
        aiState: { ...state.combat.aiState, ...updates },
      },
    })),
  
  updateAIResources: (resources) =>
    set((state) => ({
      combat: {
        ...state.combat,
        aiState: {
          ...state.combat.aiState,
          resources: { ...state.combat.aiState.resources, ...resources },
        },
      },
    })),
  
  // Unit actions
  addUnit: (unit) =>
    set((state) => ({
      combat: {
        ...state.combat,
        units: [...state.combat.units, unit],
      },
    })),
  
  removeUnit: (unitId) =>
    set((state) => ({
      combat: {
        ...state.combat,
        units: state.combat.units.filter((u) => u.id !== unitId),
      },
    })),
  
  updateUnit: (unitId, updates) =>
    set((state) => ({
      combat: {
        ...state.combat,
        units: state.combat.units.map((u) =>
          u.id === unitId ? { ...u, ...updates } : u
        ),
      },
    })),
  
  clearUnits: () =>
    set((state) => ({
      combat: { ...state.combat, units: [] },
    })),
  
  // Building actions
  addBuilding: (building) =>
    set((state) => ({
      combat: {
        ...state.combat,
        buildings: [...state.combat.buildings, building],
      },
    })),
  
  removeBuilding: (buildingId) =>
    set((state) => ({
      combat: {
        ...state.combat,
        buildings: state.combat.buildings.filter((b) => b.id !== buildingId),
      },
    })),
  
  updateBuilding: (buildingId, updates) =>
    set((state) => ({
      combat: {
        ...state.combat,
        buildings: state.combat.buildings.map((b) =>
          b.id === buildingId ? { ...b, ...updates } : b
        ),
      },
    })),
  
  // Effect actions
  addEffect: (effect) =>
    set((state) => ({
      combat: {
        ...state.combat,
        activeEffects: [...state.combat.activeEffects, effect],
      },
    })),
  
  removeEffect: (effectId) =>
    set((state) => ({
      combat: {
        ...state.combat,
        activeEffects: state.combat.activeEffects.filter((e) => e.id !== effectId),
      },
    })),
  
  clearExpiredEffects: (currentTime) =>
    set((state) => ({
      combat: {
        ...state.combat,
        activeEffects: state.combat.activeEffects.filter(
          (e) => e.startTime + e.duration > currentTime
        ),
      },
    })),
  
  // Combat log actions
  logCombatEvent: (event) =>
    set((state) => ({
      combat: {
        ...state.combat,
        combatLog: [
          ...state.combat.combatLog,
          {
            ...event,
            id: `event-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
          },
        ].slice(-100), // Keep only last 100 events
      },
    })),
  
  clearCombatLog: () =>
    set((state) => ({
      combat: { ...state.combat, combatLog: [] },
    })),
  
  // Selectors
  getUnitById: (unitId) => {
    const state = get();
    return state.combat.units.find((u) => u.id === unitId);
  },
  
  getPlayerUnits: () => {
    const state = get();
    return state.combat.units.filter((u) => u.owner === 'player');
  },
  
  getAIUnits: () => {
    const state = get();
    return state.combat.units.filter((u) => u.owner === 'ai');
  },
  
  getBuildingById: (buildingId) => {
    const state = get();
    return state.combat.buildings.find((b) => b.id === buildingId);
  },
});
