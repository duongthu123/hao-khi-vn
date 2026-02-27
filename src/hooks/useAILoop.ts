/**
 * AI Loop Hook
 * Manages AI update cycle separate from UI rendering
 * Validates Requirements 17.7, 17.8
 */

import { useEffect, useRef } from 'react';
import { useStore } from '@/store';
import { Difficulty } from '@/types/game';
import { UnitType } from '@/types/unit';
import {
  decideUnitSpawn,
  selectTarget,
  manageResources,
  getDirectionToTarget,
  type AIDecisionContext,
} from '@/lib/ai/strategy';
import {
  getAIDifficultySettings,
  calculateResourceGeneration,
  canSpawnUnit,
} from '@/lib/ai/difficulty';
import { getUnitCost } from '@/constants/units';

/**
 * AI loop configuration options
 */
export interface UseAILoopOptions {
  /**
   * Whether the AI loop is active (default: true)
   */
  enabled?: boolean;
  
  /**
   * AI update interval in milliseconds (default: 1000ms = 1 second)
   * AI runs at lower frequency than rendering to avoid blocking
   */
  updateInterval?: number;
}

/**
 * Custom hook for managing AI update cycle
 * 
 * Runs AI logic on a separate timing from UI updates to ensure smooth rendering.
 * AI updates include:
 * - Resource generation
 * - Unit spawning decisions
 * - Target selection for AI units
 * - Resource management
 * 
 * @param options - Configuration options for the AI loop
 * 
 * @example
 * ```tsx
 * function GameComponent() {
 *   const isPaused = useStore((state) => state.game.isPaused);
 *   const isPlaying = useStore((state) => state.game.phase === 'playing');
 *   
 *   useAILoop({ enabled: isPlaying && !isPaused });
 *   
 *   return <div>Game content</div>;
 * }
 * ```
 */
export function useAILoop(options: UseAILoopOptions = {}): void {
  const {
    enabled = true,
    updateInterval = 1000, // 1 second between AI updates
  } = options;
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastUpdateRef = useRef<number>(0);
  
  // Get store actions and state
  const difficulty = useStore((state) => state.game.difficulty);
  const elapsedTime = useStore((state) => state.game.elapsedTime);
  const addUnit = useStore((state) => state.addUnit);
  const updateUnit = useStore((state) => state.updateUnit);
  const updateAIState = useStore((state) => state.updateAIState);
  const updateAIResources = useStore((state) => state.updateAIResources);
  const logCombatEvent = useStore((state) => state.logCombatEvent);
  
  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }
    
    // AI update function
    const updateAI = () => {
      const currentTime = Date.now() / 1000; // Convert to seconds
      const deltaTime = currentTime - lastUpdateRef.current;
      lastUpdateRef.current = currentTime;
      
      // Skip first update (no delta time yet)
      if (deltaTime === 0 || deltaTime > 5) {
        return;
      }
      
      // Get current state
      const state = useStore.getState();
      const aiState = state.combat.aiState;
      const aiUnits = state.getAIUnits();
      const playerUnits = state.getPlayerUnits();
      
      // Update AI resources based on difficulty
      const settings = getAIDifficultySettings(difficulty);
      const baseResourceRate = 5; // Base resources per second
      const resourceGain = calculateResourceGeneration(baseResourceRate, difficulty) * deltaTime;
      
      const newFood = Math.min(aiState.resources.food + resourceGain, 1000);
      const newGold = Math.min(aiState.resources.gold + resourceGain * 0.8, 800);
      
      updateAIResources({
        food: newFood,
        gold: newGold,
      });
      
      // Create AI decision context
      const context: AIDecisionContext = {
        aiUnits,
        playerUnits,
        aiResources: aiState.resources,
        difficulty,
        elapsedTime,
        fortressPosition: aiState.fortressPosition,
      };
      
      // Check if AI should spawn a unit
      if (canSpawnUnit(aiState.lastSpawnTime, elapsedTime, difficulty)) {
        const spawnDecision = decideUnitSpawn(context);
        
        if (spawnDecision.shouldSpawn && spawnDecision.unitType && spawnDecision.position) {
          // Get unit cost
          const cost = getUnitCost(spawnDecision.unitType);
          
          // Deduct resources
          updateAIResources({
            food: aiState.resources.food - cost.food,
            gold: aiState.resources.gold - cost.gold,
          });
          
          // Create new AI unit
          const newUnit = {
            id: `ai-unit-${Date.now()}-${Math.random()}`,
            type: spawnDecision.unitType,
            faction: 'mongol' as const,
            position: spawnDecision.position,
            health: 100,
            maxHealth: 100,
            attack: 20,
            defense: 10,
            speed: 5,
            direction: 'south' as const,
            status: [],
            owner: 'ai' as const,
          };
          
          addUnit(newUnit);
          
          // Log spawn event
          logCombatEvent({
            type: 'spawn',
            message: `AI spawned ${spawnDecision.unitType}`,
            data: { unitType: spawnDecision.unitType, position: spawnDecision.position },
          });
          
          // Update last spawn time
          updateAIState({ lastSpawnTime: elapsedTime });
        }
      }
      
      // Update AI unit targeting
      for (const aiUnit of aiUnits) {
        const targetDecision = selectTarget(aiUnit, context);
        
        if (targetDecision.targetId) {
          const target = playerUnits.find((u) => u.id === targetDecision.targetId);
          
          if (target) {
            // Update unit direction to face target
            const direction = getDirectionToTarget(aiUnit.position, target.position);
            
            updateUnit(aiUnit.id, {
              direction,
            });
            
            // Move towards target (simplified movement)
            const dx = target.position.x - aiUnit.position.x;
            const dy = target.position.y - aiUnit.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 30) {
              // Move closer
              const moveSpeed = aiUnit.speed * deltaTime * 10;
              const moveX = (dx / distance) * moveSpeed;
              const moveY = (dy / distance) * moveSpeed;
              
              updateUnit(aiUnit.id, {
                position: {
                  x: aiUnit.position.x + moveX,
                  y: aiUnit.position.y + moveY,
                },
              });
            }
          }
        }
      }
      
      // Manage AI resources
      const resourceDecision = manageResources(context);
      
      // Update AI state timestamp
      updateAIState({ lastUpdateTime: currentTime });
    };
    
    // Initialize last update time
    lastUpdateRef.current = Date.now() / 1000;
    
    // Start AI update interval
    intervalRef.current = setInterval(updateAI, updateInterval);
    
    // Cleanup on unmount or when disabled
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [
    enabled,
    updateInterval,
    difficulty,
    elapsedTime,
    addUnit,
    updateUnit,
    updateAIState,
    updateAIResources,
    logCombatEvent,
  ]);
}

/**
 * Get AI state for debugging/monitoring
 * 
 * @returns Current AI state
 */
export function useAIState() {
  return useStore((state) => state.combat.aiState);
}

/**
 * Get AI performance metrics
 * 
 * @returns AI metrics including unit count, resources, and update frequency
 */
export function useAIMetrics() {
  const aiState = useStore((state) => state.combat.aiState);
  const aiUnits = useStore((state) => state.getAIUnits());
  const difficulty = useStore((state) => state.game.difficulty);
  const settings = getAIDifficultySettings(difficulty);
  
  return {
    unitCount: aiUnits.length,
    unitLimit: settings.unitLimit,
    resources: aiState.resources,
    lastSpawnTime: aiState.lastSpawnTime,
    lastUpdateTime: aiState.lastUpdateTime,
    spawnInterval: settings.spawnInterval,
  };
}
