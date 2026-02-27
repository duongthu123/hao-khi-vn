import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders when open is true', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <Modal open={false} onOpenChange={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Test Title">
        <p>Content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} description="Test description">
        <p>Content</p>
      </Modal>
    );
    
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const handleOpenChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Modal open={true} onOpenChange={handleOpenChange} title="Test Modal">
        <p>Content</p>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button', { name: /đóng/i });
    await user.click(closeButton);
    
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it('has accessible close button', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()}>
        <p>Content</p>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button', { name: /đóng/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()}>
        <div data-testid="custom-content">Custom content</div>
      </Modal>
    );
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });
});
