/**
 * Example usage of useKeyboard hook
 * Demonstrates keyboard navigation integration in the game
 */

'use client';

import { useState, useRef } from 'react';
import { useKeyboard, useFocusTrap, GAME_SHORTCUTS } from './useKeyboard';
import { KeyboardShortcutsHelp } from '@/components/ui/KeyboardShortcutsHelp';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

/**
 * Example: Game Interface with Keyboard Navigation
 */
export function GameInterfaceExample() {
  const [isPaused, setIsPaused] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [message, setMessage] = useState('');

  // Register keyboard shortcuts
  useKeyboard({
    pause: {
      key: GAME_SHORTCUTS.PAUSE,
      description: 'Pause/Resume game',
      callback: () => {
        setIsPaused(!isPaused);
        setMessage(isPaused ? 'Game resumed' : 'Game paused');
      },
      preventDefault: true,
    },
    menu: {
      key: GAME_SHORTCUTS.MENU,
      description: 'Toggle menu',
      callback: () => {
        setShowMenu(!showMenu);
      },
      preventDefault: true,
    },
    help: {
      key: GAME_SHORTCUTS.HELP,
      description: 'Show keyboard shortcuts',
      callback: () => {
        setShowHelp(true);
      },
      preventDefault: true,
    },
    save: {
      key: GAME_SHORTCUTS.SAVE,
      ctrl: true,
      description: 'Save game',
      callback: () => {
        setMessage('Game saved!');
        // Actual save logic would go here
      },
      preventDefault: true,
    },
    zoomIn: {
      key: GAME_SHORTCUTS.ZOOM_IN,
      description: 'Zoom in',
      callback: () => {
        setZoom((z) => Math.min(z + 0.1, 2));
      },
      preventDefault: true,
    },
    zoomOut: {
      key: GAME_SHORTCUTS.ZOOM_OUT,
      description: 'Zoom out',
      callback: () => {
        setZoom((z) => Math.max(z - 0.1, 0.5));
      },
      preventDefault: true,
    },
    zoomReset: {
      key: GAME_SHORTCUTS.ZOOM_RESET,
      description: 'Reset zoom',
      callback: () => {
        setZoom(1);
      },
      preventDefault: true,
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      <div className="max-w-4xl mx-auto space-y-6">
        <header className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Keyboard Navigation Example
          </h1>
          <p className="text-gray-600">
            Press <kbd className="px-2 py-1 bg-gray-100 rounded">H</kbd> for help
          </p>
        </header>

        <main id="main-content" className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Game Status</h2>
              <div className="flex gap-2">
                <Button
                  variant={isPaused ? 'danger' : 'primary'}
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? 'Resume (P)' : 'Pause (P)'}
                </Button>
                <Button variant="secondary" onClick={() => setShowMenu(true)}>
                  Menu (Esc)
                </Button>
                <Button variant="ghost" onClick={() => setShowHelp(true)}>
                  Help (H)
                </Button>
              </div>
            </div>

            {message && (
              <div
                className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
                role="status"
                aria-live="polite"
              >
                {message}
              </div>
            )}

            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Zoom Level: {zoom.toFixed(1)}x</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use + and - keys to zoom, 0 to reset
              </p>
              <div
                className="bg-river-100 rounded-lg p-8 transition-transform"
                style={{ transform: `scale(${zoom})` }}
              >
                <p className="text-center text-river-900 font-semibold">
                  Game Content Area
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-river-500 focus-visible:border-river-500 focus-visible:ring-2 focus-visible:ring-river-500 transition-colors">
                <h4 className="font-semibold mb-1">Focusable Element 1</h4>
                <p className="text-sm text-gray-600">Tab to navigate</p>
              </button>
              <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-river-500 focus-visible:border-river-500 focus-visible:ring-2 focus-visible:ring-river-500 transition-colors">
                <h4 className="font-semibold mb-1">Focusable Element 2</h4>
                <p className="text-sm text-gray-600">Tab to navigate</p>
              </button>
              <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-river-500 focus-visible:border-river-500 focus-visible:ring-2 focus-visible:ring-river-500 transition-colors">
                <h4 className="font-semibold mb-1">Focusable Element 3</h4>
                <p className="text-sm text-gray-600">Tab to navigate</p>
              </button>
              <button className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-river-500 focus-visible:border-river-500 focus-visible:ring-2 focus-visible:ring-river-500 transition-colors">
                <h4 className="font-semibold mb-1">Focusable Element 4</h4>
                <p className="text-sm text-gray-600">Tab to navigate</p>
              </button>
            </div>
          </div>
        </main>

        <footer className="bg-white rounded-lg shadow-md p-4 text-center text-sm text-gray-600">
          <p>Try using keyboard shortcuts to control the interface</p>
        </footer>
      </div>

      {/* Menu Modal with Focus Trap */}
      <MenuModal isOpen={showMenu} onClose={() => setShowMenu(false)} />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </div>
  );
}

/**
 * Example: Menu Modal with Focus Trap
 */
function MenuModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Trap focus within modal when open
  useFocusTrap(modalRef, isOpen);

  // Close on Escape key
  useKeyboard(
    {
      close: {
        key: 'Escape',
        callback: onClose,
        preventDefault: true,
      },
    },
    { enabled: isOpen }
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div ref={modalRef} className="space-y-4">
        <h2 className="text-2xl font-bold">Game Menu</h2>
        <p className="text-gray-600">
          Focus is trapped within this modal. Use Tab to navigate.
        </p>
        <div className="space-y-2">
          <Button variant="primary" className="w-full">
            Continue Game
          </Button>
          <Button variant="secondary" className="w-full">
            Save Game (Ctrl+S)
          </Button>
          <Button variant="secondary" className="w-full">
            Load Game (Ctrl+L)
          </Button>
          <Button variant="secondary" className="w-full">
            Settings
          </Button>
          <Button variant="danger" className="w-full" onClick={onClose}>
            Close Menu (Esc)
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Example: Form with Keyboard Navigation
 */
export function FormExample() {
  const [formData, setFormData] = useState({
    name: '',
    difficulty: 'normal',
    autoSave: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  // Submit form with Ctrl+Enter
  useKeyboard({
    submit: {
      key: 'Enter',
      ctrl: true,
      description: 'Submit form',
      callback: (e) => {
        e.preventDefault();
        handleSubmit(e as any);
      },
      preventDefault: true,
    },
  });

  return (
    <div className="max-w-md mx-auto p-8">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">New Game</h2>

        <div>
          <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">
            Player Name
          </label>
          <input
            id="player-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-river-500 focus:border-river-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            id="difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-river-500 focus:border-river-500"
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            id="auto-save"
            type="checkbox"
            checked={formData.autoSave}
            onChange={(e) => setFormData({ ...formData, autoSave: e.target.checked })}
            className="w-4 h-4 text-river-500 border-gray-300 rounded focus:ring-2 focus:ring-river-500"
          />
          <label htmlFor="auto-save" className="ml-2 text-sm text-gray-700">
            Enable auto-save
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" variant="primary" className="flex-1">
            Start Game (Ctrl+Enter)
          </Button>
          <Button type="button" variant="ghost">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
