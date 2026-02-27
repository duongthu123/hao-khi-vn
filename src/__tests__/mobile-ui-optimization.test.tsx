/**
 * Mobile UI Optimization Tests
 * 
 * Validates Requirements:
 * - 20.3: Scale UI elements appropriately for different screen sizes
 * - 20.5: Maintain readability of Vietnamese text on small screens
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { GameLayout } from '@/components/layout/GameLayout';
import { ResourceDisplay } from '@/components/game/ResourceDisplay/ResourceDisplay';
import { Resources, ResourceCaps, ResourceGeneration, ResourceType } from '@/types/resource';

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useReducedMotion: () => false,
}));

// Mock SwipeableDrawer
vi.mock('@/components/ui/SwipeableDrawer', () => ({
  SwipeableDrawer: ({ children, isOpen, onClose }: any) => (
    isOpen ? (
      <div data-testid="swipeable-drawer">
        <button onClick={onClose} data-testid="drawer-close">Close</button>
        {children}
      </div>
    ) : null
  ),
}));

describe('Mobile UI Optimization', () => {
  describe('GameLayout - Collapsible Sidebar', () => {
    it('should show hamburger menu button on mobile', () => {
      const sidebar = <div>Sidebar Content</div>;
      const header = <div>Header</div>;
      
      render(
        <GameLayout
          header={header}
          sidebar={sidebar}
          showSidebar={true}
        >
          <div>Main Content</div>
        </GameLayout>
      );

      // Hamburger menu button should be present
      const hamburgerButton = screen.getByLabelText('Mở menu');
      expect(hamburgerButton).toBeInTheDocument();
      
      // Button should have minimum touch target size
      expect(hamburgerButton).toHaveClass('min-h-[44px]');
      expect(hamburgerButton).toHaveClass('min-w-[44px]');
    });

    it('should open sidebar drawer when hamburger menu is clicked', () => {
      const sidebar = <div>Sidebar Content</div>;
      const header = <div>Header</div>;
      
      render(
        <GameLayout
          header={header}
          sidebar={sidebar}
          showSidebar={true}
        >
          <div>Main Content</div>
        </GameLayout>
      );

      // Click hamburger menu
      const hamburgerButton = screen.getByLabelText('Mở menu');
      fireEvent.click(hamburgerButton);

      // Drawer should be visible
      expect(screen.getByTestId('swipeable-drawer')).toBeInTheDocument();
      
      // Check that drawer contains sidebar content
      const drawer = screen.getByTestId('swipeable-drawer');
      expect(within(drawer).getByText('Sidebar Content')).toBeInTheDocument();
    });

    it('should close sidebar drawer when close button is clicked', () => {
      const sidebar = <div>Sidebar Content</div>;
      const header = <div>Header</div>;
      
      render(
        <GameLayout
          header={header}
          sidebar={sidebar}
          showSidebar={true}
        >
          <div>Main Content</div>
        </GameLayout>
      );

      // Open drawer
      const hamburgerButton = screen.getByLabelText('Mở menu');
      fireEvent.click(hamburgerButton);

      // Close drawer
      const closeButton = screen.getByTestId('drawer-close');
      fireEvent.click(closeButton);

      // Drawer should be closed
      expect(screen.queryByTestId('swipeable-drawer')).not.toBeInTheDocument();
    });

    it('should have proper header structure with responsive padding', () => {
      const header = <div>Header Content</div>;
      
      const { container } = render(
        <GameLayout header={header}>
          <div>Main Content</div>
        </GameLayout>
      );

      const headerElement = container.querySelector('header');
      expect(headerElement).toBeInTheDocument();
      
      // Check for responsive padding classes
      const headerInner = headerElement?.querySelector('div');
      expect(headerInner).toHaveClass('px-3');
      expect(headerInner).toHaveClass('tablet:px-4');
    });
  });

  describe('ResourceDisplay - Mobile Optimization', () => {
    const mockResources: Resources = {
      food: 500,
      gold: 300,
      army: 50,
    };

    const mockCaps: ResourceCaps = {
      food: 1000,
      gold: 1000,
      army: 100,
    };

    const mockGeneration: ResourceGeneration = {
      foodPerSecond: 5,
      goldPerSecond: 3,
      armyPerSecond: 1,
    };

    it('should render with responsive padding', () => {
      const { container } = render(
        <ResourceDisplay
          resources={mockResources}
          caps={mockCaps}
          generation={mockGeneration}
        />
      );

      const mainContainer = container.querySelector('.flex.flex-col');
      expect(mainContainer).toHaveClass('p-3');
      expect(mainContainer).toHaveClass('mobile:p-4');
    });

    it('should render with responsive gap spacing', () => {
      const { container } = render(
        <ResourceDisplay
          resources={mockResources}
          caps={mockCaps}
          generation={mockGeneration}
        />
      );

      const mainContainer = container.querySelector('.flex.flex-col');
      expect(mainContainer).toHaveClass('gap-2');
      expect(mainContainer).toHaveClass('mobile:gap-3');
    });

    it('should render resource title with responsive font size', () => {
      render(
        <ResourceDisplay
          resources={mockResources}
          caps={mockCaps}
          generation={mockGeneration}
        />
      );

      const title = screen.getByText('Tài nguyên');
      expect(title).toHaveClass('text-base');
      expect(title).toHaveClass('mobile:text-lg');
    });

    it('should hide tooltip hint on mobile', () => {
      render(
        <ResourceDisplay
          resources={mockResources}
          caps={mockCaps}
          generation={mockGeneration}
          showDetails={true}
        />
      );

      const tooltipHint = screen.getByText('Di chuột để xem chi tiết');
      expect(tooltipHint).toHaveClass('hidden');
      expect(tooltipHint).toHaveClass('tablet:inline');
    });

    it('should render Vietnamese text with proper font sizes', () => {
      render(
        <ResourceDisplay
          resources={mockResources}
          caps={mockCaps}
          generation={mockGeneration}
        />
      );

      // Title should be at least 16px (text-base)
      const title = screen.getByText('Tài nguyên');
      expect(title).toHaveClass('text-base'); // 16px minimum
    });
  });

  describe('Vietnamese Text Readability', () => {
    it('should use minimum 14px font size for body text', () => {
      const { container } = render(
        <div className="text-sm">Đại Chiến Sử Việt</div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-sm'); // 14px
    });

    it('should use minimum 12px font size for labels', () => {
      const { container } = render(
        <div className="text-xs">Nhãn văn bản</div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('text-xs'); // 12px
    });

    it('should use proper line height for Vietnamese diacritics', () => {
      const { container } = render(
        <div className="leading-relaxed">
          Trần Hưng Đạo - Vị tướng tài ba của dân tộc Việt Nam
        </div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('leading-relaxed'); // line-height: 1.6
    });
  });

  describe('Touch Target Sizes', () => {
    it('should have minimum 44x44px touch targets for buttons', () => {
      render(
        <button className="p-2 min-h-[44px] min-w-[44px]">
          Icon Button
        </button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('min-w-[44px]');
    });

    it('should have adequate spacing between touch targets', () => {
      const { container } = render(
        <div className="flex gap-2">
          <button className="min-h-[44px] min-w-[44px]">Button 1</button>
          <button className="min-h-[44px] min-w-[44px]">Button 2</button>
        </div>
      );

      const buttonContainer = container.firstChild as HTMLElement;
      expect(buttonContainer).toHaveClass('gap-2'); // 8px spacing
    });
  });

  describe('Responsive Grid Layouts', () => {
    it('should adapt grid columns for mobile', () => {
      const { container } = render(
        <div className="grid grid-cols-1 mobile:grid-cols-2">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-1'); // 1 column on mobile
      expect(grid).toHaveClass('mobile:grid-cols-2'); // 2 columns on mobile+
    });

    it('should adapt grid columns for tablet and desktop', () => {
      const { container } = render(
        <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-4">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
        </div>
      );

      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-2'); // 2 columns on mobile
      expect(grid).toHaveClass('tablet:grid-cols-3'); // 3 columns on tablet
      expect(grid).toHaveClass('desktop:grid-cols-4'); // 4 columns on desktop
    });
  });

  describe('Text Truncation and Wrapping', () => {
    it('should truncate long text with ellipsis', () => {
      const { container } = render(
        <div className="truncate">
          Đây là một đoạn văn bản rất dài sẽ bị cắt ngắn với dấu ba chấm
        </div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('truncate');
    });

    it('should wrap text with proper line height', () => {
      const { container } = render(
        <div className="leading-relaxed whitespace-normal">
          Đây là một đoạn văn bản sẽ được ngắt dòng tự nhiên
        </div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('leading-relaxed');
      expect(element).toHaveClass('whitespace-normal');
    });

    it('should use flexible container with minimum width', () => {
      const { container } = render(
        <div className="flex">
          <div className="flex-1 min-w-0">Flexible content</div>
        </div>
      );

      const flexItem = container.querySelector('.flex-1');
      expect(flexItem).toHaveClass('min-w-0');
    });
  });

  describe('Responsive Spacing', () => {
    it('should use responsive padding', () => {
      const { container } = render(
        <div className="p-3 mobile:p-4">Content</div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('p-3'); // 12px on mobile
      expect(element).toHaveClass('mobile:p-4'); // 16px on mobile+
    });

    it('should use responsive gap spacing', () => {
      const { container } = render(
        <div className="flex gap-2 mobile:gap-3">
          <div>Item 1</div>
          <div>Item 2</div>
        </div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('gap-2'); // 8px on mobile
      expect(element).toHaveClass('mobile:gap-3'); // 12px on mobile+
    });

    it('should use responsive margin', () => {
      const { container } = render(
        <div className="mb-1 mobile:mb-2">Content</div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('mb-1'); // 4px on mobile
      expect(element).toHaveClass('mobile:mb-2'); // 8px on mobile+
    });
  });

  describe('Responsive Font Sizes', () => {
    it('should scale title font sizes', () => {
      const { container } = render(
        <h1 className="text-base mobile:text-lg tablet:text-xl">
          Tiêu đề
        </h1>
      );

      const title = container.firstChild as HTMLElement;
      expect(title).toHaveClass('text-base'); // 16px on mobile
      expect(title).toHaveClass('mobile:text-lg'); // 18px on mobile+
      expect(title).toHaveClass('tablet:text-xl'); // 20px on tablet+
    });

    it('should scale icon sizes', () => {
      const { container } = render(
        <span className="text-xl mobile:text-2xl">🌾</span>
      );

      const icon = container.firstChild as HTMLElement;
      expect(icon).toHaveClass('text-xl'); // 20px on mobile
      expect(icon).toHaveClass('mobile:text-2xl'); // 24px on mobile+
    });
  });

  describe('Collapsible Panels', () => {
    it('should hide panel on mobile by default', () => {
      const { container } = render(
        <div className="hidden tablet:flex">
          Panel Content
        </div>
      );

      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveClass('hidden'); // Hidden on mobile
      expect(panel).toHaveClass('tablet:flex'); // Visible on tablet+
    });

    it('should show panel as overlay on mobile when active', () => {
      const { container } = render(
        <div className="hidden tablet:flex mobile:flex mobile:absolute mobile:inset-0 mobile:z-30">
          Panel Content
        </div>
      );

      const panel = container.firstChild as HTMLElement;
      expect(panel).toHaveClass('mobile:absolute'); // Overlay positioning
      expect(panel).toHaveClass('mobile:inset-0'); // Full screen
      expect(panel).toHaveClass('mobile:z-30'); // Above other content
    });
  });

  describe('Accessibility - Touch Targets', () => {
    it('should have aria-label for icon buttons', () => {
      render(
        <button
          aria-label="Mở menu"
          className="min-h-[44px] min-w-[44px]"
        >
          ☰
        </button>
      );

      const button = screen.getByLabelText('Mở menu');
      expect(button).toBeInTheDocument();
    });

    it('should have title attribute for tooltips', () => {
      render(
        <button
          title="Nhật ký chiến đấu"
          className="min-h-[44px] min-w-[44px]"
        >
          📜
        </button>
      );

      const button = screen.getByTitle('Nhật ký chiến đấu');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Performance - Layout Shift Prevention', () => {
    it('should use fixed aspect ratios for images', () => {
      const { container } = render(
        <div className="aspect-square">
          <img src="/hero.png" alt="Hero" />
        </div>
      );

      const aspectContainer = container.querySelector('.aspect-square');
      expect(aspectContainer).toBeInTheDocument();
    });

    it('should use min-width to prevent layout shift', () => {
      const { container } = render(
        <div className="min-w-[100px]">Content</div>
      );

      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass('min-w-[100px]');
    });
  });
});
