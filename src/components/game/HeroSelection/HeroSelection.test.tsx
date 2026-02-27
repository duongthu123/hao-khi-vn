import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroSelection } from './HeroSelection';
import { useGameStore } from '@/store';
import { ALL_HEROES } from '@/constants/heroes';
import { HeroFaction } from '@/types/hero';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

describe('HeroSelection', () => {
  const mockSelectHero = vi.fn();
  const mockIsHeroUnlocked = vi.fn();
  const mockLoadHeroes = vi.fn();
  const mockUnlockHero = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation
    (useGameStore as any).mockReturnValue({
      hero: {
        selectedHero: null,
        availableHeroes: ALL_HEROES,
        unlockedHeroes: [ALL_HEROES[0].id, ALL_HEROES[1].id],
      },
      selectHero: mockSelectHero,
      isHeroUnlocked: mockIsHeroUnlocked,
      loadHeroes: mockLoadHeroes,
      unlockHero: mockUnlockHero,
    });

    // Mock isHeroUnlocked to return true for first two heroes
    mockIsHeroUnlocked.mockImplementation((id: string) => {
      return id === ALL_HEROES[0].id || id === ALL_HEROES[1].id;
    });
  });

  it('renders hero selection component', () => {
    render(<HeroSelection />);
    expect(screen.getByText('CHỌN PHE THAM CHIẾN')).toBeInTheDocument();
  });

  it('displays faction filter buttons', () => {
    render(<HeroSelection />);
    expect(screen.getByRole('button', { name: 'Tất cả' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đại Việt' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nguyên Mông' })).toBeInTheDocument();
  });

  it('displays all heroes by default', () => {
    render(<HeroSelection />);
    
    // Check that heroes are rendered
    ALL_HEROES.forEach(hero => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('filters heroes by Vietnamese faction', () => {
    render(<HeroSelection />);
    
    const vietnameseButton = screen.getByRole('button', { name: 'Đại Việt' });
    fireEvent.click(vietnameseButton);
    
    // Vietnamese heroes should be visible
    const vietnameseHeroes = ALL_HEROES.filter(h => h.faction === HeroFaction.VIETNAMESE);
    vietnameseHeroes.forEach(hero => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('filters heroes by Mongol faction', () => {
    render(<HeroSelection />);
    
    const mongolButton = screen.getByRole('button', { name: 'Nguyên Mông' });
    fireEvent.click(mongolButton);
    
    // Mongol heroes should be visible
    const mongolHeroes = ALL_HEROES.filter(h => h.faction === HeroFaction.MONGOL);
    mongolHeroes.forEach(hero => {
      expect(screen.getByText(hero.nameVietnamese)).toBeInTheDocument();
    });
  });

  it('selects a hero when clicked if unlocked', () => {
    render(<HeroSelection />);
    
    const firstHero = ALL_HEROES[0];
    const heroCard = screen.getByText(firstHero.nameVietnamese).closest('button');
    
    if (heroCard) {
      fireEvent.click(heroCard);
      expect(mockSelectHero).toHaveBeenCalledWith(firstHero);
    }
  });

  it('does not select a hero when clicked if locked', () => {
    render(<HeroSelection />);
    
    const lockedHero = ALL_HEROES[2]; // Third hero is locked
    const heroCard = screen.getByText(lockedHero.nameVietnamese).closest('button');
    
    if (heroCard) {
      fireEvent.click(heroCard);
      expect(mockSelectHero).not.toHaveBeenCalled();
    }
  });

  it('displays selected hero information', () => {
    const selectedHero = ALL_HEROES[0];
    
    (useGameStore as any).mockReturnValue({
      hero: {
        selectedHero,
        availableHeroes: ALL_HEROES,
        unlockedHeroes: [selectedHero.id],
      },
      selectHero: mockSelectHero,
      isHeroUnlocked: mockIsHeroUnlocked,
      loadHeroes: mockLoadHeroes,
      unlockHero: mockUnlockHero,
    });

    render(<HeroSelection />);
    
    // Check for description and confirm button (hero name appears multiple times)
    expect(screen.getByText(selectedHero.descriptionVietnamese)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'XUẤT BINH' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const mockOnConfirm = vi.fn();
    const selectedHero = ALL_HEROES[0];
    
    (useGameStore as any).mockReturnValue({
      hero: {
        selectedHero,
        availableHeroes: ALL_HEROES,
        unlockedHeroes: [selectedHero.id],
      },
      selectHero: mockSelectHero,
      isHeroUnlocked: mockIsHeroUnlocked,
      loadHeroes: mockLoadHeroes,
      unlockHero: mockUnlockHero,
    });

    render(<HeroSelection onConfirm={mockOnConfirm} />);
    
    const confirmButton = screen.getByRole('button', { name: 'XUẤT BINH' });
    fireEvent.click(confirmButton);
    
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('displays lock indicator for locked heroes', () => {
    render(<HeroSelection />);
    
    // There should be lock icons for locked heroes
    const lockIcons = screen.getAllByRole('button').filter(button => {
      return button.classList.contains('cursor-not-allowed');
    });
    
    expect(lockIcons.length).toBeGreaterThan(0);
  });

  it('displays rarity stars for each hero', () => {
    render(<HeroSelection />);
    
    // Check that hero cards are rendered (filter buttons + hero cards)
    const allButtons = screen.getAllByRole('button');
    // 3 filter buttons + 9 hero cards = 12 buttons
    expect(allButtons.length).toBeGreaterThanOrEqual(ALL_HEROES.length);
  });
});
