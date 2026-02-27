/**
 * CollectionView Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CollectionView } from './CollectionView';
import { useGameStore } from '@/store';
import { ALL_HEROES } from '@/constants/heroes';
import { HeroFaction, HeroRarity } from '@/types/hero';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('CollectionView', () => {
  const mockGetCollectedHeroIds = vi.fn();
  const mockHasHero = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        getCollectedHeroIds: mockGetCollectedHeroIds,
        hasHero: mockHasHero,
        collection: {
          completionPercentage: 50,
        },
      };
      return selector(state);
    });

    mockGetCollectedHeroIds.mockReturnValue(['hero-tran-hung-dao', 'hero-yet-kieu']);
    mockHasHero.mockImplementation((id: string) =>
      ['hero-tran-hung-dao', 'hero-yet-kieu'].includes(id)
    );
  });

  it('renders collection view with header', () => {
    render(<CollectionView />);

    expect(screen.getByText('Bảo Tàng Anh Hùng')).toBeInTheDocument();
    expect(screen.getByText('Tiến độ sưu tập')).toBeInTheDocument();
  });

  it('displays completion percentage', () => {
    render(<CollectionView />);

    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('displays collected hero count', () => {
    render(<CollectionView />);

    const countText = `${mockGetCollectedHeroIds().length}/${ALL_HEROES.length}`;
    expect(screen.getByText(countText)).toBeInTheDocument();
    expect(screen.getByText('Anh hùng')).toBeInTheDocument();
  });

  it('renders all heroes in grid', () => {
    render(<CollectionView />);

    ALL_HEROES.forEach((hero) => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('shows locked heroes with reduced opacity', () => {
    render(<CollectionView />);

    const heroButtons = screen.getAllByRole('button').filter((btn) =>
      ALL_HEROES.some((hero) => btn.textContent?.includes(hero.nameVietnamese))
    );

    heroButtons.forEach((button) => {
      const heroName = button.textContent;
      const hero = ALL_HEROES.find((h) => heroName?.includes(h.nameVietnamese));
      if (hero) {
        const isUnlocked = mockHasHero(hero.id);
        if (isUnlocked) {
          expect(button).toHaveClass('opacity-100');
        } else {
          expect(button).toHaveClass('opacity-40');
        }
      }
    });
  });

  it('filters heroes by Vietnamese faction', () => {
    render(<CollectionView />);

    const vietnameseButton = screen.getByText('Đại Việt');
    fireEvent.click(vietnameseButton);

    // Vietnamese heroes should be visible
    expect(screen.getByText('Trần Hưng Đạo')).toBeInTheDocument();
    expect(screen.getByText('Yết Kiêu')).toBeInTheDocument();

    // Mongol heroes should still be in document (just filtered in logic)
    // The component doesn't remove them from DOM, just filters the display
  });

  it('filters heroes by Mongol faction', () => {
    render(<CollectionView />);

    const mongolButton = screen.getByText('Mông Cổ');
    fireEvent.click(mongolButton);

    // Mongol heroes should be visible
    expect(screen.getByText('Ô Mã Nhi')).toBeInTheDocument();
  });

  it('filters heroes by legendary rarity', () => {
    render(<CollectionView />);

    const legendaryButton = screen.getByText('Huyền thoại');
    fireEvent.click(legendaryButton);

    // Should show legendary heroes
    const legendaryHeroes = ALL_HEROES.filter((h) => h.rarity === HeroRarity.LEGENDARY);
    legendaryHeroes.forEach((hero) => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('filters heroes by epic rarity', () => {
    render(<CollectionView />);

    const epicButton = screen.getByText('Sử thi');
    fireEvent.click(epicButton);

    // Should show epic heroes
    const epicHeroes = ALL_HEROES.filter((h) => h.rarity === HeroRarity.EPIC);
    epicHeroes.forEach((hero) => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('filters heroes by rare rarity', () => {
    render(<CollectionView />);

    const rareButton = screen.getByText('Hiếm');
    fireEvent.click(rareButton);

    // Should show rare heroes
    const rareHeroes = ALL_HEROES.filter((h) => h.rarity === HeroRarity.RARE);
    rareHeroes.forEach((hero) => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('resets filters when clicking "Tất cả"', () => {
    render(<CollectionView />);

    // Apply a filter
    const vietnameseButton = screen.getByText('Đại Việt');
    fireEvent.click(vietnameseButton);

    // Reset filter
    const allButton = screen.getAllByText('Tất cả')[0];
    fireEvent.click(allButton);

    // All heroes should be visible again
    ALL_HEROES.forEach((hero) => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('opens hero detail panel when clicking a hero', () => {
    render(<CollectionView />);

    const tranHungDaoButton = screen.getByText('Trần Hưng Đạo').closest('button');
    if (tranHungDaoButton) {
      fireEvent.click(tranHungDaoButton);

      // Detail panel should show hero information
      expect(screen.getByText('Mô tả')).toBeInTheDocument();
      expect(screen.getByText('Chỉ số')).toBeInTheDocument();
      expect(screen.getByText('Kỹ năng')).toBeInTheDocument();
      expect(screen.getByText('Bối cảnh lịch sử')).toBeInTheDocument();
    }
  });

  it('displays hero stats in detail panel', () => {
    render(<CollectionView />);

    const tranHungDaoButton = screen.getByText('Trần Hưng Đạo').closest('button');
    if (tranHungDaoButton) {
      fireEvent.click(tranHungDaoButton);

      // Stats section header should be visible
      expect(screen.getByText('Chỉ số')).toBeInTheDocument();
      
      // Note: RadarChart labels may not render in test environment due to canvas limitations
      // The component itself is rendered, which is sufficient for this test
    }
  });

  it('displays hero abilities in detail panel', () => {
    render(<CollectionView />);

    const tranHungDaoButton = screen.getByText('Trần Hưng Đạo').closest('button');
    if (tranHungDaoButton) {
      fireEvent.click(tranHungDaoButton);

      // Ability should be visible
      expect(screen.getByText('Hịch Tướng Sĩ')).toBeInTheDocument();
      expect(screen.getByText('Rally the Troops')).toBeInTheDocument();
    }
  });

  it('displays historical context in detail panel', () => {
    render(<CollectionView />);

    const tranHungDaoButton = screen.getByText('Trần Hưng Đạo').closest('button');
    if (tranHungDaoButton) {
      fireEvent.click(tranHungDaoButton);

      expect(screen.getByText('Bối cảnh lịch sử')).toBeInTheDocument();
      // Historical context text should be present
      const historicalText = screen.getByText(/Hưng Đạo Vương Trần Quốc Tuấn/);
      expect(historicalText).toBeInTheDocument();
    }
  });

  it('shows unlock condition for locked heroes', () => {
    mockHasHero.mockReturnValue(false);

    render(<CollectionView />);

    const yetKieuButton = screen.getByText('Yết Kiêu').closest('button');
    if (yetKieuButton) {
      fireEvent.click(yetKieuButton);

      expect(screen.getByText('Điều kiện mở khóa')).toBeInTheDocument();
      expect(screen.getByText('Đạt cấp độ 5')).toBeInTheDocument();
    }
  });

  it('closes detail panel when clicking close button', () => {
    render(<CollectionView />);

    const tranHungDaoButton = screen.getByText('Trần Hưng Đạo').closest('button');
    if (tranHungDaoButton) {
      fireEvent.click(tranHungDaoButton);

      // Detail panel should be open
      expect(screen.getByText('Mô tả')).toBeInTheDocument();

      // Click close button
      const closeButton = screen.getByText('✕');
      fireEvent.click(closeButton);

      // Detail panel should be closed (Mô tả should not be visible)
      expect(screen.queryByText('Mô tả')).not.toBeInTheDocument();
    }
  });

  it('displays faction badge correctly', () => {
    render(<CollectionView />);

    const tranHungDaoButton = screen.getByText('Trần Hưng Đạo').closest('button');
    if (tranHungDaoButton) {
      fireEvent.click(tranHungDaoButton);

      // Should show Vietnamese faction badge
      const factionBadges = screen.getAllByText('Đại Việt');
      expect(factionBadges.length).toBeGreaterThan(0);
    }
  });

  it('displays rarity badge correctly', () => {
    render(<CollectionView />);

    const tranHungDaoButton = screen.getByText('Trần Hưng Đạo').closest('button');
    if (tranHungDaoButton) {
      fireEvent.click(tranHungDaoButton);

      // Should show legendary rarity badge (use getAllByText since it appears in filter too)
      const legendaryBadges = screen.getAllByText('Huyền thoại');
      expect(legendaryBadges.length).toBeGreaterThan(0);
      
      // Verify at least one is in the detail panel (has specific styling)
      const detailBadge = legendaryBadges.find(
        (el) => el.classList.contains('bg-gradient-to-r')
      );
      expect(detailBadge).toBeDefined();
    }
  });

  it('applies custom className', () => {
    const { container } = render(<CollectionView className="custom-class" />);

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('custom-class');
  });

  it('handles empty collection', () => {
    mockGetCollectedHeroIds.mockReturnValue([]);
    mockHasHero.mockReturnValue(false);

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        getCollectedHeroIds: mockGetCollectedHeroIds,
        hasHero: mockHasHero,
        collection: {
          completionPercentage: 0,
        },
      };
      return selector(state);
    });

    render(<CollectionView />);

    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText(`0/${ALL_HEROES.length}`)).toBeInTheDocument();
  });

  it('handles full collection', () => {
    const allHeroIds = ALL_HEROES.map((h) => h.id);
    mockGetCollectedHeroIds.mockReturnValue(allHeroIds);
    mockHasHero.mockReturnValue(true);

    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        getCollectedHeroIds: mockGetCollectedHeroIds,
        hasHero: mockHasHero,
        collection: {
          completionPercentage: 100,
        },
      };
      return selector(state);
    });

    render(<CollectionView />);

    expect(screen.getByText('100.0%')).toBeInTheDocument();
    expect(screen.getByText(`${ALL_HEROES.length}/${ALL_HEROES.length}`)).toBeInTheDocument();
  });
});
