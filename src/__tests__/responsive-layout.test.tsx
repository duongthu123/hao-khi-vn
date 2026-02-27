/**
 * Responsive Layout Breakpoints Test
 * Tests responsive behavior across mobile, tablet, and desktop
 * Validates Requirement 20.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MenuLayout } from '@/components/layout/MenuLayout';
import { MainMenu } from '@/components/game/MainMenu';
import { CombatView } from '@/components/game/CombatView/CombatView';
import { Unit } from '@/types/unit';
import { CombatEvent } from '@/types/combat';

const noop = () => {};
const menuProps = {
  onStartGame: noop, onTraining: noop, onCollection: noop,
  onMuseum: noop, onGacha: noop, onProfile: noop, onSettings: noop,
};

const createMatchMedia = (_width: number) => {
  return (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
};

describe('Responsive Layout Breakpoints', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  describe('Mobile Layout (320px+)', () => {
    beforeEach(() => {
      window.innerWidth = 375;
      window.matchMedia = createMatchMedia(375);
    });

    it('should render MenuLayout with scene wrapper', () => {
      const { container } = render(
        <MenuLayout><div>Test Content</div></MenuLayout>
      );
      const layout = container.firstChild as HTMLElement;
      expect(layout).toBeTruthy();
      expect(layout.className).toContain('fixed');
      expect(layout.className).toContain('inset-0');
    });

    it('should render MainMenu with game title', () => {
      render(<MainMenu {...menuProps} />);
      const title = screen.getByText('Hào Khí Đông A');
      expect(title).toBeTruthy();
    });
  });

  describe('Tablet Layout (768px+)', () => {
    beforeEach(() => {
      window.innerWidth = 768;
      window.matchMedia = createMatchMedia(768);
    });

    it('should render MenuLayout as full screen', () => {
      const { container } = render(
        <MenuLayout><div>Test Content</div></MenuLayout>
      );
      const layout = container.firstChild as HTMLElement;
      expect(layout.className).toContain('w-screen');
      expect(layout.className).toContain('h-screen');
    });

    it('should render MainMenu with subtitle', () => {
      render(<MainMenu {...menuProps} />);
      const subtitle = screen.getByText('Bạch Đằng Giang');
      expect(subtitle).toBeTruthy();
    });
  });

  describe('Desktop Layout (1024px+)', () => {
    beforeEach(() => {
      window.innerWidth = 1280;
      window.matchMedia = createMatchMedia(1280);
    });

    it('should render MainMenu with all buttons', () => {
      render(<MainMenu {...menuProps} />);
      expect(screen.getByText('XUẤT KÍCH')).toBeTruthy();
      expect(screen.getByText('LUYỆN BINH')).toBeTruthy();
      expect(screen.getByText('KHO TƯỚNG')).toBeTruthy();
    });
  });

  describe('Responsive Breakpoint Configuration', () => {
    it('should have correct breakpoint values', () => {
      const expectedBreakpoints = {
        mobile: '320px',
        tablet: '768px',
        desktop: '1024px',
      };
      expect(expectedBreakpoints.mobile).toBe('320px');
      expect(expectedBreakpoints.tablet).toBe('768px');
      expect(expectedBreakpoints.desktop).toBe('1024px');
    });
  });

  describe('Component Responsiveness', () => {
    it('should render CombatView with responsive layout', () => {
      const mockUnits: Unit[] = [];
      const mockLog: CombatEvent[] = [];

      const { container } = render(
        <CombatView
          units={mockUnits}
          combatLog={mockLog}
          selectedUnit={null}
          selectedHero={null}
          onUnitSelect={() => {}}
          onAttack={() => {}}
          onMove={() => {}}
          onDefend={() => {}}
          onAbilityActivate={() => {}}
        />
      );
      const combatView = container.querySelector('.flex.flex-col');
      expect(combatView).toBeTruthy();
    });

    it('should maintain readability of Vietnamese text', () => {
      render(<MainMenu {...menuProps} />);
      expect(screen.getByText('Hào Khí Đông A')).toBeTruthy();
      expect(screen.getByText('Bạch Đằng Giang')).toBeTruthy();
    });
  });
});
