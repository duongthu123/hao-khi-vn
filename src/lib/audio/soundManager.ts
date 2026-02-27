/**
 * Sound Manager
 * Manages combat sound effects using Web Audio API with sound pooling for performance
 * 
 * Validates Requirement 13.7: Combat sound effects implementation
 * 
 * Features:
 * - Web Audio API for low-latency sound playback
 * - Sound effect pooling to prevent audio glitches during intense combat
 * - Volume controls and mute functionality
 * - Support for attack, hit, death, and ability sound effects
 */

import { getSoundPath } from '@/lib/utils/assets';

/**
 * Sound effect types for combat events
 */
export enum SoundEffect {
  ATTACK_MELEE = 'attack-melee',
  ATTACK_RANGED = 'attack-ranged',
  HIT_LIGHT = 'hit-light',
  HIT_HEAVY = 'hit-heavy',
  DEATH = 'death',
  ABILITY_CAST = 'ability-cast',
  ABILITY_IMPACT = 'ability-impact',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  RANK_UP = 'rank-up',
  LEVEL_UP = 'level-up',
}

/**
 * Sound configuration for each effect type
 */
interface SoundConfig {
  path: string;
  volume: number;
  poolSize: number;
}

/**
 * Default sound configurations
 * Note: These paths assume sound files exist in public/sounds/
 * In production, replace with actual sound file paths
 */
const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  [SoundEffect.ATTACK_MELEE]: {
    path: 'combat/attack-melee.mp3',
    volume: 0.6,
    poolSize: 5,
  },
  [SoundEffect.ATTACK_RANGED]: {
    path: 'combat/attack-ranged.mp3',
    volume: 0.5,
    poolSize: 5,
  },
  [SoundEffect.HIT_LIGHT]: {
    path: 'combat/hit-light.mp3',
    volume: 0.5,
    poolSize: 8,
  },
  [SoundEffect.HIT_HEAVY]: {
    path: 'combat/hit-heavy.mp3',
    volume: 0.7,
    poolSize: 6,
  },
  [SoundEffect.DEATH]: {
    path: 'combat/death.mp3',
    volume: 0.8,
    poolSize: 4,
  },
  [SoundEffect.ABILITY_CAST]: {
    path: 'combat/ability-cast.mp3',
    volume: 0.7,
    poolSize: 3,
  },
  [SoundEffect.ABILITY_IMPACT]: {
    path: 'combat/ability-impact.mp3',
    volume: 0.8,
    poolSize: 4,
  },
  [SoundEffect.HEAL]: {
    path: 'combat/heal.mp3',
    volume: 0.6,
    poolSize: 3,
  },
  [SoundEffect.BUFF]: {
    path: 'combat/buff.mp3',
    volume: 0.5,
    poolSize: 2,
  },
  [SoundEffect.DEBUFF]: {
    path: 'combat/debuff.mp3',
    volume: 0.5,
    poolSize: 2,
  },
  [SoundEffect.RANK_UP]: {
    path: 'ui/rank-up.mp3',
    volume: 0.8,
    poolSize: 1,
  },
  [SoundEffect.LEVEL_UP]: {
    path: 'ui/level-up.mp3',
    volume: 0.6,
    poolSize: 1,
  },
};

/**
 * Audio buffer pool for a specific sound effect
 */
class SoundPool {
  private audioContext: AudioContext;
  private buffer: AudioBuffer | null = null;
  private config: SoundConfig;
  private activeNodes: Set<AudioBufferSourceNode> = new Set();

  constructor(audioContext: AudioContext, config: SoundConfig) {
    this.audioContext = audioContext;
    this.config = config;
  }

  /**
   * Load the audio buffer for this sound
   */
  async load(): Promise<void> {
    try {
      const response = await fetch(getSoundPath(this.config.path));
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn(`Failed to load sound: ${this.config.path}`, error);
      // Don't throw - allow game to continue without this sound
    }
  }

