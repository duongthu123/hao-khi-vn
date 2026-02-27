/**
 * SaveLoadMenu Component Tests
 * **Validates: Requirements 7.8, 2.2, 2.3**
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SaveLoadMenu } from './SaveLoadMenu';
import * as localSaves from '@/lib/saves/local';
import type { SaveMetadata } from '@/schemas/save.schema';

// Mock framer-motion to provide useReducedMotion (needed by Modal -> useAnimations)
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    useReducedMotion: () => false,
  };
});

/**
 * Helper: render and wait for initial loading to complete.
 * The component has a 300ms setTimeout before showing slots.
 */
async function renderAndWaitForLoad(ui: React.ReactElement) {
  const result = render(ui);
  // Wait for the loading skeleton to disappear and real content to appear
  await waitFor(() => {
    expect(screen.queryByLabelText('Đang tải')).not.toBeInTheDocument();
  });
  return result;
}

// Mock the local saves module
vi.mock('@/lib/saves/local', () => ({
  getAllSaveMetadata: vi.fn(),
  saveToSlot: vi.fn(),
  loadFromSlot: vi.fn(),
  deleteSave: vi.fn(),
  isSlotEmpty: vi.fn(),
  SaveSlotError: class SaveSlotError extends Error {
    constructor(message: string, public slot: number) {
      super(message);
      this.name = 'SaveSlotError';
    }
  },
  LocalStorageError: class LocalStorageError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'LocalStorageError';
    }
  },
  QuotaExceededError: class QuotaExceededError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'QuotaExceededError';
    }
  },
  SAVE_SLOT_COUNT: 5,
  MIN_SLOT: 0,
  MAX_SLOT: 4,
}));

// Mock the game store
vi.mock('@/store', () => ({
  useGameStore: vi.fn((selector) => {
    const mockState = {
      profile: {
        playerName: 'Test Player',
        rank: 'Chiến Binh',
        level: 10,
        experience: 5000,
        wins: 5,
        losses: 2,
        achievements: [],
        statistics: {
          totalPlayTime: 3600,
          unitsDefeated: 100,
          resourcesGathered: 5000,
          quizzesCompleted: 10,
        },
      },
      game: {
        phase: 'playing' as const,
        difficulty: 'normal' as const,
        currentLevel: 5,
        elapsedTime: 1800,
      },
      hero: {
        selectedHero: { id: 'hero-1', name: 'Test Hero' },
        unlockedHeroes: ['hero-1', 'hero-2'],
      },
      combat: {
        units: [{ id: 'unit-1' }, { id: 'unit-2' }],
        buildings: [{ id: 'building-1' }],
      },
      resources: {
        food: 1000,
        gold: 500,
        army: 50,
        caps: {
          food: 2000,
          gold: 1000,
          army: 100,
        },
        generation: {
          foodPerSecond: 10,
          goldPerSecond: 5,
          armyPerSecond: 1,
        },
      },
      collection: {
        heroes: ['hero-1', 'hero-2'],
        items: ['item-1'],
        completionPercentage: 45,
      },
      research: {
        completed: ['research-1'],
        inProgress: 'research-2',
        progress: 50,
        progressStartTime: Date.now(),
      },
      getAvailableResearchNodes: vi.fn(() => [
        { id: 'research-3', name: 'Research 3' },
      ]),
      quiz: {
        questionsAnswered: 20,
        correctAnswers: 15,
        completedCategories: ['history'],
        rewards: [{ id: 'reward-1' }],
      },
      ui: {
        settings: {
          animationsEnabled: true,
        },
      },
      addNotification: vi.fn(),
    };

    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  }),
}));

