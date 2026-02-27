/**
 * Keyboard Shortcuts Help Component
 * Displays available keyboard shortcuts to users
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { getKeyDisplayName, GAME_SHORTCUTS } from '@/hooks/useKeyboard';
import { Button } from './Button';
import { Card, CardHeader, CardBody, CardFooter } from './Card';

export interface KeyboardShortcut {
  key: string;
  description: string;
  descriptionVi: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  customShortcuts?: KeyboardShortcut[];
}

/**
 * Default game shortcuts for display
 */
const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: GAME_SHORTCUTS.PAUSE,
    description: 'Pause/Resume game',
    descriptionVi: 'Tạm dừng/Tiếp tục game',
  },
  {
    key: GAME_SHORTCUTS.MENU,
    description: 'Open/Close menu',
    descriptionVi: 'Mở/Đóng menu',
  },
  {
    key: GAME_SHORTCUTS.SAVE,
    ctrl: true,
    description: 'Save game',
    descriptionVi: 'Lưu game',
  },
  {
    key: GAME_SHORTCUTS.LOAD,
    ctrl: true,
    description: 'Load game',
    descriptionVi: 'Tải game',
  },
  {
    key: GAME_SHORTCUTS.HELP,
    description: 'Show help',
    descriptionVi: 'Hiển thị trợ giúp',
  },
  {
    key: GAME_SHORTCUTS.SETTINGS,
    description: 'Open settings',
    descriptionVi: 'Mở cài đặt',
  },
  {
    key: GAME_SHORTCUTS.FULLSCREEN,
    description: 'Toggle fullscreen',
    descriptionVi: 'Bật/Tắt toàn màn hình',
  },
  {
    key: GAME_SHORTCUTS.ZOOM_IN,
    description: 'Zoom in',
    descriptionVi: 'Phóng to',
  },
  {
    key: GAME_SHORTCUTS.ZOOM_OUT,
    description: 'Zoom out',
    descriptionVi: 'Thu nhỏ',
  },
  {
    key: GAME_SHORTCUTS.ZOOM_RESET,
    description: 'Reset zoom',
    descriptionVi: 'Đặt lại zoom',
  },
  {
    key: GAME_SHORTCUTS.NEXT,
    description: 'Next item',
    descriptionVi: 'Mục tiếp theo',
  },
  {
    key: GAME_SHORTCUTS.PREVIOUS,
    description: 'Previous item',
    descriptionVi: 'Mục trước',
  },
  {
    key: GAME_SHORTCUTS.CONFIRM,
    description: 'Confirm action',
    descriptionVi: 'Xác nhận',
  },
  {
    key: 'Tab',
    description: 'Navigate between elements',
    descriptionVi: 'Di chuyển giữa các phần tử',
  },
  {
    key: 'Tab',
    shift: true,
    description: 'Navigate backwards',
    descriptionVi: 'Di chuyển ngược lại',
  },
];

/**
 * Keyboard Shortcuts Help Modal
 * 
 * Displays a modal with all available keyboard shortcuts
 * Helps users discover and learn keyboard navigation
 */
export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  customShortcuts = [],
}: KeyboardShortcutsHelpProps) {
  const shortcuts = [...DEFAULT_SHORTCUTS, ...customShortcuts];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1200]"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[1201] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="shortcuts-title"
            >
              <Card className="shadow-lacquer">
                <CardHeader>
                  <h2 id="shortcuts-title" className="text-2xl font-bold text-gray-900">
                    Phím tắt / Keyboard Shortcuts
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Sử dụng các phím tắt để điều khiển game nhanh hơn
                  </p>
                </CardHeader>

                <CardBody className="overflow-y-auto max-h-[50vh]">
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <motion.div
                        key={`${shortcut.key}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {shortcut.descriptionVi}
                          </p>
                          <p className="text-sm text-gray-600">
                            {shortcut.description}
                          </p>
                        </div>
                        <kbd className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 border border-gray-300 text-sm font-mono font-semibold text-gray-800 shadow-sm">
                          {getKeyDisplayName(shortcut.key, {
                            ctrl: shortcut.ctrl,
                            shift: shortcut.shift,
                            alt: shortcut.alt,
                          })}
                        </kbd>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional tips */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 bg-river-50 border border-river-200 rounded-lg"
                  >
                    <h3 className="font-semibold text-river-900 mb-2">
                      💡 Mẹo / Tips
                    </h3>
                    <ul className="space-y-1 text-sm text-river-800">
                      <li>• Sử dụng Tab để di chuyển giữa các phần tử</li>
                      <li>• Use Tab to navigate between elements</li>
                      <li>• Nhấn Enter để xác nhận hành động</li>
                      <li>• Press Enter to confirm actions</li>
                      <li>• Nhấn Escape để đóng menu hoặc hủy</li>
                      <li>• Press Escape to close menus or cancel</li>
                    </ul>
                  </motion.div>
                </CardBody>

                <CardFooter className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={onClose}
                    autoFocus
                  >
                    Đóng / Close
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Compact keyboard shortcut indicator
 * Shows a single shortcut inline
 */
export function KeyboardShortcutBadge({
  shortcut,
  className = '',
}: {
  shortcut: KeyboardShortcut;
  className?: string;
}) {
  return (
    <kbd
      className={`inline-flex items-center px-2 py-1 rounded bg-gray-100 border border-gray-300 text-xs font-mono font-semibold text-gray-700 ${className}`}
      title={`${shortcut.descriptionVi} / ${shortcut.description}`}
    >
      {getKeyDisplayName(shortcut.key, {
        ctrl: shortcut.ctrl,
        shift: shortcut.shift,
        alt: shortcut.alt,
      })}
    </kbd>
  );
}
