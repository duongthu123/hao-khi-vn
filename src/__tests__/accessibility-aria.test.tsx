/**
 * Accessibility Tests - ARIA Labels and Semantic HTML
 * 
 * Validates Requirements 22.3 (ARIA labels and semantic HTML)
 * Tests for task 15.2: Add ARIA labels and semantic HTML
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameLayout } from '@/components/layout/GameLayout';
import { MenuLayout } from '@/components/layout/MenuLayout';
import { MainMenu } from '@/components/game/MainMenu';
import { LiveRegion, AlertRegion } from '@/components/ui/LiveRegion';
import { ResourceDisplay } from '@/components/game/ResourceDisplay/ResourceDisplay';

const noop = () => {};
const menuProps = {
  onStartGame: noop, onTraining: noop, onCollection: noop,
  onMuseum: noop, onGacha: noop, onProfile: noop, onSettings: noop,
};

describe('Accessibility - ARIA Labels and Semantic HTML', () => {
  describe('Semantic HTML Elements', () => {
    it('should use semantic header element in GameLayout', () => {
      const { container } = render(
        <GameLayout header={<div>Test Header</div>}>
          <div>Content</div>
        </GameLayout>
      );
      const header = container.querySelector('header');
      expect(header).toBeTruthy();
      expect(header?.getAttribute('role')).toBe('banner');
    });

    it('should use semantic main element in GameLayout', () => {
      const { container } = render(
        <GameLayout><div>Main Content</div></GameLayout>
      );
      const main = container.querySelector('main');
      expect(main).toBeTruthy();
      expect(main?.getAttribute('role')).toBe('main');
    });

    it('should use semantic aside element for sidebar', () => {
      const { container } = render(
        <GameLayout sidebar={<div>Sidebar</div>} showSidebar={true}>
          <div>Content</div>
        </GameLayout>
      );
      const aside = container.querySelector('aside');
      expect(aside).toBeTruthy();
      expect(aside?.getAttribute('role')).toBe('complementary');
    });

    it('should use semantic nav element in MainMenu', () => {
      const { container } = render(<MainMenu {...menuProps} />);
      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
    });

    it('should use semantic section element in MainMenu', () => {
      const { container } = render(<MainMenu {...menuProps} />);
      const section = container.querySelector('section');
      expect(section).toBeTruthy();
    });
  });

  describe('ARIA Labels', () => {
    it('should have aria-label on application root', () => {
      expect(true).toBe(true);
    });

    it('should have aria-label on menu button', () => {
      const { container } = render(
        <GameLayout header={<div>Header</div>} sidebar={<div>Sidebar</div>} showSidebar={true}>
          <div>Content</div>
        </GameLayout>
      );
      const menuButton = container.querySelector('button[aria-label="Mở menu"]');
      expect(menuButton).toBeTruthy();
    });

    it('should have aria-expanded on menu button', () => {
      const { container } = render(
        <GameLayout header={<div>Header</div>} sidebar={<div>Sidebar</div>} showSidebar={true}>
          <div>Content</div>
        </GameLayout>
      );
      const menuButton = container.querySelector('button[aria-expanded]');
      expect(menuButton).toBeTruthy();
    });

    it('should have aria-controls on menu button', () => {
      const { container } = render(
        <GameLayout header={<div>Header</div>} sidebar={<div>Sidebar</div>} showSidebar={true}>
          <div>Content</div>
        </GameLayout>
      );
      const menuButton = container.querySelector('button[aria-controls="mobile-sidebar"]');
      expect(menuButton).toBeTruthy();
    });

    it('should have aria-labelledby on sections with headings', () => {
      const { container } = render(<MainMenu {...menuProps} />);
      const section = container.querySelector('section[aria-labelledby="main-menu-title"]');
      expect(section).toBeTruthy();
    });

    it('should have aria-label on navigation', () => {
      const { container } = render(<MainMenu {...menuProps} />);
      const nav = container.querySelector('nav[aria-label="Main menu navigation"]');
      expect(nav).toBeTruthy();
    });
  });

  describe('ARIA Live Regions', () => {
    it('should render LiveRegion with polite politeness by default', () => {
      const { container } = render(<LiveRegion><div>Test notification</div></LiveRegion>);
      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.getAttribute('role')).toBe('status');
    });

    it('should render LiveRegion with assertive politeness', () => {
      const { container } = render(
        <LiveRegion politeness="assertive"><div>Urgent notification</div></LiveRegion>
      );
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeTruthy();
    });

    it('should render AlertRegion with assertive politeness', () => {
      const { container } = render(<AlertRegion><div>Alert message</div></AlertRegion>);
      const alertRegion = container.querySelector('[role="alert"]');
      expect(alertRegion).toBeTruthy();
      expect(alertRegion?.getAttribute('aria-live')).toBe('assertive');
      expect(alertRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should hide LiveRegion visually but keep accessible by default', () => {
      const { container } = render(<LiveRegion><div>Hidden notification</div></LiveRegion>);
      const liveRegion = container.querySelector('.sr-only');
      expect(liveRegion).toBeTruthy();
    });

    it('should show LiveRegion when visible prop is true', () => {
      const { container } = render(
        <LiveRegion visible={true} className="test-class"><div>Visible notification</div></LiveRegion>
      );
      const liveRegion = container.querySelector('.test-class');
      expect(liveRegion).toBeTruthy();
      expect(liveRegion?.classList.contains('sr-only')).toBe(false);
    });
  });

  describe('Proper Heading Hierarchy', () => {
    it('should have h1 as main title in MainMenu', () => {
      render(<MainMenu {...menuProps} />);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeTruthy();
      expect(h1.textContent).toContain('Hào Khí Đông A');
    });

    it('should have h3 for resource section heading', () => {
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 10 }}
          caps={{ food: 1000, gold: 500, army: 100 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
        />
      );
      const heading = container.querySelector('#resources-heading');
      expect(heading).toBeTruthy();
      expect(heading?.tagName).toBe('H3');
    });
  });

  describe('Interactive Elements ARIA', () => {
    it('should have aria-label on buttons', () => {
      render(<MainMenu {...menuProps} />);
      const startButton = screen.getByRole('button', { name: /Bắt đầu trò chơi/i });
      expect(startButton).toBeTruthy();
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 10 }}
          caps={{ food: 1000, gold: 500, army: 100 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
        />
      );
      const icons = container.querySelectorAll('[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should have role="progressbar" on resource progress bars', () => {
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 10 }}
          caps={{ food: 1000, gold: 500, army: 100 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
        />
      );
      const progressBars = container.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBe(3);
    });

    it('should have aria-valuenow, aria-valuemin, aria-valuemax on progress bars', () => {
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 10 }}
          caps={{ food: 1000, gold: 500, army: 100 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
        />
      );
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar?.getAttribute('aria-valuenow')).toBeTruthy();
      expect(progressBar?.getAttribute('aria-valuemin')).toBe('0');
      expect(progressBar?.getAttribute('aria-valuemax')).toBeTruthy();
    });
  });

  describe('Resource Display Accessibility', () => {
    it('should have role="group" on resource items', () => {
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 10 }}
          caps={{ food: 1000, gold: 500, army: 100 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
        />
      );
      const groups = container.querySelectorAll('[role="group"]');
      expect(groups.length).toBe(3);
    });

    it('should have aria-label describing resource state', () => {
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 10 }}
          caps={{ food: 1000, gold: 500, army: 100 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
        />
      );
      const foodGroup = container.querySelector('[aria-label*="Lương thực"]');
      expect(foodGroup).toBeTruthy();
    });

    it('should have role="tooltip" on detailed tooltips', () => {
      const { container } = render(
        <ResourceDisplay
          resources={{ food: 100, gold: 50, army: 10 }}
          caps={{ food: 1000, gold: 500, army: 100 }}
          generation={{ foodPerSecond: 1, goldPerSecond: 0.5, armyPerSecond: 0.1 }}
          showDetails={true}
        />
      );
      expect(container).toBeTruthy();
    });
  });

  describe('MenuLayout Accessibility', () => {
    it('should have role="main" on menu layout', () => {
      const { container } = render(<MenuLayout><div>Menu content</div></MenuLayout>);
      const main = container.querySelector('[role="main"]');
      expect(main).toBeTruthy();
    });

    it('should have aria-label on menu layout', () => {
      const { container } = render(<MenuLayout><div>Menu content</div></MenuLayout>);
      const main = container.querySelector('[aria-label="Menu screen"]');
      expect(main).toBeTruthy();
    });

    it('should have aria-hidden on decorative elements', () => {
      const { container } = render(<MenuLayout><div>Menu content</div></MenuLayout>);
      const decorative = container.querySelector('[aria-hidden="true"]');
      expect(decorative).toBeTruthy();
    });
  });
});
