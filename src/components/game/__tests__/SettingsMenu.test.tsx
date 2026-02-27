/**
 * Tests for SettingsMenu component
 * Validates Requirements 6.8 and 22.6 (animation disable option)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsMenu } from '../SettingsMenu';
import { useGameStore } from '@/store';

// Mock the store
vi.mock('@/store', () => ({
  useGameStore: vi.fn(),
}));

describe('SettingsMenu - Animation Settings', () => {
  const mockOnClose = vi.fn();
  const mockUpdateSettings = vi.fn();

  const defaultSettings = {
    soundEnabled: true,
    musicEnabled: true,
    animationsEnabled: true,
    autoSaveEnabled: true,
    autoSaveInterval: 5 * 60 * 1000,
    language: 'vi' as const,
    difficulty: 'normal' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the store to return settings and update function
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        ui: { settings: defaultSettings },
        updateSettings: mockUpdateSettings,
      };
      return selector(state);
    });
  });

  it('should render animation toggle checkbox', () => {
    render(<SettingsMenu onClose={mockOnClose} />);

    const animationLabel = screen.getByText(/Hiệu ứng chuyển động/i);
    expect(animationLabel).toBeInTheDocument();
  });

  it('should show animation checkbox as checked when animations are enabled', () => {
    render(<SettingsMenu onClose={mockOnClose} />);

    const checkbox = screen.getByRole('checkbox', { name: /Hiệu ứng chuyển động/i });
    expect(checkbox).toBeChecked();
  });

  it('should show animation checkbox as unchecked when animations are disabled', () => {
    // Mock with animations disabled
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      const state = {
        ui: { settings: { ...defaultSettings, animationsEnabled: false } },
        updateSettings: mockUpdateSettings,
      };
      return selector(state);
    });

    render(<SettingsMenu onClose={mockOnClose} />);

    const checkbox = screen.getByRole('checkbox', { name: /Hiệu ứng chuyển động/i });
    expect(checkbox).not.toBeChecked();
  });

  it('should toggle animation setting when checkbox is clicked', async () => {
    render(<SettingsMenu onClose={mockOnClose} />);

    const checkbox = screen.getByRole('checkbox', { name: /Hiệu ứng chuyển động/i });
    
    // Click to disable animations
    fireEvent.click(checkbox);

    // Click save button
    const saveButton = screen.getByRole('button', { name: /Lưu/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          animationsEnabled: false,
        })
      );
    });
  });

  it('should call onClose when save button is clicked', async () => {
    render(<SettingsMenu onClose={mockOnClose} />);

    const saveButton = screen.getByRole('button', { name: /Lưu/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should call onClose when cancel button is clicked without saving', () => {
    render(<SettingsMenu onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: /Hủy/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });

  it('should persist animation setting changes when toggled multiple times', async () => {
    render(<SettingsMenu onClose={mockOnClose} />);

    const checkbox = screen.getByRole('checkbox', { name: /Hiệu ứng chuyển động/i });
    
    // Toggle off
    fireEvent.click(checkbox);
    // Toggle on
    fireEvent.click(checkbox);
    // Toggle off again
    fireEvent.click(checkbox);

    const saveButton = screen.getByRole('button', { name: /Lưu/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith(
        expect.objectContaining({
          animationsEnabled: false,
        })
      );
    });
  });
});
