import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroDetail } from './HeroDetail';
import { Hero, HeroFaction, HeroRarity } from '@/types/hero';

const mockHero: Hero = {
  id: 'hero-test',
  name: 'Test Hero',
  nameVietnamese: 'Tướng Thử Nghiệm',
  faction: HeroFaction.VIETNAMESE,
  rarity: HeroRarity.EPIC,
  stats: {
    attack: 85,
    defense: 75,
    speed: 90,
    leadership: 80,
    intelligence: 70,
  },
  abilities: [
    {
      id: 'ability-test',
      name: 'Test Ability',
      nameVietnamese: 'Kỹ Năng Thử Nghiệm',
      description: 'Test ability description',
      descriptionVietnamese: 'Mô tả kỹ năng thử nghiệm',
      cooldown: 60,
      cost: 100,
      effect: {
        type: 'buff',
        stat: 'attack',
        value: 20,
        duration: 30,
      },
    },
  ],
  portrait: '/images/heroes/test.png',
  description: 'Test hero description',
  descriptionVietnamese: 'Mô tả tướng thử nghiệm',
  historicalContext: 'Test historical context',
  historicalContextVietnamese: 'Bối cảnh lịch sử thử nghiệm',
};

const mockComparisonHero: Hero = {
  ...mockHero,
  id: 'hero-comparison',
  name: 'Comparison Hero',
  nameVietnamese: 'Tướng So Sánh',
  stats: {
    attack: 90,
    defense: 80,
    speed: 85,
    leadership: 85,
    intelligence: 75,
  },
};

describe('HeroDetail', () => {
  it('renders hero information correctly', () => {
    render(<HeroDetail hero={mockHero} />);

    expect(screen.getByText('Tướng Thử Nghiệm')).toBeInTheDocument();
    expect(screen.getByText('Mô tả tướng thử nghiệm')).toBeInTheDocument();
    expect(screen.getByText('Đại Việt')).toBeInTheDocument();
  });

  it('displays hero stats by default', () => {
    render(<HeroDetail hero={mockHero} />);

    expect(screen.getByText('Chi tiết chỉ số')).toBeInTheDocument();
    expect(screen.getByText('Tấn công')).toBeInTheDocument();
    expect(screen.getByText('Phòng thủ')).toBeInTheDocument();
    expect(screen.getByText('Tốc độ')).toBeInTheDocument();
    expect(screen.getByText('Lãnh đạo')).toBeInTheDocument();
    expect(screen.getByText('Trí tuệ')).toBeInTheDocument();
  });

  it('switches to abilities tab when clicked', () => {
    render(<HeroDetail hero={mockHero} />);

    const abilitiesTab = screen.getByText('Kỹ năng');
    fireEvent.click(abilitiesTab);

    expect(screen.getByText('Kỹ năng đặc biệt')).toBeInTheDocument();
    expect(screen.getByText('Kỹ Năng Thử Nghiệm')).toBeInTheDocument();
    expect(screen.getByText('Mô tả kỹ năng thử nghiệm')).toBeInTheDocument();
  });

  it('switches to history tab when clicked', () => {
    render(<HeroDetail hero={mockHero} />);

    const historyTab = screen.getByText('Lịch sử');
    fireEvent.click(historyTab);

    expect(screen.getByText('Bối cảnh lịch sử')).toBeInTheDocument();
    expect(screen.getByText('Bối cảnh lịch sử thử nghiệm')).toBeInTheDocument();
  });

  it('displays comparison heroes when provided', () => {
    render(
      <HeroDetail
        hero={mockHero}
        comparisonHeroes={[mockComparisonHero]}
      />
    );

    expect(screen.getByText('So sánh với')).toBeInTheDocument();
    expect(screen.getByText('Tướng So Sánh')).toBeInTheDocument();
  });

  it('calls onRemoveComparison when remove button is clicked', () => {
    const onRemoveComparison = vi.fn();
    render(
      <HeroDetail
        hero={mockHero}
        comparisonHeroes={[mockComparisonHero]}
        onRemoveComparison={onRemoveComparison}
      />
    );

    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(
      (button) => button.querySelector('svg path[d*="M6 18L18 6"]')
    );

    if (removeButton) {
      fireEvent.click(removeButton);
      expect(onRemoveComparison).toHaveBeenCalledWith('hero-comparison');
    }
  });

  it('displays ability cooldown and cost', () => {
    render(<HeroDetail hero={mockHero} />);

    const abilitiesTab = screen.getByText('Kỹ năng');
    fireEvent.click(abilitiesTab);

    expect(screen.getByText('60s')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('displays correct rarity badge', () => {
    render(<HeroDetail hero={mockHero} />);

    expect(screen.getByText('Sử thi')).toBeInTheDocument();
  });

  it('displays message when hero has no abilities', () => {
    const heroWithoutAbilities: Hero = {
      ...mockHero,
      abilities: [],
    };

    render(<HeroDetail hero={heroWithoutAbilities} />);

    const abilitiesTab = screen.getByText('Kỹ năng');
    fireEvent.click(abilitiesTab);

    expect(screen.getByText('Tướng này chưa có kỹ năng đặc biệt')).toBeInTheDocument();
  });

  it('displays Mongol faction correctly', () => {
    const mongolHero: Hero = {
      ...mockHero,
      faction: HeroFaction.MONGOL,
    };

    render(<HeroDetail hero={mongolHero} />);

    expect(screen.getByText('Mông Cổ')).toBeInTheDocument();
  });

  it('displays all rarity types correctly', () => {
    const rarities: Array<{ rarity: HeroRarity; label: string }> = [
      { rarity: HeroRarity.COMMON, label: 'Thường' },
      { rarity: HeroRarity.RARE, label: 'Hiếm' },
      { rarity: HeroRarity.EPIC, label: 'Sử thi' },
      { rarity: HeroRarity.LEGENDARY, label: 'Huyền thoại' },
    ];

    rarities.forEach(({ rarity, label }) => {
      const { unmount } = render(
        <HeroDetail hero={{ ...mockHero, rarity }} />
      );
      expect(screen.getByText(label)).toBeInTheDocument();
      unmount();
    });
  });
});
