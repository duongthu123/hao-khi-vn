/**
 * React hook for sound manager integration
 * Provides easy access to sound manager functionality in React components
 */

import { useEffect, useState, useCallback } from 'react';
import { soundManager, SoundEffect, playCombatSound, initializeSoundManager } from '@/lib/audio/soundManager';

/**
 * Hook for managing sound effects in React components
 * 
 * @returns Sound manager controls and state
 */
export function useSoundManager() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);

  // Initialize sound manager on mount
  useEffect(() => {
    const initialize = async () => {
      await initializeSoundManager();
      setIsInitialized(soundManager.isInitialized());
      setIsMuted(soundManager.isMuted());
      setVolume(soundManager.getMasterVolume());
    };

    // Try to initialize (will only work after user interaction)
    initialize();
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        await soundManager.suspend();
      } else {
        await soundManager.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Play a sound effect
  const play = useCallback((effect: SoundEffect, volume?: number, playbackRate?: number) => {
    soundManager.play(effect, volume, playbackRate);
  }, []);

  // Play combat sound with helper
  const playCombat = useCallback(
    (
      eventType: 'attack' | 'hit' | 'death' | 'ability' | 'heal' | 'buff' | 'debuff',
      options?: {
        isMelee?: boolean;
        isHeavy?: boolean;
        volume?: number;
        playbackRate?: number;
      }
    ) => {
      playCombatSound(eventType, options);
    },
    []
  );

  // Set master volume
  const setMasterVolume = useCallback((newVolume: number) => {
    soundManager.setMasterVolume(newVolume);
    setVolume(newVolume);
  }, []);

  // Mute/unmute
  const mute = useCallback(() => {
    soundManager.mute();
    setIsMuted(true);
  }, []);

  const unmute = useCallback(() => {
    soundManager.unmute();
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    soundManager.toggleMute();
    setIsMuted(soundManager.isMuted());
  }, []);

  // Stop all sounds
  const stopAll = useCallback(() => {
    soundManager.stopAll();
  }, []);

  // Initialize manually (useful for click handlers)
  const initialize = useCallback(async () => {
    await initializeSoundManager();
    setIsInitialized(soundManager.isInitialized());
  }, []);

  return {
    isInitialized,
    isMuted,
    volume,
    play,
    playCombat,
    setMasterVolume,
    mute,
    unmute,
    toggleMute,
    stopAll,
    initialize,
  };
}

/**
 * Hook for playing sounds in response to combat events
 * Automatically plays appropriate sounds based on combat event types
 * 
 * @param enabled - Whether sound effects are enabled
 */
export function useCombatSounds(enabled: boolean = true) {
  const { playCombat } = useSoundManager();

  const onAttack = useCallback(
    (isMelee: boolean = true) => {
      if (enabled) {
        playCombat('attack', { isMelee });
      }
    },
    [enabled, playCombat]
  );

  const onHit = useCallback(
    (damage: number, maxDamage: number = 100) => {
      if (enabled) {
        // Heavy hit if damage is more than 50% of max
        const isHeavy = damage > maxDamage * 0.5;
        playCombat('hit', { isHeavy });
      }
    },
    [enabled, playCombat]
  );

  const onDeath = useCallback(() => {
    if (enabled) {
      playCombat('death');
    }
  }, [enabled, playCombat]);

  const onAbility = useCallback(() => {
    if (enabled) {
      playCombat('ability');
    }
  }, [enabled, playCombat]);

  const onHeal = useCallback(() => {
    if (enabled) {
      playCombat('heal');
    }
  }, [enabled, playCombat]);

  const onBuff = useCallback(() => {
    if (enabled) {
      playCombat('buff');
    }
  }, [enabled, playCombat]);

  const onDebuff = useCallback(() => {
    if (enabled) {
      playCombat('debuff');
    }
  }, [enabled, playCombat]);

  return {
    onAttack,
    onHit,
    onDeath,
    onAbility,
    onHeal,
    onBuff,
    onDebuff,
  };
}
