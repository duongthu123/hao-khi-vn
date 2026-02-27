/**
 * Example: Integrating Sound Manager with Combat System
 * 
 * This file demonstrates how to integrate the sound manager with the combat engine
 * to play appropriate sounds for combat events.
 */

import { useEffect, useCallback } from 'react';
import { useCombatSounds } from '@/hooks/useSoundManager';
import { CombatEvent, CombatEventType } from '@/types/combat';
import { UnitType } from '@/types/unit';

/**
 * Example component that plays sounds based on combat events
 */
export function CombatSoundIntegration() {
  const { onAttack, onHit, onDeath, onAbility, onHeal, onBuff, onDebuff } = useCombatSounds(true);

  /**
   * Process a combat event and play the appropriate sound
   */
  const handleCombatEvent = useCallback(
    (event: CombatEvent) => {
      switch (event.type) {
        case CombatEventType.ATTACK: {
          // Determine if it's a melee or ranged attack based on unit type
          const isMelee = event.data?.unitType === UnitType.INFANTRY || 
                         event.data?.unitType === UnitType.CAVALRY;
          onAttack(isMelee);
          break;
        }

        case CombatEventType.DAMAGE: {
          // Play hit sound based on damage amount
          const damage = event.value || 0;
          const maxDamage = 100; // Adjust based on your game balance
          onHit(damage, maxDamage);
          break;
        }

        case CombatEventType.DEATH: {
          onDeath();
          break;
        }

        case CombatEventType.ABILITY_USED: {
          onAbility();
          break;
        }

        case CombatEventType.HEAL: {
          onHeal();
          break;
        }

        case CombatEventType.STATUS_APPLIED: {
          const statusType = event.data?.statusType;
          if (statusType === 'buff') {
            onBuff();
          } else if (statusType === 'debuff') {
            onDebuff();
          }
          break;
        }
      }
    },
    [onAttack, onHit, onDeath, onAbility, onHeal, onBuff, onDebuff]
  );

  return { handleCombatEvent };
}

/**
 * Example: Using with Combat Engine
 */
export function useCombatEngineWithSound() {
  const { handleCombatEvent } = CombatSoundIntegration();

  const processCombatWithSound = useCallback(
    (attacker: any, defender: any) => {
      // Import your combat engine
      // const { processAttack } = require('@/lib/combat/engine');
      
      // Process the attack
      // const result = processAttack(attacker, defender);
      
      // Play sounds for each event
      // result.events.forEach(handleCombatEvent);
      
      // return result;
    },
    [handleCombatEvent]
  );

  return { processCombatWithSound };
}

/**
 * Example: Volume Control Component
 */
export function VolumeControl() {
  const { volume, setMasterVolume, isMuted, toggleMute } = useCombatSounds(true);

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
      <button
        onClick={toggleMute}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        {isMuted ? '🔇 Unmute' : '🔊 Mute'}
      </button>
      
      <div className="flex items-center gap-2">
        <label htmlFor="volume" className="text-white">
          Volume:
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-white w-12">
          {Math.round(volume * 100)}%
        </span>
      </div>
    </div>
  );
}

/**
 * Example: Initialize sound on game start
 */
export function GameStartButton() {
  const { initialize, isInitialized } = useCombatSounds(true);

  const handleStartGame = async () => {
    // Initialize sound manager (required for browser autoplay policy)
    if (!isInitialized) {
      await initialize();
    }
    
    // Start your game...
  };

  return (
    <button
      onClick={handleStartGame}
      className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-bold"
    >
      Start Game
    </button>
  );
}

/**
 * Example: Combat View with Sound Integration
 */
export function CombatViewWithSound({ combatEvents }: { combatEvents: CombatEvent[] }) {
  const { handleCombatEvent } = CombatSoundIntegration();

  // Play sounds when new combat events occur
  useEffect(() => {
    if (combatEvents.length > 0) {
      const latestEvent = combatEvents[combatEvents.length - 1];
      handleCombatEvent(latestEvent);
    }
  }, [combatEvents, handleCombatEvent]);

  return (
    <div className="combat-view">
      {/* Your combat visualization here */}
      <div className="combat-log">
        {combatEvents.map((event, index) => (
          <div key={index} className="combat-event">
            {event.type}: {JSON.stringify(event.data)}
          </div>
        ))}
      </div>
    </div>
  );
}
