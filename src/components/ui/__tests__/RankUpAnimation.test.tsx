/**
 * RankUpAnimation Component Tests
 * Tests rank-up celebration animation display
 * 
 * Validates Requirements 18.6 (award rank promotions)
 * Validates Requirements 18.8 (update displays immediately)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankUpAnimation } from '../RankUpAnimation';
import { soundManager } from '@/lib/audio/soundManager';

// Mock sound manager
vi.mock('@/lib/audio/soundManager', () => ({
  soundManager: {
    play: vi.fn(),
  },
  SoundEffect: {
    RANK_UP: 'rank-up',
  },
}));

describe('RankUpAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render rank-up animation with rank name', () => {
    render(<RankUpAnimation newRank="Chiến Binh" />);
    
    expect(screen.getByText('THĂNG CẤP BẬC!')).toBeInTheDocument();
    expect(screen.getByText('Chiến Binh')).toBeInTheDocument();
    expect(screen.getByText('Chúc mừng chiến binh!')).toBeInTheDocument();
  });

  it('should play rank-up sound effect on mount', () => {
    render(<RankUpAnimation newRank="Chiến Binh" />);
    
    expect(soundManager.play).toHaveBeenCalledWith('rank-up');
  });

  it('should display correct icon for Nguyên Soái rank', () => {
    const { container } = render(<RankUpAnimation newRank="Nguyên Soái" />);
    
    expect(container.textContent).toContain('👑');
  });

  it('should display correct icon for Đại Tướng rank', () => {
    const { container } = render(<RankUpAnimation newRank="Đại Tướng" />);
    
    expect(container.textContent).toContain('⭐');
  });

  it('should display correct icon for Tướng rank', () => {
    const { container } = render(<RankUpAnimation newRank="Tiểu Tướng" />);
    
    expect(container.textContent).toContain('🎖️');
  });

  it('should display correct icon for Đội Trưởng rank', () => {
    const { container } = render(<RankUpAnimation newRank="Đội Trưởng" />);
    
    expect(container.textContent).toContain('🛡️');
  });

  it('should render enhanced celebration particles', () => {
    const { container } = render(<RankUpAnimation newRank="Chiến Binh" />);
    
    // Should have multiple particle elements with various colors
    const yellowParticles = container.querySelectorAll('.bg-yellow-400');
    const orangeParticles = container.querySelectorAll('.bg-orange-400');
    const redParticles = container.querySelectorAll('.bg-red-400');
    
    expect(yellowParticles.length).toBeGreaterThan(0);
    expect(orangeParticles.length).toBeGreaterThan(0);
    expect(redParticles.length).toBeGreaterThan(0);
  });

  it('should render confetti effect', () => {
    const { container } = render(<RankUpAnimation newRank="Chiến Binh" />);
    
    // Should have confetti elements with various colors
    const confetti = container.querySelectorAll('[class*="bg-"][class*="-300"]');
    expect(confetti.length).toBeGreaterThan(0);
  });

  it('should render decorative stars in circular pattern', () => {
    const { container } = render(<RankUpAnimation newRank="Chiến Binh" />);
    
    // Should have star emojis
    expect(container.textContent).toContain('⭐');
  });

  it('should render light rays', () => {
    const { container } = render(<RankUpAnimation newRank="Chiến Binh" />);
    
    // Should have gradient elements for light rays
    const rays = container.querySelectorAll('[class*="bg-gradient-to-t"]');
    expect(rays.length).toBeGreaterThan(0);
  });

  it('should apply correct gradient for different ranks', () => {
    const { container: container1 } = render(
      <RankUpAnimation newRank="Nguyên Soái" />
    );
    expect(container1.innerHTML).toContain('from-yellow-400');
    
    const { container: container2 } = render(
      <RankUpAnimation newRank="Đại Tướng" />
    );
    expect(container2.innerHTML).toContain('from-purple-400');
    
    const { container: container3 } = render(
      <RankUpAnimation newRank="Tiểu Tướng" />
    );
    expect(container3.innerHTML).toContain('from-blue-400');
  });

  it('should have enhanced glow effects', () => {
    const { container } = render(<RankUpAnimation newRank="Chiến Binh" />);
    
    // Should have multiple blur layers for glow
    const blurElements = container.querySelectorAll('[class*="blur-"]');
    expect(blurElements.length).toBeGreaterThan(1);
  });

  it('should have rotating ring effect', () => {
    const { container } = render(<RankUpAnimation newRank="Chiến Binh" />);
    
    // Should have border element for rotating ring
    const rings = container.querySelectorAll('[class*="border-"]');
    expect(rings.length).toBeGreaterThan(0);
  });
});
