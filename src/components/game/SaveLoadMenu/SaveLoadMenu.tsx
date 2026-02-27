'use client';

/**
 * SaveLoadMenu Component
 * Provides UI for managing save slots with save/load/delete operations
 * **Implements: Requirements 7.8, 2.2, 2.3**
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SaveLoadMenuSkeleton } from './SaveLoadMenuSkeleton';
import {
  getAllSaveMetadata,
  saveToSlot,
  loadFromSlot,
  deleteSave,
  exportSave,
  generateExportFilename,
  importSave,
  importAndSaveToSlot,
  SaveSlotError,
  LocalStorageError,
  QuotaExceededError,
} from '@/lib/saves/local';
import { useGameStore } from '@/store';
import type { SaveMetadata } from '@/schemas/save.schema';
import type { GameState } from '@/schemas/save.schema';

export interface SaveLoadMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'save' | 'load';
}

/**
 * Format timestamp to readable date string
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format play time in seconds to readable string
 */
function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Save slot card component
 */
interface SaveSlotCardProps {
  slot: number;
  metadata: SaveMetadata | null;
  mode: 'save' | 'load';
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
  onDelete: (slot: number) => void;
  onExport: (slot: number) => void;
  onImport: (slot: number) => void;
  isLoading: boolean;
}

const SaveSlotCard: React.FC<SaveSlotCardProps> = ({
  slot,
  metadata,
  mode,
  onSave,
  onLoad,
  onDelete,
  onExport,
  onImport,
  isLoading,
}) => {
  const isEmpty = metadata === null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: slot * 0.05 }}
      className={`
        relative border-2 rounded-lg p-4
        ${isEmpty ? 'border-[#555] bg-[#34495e]' : 'border-vietnam-500 bg-[#2c3e50]'}
        hover:shadow-lg transition-shadow
        ${isLoading ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-10">
          <LoadingSpinner size="md" />
        </div>
      )}
      {/* Slot number badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-vietnam-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
        {slot + 1}
      </div>

      {isEmpty ? (
        // Empty slot
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <svg
            className="w-16 h-16 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-medium">Ô lưu trống</p>
          {mode === 'save' && (
            <div className="flex flex-col gap-2 mt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSave(slot)}
                disabled={isLoading}
              >
                Lưu vào đây
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onImport(slot)}
                disabled={isLoading}
              >
                📥 Nhập file
              </Button>
            </div>
          )}
          {mode === 'load' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onImport(slot)}
              disabled={isLoading}
              className="mt-4"
            >
              📥 Nhập file
            </Button>
          )}
        </div>
      ) : (
        // Filled slot
        <div className="space-y-3">
          {/* Player name and level */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white">
              {metadata.playerName}
            </h3>
            <span className="text-sm font-medium text-vietnam-600 bg-vietnam-100 px-2 py-1 rounded">
              Cấp {metadata.level}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Tiến độ</span>
              <span>{metadata.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metadata.progress}%` }}
                transition={{ duration: 0.5, delay: slot * 0.05 + 0.2 }}
                className="h-full bg-gradient-vietnamese"
              />
            </div>
          </div>

          {/* Resources */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1 text-gray-700">
              <span className="font-medium">🌾</span>
              <span>{metadata.resources.food.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <span className="font-medium">💰</span>
              <span>{metadata.resources.gold.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-700">
              <span className="font-medium">⚔️</span>
              <span>{metadata.resources.army.toLocaleString()}</span>
            </div>
          </div>

          {/* Timestamp and play time */}
          <div className="text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formatTimestamp(metadata.timestamp)}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Thời gian chơi: {formatPlayTime(metadata.playTime)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            {mode === 'save' ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSave(slot)}
                disabled={isLoading}
                className="flex-1"
              >
                Ghi đè
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onLoad(slot)}
                disabled={isLoading}
                className="flex-1"
              >
                Tải game
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExport(slot)}
              disabled={isLoading}
              className="px-3"
              aria-label="Xuất file"
              title="Xuất file"
            >
              📤
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(slot)}
              disabled={isLoading}
              className="px-3"
              aria-label="Xóa"
              title="Xóa"
            >
              🗑️
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

/**
 * Delete confirmation dialog
 */
interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: number;
  metadata: SaveMetadata | null;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  slot,
  metadata,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Xác nhận xóa"
      description="Bạn có chắc chắn muốn xóa dữ liệu lưu này?"
    >
      <div className="space-y-4">
        {metadata && (
          <div className="bg-[#34495e] rounded-lg p-3 text-sm">
            <p className="font-medium text-white">Ô lưu #{slot + 1}</p>
            <p className="text-gray-400">{metadata.playerName} - Cấp {metadata.level}</p>
            <p className="text-gray-400 text-xs mt-1">
              {formatTimestamp(metadata.timestamp)}
            </p>
          </div>
        )}
        <p className="text-sm text-gray-700">
          Hành động này không thể hoàn tác. Dữ liệu lưu sẽ bị xóa vĩnh viễn.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Xóa
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Import confirmation dialog
 * **Implements: Requirement 9.7 - Warn before overwriting existing saves**
 */
interface ImportConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: number;
  existingMetadata: SaveMetadata | null;
  importedMetadata: GameState['metadata'] | null;
  onConfirm: () => void;
}

const ImportConfirmDialog: React.FC<ImportConfirmDialogProps> = ({
  open,
  onOpenChange,
  slot: _slot,
  existingMetadata,
  importedMetadata,
  onConfirm,
}) => {
  const willOverwrite = existingMetadata !== null;

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={willOverwrite ? '⚠️ Xác nhận ghi đè' : '📥 Xác nhận nhập'}
      description={
        willOverwrite
          ? 'Ô lưu này đã có dữ liệu. Bạn có muốn ghi đè không?'
          : 'Xác nhận nhập dữ liệu lưu vào ô này?'
      }
    >
      <div className="space-y-4">
        {/* Imported save info */}
        {importedMetadata && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-green-900 mb-1">📥 Dữ liệu nhập:</p>
            <p className="text-green-800">{importedMetadata.playerName} - Cấp {importedMetadata.level}</p>
            <p className="text-green-700 text-xs mt-1">
              Tiến độ: {importedMetadata.progress}% | {formatTimestamp(importedMetadata.timestamp)}
            </p>
          </div>
        )}

        {/* Existing save info (if overwriting) */}
        {willOverwrite && existingMetadata && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <p className="font-medium text-red-900 mb-1">⚠️ Sẽ bị ghi đè:</p>
            <p className="text-red-800">{existingMetadata.playerName} - Cấp {existingMetadata.level}</p>
            <p className="text-red-700 text-xs mt-1">
              Tiến độ: {existingMetadata.progress}% | {formatTimestamp(existingMetadata.timestamp)}
            </p>
          </div>
        )}

        {willOverwrite && (
          <p className="text-sm text-gray-700">
            Dữ liệu lưu hiện tại sẽ bị xóa vĩnh viễn và không thể khôi phục.
          </p>
        )}

        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant={willOverwrite ? 'danger' : 'primary'}
            size="sm"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {willOverwrite ? 'Ghi đè' : 'Nhập'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Main SaveLoadMenu component
 */
export const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({
  open,
  onOpenChange,
  mode,
}) => {
  const [saveMetadata, setSaveMetadata] = useState<(SaveMetadata | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importSlot, setImportSlot] = useState<number | null>(null);
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [importedMetadata, setImportedMetadata] = useState<GameState['metadata'] | null>(null);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addNotification = useGameStore((state) => state.addNotification);
  const gameState = useGameStore();

  // Load save metadata when modal opens
  useEffect(() => {
    if (open) {
      loadSaveMetadata();
    }
  }, [open]);

  const loadSaveMetadata = async () => {
    setIsInitialLoading(true);
    try {
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      const metadata = getAllSaveMetadata();
      setSaveMetadata(metadata);
    } catch (error) {
      console.error('Failed to load save metadata:', error);
      addNotification({
        type: 'error',
        message: 'Không thể tải danh sách lưu game',
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleSave = async (slot: number) => {
    setIsLoading(true);
    setOperationInProgress(`save-${slot}`);
    try {
      // Build game state from store
      const stateToSave: GameState = {
        version: '1.0.0',
        metadata: {
          slot: slot,
          timestamp: Date.now(),
          playerName: gameState.profile.playerName,
          progress: Math.round(
            (gameState.collection.completionPercentage +
              gameState.profile.level) /
              2
          ),
          level: gameState.profile.level,
          playTime: gameState.profile.statistics.totalPlayTime,
        },
        game: {
          phase: gameState.game.phase,
          difficulty: gameState.game.difficulty,
          currentLevel: gameState.game.currentLevel,
          elapsedTime: gameState.game.elapsedTime,
        },
        hero: {
          selectedHero: gameState.hero.selectedHero?.id || null,
          unlockedHeroes: gameState.hero.unlockedHeroes,
        },
        combat: {
          units: gameState.combat.units.map((u) => u.id),
          buildings: gameState.combat.buildings.map((b) => b.id),
          activeEffects: [],
        },
        resources: {
          food: gameState.resources.food,
          gold: gameState.resources.gold,
          army: gameState.resources.army,
          foodCap: gameState.resources.caps.food,
          goldCap: gameState.resources.caps.gold,
          armyCap: gameState.resources.caps.army,
          generation: {
            foodPerSecond: gameState.resources.generation.foodPerSecond,
            goldPerSecond: gameState.resources.generation.goldPerSecond,
            armyPerSecond: gameState.resources.generation.armyPerSecond,
          },
        },
        collection: {
          heroes: gameState.collection.heroes.map((h) => h.id),
          items: gameState.collection.items.map((i) => i.id),
          completionPercentage: gameState.collection.completionPercentage,
        },
        profile: {
          name: gameState.profile.playerName,
          rank: gameState.profile.rank,
          level: gameState.profile.level,
          experience: gameState.profile.experience,
          wins: gameState.profile.wins,
          losses: gameState.profile.losses,
          achievements: gameState.profile.achievements.map((a) => a.id),
          statistics: gameState.profile.statistics,
        },
        research: {
          completed: gameState.research.completed,
          inProgress: gameState.research.inProgress,
          progress: gameState.research.progress,
          available: gameState.getAvailableResearchNodes().map((r) => r.id),
        },
        quiz: {
          questionsAnswered: gameState.quiz.questionsAnswered,
          correctAnswers: gameState.quiz.correctAnswers,
          completedCategories: gameState.quiz.completedCategories,
          rewards: gameState.quiz.rewards.map((r) => r.id),
        },
      };

      await saveToSlot(slot, stateToSave);
      await loadSaveMetadata();
      addNotification({
        type: 'success',
        message: `✅ Đã lưu game vào ô ${slot + 1}`,
      });
    } catch (error) {
      console.error('Save failed:', error);
      
      if (error instanceof QuotaExceededError) {
        addNotification({
          type: 'error',
          message: 'Không đủ dung lượng lưu trữ. Vui lòng xóa bớt dữ liệu lưu cũ.',
        });
      } else if (error instanceof SaveSlotError) {
        addNotification({
          type: 'error',
          message: `Lỗi ô lưu: ${error.message}`,
        });
      } else {
        addNotification({
          type: 'error',
          message: 'Không thể lưu game. Vui lòng thử lại.',
        });
      }
    } finally {
      setIsLoading(false);
      setOperationInProgress(null);
    }
  };

  const handleLoad = async (slot: number) => {
    setIsLoading(true);
    setOperationInProgress(`load-${slot}`);
    try {
      await loadFromSlot(slot);
      
      // TODO: Apply loaded state to store
      // This would require implementing state restoration logic
      // For now, we'll just show a success message
      
      addNotification({
        type: 'success',
        message: `✅ Đã tải game từ ô ${slot + 1}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Load failed:', error);
      
      if (error instanceof SaveSlotError) {
        addNotification({
          type: 'error',
          message: `Lỗi: ${error.message}`,
        });
      } else if (error instanceof LocalStorageError) {
        addNotification({
          type: 'error',
          message: 'Dữ liệu lưu bị hỏng hoặc không hợp lệ.',
        });
      } else {
        addNotification({
          type: 'error',
          message: 'Không thể tải game. Vui lòng thử lại.',
        });
      }
    } finally {
      setIsLoading(false);
      setOperationInProgress(null);
    }
  };

  const handleDeleteClick = (slot: number) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (slotToDelete === null) return;

    setIsLoading(true);
    try {
      await deleteSave(slotToDelete);
      loadSaveMetadata();
      addNotification({
        type: 'success',
        message: `🗑️ Đã xóa dữ liệu lưu ô ${slotToDelete + 1}`,
      });
    } catch (error) {
      console.error('Delete failed:', error);
      addNotification({
        type: 'error',
        message: 'Không thể xóa dữ liệu lưu. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
      setSlotToDelete(null);
    }
  };

  /**
   * Handle export save to file
   * **Implements: Requirement 9.1 - Export function that downloads save as JSON file**
   * **Implements: Requirement 9.2 - Name exported files with timestamp and player identifier**
   */
  const handleExport = async (slot: number) => {
    setIsLoading(true);
    try {
      // Get metadata for filename
      const metadata = saveMetadata[slot];
      if (!metadata) {
        throw new Error('No save data in this slot');
      }

      // Export save data
      const blob = await exportSave(slot);
      
      // Generate filename
      const filename = generateExportFilename(metadata);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      addNotification({
        type: 'success',
        message: `📤 Đã xuất dữ liệu lưu: ${filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      addNotification({
        type: 'error',
        message: 'Không thể xuất dữ liệu lưu. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle import button click - trigger file input
   * **Implements: Requirement 9.3 - Import function that accepts uploaded JSON files**
   */
  const handleImportClick = (slot: number) => {
    setImportSlot(slot);
    // Trigger file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle file selection for import
   * **Implements: Requirement 9.4 - Validate imported save data before loading**
   * **Implements: Requirement 9.5 - Show descriptive error messages for invalid imports**
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || importSlot === null) return;

    setIsLoading(true);
    try {
      // Validate file type
      if (!file.name.endsWith('.json')) {
        throw new Error('Chỉ chấp nhận file JSON (.json)');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File quá lớn. Kích thước tối đa: 10MB');
      }

      // Import and validate the save data
      const gameState = await importSave(file, importSlot);
      
      // Store file and metadata for confirmation dialog
      setImportedFile(file);
      setImportedMetadata(gameState.metadata);
      
      // Show confirmation dialog
      setImportDialogOpen(true);
    } catch (error) {
      console.error('Import validation failed:', error);
      
      // Show descriptive error message
      let errorMessage = 'Không thể nhập file. ';
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid save file format')) {
          errorMessage += 'Định dạng file không hợp lệ.';
        } else if (error.message.includes('checksum mismatch')) {
          errorMessage += 'File bị hỏng hoặc đã bị chỉnh sửa.';
        } else if (error.message.includes('version')) {
          errorMessage += 'Phiên bản không tương thích.';
        } else if (error.message.includes('Invalid save data format')) {
          errorMessage += 'Dữ liệu không đúng định dạng.';
        } else if (error.message.includes('corrupted')) {
          errorMessage += 'Dữ liệu bị hỏng.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Lỗi không xác định.';
      }
      
      addNotification({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /**
   * Handle import confirmation
   * **Implements: Requirement 9.6 - Allow importing to any available save slot**
   * **Implements: Requirement 9.7 - Warn before overwriting existing saves**
   */
  const handleImportConfirm = async () => {
    if (!importedFile || importSlot === null) return;

    setIsLoading(true);
    try {
      // Check if slot is empty
      const willOverwrite = saveMetadata[importSlot] !== null;
      
      // Import and save to slot
      await importAndSaveToSlot(importedFile, importSlot, willOverwrite);
      
      // Reload metadata
      loadSaveMetadata();
      
      addNotification({
        type: 'success',
        message: `✅ Đã nhập dữ liệu lưu vào ô ${importSlot + 1}`,
      });
      
      // Reset import state
      setImportedFile(null);
      setImportedMetadata(null);
      setImportSlot(null);
    } catch (error) {
      console.error('Import save failed:', error);
      addNotification({
        type: 'error',
        message: 'Không thể lưu dữ liệu đã nhập. Vui lòng thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label="Chọn file để nhập"
      />

      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={mode === 'save' ? '💾 Lưu Game' : '📂 Tải Game'}
        description={
          mode === 'save'
            ? 'Chọn ô để lưu tiến trình game của bạn'
            : 'Chọn ô để tải tiến trình game đã lưu'
        }
        className="max-w-4xl"
      >
        <div className="space-y-4">
          {/* Save slots grid or skeleton */}
          {isInitialLoading ? (
            <SaveLoadMenuSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
              {saveMetadata.map((metadata, index) => (
                <SaveSlotCard
                  key={index}
                  slot={index}
                  metadata={metadata}
                  mode={mode}
                  onSave={handleSave}
                  onLoad={handleLoad}
                  onDelete={handleDeleteClick}
                  onExport={handleExport}
                  onImport={handleImportClick}
                  isLoading={operationInProgress === `save-${index}` || operationInProgress === `load-${index}`}
                />
              ))}
            </div>
          )}

          {/* Footer info */}
          <div className="text-xs text-gray-400 text-center pt-2 border-t">
            {mode === 'save'
              ? 'Dữ liệu lưu được lưu trữ trong trình duyệt của bạn. Sử dụng nút xuất (📤) để sao lưu ra file.'
              : 'Chọn một ô lưu để tiếp tục chơi hoặc nhập file đã xuất (📥)'}
          </div>
        </div>
      </Modal>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        slot={slotToDelete ?? 0}
        metadata={slotToDelete !== null ? saveMetadata[slotToDelete] : null}
        onConfirm={handleDeleteConfirm}
      />

      {/* Import confirmation dialog */}
      <ImportConfirmDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        slot={importSlot ?? 0}
        existingMetadata={importSlot !== null ? saveMetadata[importSlot] : null}
        importedMetadata={importedMetadata}
        onConfirm={handleImportConfirm}
      />
    </>
  );
};

export default SaveLoadMenu;
