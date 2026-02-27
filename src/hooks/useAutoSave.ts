/**
 * Auto-save hook
 * Provides automatic game state persistence at regular intervals and on critical events
 * **Implements: Requirements 8.1, 8.2, 8.3, 8.4, 8.6, 8.7, 8.8**
 */

import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store';
import { saveToSlot } from '@/lib/saves/local';
import type { GameState } from '@/schemas/save.schema';

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  /** Auto-save interval in milliseconds (default: 5 minutes) */
  interval?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
  /** Dedicated slot for auto-saves (default: slot 0) */
  autoSaveSlot?: number;
  /** Debounce duration during combat in milliseconds (default: 30 seconds) */
  combatDebounce?: number;
  /** Whether to trigger auto-save on critical events (default: true) */
  enableEventTriggers?: boolean;
}

/**
 * Default auto-save configuration
 * **Implements: Requirement 8.2 - Default 5 minutes interval**
 */
const DEFAULT_CONFIG: Required<AutoSaveConfig> = {
  interval: 5 * 60 * 1000, // 5 minutes
  enabled: true,
  autoSaveSlot: 0, // Use slot 0 for auto-saves
  combatDebounce: 30 * 1000, // 30 seconds
  enableEventTriggers: true, // Enable critical event triggers
};

/**
 * Auto-save hook
 * **Implements: Requirement 8.1 - Automatically save Game_State at regular intervals**
 * **Implements: Requirement 8.3 - Use dedicated auto-save slot**
 * **Implements: Requirement 8.4 - Save without interrupting gameplay**
 * **Implements: Requirement 8.6 - Allow enable/disable in settings**
 * **Implements: Requirement 8.7 - Trigger auto-save on critical events**
 * **Implements: Requirement 8.8 - Not auto-save during animations**
 *
 * @param config - Auto-save configuration
 *
 * @example
 * ```tsx
 * function GameComponent() {
 *   useAutoSave({
 *     interval: 5 * 60 * 1000, // 5 minutes
 *     enabled: true,
 *     enableEventTriggers: true, // Auto-save on critical events
 *   });
 *
 *   return <div>Game content...</div>;
 * }
 * ```
 */