  /**
   * Play the sound effect
   * 
   * @param volume - Volume multiplier (0-1), defaults to config volume
   * @param playbackRate - Playback speed (0.5-2), defaults to 1
   */
  play(volume: number = 1, playbackRate: number = 1): void {
    if (!this.buffer) {
      console.warn('Sound buffer not loaded');
      return;
    }

    // Check if we've exceeded the pool size
    if (this.activeNodes.size >= this.config.poolSize) {
      // Stop the oldest sound to make room
      const oldestNode = this.activeNodes.values().next().value;
      if (oldestNode) {
        try {
          oldestNode.stop();
        } catch (e) {
          // Node might already be stopped
        }
        this.activeNodes.delete(oldestNode);
      }
    }

    try {
      // Create source node
      const source = this.audioContext.createBufferSource();
      source.buffer = this.buffer;
      source.playbackRate.value = playbackRate;

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.config.volume * volume;

      // Connect nodes: source -> gain -> destination
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Track active node
      this.activeNodes.add(source);

      // Clean up when sound finishes
      source.onended = () => {
        this.activeNodes.delete(source);
        source.disconnect();
        gainNode.disconnect();
      };

      // Start playback
      source.start(0);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Stop all active sounds from this pool
   */
  stopAll(): void {
    for (const node of this.activeNodes) {
      try {
        node.stop();
      } catch (e) {
        // Node might already be stopped
      }
    }
    this.activeNodes.clear();
  }

  /**
   * Get the number of currently playing sounds
   */
  getActiveCount(): number {
    return this.activeNodes.size;
  }
}

/**
 * Main sound manager class
 * Singleton pattern for global sound management
 */
class SoundManager {
  private static instance: SoundManager | null = null;
  
  private audioContext: AudioContext | null = null;
  private soundPools: Map<SoundEffect, SoundPool> = new Map();
  private masterVolume: number = 1.0;
  private muted: boolean = false;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private captionsEnabled: boolean = false;
  private onCaptionCallback: ((caption: string) => void) | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize the sound manager
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<void> {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume context if suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Create sound pools for each effect
      const loadPromises: Promise<void>[] = [];
      
      for (const [effect, config] of Object.entries(SOUND_CONFIGS)) {
        const pool = new SoundPool(this.audioContext, config);
        this.soundPools.set(effect as SoundEffect, pool);
        loadPromises.push(pool.load());
      }

      // Load all sounds in parallel
      await Promise.all(loadPromises);

      this.initialized = true;
      console.log('Sound manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize sound manager:', error);
      // Don't throw - allow game to continue without sound
    }
  }

  /**
   * Play a sound effect
   * 
   * @param effect - The sound effect to play
   * @param volume - Volume multiplier (0-1), defaults to 1
   * @param playbackRate - Playback speed (0.5-2), defaults to 1
   */
  play(effect: SoundEffect, volume: number = 1, playbackRate: number = 1): void {
    if (!this.initialized || this.muted) {
      return;
    }

    const pool = this.soundPools.get(effect);
    if (!pool) {
      console.warn(`Sound effect not found: ${effect}`);
      return;
    }

    // Apply master volume
    const finalVolume = volume * this.masterVolume;
    pool.play(finalVolume, playbackRate);

    // Trigger caption if enabled
    if (this.captionsEnabled && this.onCaptionCallback) {
      const caption = this.getSoundCaption(effect);
      this.onCaptionCallback(caption);
    }
  }

  /**
   * Get caption text for a sound effect
   */
  private getSoundCaption(effect: SoundEffect): string {
    const captions: Record<SoundEffect, string> = {
      [SoundEffect.ATTACK_MELEE]: 'Âm thanh tấn công cận chiến',
      [SoundEffect.ATTACK_RANGED]: 'Âm thanh tấn công tầm xa',
      [SoundEffect.HIT_LIGHT]: 'Âm thanh trúng đòn nhẹ',
      [SoundEffect.HIT_HEAVY]: 'Âm thanh trúng đòn mạnh',
      [SoundEffect.DEATH]: 'Âm thanh tử trận',
      [SoundEffect.ABILITY_CAST]: 'Âm thanh kích hoạt kỹ năng',
      [SoundEffect.ABILITY_IMPACT]: 'Âm thanh kỹ năng trúng đích',
      [SoundEffect.HEAL]: 'Âm thanh hồi máu',
      [SoundEffect.BUFF]: 'Âm thanh tăng cường',
      [SoundEffect.DEBUFF]: 'Âm thanh suy yếu',
      [SoundEffect.RANK_UP]: 'Âm thanh thăng cấp',
      [SoundEffect.LEVEL_UP]: 'Âm thanh lên bậc',
    };
    return captions[effect] || 'Âm thanh trò chơi';
  }

  /**
   * Enable audio captions
   */
  enableCaptions(callback: (caption: string) => void): void {
    this.captionsEnabled = true;
    this.onCaptionCallback = callback;
  }

  /**
   * Disable audio captions
   */
  disableCaptions(): void {
    this.captionsEnabled = false;
    this.onCaptionCallback = null;
  }

  /**
   * Check if captions are enabled
   */
  areCaptionsEnabled(): boolean {
    return this.captionsEnabled;
  }

  /**
   * Set the master volume
   * 
   * @param volume - Volume level (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get the current master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    this.muted = true;
    this.stopAll();
  }

  /**
   * Unmute sounds
   */
  unmute(): void {
    this.muted = false;
  }

  /**
   * Toggle mute state
   */
  toggleMute(): void {
    if (this.muted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Check if sounds are muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Stop all currently playing sounds
   */
  stopAll(): void {
    for (const pool of this.soundPools.values()) {
      pool.stopAll();
    }
  }

  /**
   * Get the number of currently playing sounds
   */
  getActiveSoundCount(): number {
    let count = 0;
    for (const pool of this.soundPools.values()) {
      count += pool.getActiveCount();
    }
    return count;
  }

  /**
   * Check if the sound manager is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Resume audio context (useful after page visibility changes)
   */
  async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Suspend audio context (useful for pausing game)
   */
  async suspend(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'running') {
      await this.audioContext.suspend();
    }
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

/**
 * Helper function to play combat sounds based on combat events
 */
export function playCombatSound(
  eventType: 'attack' | 'hit' | 'death' | 'ability' | 'heal' | 'buff' | 'debuff',
  options?: {
    isMelee?: boolean;
    isHeavy?: boolean;
    volume?: number;
    playbackRate?: number;
  }
): void {
  const { isMelee = true, isHeavy = false, volume = 1, playbackRate = 1 } = options || {};

  let effect: SoundEffect;

  switch (eventType) {
    case 'attack':
      effect = isMelee ? SoundEffect.ATTACK_MELEE : SoundEffect.ATTACK_RANGED;
      break;
    case 'hit':
      effect = isHeavy ? SoundEffect.HIT_HEAVY : SoundEffect.HIT_LIGHT;
      break;
    case 'death':
      effect = SoundEffect.DEATH;
      break;
    case 'ability':
      effect = SoundEffect.ABILITY_CAST;
      break;
    case 'heal':
      effect = SoundEffect.HEAL;
      break;
    case 'buff':
      effect = SoundEffect.BUFF;
      break;
    case 'debuff':
      effect = SoundEffect.DEBUFF;
      break;
    default:
      return;
  }

  soundManager.play(effect, volume, playbackRate);
}

/**
 * Initialize sound manager on user interaction
 * Call this from a click or touch event handler
 */
export async function initializeSoundManager(): Promise<void> {
  await soundManager.initialize();
}
