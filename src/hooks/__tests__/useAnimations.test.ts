/**
 * Tests for useAnimations hook
 * Validates Requirements 6.8 and 22.6 (animation disable for accessibility)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnimations, useAnimationConfig } from '../useAnimations';
import { useGameStore } from '@/store';
import * as FramerMotion from 'framer-motion';

// Mock Framer Motion's useReducedMotion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(),
  };
});

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

describe('useAnimations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when animations are enabled and no reduced motion preference', () => {
    // Mock store to return animations enabled
    vi.mocked(useGameStore).mockReturnValue(true);
    // Mock browser to not prefer reduced motion
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);

    const { result } = renderHook(() => useAnimations());

    expect(result.current).toBe(true);
  });

  it('should return false when animations are disabled in settings', () => {
    // Mock store to return animations disabled
    vi.mocked(useGameStore).mockReturnValue(false);
    // Mock browser to not prefer reduced motion
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);

    const { result } = renderHook(() => useAnimations());

    expect(result.current).toBe(false);
  });

  it('should return false when browser prefers reduced motion', () => {
    // Mock store to return animations enabled
    vi.mocked(useGameStore).mockReturnValue(true);
    // Mock browser to prefer reduced motion
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);

    const { result } = renderHook(() => useAnimations());

    expect(result.current).toBe(false);
  });

  it('should return false when both settings disabled and browser prefers reduced motion', () => {
    // Mock store to return animations disabled
    vi.mocked(useGameStore).mockReturnValue(false);
    // Mock browser to prefer reduced motion
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);

    const { result } = renderHook(() => useAnimations());

    expect(result.current).toBe(false);
  });
});

describe('useAnimationConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return config with animations enabled', () => {
    // Mock animations enabled
    vi.mocked(useGameStore).mockReturnValue(true);
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);

    const { result } = renderHook(() => useAnimationConfig());

    expect(result.current.shouldAnimate).toBe(true);
    expect(result.current.transition).toBeUndefined();
    expect(result.current.initial).toBeUndefined();
  });

  it('should return config with animations disabled', () => {
    // Mock animations disabled
    vi.mocked(useGameStore).mockReturnValue(false);
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(false);

    const { result } = renderHook(() => useAnimationConfig());

    expect(result.current.shouldAnimate).toBe(false);
    expect(result.current.transition).toEqual({ duration: 0 });
    expect(result.current.initial).toBe(false);
  });

  it('should return config with reduced motion preference', () => {
    // Mock browser prefers reduced motion
    vi.mocked(useGameStore).mockReturnValue(true);
    vi.mocked(FramerMotion.useReducedMotion).mockReturnValue(true);

    const { result } = renderHook(() => useAnimationConfig());

    expect(result.current.shouldAnimate).toBe(false);
    expect(result.current.transition).toEqual({ duration: 0 });
    expect(result.current.initial).toBe(false);
  });
});