describe('SaveLoadMenu', () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders save mode with correct title', () => {
      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        null,
        null,
        null,
        null,
        null,
      ]);

      render(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      expect(screen.getByText('💾 Lưu Game')).toBeInTheDocument();
      expect(
        screen.getByText('Chọn ô để lưu tiến trình game của bạn')
      ).toBeInTheDocument();
    });

    it('renders load mode with correct title', () => {
      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        null,
        null,
        null,
        null,
        null,
      ]);

      render(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="load" />
      );

      expect(screen.getByText('📂 Tải Game')).toBeInTheDocument();
      expect(
        screen.getByText('Chọn ô để tải tiến trình game đã lưu')
      ).toBeInTheDocument();
    });

    it('displays all 5 save slots', async () => {
      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        null,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      // Check for slot number badges (1-5)
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays empty slot state', async () => {
      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        null,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      const emptySlotTexts = screen.getAllByText('Ô lưu trống');
      expect(emptySlotTexts).toHaveLength(5);
    });

    it('displays filled slot with metadata', async () => {
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Trần Hưng Đạo',
        progress: 75,
        resources: {
          food: 1500,
          gold: 800,
          army: 75,
        },
        level: 15,
        playTime: 7200,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      expect(screen.getByText('Trần Hưng Đạo')).toBeInTheDocument();
      expect(screen.getByText('Cấp 15')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('1,500')).toBeInTheDocument();
      expect(screen.getByText('800')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  describe('Save Operation', () => {
    it('saves game to empty slot', async () => {
      const user = userEvent.setup();
      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        null,
        null,
        null,
        null,
        null,
      ]);
      vi.mocked(localSaves.saveToSlot).mockResolvedValue();

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      const saveButtons = screen.getAllByText('Lưu vào đây');
      await user.click(saveButtons[0]);

      await waitFor(() => {
        expect(localSaves.saveToSlot).toHaveBeenCalledWith(
          0,
          expect.objectContaining({
            version: '1.0.0',
            metadata: expect.objectContaining({
              slot: 0,
              playerName: 'Test Player',
            }),
          })
        );
      });
    });

    it('overwrites existing save slot', async () => {
      const user = userEvent.setup();
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Old Save',
        progress: 50,
        resources: { food: 100, gold: 100, army: 10 },
        level: 5,
        playTime: 1000,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);
      vi.mocked(localSaves.saveToSlot).mockResolvedValue();

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      const overwriteButton = screen.getByText('Ghi đè');
      await user.click(overwriteButton);

      await waitFor(() => {
        expect(localSaves.saveToSlot).toHaveBeenCalledWith(0, expect.any(Object));
      });
    });

    it('handles save error gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        null,
        null,
        null,
        null,
        null,
      ]);
      vi.mocked(localSaves.saveToSlot).mockRejectedValue(
        new Error('Save failed')
      );

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      const saveButtons = screen.getAllByText('Lưu vào đây');
      await user.click(saveButtons[0]);

      await waitFor(() => {
        expect(localSaves.saveToSlot).toHaveBeenCalled();
      });
    });
  });

  describe('Load Operation', () => {
    it('loads game from filled slot', async () => {
      const user = userEvent.setup();
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Saved Game',
        progress: 60,
        resources: { food: 500, gold: 300, army: 30 },
        level: 8,
        playTime: 2000,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);
      vi.mocked(localSaves.loadFromSlot).mockResolvedValue({} as any);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="load" />
      );

      const loadButton = screen.getByText('Tải game');
      await user.click(loadButton);

      await waitFor(() => {
        expect(localSaves.loadFromSlot).toHaveBeenCalledWith(0);
      });
    });

    it('handles load error gracefully', async () => {
      const user = userEvent.setup();
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Corrupted Save',
        progress: 40,
        resources: { food: 200, gold: 150, army: 20 },
        level: 6,
        playTime: 1500,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);
      vi.mocked(localSaves.loadFromSlot).mockRejectedValue(
        new Error('Load failed')
      );

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="load" />
      );

      const loadButton = screen.getByText('Tải game');
      await user.click(loadButton);

      await waitFor(() => {
        expect(localSaves.loadFromSlot).toHaveBeenCalled();
      });
    });
  });

  describe('Delete Operation', () => {
    it('opens delete confirmation dialog', async () => {
      const user = userEvent.setup();
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'To Delete',
        progress: 30,
        resources: { food: 100, gold: 50, army: 10 },
        level: 3,
        playTime: 500,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      const deleteButton = screen.getByLabelText('Xóa');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument();
        expect(
          screen.getByText('Bạn có chắc chắn muốn xóa dữ liệu lưu này?')
        ).toBeInTheDocument();
      });
    });

    it('deletes save after confirmation', async () => {
      const user = userEvent.setup();
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'To Delete',
        progress: 30,
        resources: { food: 100, gold: 50, army: 10 },
        level: 3,
        playTime: 500,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);
      vi.mocked(localSaves.deleteSave).mockResolvedValue();

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      // Click delete button
      const deleteButton = screen.getByLabelText('Xóa');
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /xóa/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(localSaves.deleteSave).toHaveBeenCalledWith(0);
      });
    });

    it('cancels delete operation', async () => {
      const user = userEvent.setup();
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Not Deleted',
        progress: 30,
        resources: { food: 100, gold: 50, army: 10 },
        level: 3,
        playTime: 500,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      // Click delete button
      const deleteButton = screen.getByLabelText('Xóa');
      await user.click(deleteButton);

      // Cancel deletion
      const cancelButton = screen.getByRole('button', { name: /hủy/i });
      await user.click(cancelButton);

      expect(localSaves.deleteSave).not.toHaveBeenCalled();
    });
  });

  describe('Metadata Display', () => {
    it('formats timestamp correctly', async () => {
      const timestamp = new Date('2024-01-15T10:30:00').getTime();
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp,
        playerName: 'Test',
        progress: 50,
        resources: { food: 100, gold: 100, army: 10 },
        level: 5,
        playTime: 1000,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      // Check that timestamp is displayed (format may vary by locale)
      expect(screen.getByText(/15/)).toBeInTheDocument();
    });

    it('formats play time correctly', async () => {
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Test',
        progress: 50,
        resources: { food: 100, gold: 100, army: 10 },
        level: 5,
        playTime: 7320, // 2 hours 2 minutes
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      expect(screen.getByText(/2h 2m/)).toBeInTheDocument();
    });

    it('displays resources with thousand separators', async () => {
      const mockMetadata: SaveMetadata = {
        slot: 0,
        timestamp: Date.now(),
        playerName: 'Test',
        progress: 50,
        resources: { food: 12345, gold: 6789, army: 123 },
        level: 5,
        playTime: 1000,
        version: '1.0.0',
      };

      vi.mocked(localSaves.getAllSaveMetadata).mockReturnValue([
        mockMetadata,
        null,
        null,
        null,
        null,
      ]);

      await renderAndWaitForLoad(
        <SaveLoadMenu open={true} onOpenChange={mockOnOpenChange} mode="save" />
      );

      expect(screen.getByText('12,345')).toBeInTheDocument();
      expect(screen.getByText('6,789')).toBeInTheDocument();
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });
});
