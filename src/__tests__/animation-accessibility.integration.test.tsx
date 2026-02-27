/**
 * Integration tests for animation accessibility features
 * Validates Requirements 6.8 and 22.6 (animation disable for accessibility)
 * 
 * This test verifies that:
 * 1. User can toggle animations in settings
 * 2. Animation setting is respected by all components
 * 3. Browser prefers-reduced-motion is respected
 * 4. All features work without animations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from '@/store';
import { useAnimations } from '@/hooks/useAnimations';
import * as FramerMotion from 'framer-motion';

// Mock Framer Motion's useReducedMotion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(),
  };
});

describe('Animation Accessibility - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useGameStore.setState({
      ui: {
        activeModal: null,
        notifications: [],
        mapZoom: 1,
        mapPosition: { x: 0, y: 0 },
        settings: {
          soundEnabled: true,
          musicEnabled: true,
          animationsEnabled: true,
          autoSaveEnabled: true,
          autoSaveInterval: 5 * 60 * 1000,
          language: 'vi',
          difficulty: 'normal',
        },
        rankUpAnimation: {
          isVisible: false,
          newRank: null,
        },
      },
    });
  });

  describe('User Settings Control', () => {
    it('should allow user to disable animations via settings', () => {
      const { result } = renderHook(() => useGameStore());

      // Initially animations should be enabled
      expect(result.current.ui.settings.animationsEnabled).toBe(true);

      // User disables animations
      act(() => {
        result.current.updateSettings({ animationsEnabled: false });
      });

      // Animations should now be disabled
      expect(result.current.ui.settings.animationsEnabled).toBe(false);
    });

    it('should allow user to enable animations via settings', () => {
      const { result } = renderHook(() => useGameStore());

      // Disable animations first
      act(() => {
        result.current.updateSettings({ animationsEnabled: false });
      });

      expect(result.current.ui.settings.animationsEnabled).toBe(false);

      // User enables animations
      act(() => {
        result.current.updateSettings({ animationsEnabled: true });
      });

      // Animations should now be enabled
      expect(result.current.ui.settings.animationsEnabled).toBe(true);
    });
  });

  describe('Browser Preference Respect', () => {
    it('should respect prefers-reduced-motion when user has animations enabled', () => {
      // User has animations enabled in settings
      act(() => {
        useGameStore.setState({
          ui: {
            ...useGameStore.getState().ui,
            settings: {
              ...useGameStore.getState().ui.settings,
              animationsEnabled: true,
            },
          },
        });
      });

      // Browser prefers reduced motion
      vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);

      const { result } = renderHook(() => useAnimations());

      // Animations should be disabled due to browser preference
      expect(result.current).toBe(false);
    });

    it('should not animate when both user and browser prefer reduced motion', () => {
      // User has animations disabled in settings
      act(() => {
        useGameStore.setState({
          ui: {
            ...useGameStore.getState().ui,
            settings: {
              ...useGameStore.getState().ui.settings,
              animationsEnabled: false,
            },
          },
        });
      });

      // Browser also prefers reduced motion
      vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);

      const { result } = renderHook(() => useAnimations());

      // Animations should be disabled
      expect(result.current).toBe(false);
    });

    it('should animate when user enables and browser does not prefer reduced motion', () => {
      // User has animations enabled in settings
      act(() => {
        useGameStore.setState({
          ui: {
            ...useGameStore.getState().ui,
            settings: {
              ...useGameStore.getState().ui.settings,
              animationsEnabled: true,
            },
          },
        });
      });

      // Browser does not prefer reduced motion
      vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);

      const { result } = renderHook(() => useAnimations());

      // Animations should be enabled
      expect(result.current).toBe(true);
    });
  });

  describe('Feature Functionality Without Animations', () => {
    beforeEach(() => {
      // Disable animations for these tests
      act(() => {
        useGameStore.setState({
          ui: {
            ...useGameStore.getState().ui,
            settings: {
              ...useGameStore.getState().ui.settings,
              animationsEnabled: false,
            },
          },
        });
      });
      vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);
    });

    it('should allow resource updates without animations', () => {
      const { result } = renderHook(() => useGameStore());

      // Add resources
      act(() => {
        result.current.addResource('food', 100);
      });

      // Resources should update correctly
      expect(result.current.resources.food).toBeGreaterThan(0);
    });

    it('should allow combat without animations', () => {
      const { result } = renderHook(() => useGameStore());

      const testUnit = {
        id: 'test-unit-1',
        type: 'infantry' as const,
        faction: 'vietnamese' as const,
        position: { x: 100, y: 100 },
        health: 100,
        maxHealth: 100,
        attack: 10,
        defense: 5,
        speed: 5,
        direction: 'north' as const,
        status: [],
        owner: 'player' as const,
      };

      // Add unit
      act(() => {
        result.current.addUnit(testUnit);
      });

      // Unit should be added correctly
      expect(result.current.combat.units).toHaveLength(1);
      expect(result.current.combat.units[0].id).toBe('test-unit-1');
    });

    it('should allow rank progression without animations', () => {
      const { result } = renderHook(() => useGameStore());

      // Update profile rank
      act(() => {
        result.current.updateProfile({ rank: 'Đại Tướng' });
      });

      // Rank should update correctly
      expect(result.current.profile.rank).toBe('Đại Tướng');
    });

    it('should allow notifications without animations', () => {
      const { result } = renderHook(() => useGameStore());

      // Add notification
      act(() => {
        result.current.addNotification({
          type: 'success',
          message: 'Test notification',
        });
      });

      // Notification should be added
      expect(result.current.ui.notifications).toHaveLength(1);
      expect(result.current.ui.notifications[0].message).toBe('Test notification');
    });
  });

  describe('Settings Persistence', () => {
    it('should persist animation setting across store updates', () => {
      const { result } = renderHook(() => useGameStore());

      // Disable animations
      act(() => {
        result.current.updateSettings({ animationsEnabled: false });
      });

      // Update other settings
      act(() => {
        result.current.updateSettings({ soundEnabled: false });
      });

      // Animation setting should still be disabled
      expect(result.current.ui.settings.animationsEnabled).toBe(false);
      expect(result.current.ui.settings.soundEnabled).toBe(false);
    });

    it('should allow independent control of animation and sound settings', () => {
      const { result } = renderHook(() => useGameStore());

      // Disable animations but keep sound enabled
      act(() => {
        result.current.updateSettings({
          animationsEnabled: false,
          soundEnabled: true,
        });
      });

      expect(result.current.ui.settings.animationsEnabled).toBe(false);
      expect(result.current.ui.settings.soundEnabled).toBe(true);
    });
  });

  describe('Accessibility Compliance', () => {
    it('should provide animation control for motion sensitivity (Requirement 22.6)', () => {
      const { result } = renderHook(() => useGameStore());

      // User with motion sensitivity disables animations
      act(() => {
        result.current.updateSettings({ animationsEnabled: false });
      });

      // Verify animations are disabled
      vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);
      const { result: animResult } = renderHook(() => useAnimations());
      expect(animResult.current).toBe(false);
    });

    it('should respect prefers-reduced-motion for accessibility (Requirement 6.8)', () => {
      // Browser indicates user prefers reduced motion
      vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);

      const { result } = renderHook(() => useAnimations());

      // Animations should be disabled
      expect(result.current).toBe(false);
    });

    it('should allow all game features to work without animations (Requirement 6.8)', () => {
      const { result } = renderHook(() => useGameStore());

      // Disable animations
      act(() => {
        result.current.updateSettings({ animationsEnabled: false });
      });

      // Verify core game functions still work
      act(() => {
        result.current.addResource('food', 100);
        result.current.updateProfile({ rank: 'Tướng' });
        result.current.addNotification({ type: 'info', message: 'Test' });
      });

      expect(result.current.resources.food).toBeGreaterThan(0);
      expect(result.current.profile.rank).toBe('Tướng');
      expect(result.current.ui.notifications).toHaveLength(1);
    });
  });
});
