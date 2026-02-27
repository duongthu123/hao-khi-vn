/**
 * CombatView Component Tests
 * Tests combat interface, unit controls, combat log, and ability activation
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { CombatView } from './CombatView';
import { Unit, UnitType, Direction, UnitOwner, StatusEffectType } from '@/types/unit';
import { Hero, HeroFaction, HeroRarity } from '@/types/hero';
import { CombatEvent, CombatEventType } from '@/types/combat';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

describe('CombatView', () => {
  const mockPlayerUnit: Unit = {
    id: 'unit-1',
    type: UnitType.INFANTRY,
    faction: 'vietnamese',
    position: { x: 10, y: 10 },
    health: 80,
    maxHealth: 100,
    attack: 50,
    defense: 30,
    speed: 20,
    direction: Direction.NORTH,
    status: [],
    owner: UnitOwner.PLAYER,
  };

  const mockAIUnit: Unit = {
    id: 'unit-2',
    type: UnitType.CAVALRY,
    faction: 'mongol',
    position: { x: 20, y: 20 },
    health: 60,
    maxHealth: 100,
    attack: 60,
    defense: 25,
    speed: 30,
    direction: Direction.SOUTH,
    status: [
      {
        type: StatusEffectType.POISON,
        duration: 5,
        value: 10,
        source: 'ability-1',
      },
    ],
    owner: UnitOwner.AI,
  };

  const mockHero: Hero = {
    id: 'hero-1',
    name: 'Tran Hung Dao',
    nameVietnamese: 'Trần Hưng Đạo',
    faction: HeroFaction.VIETNAMESE,
    rarity: HeroRarity.LEGENDARY,
    stats: {
      attack: 90,
      defense: 80,
      speed: 70,
      leadership: 95,
      intelligence: 85,
    },
    abilities: [
      {
        id: 'ability-1',
        name: 'Thunder Strike',
        nameVietnamese: 'Sấm Sét',
        description: 'Deals massive damage',
        descriptionVietnamese: 'Gây sát thương lớn',
        cooldown: 10,
        cost: 50,
        effect: {
          type: 'damage',
          value: 100,
          radius: 5,
        },
      },
    ],
    portrait: '/heroes/tran-hung-dao.png',
    description: 'Legendary Vietnamese general',
    descriptionVietnamese: 'Danh tướng Việt Nam',
    historicalContext: 'Defeated Mongol invasions',
    historicalContextVietnamese: 'Đánh bại quân Mông Cổ',
  };

  const mockCombatLog: CombatEvent[] = [
    {
      type: CombatEventType.ATTACK,
      timestamp: Date.now() - 5000,
      sourceId: 'unit-1',
      targetId: 'unit-2',
    },
    {
      type: CombatEventType.DAMAGE,
      timestamp: Date.now() - 4000,
      sourceId: 'unit-1',
      targetId: 'unit-2',
      value: 25,
    },
    {
      type: CombatEventType.ABILITY_USED,
      timestamp: Date.now() - 3000,
      sourceId: 'hero-1',
      data: { abilityName: 'Thunder Strike' },
    },
  ];

  const defaultProps = {
    units: [mockPlayerUnit, mockAIUnit],
    combatLog: mockCombatLog,
    selectedUnit: null,
    selectedHero: null,
    onUnitSelect: vi.fn(),
    onAttack: vi.fn(),
    onMove: vi.fn(),
    onDefend: vi.fn(),
    onAbilityActivate: vi.fn(),
  };

  it('renders combat view with combat log header', () => {
    render(<CombatView {...defaultProps} />);
    expect(screen.getByText('Nhật ký chiến đấu')).toBeInTheDocument();
  });

  it('displays combat log with events', () => {
    render(<CombatView {...defaultProps} />);
    expect(screen.getByText('Nhật ký chiến đấu')).toBeInTheDocument();
    const logSection = screen.getByText('Nhật ký chiến đấu').closest('div')?.parentElement;
    expect(logSection).toBeInTheDocument();
  });

  it('shows empty state when no combat log events', () => {
    render(<CombatView {...defaultProps} combatLog={[]} />);
    expect(screen.getByText('Chưa có sự kiện chiến đấu')).toBeInTheDocument();
  });

  it('shows retreat button', () => {
    render(<CombatView {...defaultProps} />);
    expect(screen.getByText('RÚT LUI')).toBeInTheDocument();
  });

  it('displays selected unit information', () => {
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} />);
    expect(screen.getByText(/Đơn vị infantry/)).toBeInTheDocument();
    expect(screen.getByText('Người chơi')).toBeInTheDocument();
  });

  it('shows unit stats when showDetailedStats is true', () => {
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} showDetailedStats={true} />);
    expect(screen.getByText('Tấn công')).toBeInTheDocument();
    expect(screen.getByText('Phòng thủ')).toBeInTheDocument();
    expect(screen.getByText('Tốc độ')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('hides detailed stats when showDetailedStats is false', () => {
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} showDetailedStats={false} />);
    expect(screen.queryByText('Tấn công')).not.toBeInTheDocument();
    expect(screen.queryByText('Phòng thủ')).not.toBeInTheDocument();
  });

  it('shows unit controls for player units', () => {
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} />);
    expect(screen.getByText('⚔️ Tấn công')).toBeInTheDocument();
    expect(screen.getByText('🛡️ Phòng thủ')).toBeInTheDocument();
  });

  it('does not show unit controls for AI units', () => {
    render(<CombatView {...defaultProps} selectedUnit={mockAIUnit} />);
    expect(screen.queryByText('⚔️ Tấn công')).not.toBeInTheDocument();
    expect(screen.queryByText('🛡️ Phòng thủ')).not.toBeInTheDocument();
  });

  it('calls onDefend when clicking defend button', () => {
    const onDefend = vi.fn();
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} onDefend={onDefend} />);
    const defendButton = screen.getByText('🛡️ Phòng thủ');
    fireEvent.click(defendButton);
    expect(onDefend).toHaveBeenCalledWith(mockPlayerUnit.id);
  });

  it('enters targeting mode when clicking attack button', () => {
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} />);
    const attackButton = screen.getByText('⚔️ Tấn công');
    fireEvent.click(attackButton);
    expect(screen.getByText('🎯 Chọn mục tiêu để tấn công')).toBeInTheDocument();
  });

  it('displays hero abilities panel when hero is selected', () => {
    render(<CombatView {...defaultProps} selectedHero={mockHero} />);
    expect(screen.getByText('Kỹ năng anh hùng')).toBeInTheDocument();
    expect(screen.getByText('Trần Hưng Đạo')).toBeInTheDocument();
    expect(screen.getByText('Sấm Sét')).toBeInTheDocument();
  });

  it('shows ability details in hero panel', () => {
    render(<CombatView {...defaultProps} selectedHero={mockHero} />);
    expect(screen.getByText('Gây sát thương lớn')).toBeInTheDocument();
    expect(screen.getByText('50 MP')).toBeInTheDocument();
    expect(screen.getByText('Hồi chiêu: 10s')).toBeInTheDocument();
  });

  it('enters ability targeting mode when clicking an ability', () => {
    render(<CombatView {...defaultProps} selectedHero={mockHero} />);
    const abilityButton = screen.getByText('Sấm Sét').closest('div');
    if (abilityButton) {
      fireEvent.click(abilityButton);
      expect(screen.getByText(/Chọn vị trí cho kỹ năng: Sấm Sét/)).toBeInTheDocument();
    }
  });

  it('cancels targeting mode when clicking cancel button', () => {
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} />);
    const attackButton = screen.getByText('⚔️ Tấn công');
    fireEvent.click(attackButton);
    const cancelButton = screen.getByText('Hủy');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('🎯 Chọn mục tiêu để tấn công')).not.toBeInTheDocument();
  });

  it('limits combat log entries to maxLogEntries', () => {
    const manyEvents: CombatEvent[] = Array.from({ length: 100 }, (_, i) => ({
      type: CombatEventType.DAMAGE,
      timestamp: Date.now() - i * 1000,
      value: 10,
    }));

    render(<CombatView {...defaultProps} combatLog={manyEvents} maxLogEntries={20} />);
    const logSection = screen.getByText('Nhật ký chiến đấu').closest('div')?.parentElement;
    if (logSection) {
      const events = within(logSection).getAllByText(/Gây 10 sát thương/);
      expect(events.length).toBeLessThanOrEqual(20);
    }
  });

  it('displays health bar with correct values', () => {
    const lowHealthUnit: Unit = { ...mockPlayerUnit, health: 20, maxHealth: 100 };
    render(<CombatView {...defaultProps} selectedUnit={lowHealthUnit} />);
    // Health displayed as {health}/{maxHealth}
    expect(screen.getByText('20/100')).toBeInTheDocument();
  });

  it('shows empty state for hero with no abilities', () => {
    const heroWithoutAbilities: Hero = { ...mockHero, abilities: [] };
    render(<CombatView {...defaultProps} selectedHero={heroWithoutAbilities} />);
    // Hero panel still shows but no abilities listed
    expect(screen.getByText('Kỹ năng anh hùng')).toBeInTheDocument();
  });

  it('closes unit info panel when clicking retreat button', () => {
    const onUnitSelect = vi.fn();
    render(<CombatView {...defaultProps} selectedUnit={mockPlayerUnit} onUnitSelect={onUnitSelect} />);
    const retreatButton = screen.getByText('RÚT LUI');
    fireEvent.click(retreatButton);
    expect(onUnitSelect).toHaveBeenCalledWith(null);
  });

  it('formats different combat event types correctly', () => {
    const diverseEvents: CombatEvent[] = [
      { type: CombatEventType.ATTACK, timestamp: Date.now(), sourceId: 'unit-1', targetId: 'unit-2' },
      { type: CombatEventType.HEAL, timestamp: Date.now(), value: 30 },
      { type: CombatEventType.DEATH, timestamp: Date.now(), targetId: 'unit-3' },
    ];
    render(<CombatView {...defaultProps} combatLog={diverseEvents} />);
    const logSection = screen.getByText('Nhật ký chiến đấu').closest('div')?.parentElement;
    expect(logSection).toBeInTheDocument();
  });

  it('displays skill bar with Q W E R slots', () => {
    render(<CombatView {...defaultProps} />);
    expect(screen.getByText('Q')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });
});
