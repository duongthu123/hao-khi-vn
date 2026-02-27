/**
 * Tests for RankUpAnimation accessibility features
 * Validates Requirements 6.8 and 22.6 (animation disable for accessibility)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankUpAnimation } from '../RankUpAnimation';
import * as useAnimationsHook from '@/hooks/useAnimations';
import * as soundManager from '@/lib/audio/soundManager';

// Mock the useAnimations hook
vi.mock('@/hooks/useAnimations', () => ({
  useAnimations: vi.fn(),
}));

// Mock sound manager
vi.mock('@/lib/audio/soundManager', () => ({
  soundManager: {
    play: vi.fn(),
  },
  SoundEffect: {
    RANK_UP: 'rank_up',
  },
}));

describe('RankUpAnimation - Accessibility', () => {
  const mockOnComplete = vi.fn();
  const testRank = 'Đại Tướng';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render animated version when animations are enabled', () => {
    // Mock animations enabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(true);

    const { container } = render(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );

    // Should render the animated version with motion elements
    expect(screen.getByText('THĂNG CẤP BẬC!')).toBeInTheDocument();
    expect(screen.getByText(testRank)).toBeInTheDocument();
    expect(screen.getByText('Chúc mừng chiến binh!')).toBeInTheDocument();
  });

  it('should render static version when animations are disabled', () => {
    // Mock animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);

    render(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );

    // Should still show the content but without animations
    expect(screen.getByText('THĂNG CẤP BẬC!')).toBeInTheDocument();
    expect(screen.getByText(testRank)).toBeInTheDocument();
    expect(screen.getByText('Chúc mừng chiến binh!')).toBeInTheDocument();
  });

  it('should play sound effect regardless of animation setting', () => {
    // Mock animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);

    render(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );

    // Sound should still play
    expect(soundManager.soundManager.play).toHaveBeenCalledWith('rank_up');
  });

  it('should call onComplete after duration with animations enabled', () => {
    // Mock animations enabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(true);

    render(
      <RankUpAnimation 
        newRank={testRank} 
        onComplete={mockOnComplete}
        duration={2000}
      />
    );

    // Fast-forward time
    vi.advanceTimersByTime(2500);

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should call onComplete after duration with animations disabled', () => {
    // Mock animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);

    render(
      <RankUpAnimation 
        newRank={testRank} 
        onComplete={mockOnComplete}
        duration={2000}
      />
    );

    // Fast-forward time
    vi.advanceTimersByTime(2500);

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should display rank icon in both animated and static versions', () => {
    // Test with animations enabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(true);
    const { rerender } = render(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );
    
    let container = screen.getByText(testRank).closest('div');
    expect(container).toBeInTheDocument();

    // Test with animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);
    rerender(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );
    
    container = screen.getByText(testRank).closest('div');
    expect(container).toBeInTheDocument();
  });

  it('should have proper backdrop in both versions', () => {
    // Test with animations enabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(true);
    const { container: animatedContainer } = render(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );
    
    expect(animatedContainer.querySelector('.bg-black\\/60')).toBeInTheDocument();

    // Test with animations disabled
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);
    const { container: staticContainer } = render(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );
    
    expect(staticContainer.querySelector('.bg-black\\/60')).toBeInTheDocument();
  });

  it('should be accessible with screen readers in static mode', () => {
    // Mock animations disabled for accessibility
    vi.mocked(useAnimationsHook.useAnimations).mockReturnValue(false);

    render(
      <RankUpAnimation newRank={testRank} onComplete={mockOnComplete} />
    );

    // All important text should be present and readable
    expect(screen.getByText('THĂNG CẤP BẬC!')).toBeInTheDocument();
    expect(screen.getByText(testRank)).toBeInTheDocument();
    expect(screen.getByText('Chúc mừng chiến binh!')).toBeInTheDocument();
  });
});
