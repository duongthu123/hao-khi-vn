/**
 * RankUpAnimationContainer Component Tests
 * Tests the container that connects rank-up animation to store state
 * 
 * Validates Requirements 18.6 (award rank promotions)
 * Validates Requirements 18.8 (update displays immediately)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RankUpAnimationContainer } from '../RankUpAnimationContainer';
import { useGameStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

// Mock the RankUpAnimation component
vi.mock('../RankUpAnimation', () => ({
  RankUpAnimation: ({ newRank, onComplete }: any) => (
    <div data-testid="rank-up-animation">
      <span>{newRank}</span>
      <button onClick={onComplete}>Complete</button>
    </div>
  ),
}));

describe('RankUpAnimationContainer', () => {
  const mockHideRankUpAnimation = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when animation is not visible', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        ui: {
          rankUpAnimation: {
            isVisible: false,
            newRank: null,
          },
        },
        hideRankUpAnimation: mockHideRankUpAnimation,
      };
      return selector(state);
    });

    const { container } = render(<RankUpAnimationContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when newRank is null', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        ui: {
          rankUpAnimation: {
            isVisible: true,
            newRank: null,
          },
        },
        hideRankUpAnimation: mockHideRankUpAnimation,
      };
      return selector(state);
    });

    const { container } = render(<RankUpAnimationContainer />);
    expect(container.firstChild).toBeNull();
  });

  it('should render RankUpAnimation when visible and rank is set', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        ui: {
          rankUpAnimation: {
            isVisible: true,
            newRank: 'Chiến Binh',
          },
        },
        hideRankUpAnimation: mockHideRankUpAnimation,
      };
      return selector(state);
    });

    render(<RankUpAnimationContainer />);
    
    expect(screen.getByTestId('rank-up-animation')).toBeInTheDocument();
    expect(screen.getByText('Chiến Binh')).toBeInTheDocument();
  });

  it('should call hideRankUpAnimation when animation completes', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        ui: {
          rankUpAnimation: {
            isVisible: true,
            newRank: 'Đại Tướng',
          },
        },
        hideRankUpAnimation: mockHideRankUpAnimation,
      };
      return selector(state);
    });

    render(<RankUpAnimationContainer />);
    
    const completeButton = screen.getByText('Complete');
    completeButton.click();
    
    expect(mockHideRankUpAnimation).toHaveBeenCalledTimes(1);
  });
});