export function useAutoSave(config: AutoSaveConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const gameStore = useGameStore();
  const addNotification = useGameStore((state) => state.addNotification);
  const autoSaveEnabled = useGameStore((state) => state.ui.settings?.autoSaveEnabled ?? true);
  
  // Track last save time and combat state
  const lastSaveTimeRef = useRef<number>(0);
  const lastCombatTimeRef = useRef<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track previous state for event detection
  const prevLevelRef = useRef<number>(gameStore.game.currentLevel);
  const prevHeroCountRef = useRef<number>(gameStore.collection.heroes.length);
  const prevAchievementCountRef = useRef<number>(
    gameStore.profile.achievements.filter((a) => a.unlocked).length
  );
  
  // Track if animations are currently playing
  const isAnimatingRef = useRef<boolean>(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Check if combat is currently active
   * Combat is considered active if there are units on the battlefield
   */
  const isCombatActive = useCallback((): boolean => {
    const units = gameStore.combat.units;
    return units.length > 0;
  }, [gameStore.combat.units]);
  
  /**
   * Check if animations are currently playing
   * **Implements: Requirement 8.8 - Prevent auto-save during animations**
   */
  const isAnimationPlaying = useCallback((): boolean => {
    // Check if animations are disabled in settings
    const animationsEnabled = gameStore.ui.settings?.animationsEnabled ?? true;
    if (!animationsEnabled) {
      return false; // No animations playing if disabled
    }
    
    // Check our animation tracking flag
    return isAnimatingRef.current;
  }, [gameStore.ui.settings?.animationsEnabled]);
  
  /**
   * Mark that an animation has started
   * This prevents auto-save during the animation
   */
  const markAnimationStart = useCallback(() => {
    isAnimatingRef.current = true;
    
    // Clear any existing timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Auto-clear animation flag after 5 seconds (safety timeout)
    animationTimeoutRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
    }, 5000);
  }, []);
  
  /**
   * Mark that an animation has ended
   */
  const markAnimationEnd = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    isAnimatingRef.current = false;
  }, []);
  
  /**
   * Check if we should debounce auto-save due to recent combat
   * **Implements: Requirement 8.8 - Not auto-save during active combat**
   */
  const shouldDebounceDueToCombat = useCallback((): boolean => {
    if (!isCombatActive()) {
      return false;
    }
    
    // Update last combat time
    lastCombatTimeRef.current = Date.now();
    
    // Check if we're within the debounce window
    const timeSinceLastCombat = Date.now() - lastCombatTimeRef.current;
    return timeSinceLastCombat < finalConfig.combatDebounce;
  }, [isCombatActive, finalConfig.combatDebounce]);
  
  /**
   * Check if we should prevent auto-save
   * **Implements: Requirement 8.8 - Prevent auto-save during animations**
   */
  const shouldPreventAutoSave = useCallback((): boolean => {
    // Prevent during combat
    if (shouldDebounceDueToCombat()) {
      console.log('[AutoSave] Preventing due to active combat');
      return true;
    }
    
    // Prevent during animations
    if (isAnimationPlaying()) {
      console.log('[AutoSave] Preventing due to active animations');
      return true;
    }
    
    return false;
  }, [shouldDebounceDueToCombat, isAnimationPlaying]);
  
  /**
   * Perform auto-save operation
   * **Implements: Requirement 8.4 - Save without interrupting gameplay**
   * **Implements: Requirement 8.5 - Display non-intrusive notification**
   */
  const performAutoSave = useCallback(async (reason?: string) => {
    // Check if auto-save is enabled
    if (!finalConfig.enabled || !autoSaveEnabled) {
      return;
    }
    
    // Check if we should prevent auto-save
    if (shouldPreventAutoSave()) {
      return;
    }
    
    // Check if game is in a saveable state
    const gamePhase = gameStore.game.phase;
    if (gamePhase === 'menu' || gamePhase === 'hero-selection') {
      console.log('[AutoSave] Skipping - not in gameplay phase');
      return;
    }
    
    try {
      // Build game state from store
      const stateToSave: GameState = {
        version: '1.0.0',
        metadata: {
          slot: finalConfig.autoSaveSlot as 0 | 1 | 2 | 3 | 4,
          timestamp: Date.now(),
          playerName: gameStore.profile.playerName || 'Auto-save',
          progress: Math.round(
            (gameStore.collection.completionPercentage + gameStore.profile.level) / 2
          ),
          level: gameStore.profile.level,
          playTime: gameStore.profile.statistics.totalPlayTime,
        },
        game: {
          phase: gameStore.game.phase,
          difficulty: gameStore.game.difficulty,
          currentLevel: gameStore.game.currentLevel,
          elapsedTime: gameStore.game.elapsedTime,
        },
        hero: {
          selectedHero: gameStore.hero.selectedHero?.id || null,
          unlockedHeroes: gameStore.hero.unlockedHeroes,
        },
        combat: {
          units: gameStore.combat.units.map((u) => u.id),
          buildings: gameStore.combat.buildings.map((b) => b.id),
          activeEffects: [],
        },
        resources: {
          food: gameStore.resources.food,
          gold: gameStore.resources.gold,
          army: gameStore.resources.army,
          foodCap: gameStore.resources.caps.food,
          goldCap: gameStore.resources.caps.gold,
          armyCap: gameStore.resources.caps.army,
          generation: {
            foodPerSecond: gameStore.resources.generation.foodPerSecond,
            goldPerSecond: gameStore.resources.generation.goldPerSecond,
            armyPerSecond: gameStore.resources.generation.armyPerSecond,
          },
        },
        collection: {
          heroes: gameStore.collection.heroes.map((h) => h.id),
          items: gameStore.collection.items.map((i) => i.id),
          completionPercentage: gameStore.collection.completionPercentage,
        },
        profile: {
          name: gameStore.profile.playerName,
          rank: gameStore.profile.rank,
          level: gameStore.profile.level,
          experience: gameStore.profile.experience,
          wins: gameStore.profile.wins,
          losses: gameStore.profile.losses,
          achievements: gameStore.profile.achievements.map((a) => a.id),
          statistics: gameStore.profile.statistics,
        },
        research: {
          completed: gameStore.research.completed,
          inProgress: gameStore.research.inProgress,
          progress: gameStore.research.progress,
          available: gameStore.getAvailableResearchNodes().map((r) => r.id),
        },
        quiz: {
          questionsAnswered: gameStore.quiz.questionsAnswered,
          correctAnswers: gameStore.quiz.correctAnswers,
          completedCategories: gameStore.quiz.completedCategories,
          rewards: gameStore.quiz.rewards.map((r) => r.id),
        },
      };
      
      // Save to dedicated auto-save slot
      await saveToSlot(finalConfig.autoSaveSlot, stateToSave);
      
      // Update last save time
      lastSaveTimeRef.current = Date.now();
      
      // Show non-intrusive notification
      // **Implements: Requirement 8.5 - Display non-intrusive notification**
      const message = reason
        ? `💾 Tự động lưu game (${reason})`
        : '💾 Tự động lưu game thành công';
      
      addNotification({
        type: 'info',
        message,
        duration: 2000, // Short duration for non-intrusive notification
      });
      
      console.log(`[AutoSave] Successfully saved game${reason ? ` - ${reason}` : ''}`);
    } catch (error) {
      console.error('[AutoSave] Failed to save game:', error);
      
      // Show error notification (but don't interrupt gameplay)
      addNotification({
        type: 'warning',
        message: '⚠️ Không thể tự động lưu game',
        duration: 3000,
      });
    }
  }, [
    finalConfig.enabled,
    finalConfig.autoSaveSlot,
    autoSaveEnabled,
    shouldPreventAutoSave,
    gameStore,
    addNotification,
  ]);
  
  /**
   * Set up auto-save interval
   * **Implements: Requirement 8.1 - Save at regular intervals**
   * **Implements: Requirement 8.2 - Configurable interval**
   */
  useEffect(() => {
    // Clear existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    // Don't set up interval if disabled
    if (!finalConfig.enabled || !autoSaveEnabled) {
      console.log('[AutoSave] Auto-save is disabled');
      return;
    }
    
    console.log(`[AutoSave] Setting up auto-save with ${finalConfig.interval}ms interval`);
    
    // Set up new interval
    intervalIdRef.current = setInterval(() => {
      performAutoSave();
    }, finalConfig.interval);
    
    // Cleanup on unmount or config change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [finalConfig.enabled, finalConfig.interval, autoSaveEnabled, performAutoSave]);
  
  /**
   * Monitor for critical events and trigger auto-save
   * **Implements: Requirement 8.7 - Trigger auto-save on critical events**
   * - Level completion
   * - Hero acquisition
   * - Major milestones (achievements)
   */
  useEffect(() => {
    // Skip if event triggers are disabled
    if (!finalConfig.enableEventTriggers || !finalConfig.enabled || !autoSaveEnabled) {
      return;
    }
    
    const currentLevel = gameStore.game.currentLevel;
    const currentHeroCount = gameStore.collection.heroes.length;
    const currentAchievementCount = gameStore.profile.achievements.filter((a) => a.unlocked).length;
    
    // Detect level completion (level increased)
    if (currentLevel > prevLevelRef.current && prevLevelRef.current > 0) {
      console.log(`[AutoSave] Level completion detected: ${prevLevelRef.current} -> ${currentLevel}`);
      
      // Mark animation start (level completion usually has animations)
      markAnimationStart();
      
      // Trigger auto-save after a short delay to allow animations to complete
      setTimeout(() => {
        markAnimationEnd();
        performAutoSave('hoàn thành cấp độ');
      }, 2000); // 2 second delay for animations
    }
    
    // Detect hero acquisition (hero count increased)
    if (currentHeroCount > prevHeroCountRef.current && prevHeroCountRef.current > 0) {
      console.log(`[AutoSave] Hero acquisition detected: ${prevHeroCountRef.current} -> ${currentHeroCount}`);
      
      // Mark animation start (hero acquisition usually has animations)
      markAnimationStart();
      
      // Trigger auto-save after a short delay to allow animations to complete
      setTimeout(() => {
        markAnimationEnd();
        performAutoSave('nhận tướng mới');
      }, 2000); // 2 second delay for animations
    }
    
    // Detect achievement unlock (major milestone)
    if (currentAchievementCount > prevAchievementCountRef.current && prevAchievementCountRef.current > 0) {
      console.log(`[AutoSave] Achievement unlock detected: ${prevAchievementCountRef.current} -> ${currentAchievementCount}`);
      
      // Mark animation start (achievement unlock usually has animations)
      markAnimationStart();
      
      // Trigger auto-save after a short delay to allow animations to complete
      setTimeout(() => {
        markAnimationEnd();
        performAutoSave('đạt thành tựu');
      }, 2000); // 2 second delay for animations
    }
    
    // Update previous values for next comparison
    prevLevelRef.current = currentLevel;
    prevHeroCountRef.current = currentHeroCount;
    prevAchievementCountRef.current = currentAchievementCount;
  }, [
    finalConfig.enableEventTriggers,
    finalConfig.enabled,
    autoSaveEnabled,
    gameStore.game.currentLevel,
    gameStore.collection.heroes.length,
    gameStore.profile.achievements,
    performAutoSave,
    markAnimationStart,
    markAnimationEnd,
  ]);
  
  /**
   * Cleanup animation timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Expose manual trigger for testing or critical events
   */
  return {
    triggerAutoSave: performAutoSave,
    lastSaveTime: lastSaveTimeRef.current,
    isEnabled: finalConfig.enabled && autoSaveEnabled,
    markAnimationStart,
    markAnimationEnd,
  };
}

/**
 * Get formatted time since last auto-save
 *
 * @param lastSaveTime - Timestamp of last save
 * @returns Formatted string (e.g., "2 minutes ago")
 */
export function getTimeSinceLastSave(lastSaveTime: number): string {
  if (lastSaveTime === 0) {
    return 'Chưa lưu';
  }
  
  const seconds = Math.floor((Date.now() - lastSaveTime) / 1000);
  
  if (seconds < 60) {
    return `${seconds} giây trước`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }
  
  const hours = Math.floor(minutes / 60);
  return `${hours} giờ trước`;
}
