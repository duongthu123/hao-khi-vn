import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileView } from './ProfileView';
import { useGameStore } from '@/store';

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

describe('ProfileView', () => {
  const mockProfile = {
    playerName: 'Test Player',
    rank: 'Đại Tướng',
    level: 25,
    experience: 24500,
    wins: 15,
    losses: 5,
    achievements: [
      {
        id: 'ach1',
        name: 'First Victory',
        description: 'Win your first battle',
        icon: '🏆',
        unlocked: true,
        unlockedAt: Date.now() - 86400000,
      },
      {
        id: 'ach2',
        name: 'Master Strategist',
        description: 'Win 10 battles',
        icon: '⚔️',
        unlocked: false,
      },
    ],
    statistics: {
      totalPlayTime: 7200,
      unitsDefeated: 150,
      resourcesGathered: 5000,
      quizzesCompleted: 10,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        profile: mockProfile,
        getWinRate: () => 75,
        getTotalGames: () => 20,
        getUnlockedAchievements: () => mockProfile.achievements.filter((a) => a.unlocked),
        getNextRankThreshold: () => ({ level: 30, rank: 'Nguyên Soái' }),
      };
      return selector(state);
    });
  });

  it('renders player name and rank', () => {
    render(<ProfileView />);
    expect(screen.getByText('Test Player')).toBeInTheDocument();
    expect(screen.getByText('Đại Tướng')).toBeInTheDocument();
  });

  it('displays player level', () => {
    render(<ProfileView />);
    expect(screen.getByText(/Cấp 25/)).toBeInTheDocument();
  });

  it('shows experience progress', () => {
    render(<ProfileView />);
    expect(screen.getByText(/Kinh nghiệm/)).toBeInTheDocument();
    expect(screen.getByText(/500 \/ 1000 XP/)).toBeInTheDocument();
  });

  it('displays win/loss statistics', () => {
    render(<ProfileView />);
    expect(screen.getByText('15')).toBeInTheDocument(); // Wins
    expect(screen.getByText('5')).toBeInTheDocument(); // Losses
    expect(screen.getByText('20')).toBeInTheDocument(); // Total games
    expect(screen.getByText('75.0%')).toBeInTheDocument(); // Win rate
  });

  it('shows win and loss labels', () => {
    render(<ProfileView />);
    expect(screen.getByText('Thắng')).toBeInTheDocument();
    expect(screen.getByText('Thua')).toBeInTheDocument();
    expect(screen.getByText('Tổng trận')).toBeInTheDocument();
    expect(screen.getByText('Tỷ lệ thắng')).toBeInTheDocument();
  });

  it('displays detailed statistics', () => {
    render(<ProfileView />);
    expect(screen.getByText('2h 0m')).toBeInTheDocument(); // Play time
    expect(screen.getByText('150')).toBeInTheDocument(); // Units defeated
    expect(screen.getByText('5,000')).toBeInTheDocument(); // Resources gathered
    expect(screen.getByText('10')).toBeInTheDocument(); // Quizzes completed
  });

  it('shows statistics labels', () => {
    render(<ProfileView />);
    expect(screen.getByText('Thời gian chơi')).toBeInTheDocument();
    expect(screen.getByText('Đơn vị tiêu diệt')).toBeInTheDocument();
    expect(screen.getByText('Tài nguyên thu thập')).toBeInTheDocument();
    expect(screen.getByText('Câu đố hoàn thành')).toBeInTheDocument();
  });

  it('displays achievements with unlock status', () => {
    render(<ProfileView />);
    expect(screen.getByText('First Victory')).toBeInTheDocument();
    expect(screen.getByText('Win your first battle')).toBeInTheDocument();
    expect(screen.getByText('Master Strategist')).toBeInTheDocument();
    expect(screen.getByText('Win 10 battles')).toBeInTheDocument();
  });

  it('shows achievement count', () => {
    render(<ProfileView />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });

  it('displays unlocked achievement with date', () => {
    render(<ProfileView />);
    const unlockedText = screen.getAllByText(/Mở khóa:/);
    expect(unlockedText.length).toBeGreaterThan(0);
  });

  it('displays locked achievement indicator', () => {
    render(<ProfileView />);
    expect(screen.getByText('🔒 Chưa mở khóa')).toBeInTheDocument();
  });

  it('formats play time correctly for minutes only', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        profile: { ...mockProfile, statistics: { ...mockProfile.statistics, totalPlayTime: 1800 } },
        getWinRate: () => 75,
        getTotalGames: () => 20,
        getUnlockedAchievements: () => [],
        getNextRankThreshold: () => ({ level: 30, rank: 'Nguyên Soái' }),
      };
      return selector(state);
    });

    render(<ProfileView />);
    expect(screen.getByText('30m')).toBeInTheDocument();
  });

  it('handles zero games played', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        profile: { ...mockProfile, wins: 0, losses: 0 },
        getWinRate: () => 0,
        getTotalGames: () => 0,
        getUnlockedAchievements: () => [],
        getNextRankThreshold: () => ({ level: 30, rank: 'Nguyên Soái' }),
      };
      return selector(state);
    });

    render(<ProfileView />);
    // Check for multiple zeros (wins, losses, total games)
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('displays empty achievements message when no achievements exist', () => {
    (useGameStore as any).mockImplementation((selector: any) => {
      const state = {
        profile: { ...mockProfile, achievements: [] },
        getWinRate: () => 75,
        getTotalGames: () => 20,
        getUnlockedAchievements: () => [],
        getNextRankThreshold: () => ({ level: 30, rank: 'Nguyên Soái' }),
      };
      return selector(state);
    });

    render(<ProfileView />);
    expect(screen.getByText('Chưa có thành tựu nào')).toBeInTheDocument();
    expect(screen.getByText('Hãy chiến đấu để mở khóa thành tựu!')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<ProfileView className="custom-class" />);
    const rootElement = container.firstChild as HTMLElement;
    expect(rootElement.className).toContain('custom-class');
  });

  it('renders all section headers', () => {
    render(<ProfileView />);
    expect(screen.getByText('Hồ Sơ Chiến Binh')).toBeInTheDocument();
    expect(screen.getByText('Thống Kê Chiến Đấu')).toBeInTheDocument();
    expect(screen.getByText('Thống Kê Chi Tiết')).toBeInTheDocument();
    expect(screen.getByText('Thành Tựu')).toBeInTheDocument();
  });

  it('displays win/loss ratio text', () => {
    render(<ProfileView />);
    expect(screen.getByText('15W - 5L')).toBeInTheDocument();
  });
});
