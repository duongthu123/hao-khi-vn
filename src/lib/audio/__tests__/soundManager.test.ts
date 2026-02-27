/**
 * Unit tests for Sound Manager
 * Tests sound pooling, volume controls, and mute functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { soundManager, SoundEffect, playCombatSound } from '../soundManager';

// Mock Web Audio API
class MockAudioContext {
  state = 'running';
  destination = {};
  
  async resume() {
    this.state = 'running';
  }
  
  async suspend() {
    this.state = 'suspended';
  }
  
  createBufferSource() {
    return {
      buffer: null,
      playbackRate: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    };
  }
  
  createGain() {
    return {
      gain: { value: 1 },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  
  async decodeAudioData(arrayBuffer: ArrayBuffer) {
    return {} as AudioBuffer;
  }
}

// Mock fetch for loading audio files
global.fetch = vi.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  } as Response)
);

// Setup Web Audio API mock
beforeEach(() => {
  (global as any).AudioContext = MockAudioContext;
  (global as any).webkitAudioContext = MockAudioContext;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('SoundManager', () => {
  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await soundManager.initialize();
      expect(soundManager.isInitialized()).toBe(true);
    });

    it('should not initialize twice', async () => {
      await soundManager.initialize();
      const firstInit = soundManager.isInitialized();
      
      await soundManager.initialize();
      const secondInit = soundManager.isInitialized();
      
      expect(firstInit).toBe(true);
      expect(secondInit).toBe(true);
    });
  });

  describe('Volume Controls', () => {
    beforeEach(async () => {
      await soundManager.initialize();
      // Reset volume to default
      soundManager.setMasterVolume(1.0);
    });

    it('should set master volume', () => {
      soundManager.setMasterVolume(0.5);
      expect(soundManager.getMasterVolume()).toBe(0.5);
    });

    it('should clamp volume to 0-1 range', () => {
      soundManager.setMasterVolume(1.5);
      expect(soundManager.getMasterVolume()).toBe(1);
      
      soundManager.setMasterVolume(-0.5);
      expect(soundManager.getMasterVolume()).toBe(0);
    });

    it('should have default volume of 1.0', () => {
      expect(soundManager.getMasterVolume()).toBe(1.0);
    });
  });

  describe('Mute Functionality', () => {
    beforeEach(async () => {
      await soundManager.initialize();
    });

    it('should mute sounds', () => {
      soundManager.mute();
      expect(soundManager.isMuted()).toBe(true);
    });

    it('should unmute sounds', () => {
      soundManager.mute();
      soundManager.unmute();
      expect(soundManager.isMuted()).toBe(false);
    });

    it('should toggle mute state', () => {
      const initialState = soundManager.isMuted();
      soundManager.toggleMute();
      expect(soundManager.isMuted()).toBe(!initialState);
      
      soundManager.toggleMute();
      expect(soundManager.isMuted()).toBe(initialState);
    });

    it('should not play sounds when muted', () => {
      soundManager.mute();
      
      // This should not throw or cause issues
      soundManager.play(SoundEffect.ATTACK_MELEE);
      
      // Sound count should be 0 since muted
      expect(soundManager.getActiveSoundCount()).toBe(0);
    });
  });

  describe('Sound Playback', () => {
    beforeEach(async () => {
      await soundManager.initialize();
    });

    it('should play a sound effect', () => {
      // Should not throw
      expect(() => {
        soundManager.play(SoundEffect.ATTACK_MELEE);
      }).not.toThrow();
    });

    it('should play sound with custom volume', () => {
      expect(() => {
        soundManager.play(SoundEffect.HIT_LIGHT, 0.5);
      }).not.toThrow();
    });

    it('should play sound with custom playback rate', () => {
      expect(() => {
        soundManager.play(SoundEffect.DEATH, 1, 1.5);
      }).not.toThrow();
    });

    it('should stop all sounds', () => {
      soundManager.play(SoundEffect.ATTACK_MELEE);
      soundManager.play(SoundEffect.HIT_LIGHT);
      
      soundManager.stopAll();
      
      // After stopping, active count should be 0
      expect(soundManager.getActiveSoundCount()).toBe(0);
    });
  });

  describe('Audio Context Management', () => {
    beforeEach(async () => {
      await soundManager.initialize();
    });

    it('should resume audio context', async () => {
      await soundManager.suspend();
      await soundManager.resume();
      
      // Should not throw
      expect(soundManager.isInitialized()).toBe(true);
    });

    it('should suspend audio context', async () => {
      await soundManager.suspend();
      
      // Should not throw
      expect(soundManager.isInitialized()).toBe(true);
    });
  });

  describe('Helper Functions', () => {
    beforeEach(async () => {
      await soundManager.initialize();
    });

    it('should play melee attack sound', () => {
      expect(() => {
        playCombatSound('attack', { isMelee: true });
      }).not.toThrow();
    });

    it('should play ranged attack sound', () => {
      expect(() => {
        playCombatSound('attack', { isMelee: false });
      }).not.toThrow();
    });

    it('should play light hit sound', () => {
      expect(() => {
        playCombatSound('hit', { isHeavy: false });
      }).not.toThrow();
    });

    it('should play heavy hit sound', () => {
      expect(() => {
        playCombatSound('hit', { isHeavy: true });
      }).not.toThrow();
    });

    it('should play death sound', () => {
      expect(() => {
        playCombatSound('death');
      }).not.toThrow();
    });

    it('should play ability sound', () => {
      expect(() => {
        playCombatSound('ability');
      }).not.toThrow();
    });

    it('should play heal sound', () => {
      expect(() => {
        playCombatSound('heal');
      }).not.toThrow();
    });

    it('should play buff sound', () => {
      expect(() => {
        playCombatSound('buff');
      }).not.toThrow();
    });

    it('should play debuff sound', () => {
      expect(() => {
        playCombatSound('debuff');
      }).not.toThrow();
    });

    it('should apply custom volume to combat sounds', () => {
      expect(() => {
        playCombatSound('attack', { volume: 0.3 });
      }).not.toThrow();
    });

    it('should apply custom playback rate to combat sounds', () => {
      expect(() => {
        playCombatSound('hit', { playbackRate: 1.2 });
      }).not.toThrow();
    });
  });

  describe('Sound Effect Types', () => {
    it('should have all required sound effect types', () => {
      expect(SoundEffect.ATTACK_MELEE).toBeDefined();
      expect(SoundEffect.ATTACK_RANGED).toBeDefined();
      expect(SoundEffect.HIT_LIGHT).toBeDefined();
      expect(SoundEffect.HIT_HEAVY).toBeDefined();
      expect(SoundEffect.DEATH).toBeDefined();
      expect(SoundEffect.ABILITY_CAST).toBeDefined();
      expect(SoundEffect.ABILITY_IMPACT).toBeDefined();
      expect(SoundEffect.HEAL).toBeDefined();
      expect(SoundEffect.BUFF).toBeDefined();
      expect(SoundEffect.DEBUFF).toBeDefined();
    });
  });
});
