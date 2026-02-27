/**
 * Mobile Menu System Tests
 * 
 * Tests for the complete mobile-optimized menu system including:
 * - Hamburger menu functionality
 * - Bottom navigation bar
 * - Full-screen modals on mobile
 * - Responsive behavior
 * 
 * Requirements: 20.8
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileMenuSystem, useMobileMenu } from '@/components/layout/MobileMenuSystem';
import { Modal } from '@/components/ui/Modal';
import { NavigationItem } from '@/components/layout/MobileNavigation';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    nav: ({ children, ...props }: any) => <nav {...props}>{children}</nav>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock useAnimations hook
vi.mock('@/hooks/useAnimations', () => ({
  useAnimations: () => true,
}));

describe('MobileMenuSystem', () => {
  const mockMenuItems: NavigationItem[] = [
    { id: 'home', label: 'Trang chủ', icon: '🏠', onClick: vi.fn() },
    { id: 'game', label: 'Chơi game', icon: '🎮', onClick: vi.fn() },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️', onClick: vi.fn() },
  ];

  const mockBottomBarItems: NavigationItem[] = [
    { id: 'map', label: 'Bản đồ', icon: '🗺️', onClick: vi.fn() },
    { id: 'combat', label: 'Chiến đấu', icon: '⚔️', onClick: vi.fn() },
    { id: 'resources', label: 'Tài nguyên', icon: '💰', onClick: vi.fn() },
  ];

  it('renders mobile menu system with children', () => {
    render(
      <MobileMenuSystem menuItems={mockMenuItems}>
        <div>Test Content</div>
      </MobileMenuSystem>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders hamburger menu button', () => {
    render(
      <MobileMenuSystem menuItems={mockMenuItems}>
        <div>Content</div>
      </MobileMenuSystem>
    );

    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('renders bottom navigation bar when bottomBarItems provided', () => {
    render(
      <MobileMenuSystem
        menuItems={mockMenuItems}
        bottomBarItems={mockBottomBarItems}
      >
        <div>Content</div>
      </MobileMenuSystem>
    );

    expect(screen.getByText('Bản đồ')).toBeInTheDocument();
    expect(screen.getByText('Chiến đấu')).toBeInTheDocument();
    expect(screen.getByText('Tài nguyên')).toBeInTheDocument();
  });

  it('opens drawer when hamburger button is clicked', async () => {
    render(
      <MobileMenuSystem menuItems={mockMenuItems}>
        <div>Content</div>
      </MobileMenuSystem>
    );

    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    fireEvent.click(hamburgerButton);

    await waitFor(() => {
      expect(screen.getByText('Trang chủ')).toBeInTheDocument();
      expect(screen.getByText('Chơi game')).toBeInTheDocument();
      expect(screen.getByText('Cài đặt')).toBeInTheDocument();
    });
  });

  it('calls onClick handler when menu item is clicked', async () => {
    const onClickMock = vi.fn();
    const items: NavigationItem[] = [
      { id: 'test', label: 'Test Item', onClick: onClickMock },
    ];

    render(
      <MobileMenuSystem menuItems={items}>
        <div>Content</div>
      </MobileMenuSystem>
    );

    // Open drawer
    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    fireEvent.click(hamburgerButton);

    // Click menu item
    await waitFor(() => {
      const menuItem = screen.getByText('Test Item');
      fireEvent.click(menuItem);
    });

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClick handler when bottom bar item is clicked', () => {
    const onClickMock = vi.fn();
    const bottomItems: NavigationItem[] = [
      { id: 'test', label: 'Test', icon: '🧪', onClick: onClickMock },
    ];

    render(
      <MobileMenuSystem
        menuItems={mockMenuItems}
        bottomBarItems={bottomItems}
      >
        <div>Content</div>
      </MobileMenuSystem>
    );

    const bottomBarItem = screen.getByText('Test');
    fireEvent.click(bottomBarItem);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('highlights active menu item', () => {
    render(
      <MobileMenuSystem
        menuItems={mockMenuItems}
        activeItemId="game"
      >
        <div>Content</div>
      </MobileMenuSystem>
    );

    // Open drawer to see menu items
    const hamburgerButton = screen.getByLabelText('Open navigation menu');
    fireEvent.click(hamburgerButton);

    // Check if active item has aria-current
    const gameButton = screen.getByText('Chơi game').closest('button');
    expect(gameButton).toHaveAttribute('aria-current', 'page');
  });

  it('highlights active bottom bar item', () => {
    render(
      <MobileMenuSystem
        menuItems={mockMenuItems}
        bottomBarItems={mockBottomBarItems}
        activeItemId="combat"
      >
        <div>Content</div>
      </MobileMenuSystem>
    );

    const combatButton = screen.getByText('Chiến đấu').closest('button');
    expect(combatButton).toHaveAttribute('aria-current', 'page');
  });

  it('adds bottom padding when bottom bar is present', () => {
    const { container } = render(
      <MobileMenuSystem
        menuItems={mockMenuItems}
        bottomBarItems={mockBottomBarItems}
      >
        <div>Content</div>
      </MobileMenuSystem>
    );

    const contentArea = container.querySelector('.pb-16');
    expect(contentArea).toBeInTheDocument();
  });

  it('does not add bottom padding when no bottom bar', () => {
    const { container } = render(
      <MobileMenuSystem menuItems={mockMenuItems}>
        <div>Content</div>
      </MobileMenuSystem>
    );

    const contentArea = container.querySelector('.pb-16');
    expect(contentArea).not.toBeInTheDocument();
  });
});

describe('Modal - Full-screen variants', () => {
  it('renders modal with fullScreenOnMobile prop', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        fullScreenOnMobile
        title="Test Modal"
      >
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders modal with fullScreen prop', () => {
    render(
      <Modal
        open={true}
        onOpenChange={vi.fn()}
        fullScreen
        title="Full Screen Modal"
      >
        <div>Full Screen Content</div>
      </Modal>
    );

    expect(screen.getByText('Full Screen Modal')).toBeInTheDocument();
    expect(screen.getByText('Full Screen Content')).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', () => {
    const onOpenChangeMock = vi.fn();
    
    render(
      <Modal
        open={true}
        onOpenChange={onOpenChangeMock}
        title="Test Modal"
      >
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Đóng');
    fireEvent.click(closeButton);

    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
  });

  it('does not render when open is false', () => {
    render(
      <Modal
        open={false}
        onOpenChange={vi.fn()}
        title="Hidden Modal"
      >
        <div>Hidden Content</div>
      </Modal>
    );

    expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
  });
});

describe('useMobileMenu hook', () => {
  function TestComponent() {
    const { activeView, setActiveView, openModal, closeModal, modalState } = useMobileMenu();

    return (
      <div>
        <div data-testid="active-view">{activeView}</div>
        <div data-testid="modal-open">{modalState.isOpen.toString()}</div>
        <div data-testid="modal-id">{modalState.modalId || 'none'}</div>
        <button onClick={() => setActiveView('test-view')}>Set View</button>
        <button onClick={() => openModal('test-modal')}>Open Modal</button>
        <button onClick={closeModal}>Close Modal</button>
      </div>
    );
  }

  it('initializes with empty state', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('active-view')).toHaveTextContent('');
    expect(screen.getByTestId('modal-open')).toHaveTextContent('false');
    expect(screen.getByTestId('modal-id')).toHaveTextContent('none');
  });

  it('updates active view when setActiveView is called', () => {
    render(<TestComponent />);

    const setViewButton = screen.getByText('Set View');
    fireEvent.click(setViewButton);

    expect(screen.getByTestId('active-view')).toHaveTextContent('test-view');
  });

  it('opens modal when openModal is called', () => {
    render(<TestComponent />);

    const openModalButton = screen.getByText('Open Modal');
    fireEvent.click(openModalButton);

    expect(screen.getByTestId('modal-open')).toHaveTextContent('true');
    expect(screen.getByTestId('modal-id')).toHaveTextContent('test-modal');
  });

  it('closes modal when closeModal is called', () => {
    render(<TestComponent />);

    // Open modal first
    const openModalButton = screen.getByText('Open Modal');
    fireEvent.click(openModalButton);

    expect(screen.getByTestId('modal-open')).toHaveTextContent('true');

    // Close modal
    const closeModalButton = screen.getByText('Close Modal');
    fireEvent.click(closeModalButton);

    expect(screen.getByTestId('modal-open')).toHaveTextContent('false');
    expect(screen.getByTestId('modal-id')).toHaveTextContent('none');
  });
});
