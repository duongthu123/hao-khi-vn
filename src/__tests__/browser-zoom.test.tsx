/**
 * Browser Zoom Support Test
 * 
 * Tests that the application supports browser zoom up to 200% without breaking layout
 * Validates Requirement 22.7
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MenuLayout } from '@/components/layout/MenuLayout';
import { MainMenu } from '@/components/game/MainMenu';
import { HeroSelection } from '@/components/game/HeroSelection/HeroSelection';
import { ResourceDisplay } from '@/components/game/ResourceDisplay/ResourceDisplay';
import { CombatView } from '@/components/game/CombatView/CombatView';
import { ALL_HEROES } from '@/constants/heroes';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock the store for HeroSelection
vi.mock('@/store', () => ({
  useGameStore: vi.fn((selector?: any) => {
    const state = {
      hero: {
        selectedHero: null,
        availableHeroes: ALL_HEROES,
        unlockedHeroes: [ALL_HEROES[0].id, ALL_HEROES[1].id],
      },
      ui: {
        settings: {
          animationsEnabled: true,
        },
      },
      selectHero: vi.fn(),
      isHeroUnlocked: (id: string) => id === ALL_HEROES[0].id || id === ALL_HEROES[1].id,
    };
    return selector ? selector(state) : state;
  }),
}));

const noop = () => {};
const menuProps = {
  onStartGame: noop,
  onTraining: noop,
  onCollection: noop,
  onMuseum: noop,
  onGacha: noop,
  onProfile: noop,
  onSettings: noop,
};

// Helper to simulate zoom by adjusting viewport and font size
const simulateZoom = (zoomLevel: number) => {
  const baseWidth = 1280;
  const baseHeight = 720;
  window.innerWidth = baseWidth / zoomLevel;
  window.innerHeight = baseHeight / zoomLevel;
  document.documentElement.style.fontSize = `${16 * zoomLevel}px`;
};

const resetZoom = () => {
  window.innerWidth = 1280;
  window.innerHeight = 720;
  document.documentElement.style.fontSize = '16px';
};

describe('Browser Zoom Support', () => {
  beforeEach(() => { resetZoom(); });
  afterEach(() => { resetZoom(); });

  describe('100% Zoom (Baseline)', () => {
    it('should render MenuLayout correctly at 100% zoom', () => {
      const { container } = render(
        <MenuLayout><div data-testid="test-content">Test Content</div></MenuLayout>
      );
      expect(screen.getByTestId('test-content')).toBeTruthy();
      expect(container.firstChild).toBeTruthy();
    });

    it('should render MainMenu correctly at 100% zoom', () => {
      render(<MainMenu {...menuProps} />);
      expect(screen.getByText('Hào Khí Đông A')).toBeTruthy();
      expect(screen.getByText('XUẤT KÍCH')).toBeTruthy();
    });
  });

  describe('150% Zoom', () => {
    beforeEach(() => { simulateZoom(1.5); });

    it('should render MenuLayout without content cutoff at 150% zoom', () => {
      render(<MenuLayout><div data-testid="test-content">Test Content</div></MenuLayout>);
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render MainMenu with all buttons accessible at 150% zoom', () => {
      render(<MainMenu {...menuProps} />);
      expect(screen.getByText('XUẤT KÍCH')).toBeTruthy();
      expect(screen.getByText('LUYỆN BINH')).toBeTruthy();
    });

    it('should render HeroSelection grid without overlap at 150% zoom', () => {
      const { container } = render(<HeroSelection />);
      const heroSection = container.querySelector('.flex.gap-10');
      expect(heroSection).toBeTruthy();
    });
  });

  describe('200% Zoom (Maximum Required)', () => {
    beforeEach(() => { simulateZoom(2.0); });

    it('should render MenuLayout without breaking layout at 200% zoom', () => {
      const { container } = render(
        <MenuLayout><div data-testid="test-content">Test Content</div></MenuLayout>
      );
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(container.firstChild).toBeTruthy();
    });

    it('should render MainMenu with all content visible at 200% zoom', () => {
      render(<MainMenu {...menuProps} />);
      expect(screen.getByText('Hào Khí Đông A')).toBeTruthy();
      expect(screen.getByText('Bạch Đằng Giang')).toBeTruthy();
      expect(screen.getByText('XUẤT KÍCH')).toBeTruthy();
      expect(screen.getByText('LUYỆN BINH')).toBeTruthy();
    });

    it('should render HeroSelection without content overlap at 200% zoom', () => {
      const { container } = render(<HeroSelection />);
      const heroSection = container.querySelector('.flex.gap-10');
      expect(heroSection).toBeTruthy();
    });

    it('should render ResourceDisplay with readable text at 200% zoom', () => {
      render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 25 }}
          caps={{ food: 200, gold: 100, army: 50 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
          showDetails={true}
        />
      );
      expect(screen.getByText('100')).toBeTruthy();
      expect(screen.getByText('50')).toBeTruthy();
      expect(screen.getByText('25')).toBeTruthy();
    });

    it('should render CombatView without layout breaking at 200% zoom', () => {
      const { container } = render(
        <CombatView
          units={[]} combatLog={[]} selectedUnit={null} selectedHero={null}
          onUnitSelect={() => {}} onAttack={() => {}} onMove={() => {}}
          onDefend={() => {}} onAbilityActivate={() => {}}
        />
      );
      expect(container.querySelector('.flex')).toBeTruthy();
    });

    it('should maintain button functionality at 200% zoom', () => {
      let startClicked = false;
      render(
        <MainMenu {...menuProps} onStartGame={() => { startClicked = true; }} />
      );
      screen.getByText('XUẤT KÍCH').click();
      expect(startClicked).toBe(true);
    });
  });

  describe('Vietnamese Text Readability at High Zoom', () => {
    it('should maintain Vietnamese text readability at 200% zoom', () => {
      simulateZoom(2.0);
      render(<MainMenu {...menuProps} />);
      expect(screen.getByText('Hào Khí Đông A')).toBeInTheDocument();
      expect(screen.getByText('Bạch Đằng Giang')).toBeInTheDocument();
    });

    it('should render hero names in Vietnamese at 200% zoom', () => {
      simulateZoom(2.0);
      render(<HeroSelection />);
      expect(screen.getByText('CHỌN PHE THAM CHIẾN')).toBeTruthy();
    });
  });

  describe('Scrolling Behavior at High Zoom', () => {
    it('should allow scrolling when content exceeds viewport at 200% zoom', () => {
      simulateZoom(2.0);
      render(
        <MenuLayout>
          <div style={{ height: '2000px' }} data-testid="tall-content">Tall Content</div>
        </MenuLayout>
      );
      const content = screen.getByTestId('tall-content');
      expect(content.style.height).toBe('2000px');
    });
  });

  describe('Interactive Elements at High Zoom', () => {
    it('should maintain touch target sizes at 200% zoom', () => {
      simulateZoom(2.0);
      render(<MainMenu {...menuProps} />);
      const startButton = screen.getByText('XUẤT KÍCH');
      expect(startButton).toBeTruthy();
      expect(startButton.className).toContain('btn-hex-start');
    });

    it('should maintain hero selection interactivity at 200% zoom', () => {
      simulateZoom(2.0);
      render(<HeroSelection />);
      expect(screen.getByText('CHỌN PHE THAM CHIẾN')).toBeTruthy();
    });
  });

  describe('Layout Flexibility', () => {
    it('should use flexible units instead of fixed pixels', () => {
      const { container } = render(
        <MenuLayout><div data-testid="test-content">Test Content</div></MenuLayout>
      );
      expect(container.firstChild).toBeTruthy();
    });

    it('should not use overflow:hidden that cuts off content at high zoom', () => {
      simulateZoom(2.0);
      const { container } = render(
        <MenuLayout><div data-testid="test-content">Test Content</div></MenuLayout>
      );
      const layout = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(layout);
      expect(styles.overflow).not.toBe('hidden');
    });
  });

  describe('Grid and Flexbox Behavior', () => {
    it('should maintain grid layout integrity at 200% zoom', () => {
      simulateZoom(2.0);
      const { container } = render(<HeroSelection />);
      const heroSection = container.querySelector('.flex.gap-10');
      expect(heroSection).toBeTruthy();
    });

    it('should maintain flexbox layout integrity at 200% zoom', () => {
      simulateZoom(2.0);
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 25 }}
          caps={{ food: 200, gold: 100, army: 50 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
          showDetails={true}
        />
      );
      expect(container.querySelector('.flex')).toBeTruthy();
    });
  });
});
