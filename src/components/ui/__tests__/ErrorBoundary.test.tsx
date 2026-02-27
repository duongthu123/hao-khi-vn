import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';
import { GameErrorBoundary } from '../GameErrorBoundary';
import { ComponentErrorBoundary } from '../ComponentErrorBoundary';

// Suppress console errors during tests
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Component that throws an error
function ThrowError({ message = 'Test error' }: { message?: string }) {
  throw new Error(message);
}

// Component that works normally
function WorkingComponent() {
  return <div>Working component</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('catches errors and displays default fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for Vietnamese error title
    expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();
    
    // Check for error message
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
  });

  it('displays recovery options', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for recovery buttons
    expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
    expect(screen.getByText(/Tải lại trang/i)).toBeInTheDocument();
    expect(screen.getByText(/Quay về menu chính/i)).toBeInTheDocument();
  });

  it('resets error state when reset button is clicked', () => {
    let shouldThrow = true;

    function ConditionalError() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();

    // Fix the error condition
    shouldThrow = false;

    // Click reset button
    const resetButton = screen.getByText(/Thử lại/i);
    fireEvent.click(resetButton);

    // Component should render normally after reset
    rerender(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="Custom error" />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0].message).toBe('Custom error');
  });

  it('renders custom fallback when provided', () => {
    const customFallback = (error: Error) => (
      <div>Custom fallback: {error.message}</div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError message="Custom error" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Custom fallback: Custom error/i)).toBeInTheDocument();
  });

  it('resets when resetKeys change', () => {
    let shouldThrow = true;

    function ConditionalError() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    }

    const { rerender } = render(
      <ErrorBoundary resetKeys={['key1']}>
        <ConditionalError />
      </ErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();

    // Fix the error condition
    shouldThrow = false;

    // Change reset key
    rerender(
      <ErrorBoundary resetKeys={['key2']}>
        <ConditionalError />
      </ErrorBoundary>
    );

    // Error should be cleared
    expect(screen.queryByText(/Đã xảy ra lỗi/i)).not.toBeInTheDocument();
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('displays English translations alongside Vietnamese', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for both Vietnamese and English text
    expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
  });
});

describe('GameErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <GameErrorBoundary section="combat">
        <WorkingComponent />
      </GameErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('catches errors and displays section-specific fallback', () => {
    render(
      <GameErrorBoundary section="combat">
        <ThrowError />
      </GameErrorBoundary>
    );

    // Check for section-specific error message
    expect(screen.getByText(/Lỗi trong phần/i)).toBeInTheDocument();
    expect(screen.getByText(/chiến đấu/i)).toBeInTheDocument();
  });

  it('displays Vietnamese section names correctly', () => {
    const sections = [
      { key: 'map', name: 'bản đồ' },
      { key: 'hero', name: 'anh hùng' },
      { key: 'resources', name: 'tài nguyên' },
      { key: 'quiz', name: 'câu đố' },
    ];

    sections.forEach(({ key, name }) => {
      const { unmount } = render(
        <GameErrorBoundary section={key}>
          <ThrowError />
        </GameErrorBoundary>
      );

      expect(screen.getByText(new RegExp(name, 'i'))).toBeInTheDocument();
      unmount();
    });
  });

  it('provides recovery options', () => {
    render(
      <GameErrorBoundary section="combat">
        <ThrowError />
      </GameErrorBoundary>
    );

    expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
    expect(screen.getByText(/Quay về menu/i)).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <GameErrorBoundary section="combat">
        <ThrowError />
      </GameErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'assertive');
  });

  it('displays error message', () => {
    render(
      <GameErrorBoundary section="combat">
        <ThrowError message="Combat system error" />
      </GameErrorBoundary>
    );

    expect(screen.getByText(/Combat system error/i)).toBeInTheDocument();
  });
});

describe('ComponentErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ComponentErrorBoundary componentName="Hero Stats">
        <WorkingComponent />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText('Working component')).toBeInTheDocument();
  });

  it('catches errors and displays minimal fallback', () => {
    render(
      <ComponentErrorBoundary componentName="Hero Stats">
        <ThrowError />
      </ComponentErrorBoundary>
    );

    // Check for component-specific error message
    expect(screen.getByText(/Không thể tải Hero Stats/i)).toBeInTheDocument();
  });

  it('displays custom fallback message when provided', () => {
    render(
      <ComponentErrorBoundary 
        componentName="Hero Stats"
        fallbackMessage="Lỗi tải thông tin anh hùng"
      >
        <ThrowError />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText(/Lỗi tải thông tin anh hùng/i)).toBeInTheDocument();
  });

  it('provides try again option', () => {
    render(
      <ComponentErrorBoundary componentName="Hero Stats">
        <ThrowError />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(
      <ComponentErrorBoundary componentName="Hero Stats">
        <ThrowError />
      </ComponentErrorBoundary>
    );

    const errorContainer = screen.getByRole('alert');
    expect(errorContainer).toHaveAttribute('aria-live', 'polite');
  });

  it('resets error when try again is clicked', () => {
    let shouldThrow = true;

    function ConditionalError() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    }

    const { rerender } = render(
      <ComponentErrorBoundary componentName="Test">
        <ConditionalError />
      </ComponentErrorBoundary>
    );

    // Error should be displayed
    expect(screen.getByText(/Không thể tải Test/i)).toBeInTheDocument();

    // Fix the error condition
    shouldThrow = false;

    // Click try again button
    const tryAgainButton = screen.getByText(/Thử lại/i);
    fireEvent.click(tryAgainButton);

    // Component should render normally after reset
    rerender(
      <ComponentErrorBoundary componentName="Test">
        <ConditionalError />
      </ComponentErrorBoundary>
    );
  });

  it('displays error message in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ComponentErrorBoundary componentName="Hero Stats">
        <ThrowError message="Detailed error message" />
      </ComponentErrorBoundary>
    );

    expect(screen.getByText(/Detailed error message/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('Error Boundary Integration', () => {
  it('nested error boundaries work correctly', () => {
    function OuterComponent() {
      return (
        <div>
          <div>Outer component</div>
          <ThrowError message="Inner error" />
        </div>
      );
    }

    render(
      <ErrorBoundary>
        <div>Top level</div>
        <GameErrorBoundary section="test">
          <OuterComponent />
        </GameErrorBoundary>
      </ErrorBoundary>
    );

    // Inner error boundary should catch the error
    expect(screen.getByText(/Lỗi trong phần/i)).toBeInTheDocument();
    
    // Top level should still be visible
    expect(screen.getByText('Top level')).toBeInTheDocument();
  });

  it('error in one boundary does not affect siblings', () => {
    render(
      <div>
        <ComponentErrorBoundary componentName="Component 1">
          <ThrowError />
        </ComponentErrorBoundary>

        <ComponentErrorBoundary componentName="Component 2">
          <WorkingComponent />
        </ComponentErrorBoundary>
      </div>
    );

    // First component should show error
    expect(screen.getByText(/Không thể tải Component 1/i)).toBeInTheDocument();

    // Second component should work normally
    expect(screen.getByText('Working component')).toBeInTheDocument();
  });
});
