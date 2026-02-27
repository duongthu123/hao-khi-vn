/**
 * Error Boundary Usage Examples
 * 
 * This file demonstrates how to use the error boundary components
 * in different scenarios throughout the application.
 */

import { ErrorBoundary, GameErrorBoundary, ComponentErrorBoundary } from '@/components/ui';

// ============================================================================
// Example 1: Basic ErrorBoundary with default fallback
// ============================================================================

export function Example1_BasicUsage() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}

// ============================================================================
// Example 2: ErrorBoundary with custom fallback
// ============================================================================

export function Example2_CustomFallback() {
  return (
    <ErrorBoundary
      fallback={(error, errorInfo, reset) => (
        <div className="p-4 bg-red-50 rounded">
          <h2>Đã xảy ra lỗi tùy chỉnh</h2>
          <p>{error.message}</p>
          <button onClick={reset}>Thử lại</button>
        </div>
      )}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}

// ============================================================================
// Example 3: ErrorBoundary with error logging
// ============================================================================

export function Example3_WithErrorLogging() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Send to error tracking service
    console.error('Error logged:', error, errorInfo);
    // Example: Sentry.captureException(error, { extra: errorInfo });
  };

  return (
    <ErrorBoundary onError={handleError}>
      <YourComponent />
    </ErrorBoundary>
  );
}

// ============================================================================
// Example 4: ErrorBoundary with reset keys
// ============================================================================

export function Example4_WithResetKeys() {
  const [userId, setUserId] = React.useState('user-1');

  return (
    <ErrorBoundary resetKeys={[userId]}>
      {/* Error boundary will reset when userId changes */}
      <UserProfile userId={userId} />
    </ErrorBoundary>
  );
}

// ============================================================================
// Example 5: GameErrorBoundary for game sections
// ============================================================================

export function Example5_GameSection() {
  return (
    <GameErrorBoundary section="combat">
      <CombatView />
    </GameErrorBoundary>
  );
}

// ============================================================================
// Example 6: Multiple GameErrorBoundaries for different sections
// ============================================================================

export function Example6_MultipleGameSections() {
  return (
    <div className="game-layout">
      <GameErrorBoundary section="map">
        <GameMap />
      </GameErrorBoundary>

      <GameErrorBoundary section="resources">
        <ResourceDisplay />
      </GameErrorBoundary>

      <GameErrorBoundary section="combat">
        <CombatView />
      </GameErrorBoundary>
    </div>
  );
}

// ============================================================================
// Example 7: ComponentErrorBoundary for individual components
// ============================================================================

export function Example7_ComponentLevel() {
  return (
    <div className="dashboard">
      <ComponentErrorBoundary componentName="Hero Stats">
        <HeroStatsWidget />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary componentName="Resource Counter">
        <ResourceCounter />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary 
        componentName="Leaderboard"
        fallbackMessage="Không thể tải bảng xếp hạng"
      >
        <Leaderboard />
      </ComponentErrorBoundary>
    </div>
  );
}

// ============================================================================
// Example 8: Nested error boundaries
// ============================================================================

export function Example8_NestedBoundaries() {
  return (
    <GameErrorBoundary section="game">
      {/* Top-level game error boundary */}
      <div className="game-container">
        <ComponentErrorBoundary componentName="Header">
          <GameHeader />
        </ComponentErrorBoundary>

        <div className="game-content">
          <GameErrorBoundary section="map">
            {/* Section-specific error boundary */}
            <GameMap />
          </GameErrorBoundary>

          <div className="sidebar">
            <ComponentErrorBoundary componentName="Mini Map">
              <MiniMap />
            </ComponentErrorBoundary>

            <ComponentErrorBoundary componentName="Quest Log">
              <QuestLog />
            </ComponentErrorBoundary>
          </div>
        </div>
      </div>
    </GameErrorBoundary>
  );
}

// ============================================================================
// Example 9: Error boundary with lazy-loaded components
// ============================================================================

const LazyGameMap = React.lazy(() => import('./GameMap'));

export function Example9_WithLazyLoading() {
  return (
    <GameErrorBoundary section="map">
      <React.Suspense fallback={<LoadingSpinner />}>
        <LazyGameMap />
      </React.Suspense>
    </GameErrorBoundary>
  );
}

// ============================================================================
// Example 10: Error boundary in modal/dialog
// ============================================================================

export function Example10_InModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <GameErrorBoundary section="settings">
        <SettingsPanel />
      </GameErrorBoundary>
    </Modal>
  );
}

// ============================================================================
// Mock components for examples
// ============================================================================

function YourComponent() {
  return <div>Your component content</div>;
}

function UserProfile({ userId }: { userId: string }) {
  return <div>User: {userId}</div>;
}

function CombatView() {
  return <div>Combat View</div>;
}

function GameMap() {
  return <div>Game Map</div>;
}

function ResourceDisplay() {
  return <div>Resources</div>;
}

function HeroStatsWidget() {
  return <div>Hero Stats</div>;
}

function ResourceCounter() {
  return <div>Resource Counter</div>;
}

function Leaderboard() {
  return <div>Leaderboard</div>;
}

function GameHeader() {
  return <div>Game Header</div>;
}

function MiniMap() {
  return <div>Mini Map</div>;
}

function QuestLog() {
  return <div>Quest Log</div>;
}

function LoadingSpinner() {
  return <div>Loading...</div>;
}

function SettingsPanel() {
  return <div>Settings</div>;
}

function Modal({ open, onOpenChange, children }: any) {
  return open ? <div>{children}</div> : null;
}

// Add React import for the examples
import React from 'react';
