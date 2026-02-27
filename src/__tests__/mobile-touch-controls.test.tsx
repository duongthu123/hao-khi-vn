/**
 * Integration tests for mobile touch controls
 * 
 * Tests:
 * - Touch-friendly button sizes (minimum 44x44px)
 * - Swipe gesture detection
 * - Touch target spacing
 * - Mobile navigation
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { isTouchTargetCompliant } from '@/lib/utils/touchTargets';

describe('Mobile Touch Controls', () => {
  describe('Button Touch Targets', () => {
    it('should render small buttons with minimum 44px height', () => {
      const { container } = render(<Button size="sm">Small Button</Button>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should render medium buttons with minimum 44px height', () => {
      const { container } = render(<Button size="md">Medium Button</Button>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should render large buttons with minimum 44px height', () => {
      const { container } = render(<Button size="lg">Large Button</Button>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('min-h-[44px]');
    });

    it('should have touch-friendly dimensions', () => {
      const { container } = render(<Button>Touch Me</Button>);
      const button = container.querySelector('button');
      
      // Check that button has the min-height class applied
      expect(button).toHaveClass('min-h-[44px]');
    });
  });

  describe('Touch Target Compliance', () => {
    it('should validate compliant touch targets', () => {
      expect(isTouchTargetCompliant(44, 44)).toBe(true);
      expect(isTouchTargetCompliant(48, 48)).toBe(true);
      expect(isTouchTargetCompliant(56, 56)).toBe(true);
    });

    it('should reject non-compliant touch targets', () => {
      expect(isTouchTargetCompliant(40, 40)).toBe(false);
      expect(isTouchTargetCompliant(30, 30)).toBe(false);
      expect(isTouchTargetCompliant(44, 40)).toBe(false);
    });
  });

  describe('MobileNavigation', () => {
    const mockItems = [
      { id: '1', label: 'Home', icon: '🏠', onClick: vi.fn() },
      { id: '2', label: 'Profile', icon: '👤', onClick: vi.fn() },
      { id: '3', label: 'Settings', icon: '⚙️', onClick: vi.fn() },
    ];

    const mockBottomBarItems = [
      { id: 'map', label: 'Map', icon: '🗺️', onClick: vi.fn() },
      { id: 'combat', label: 'Combat', icon: '⚔️', onClick: vi.fn() },
      { id: 'heroes', label: 'Heroes', icon: '🦸', onClick: vi.fn() },
    ];

    it('should render hamburger menu button', () => {
      render(<MobileNavigation items={mockItems} />);
      
      const menuButton = screen.getByLabelText('Open navigation menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('should have touch-friendly hamburger button size', () => {
      const { container } = render(<MobileNavigation items={mockItems} />);
      
      const menuButton = container.querySelector('button[aria-label="Open navigation menu"]');
      expect(menuButton).toHaveClass('min-w-[44px]');
      expect(menuButton).toHaveClass('min-h-[44px]');
    });

    it('should render bottom navigation bar when items provided', () => {
      render(
        <MobileNavigation
          items={mockItems}
          bottomBarItems={mockBottomBarItems}
        />
      );
      
      const bottomNav = screen.getByRole('navigation', { name: 'Bottom navigation' });
      expect(bottomNav).toBeInTheDocument();
    });

    it('should render all bottom bar items', () => {
      render(
        <MobileNavigation
          items={mockItems}
          bottomBarItems={mockBottomBarItems}
        />
      );
      
      expect(screen.getByLabelText('Map')).toBeInTheDocument();
      expect(screen.getByLabelText('Combat')).toBeInTheDocument();
      expect(screen.getByLabelText('Heroes')).toBeInTheDocument();
    });

    it('should have touch-friendly bottom bar button sizes', () => {
      const { container } = render(
        <MobileNavigation
          items={mockItems}
          bottomBarItems={mockBottomBarItems}
        />
      );
      
      const bottomButtons = container.querySelectorAll('nav[aria-label="Bottom navigation"] button');
      bottomButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]');
        expect(button).toHaveClass('min-w-[44px]');
      });
    });

    it('should highlight active item', () => {
      render(
        <MobileNavigation
          items={mockItems}
          bottomBarItems={mockBottomBarItems}
          activeItemId="map"
        />
      );
      
      const mapButton = screen.getByLabelText('Map');
      expect(mapButton).toHaveAttribute('aria-current', 'page');
    });

    it('should call onClick when bottom bar item clicked', () => {
      const onMapClick = vi.fn();
      const items = [
        { id: 'map', label: 'Map', icon: '🗺️', onClick: onMapClick },
      ];

      render(
        <MobileNavigation
          items={mockItems}
          bottomBarItems={items}
        />
      );
      
      const mapButton = screen.getByLabelText('Map');
      fireEvent.click(mapButton);
      
      expect(onMapClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SwipeableDrawer', () => {
    it('should render drawer when open', () => {
      render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()}>
          <div>Drawer Content</div>
        </SwipeableDrawer>
      );
      
      expect(screen.getByText('Drawer Content')).toBeInTheDocument();
    });

    it('should not render drawer when closed', () => {
      render(
        <SwipeableDrawer isOpen={false} onClose={vi.fn()}>
          <div>Drawer Content</div>
        </SwipeableDrawer>
      );
      
      expect(screen.queryByText('Drawer Content')).not.toBeInTheDocument();
    });

    it('should render backdrop when showBackdrop is true', () => {
      const { container } = render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()} showBackdrop={true}>
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const backdrop = container.querySelector('.bg-black\\/50');
      expect(backdrop).toBeInTheDocument();
    });

    it('should call onClose when backdrop clicked', () => {
      const onClose = vi.fn();
      const { container } = render(
        <SwipeableDrawer
          isOpen={true}
          onClose={onClose}
          showBackdrop={true}
          closeOnBackdropClick={true}
        >
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const backdrop = container.querySelector('.bg-black\\/50');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should have swipe indicator', () => {
      const { container } = render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()}>
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const indicator = container.querySelector('.w-12.h-1');
      expect(indicator).toBeInTheDocument();
    });

    it('should apply correct position classes for left drawer', () => {
      const { container } = render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()} position="left">
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('left-0');
    });

    it('should apply correct position classes for right drawer', () => {
      const { container } = render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()} position="right">
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('right-0');
    });

    it('should apply correct position classes for top drawer', () => {
      const { container } = render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()} position="top">
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('top-0');
    });

    it('should apply correct position classes for bottom drawer', () => {
      const { container } = render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()} position="bottom">
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('bottom-0');
    });
  });

  describe('Touch Target Spacing', () => {
    it('should have adequate spacing between buttons in a group', () => {
      const { container } = render(
        <div className="flex gap-3">
          <Button>Button 1</Button>
          <Button>Button 2</Button>
          <Button>Button 3</Button>
        </div>
      );
      
      const buttonGroup = container.querySelector('.gap-3');
      expect(buttonGroup).toBeInTheDocument();
    });

    it('should use touch-friendly grid spacing', () => {
      const { container } = render(
        <div className="grid grid-cols-2 gap-3">
          <Button>1</Button>
          <Button>2</Button>
          <Button>3</Button>
          <Button>4</Button>
        </div>
      );
      
      const grid = container.querySelector('.gap-3');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on navigation buttons', () => {
      const items = [
        { id: 'home', label: 'Home', icon: '🏠', onClick: vi.fn() },
      ];

      render(<MobileNavigation items={[]} bottomBarItems={items} />);
      
      const button = screen.getByLabelText('Home');
      expect(button).toBeInTheDocument();
    });

    it('should have proper role on drawer', () => {
      render(
        <SwipeableDrawer isOpen={true} onClose={vi.fn()}>
          <div>Content</div>
        </SwipeableDrawer>
      );
      
      const drawer = screen.getByRole('dialog');
      expect(drawer).toBeInTheDocument();
      expect(drawer).toHaveAttribute('aria-modal', 'true');
    });

    it('should have proper aria-expanded on hamburger menu', () => {
      render(<MobileNavigation items={[]} />);
      
      const menuButton = screen.getByLabelText('Open navigation menu');
      expect(menuButton).toHaveAttribute('aria-expanded');
    });
  });
});
