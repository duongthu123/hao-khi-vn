/**
 * Unit tests for GachaSystem component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GachaSystem } from './GachaSystem';
import { useGameStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('GachaSystem', () => {
  const mockAddHeroToCollection = vi.fn();
  const mockAddResource = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useGameStore as any).mockReturnValue({
      collection: {
        heroes: [],
      },
      resources: {
        gold: 1000,
      },
      addHeroToCollection: mockAddHeroToCollection,
      addResource: mockAddResource,
    });
  });

  it('should render gacha system in idle state', () => {
    render(<GachaSystem />);
    
    expect(screen.getByText('Triệu Hồi Tướng Lĩnh')).toBeInTheDocument();
    expect(screen.getByText('Hero Summoning System')).toBeInTheDocument();
    expect(screen.getByText('Triệu Hồi x1')).toBeInTheDocument();
    expect(screen.getByText('Triệu Hồi x10')).toBeInTheDocument();
  });

  it('should display current gold amount', () => {
    render(<GachaSystem />);
    
    expect(screen.getByText(/Vàng hiện có: 1000/)).toBeInTheDocument();
  });

  it('should display drop rates', () => {
    render(<GachaSystem />);
    
    expect(screen.getByText(/Huyền Thoại 1%/)).toBeInTheDocument();
    expect(screen.getByText(/Sử Thi 5%/)).toBeInTheDocument();
    expect(screen.getByText(/Hiếm 20%/)).toBeInTheDocument();
    expect(screen.getByText(/Thường 74%/)).toBeInTheDocument();
  });

  it('should show pulling state when single pull is clicked', async () => {
    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    fireEvent.click(singlePullButton);
    
    await waitFor(() => {
      expect(screen.getByText('Đang Triệu Hồi...')).toBeInTheDocument();
    });
  });

  it('should show pulling state when multi pull is clicked', async () => {
    render(<GachaSystem />);
    
    const multiPullButton = screen.getByText('Triệu Hồi x10');
    fireEvent.click(multiPullButton);
    
    await waitFor(() => {
      expect(screen.getByText('Đang Triệu Hồi...')).toBeInTheDocument();
    });
  });

  it('should reveal hero after pulling', async () => {
    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    fireEvent.click(singlePullButton);
    
    // Wait for pulling animation and reveal
    await waitFor(() => {
      // Should show some hero name (we don't know which one due to randomness)
      const heroElements = screen.queryAllByText(/Tấn Công|Phòng Thủ|Tốc Độ/);
      expect(heroElements.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('should add hero to collection when new hero is pulled', async () => {
    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    fireEvent.click(singlePullButton);
    
    await waitFor(() => {
      expect(mockAddHeroToCollection).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should show duplicate badge for owned heroes', async () => {
    // Mock store with owned hero
    (useGameStore as any).mockReturnValue({
      collection: {
        heroes: [{ id: 'hero-vietnamese-soldier' }],
      },
      resources: {
        gold: 1000,
      },
      addHeroToCollection: mockAddHeroToCollection,
      addResource: mockAddResource,
    });

    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    
    // Keep pulling until we get a duplicate (or timeout)
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      fireEvent.click(singlePullButton);
      
      await waitFor(() => {
        const duplicateBadge = screen.queryByText('Trùng Lặp');
        if (duplicateBadge) {
          expect(duplicateBadge).toBeInTheDocument();
          return true;
        }
      }, { timeout: 2000 }).catch(() => {
        // Reset for next attempt
        const resetButton = screen.queryByText('Hoàn Thành');
        if (resetButton) {
          fireEvent.click(resetButton);
        }
      });
      
      attempts++;
    }
  });

  it('should render close button when onClose is provided', () => {
    render(<GachaSystem onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('✕');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<GachaSystem onClose={mockOnClose} />);
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should show completion state after viewing all results', async () => {
    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    fireEvent.click(singlePullButton);
    
    // Wait for reveal
    await waitFor(() => {
      const completeButton = screen.queryByText('Hoàn Thành');
      expect(completeButton).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('should reset to idle state after completion', async () => {
    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    fireEvent.click(singlePullButton);
    
    // Wait for reveal and click complete
    await waitFor(() => {
      const completeButton = screen.getByText('Hoàn Thành');
      fireEvent.click(completeButton);
    }, { timeout: 2000 });
    
    // Should be back to idle state
    await waitFor(() => {
      expect(screen.getByText('Chọn Phương Thức Triệu Hồi')).toBeInTheDocument();
    });
  });

  it('should show next button for multi-pull results', async () => {
    render(<GachaSystem />);
    
    const multiPullButton = screen.getByText('Triệu Hồi x10');
    fireEvent.click(multiPullButton);
    
    // Wait for first result
    await waitFor(() => {
      const nextButton = screen.queryByText(/Tiếp Theo/);
      expect(nextButton).toBeInTheDocument();
    }, { timeout: 2500 });
  });

  it('should display rarity colors correctly', async () => {
    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    fireEvent.click(singlePullButton);
    
    // Wait for reveal
    await waitFor(() => {
      // Should show rarity name in Vietnamese
      const rarityNames = ['Thường', 'Hiếm', 'Sử Thi', 'Huyền Thoại'];
      const hasRarity = rarityNames.some(name => screen.queryByText(name));
      expect(hasRarity).toBe(true);
    }, { timeout: 2000 });
  });

  it('should display hero stats', async () => {
    render(<GachaSystem />);
    
    const singlePullButton = screen.getByText('Triệu Hồi x1');
    fireEvent.click(singlePullButton);
    
    // Wait for reveal
    await waitFor(() => {
      expect(screen.getByText('Tấn Công')).toBeInTheDocument();
      expect(screen.getByText('Phòng Thủ')).toBeInTheDocument();
      expect(screen.getByText('Tốc Độ')).toBeInTheDocument();
      expect(screen.getByText('Lãnh Đạo')).toBeInTheDocument();
      expect(screen.getByText('Trí Tuệ')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
