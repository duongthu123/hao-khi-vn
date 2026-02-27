# Error Boundary Components

Comprehensive error handling components for the Vietnamese Historical Strategy Game with Vietnamese language support and recovery options.

## Overview

This module provides three error boundary components:

1. **ErrorBoundary** - Base error boundary with full-featured error handling
2. **GameErrorBoundary** - Specialized for game sections with game-specific recovery
3. **ComponentErrorBoundary** - Lightweight for individual components

All components provide:
- ✅ Vietnamese language error messages
- ✅ English translations
- ✅ Recovery options (try again, reload, return to menu)
- ✅ Development mode error details
- ✅ Accessible ARIA labels
- ✅ Responsive design

## Components

### ErrorBoundary

Base error boundary component with customizable fallback UI.

**Props:**
- `children: ReactNode` - Components to wrap
- `fallback?: (error, errorInfo, reset) => ReactNode` - Custom fallback UI
- `onError?: (error, errorInfo) => void` - Error callback for logging
- `resetKeys?: Array<string | number>` - Keys that trigger reset when changed

**Features:**
- Full-page error UI with Vietnamese messages
- Three recovery options: Try Again, Reload Page, Return to Menu
- Development mode shows component stack trace
- Accessible with ARIA labels and keyboard navigation

**Example:**
```tsx
import { ErrorBoundary } from '@/components/ui';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### GameErrorBoundary

Specialized error boundary for game sections with section-specific error messages.

**Props:**
- `children: ReactNode` - Components to wrap
- `section?: string` - Section name (e.g., 'map', 'combat', 'hero')

**Supported Sections:**
- `game` - Trò chơi
- `map` - Bản đồ
- `combat` - Chiến đấu
- `hero` - Anh hùng
- `resources` - Tài nguyên
- `quiz` - Câu đố
- `collection` - Bộ sưu tập
- `profile` - Hồ sơ
- `research` - Nghiên cứu
- `settings` - Cài đặt
- `menu` - Menu

**Features:**
- Compact error UI suitable for page sections
- Section-specific Vietnamese names
- Two recovery options: Try Again, Return to Menu
- Automatic error logging in development

**Example:**
```tsx
import { GameErrorBoundary } from '@/components/ui';

<GameErrorBoundary section="combat">
  <CombatView />
</GameErrorBoundary>
```

### ComponentErrorBoundary

Lightweight error boundary for individual components with minimal UI disruption.

**Props:**
- `children: ReactNode` - Components to wrap
- `componentName?: string` - Component name for error message
- `fallbackMessage?: string` - Custom Vietnamese error message

**Features:**
- Minimal inline error UI (yellow warning box)
- Single recovery option: Try Again
- Does not disrupt surrounding UI
- Perfect for widgets and small components

**Example:**
```tsx
import { ComponentErrorBoundary } from '@/components/ui';

<ComponentErrorBoundary 
  componentName="Hero Stats"
  fallbackMessage="Không thể tải thông tin anh hùng"
>
  <HeroStatsWidget />
</ComponentErrorBoundary>
```

## Usage Patterns

### Pattern 1: Application-Level Protection

Wrap the entire application in the Providers component (already implemented):

```tsx
// src/components/providers/Providers.tsx
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### Pattern 2: Page-Level Protection

Wrap major page sections with GameErrorBoundary:

```tsx
export function GamePage() {
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
```

### Pattern 3: Component-Level Protection

Wrap individual widgets with ComponentErrorBoundary:

```tsx
export function Dashboard() {
  return (
    <div className="dashboard">
      <ComponentErrorBoundary componentName="Mini Map">
        <MiniMap />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary componentName="Quest Log">
        <QuestLog />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary componentName="Inventory">
        <Inventory />
      </ComponentErrorBoundary>
    </div>
  );
}
```

### Pattern 4: Nested Boundaries

Combine multiple error boundaries for granular error handling:

```tsx
export function GameView() {
  return (
    <GameErrorBoundary section="game">
      {/* Top-level catches catastrophic errors */}
      
      <ComponentErrorBoundary componentName="Header">
        <GameHeader />
      </ComponentErrorBoundary>

      <div className="game-content">
        <GameErrorBoundary section="map">
          {/* Section-level catches map errors */}
          <GameMap />
        </GameErrorBoundary>

        <div className="sidebar">
          <ComponentErrorBoundary componentName="Stats">
            {/* Component-level catches widget errors */}
            <StatsPanel />
          </ComponentErrorBoundary>
        </div>
      </div>
    </GameErrorBoundary>
  );
}
```

### Pattern 5: With Lazy Loading

Combine with React.Suspense for lazy-loaded components:

```tsx
const LazyGameMap = React.lazy(() => import('./GameMap'));

export function MapView() {
  return (
    <GameErrorBoundary section="map">
      <React.Suspense fallback={<LoadingSpinner />}>
        <LazyGameMap />
      </React.Suspense>
    </GameErrorBoundary>
  );
}
```

### Pattern 6: With Error Logging

Add error tracking for production monitoring:

```tsx
export function MonitoredComponent() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
      console.error('Production error:', error);
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Pattern 7: With Reset Keys

Automatically reset error state when dependencies change:

```tsx
export function UserProfile() {
  const [userId, setUserId] = useState('user-1');

  return (
    <ErrorBoundary resetKeys={[userId]}>
      {/* Error boundary resets when userId changes */}
      <ProfileContent userId={userId} />
    </ErrorBoundary>
  );
}
```

## Vietnamese Language Support

All error messages are provided in Vietnamese with English translations:

### ErrorBoundary Messages:
- **Title**: "Đã xảy ra lỗi" / "An error occurred"
- **Error message**: "Thông báo lỗi" / "Error message"
- **Technical details**: "Chi tiết kỹ thuật" / "Technical details"
- **Options prompt**: "Vui lòng chọn một trong các tùy chọn sau" / "Please choose one of the following options"
- **Try again**: "Thử lại" / "Try Again"
- **Reload page**: "Tải lại trang" / "Reload Page"
- **Return to menu**: "Quay về menu chính" / "Return to Main Menu"
- **Help text**: "Nếu lỗi vẫn tiếp tục xảy ra..." / "If the error persists..."

### GameErrorBoundary Messages:
- **Title**: "Lỗi trong phần [section]" / "Error in [section] section"
- **Try again**: "Thử lại" / "Try Again"
- **Return to menu**: "Quay về menu" / "Return to Menu"

### ComponentErrorBoundary Messages:
- **Title**: "Không thể tải [component]" / "Unable to load [component]"
- **Try again**: "Thử lại" / "Try again"

## Accessibility

All error boundaries follow WCAG 2.1 Level AA guidelines:

- ✅ `role="alert"` for error announcements
- ✅ `aria-live="assertive"` for critical errors
- ✅ `aria-live="polite"` for component errors
- ✅ `aria-label` on all interactive elements
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader compatible
- ✅ Color contrast compliant

## Development vs Production

### Development Mode:
- Shows detailed error messages
- Displays component stack traces
- Logs errors to console
- Shows expandable error details

### Production Mode:
- Shows user-friendly messages only
- Hides technical details
- Can integrate with error tracking services
- Maintains security by not exposing internals

## Integration Points

The error boundaries are already integrated into:

1. **Providers Component** (`src/components/providers/Providers.tsx`)
   - Wraps entire application
   - Catches top-level errors

2. **GameClient Component** (`src/components/game/GameClient.tsx`)
   - Wraps game sections
   - Wraps menu sections
   - Wraps settings modal

## Best Practices

### ✅ DO:
- Wrap major sections with GameErrorBoundary
- Wrap individual widgets with ComponentErrorBoundary
- Use descriptive section/component names
- Provide custom fallback messages when appropriate
- Log errors in production for monitoring
- Test error boundaries with intentional errors

### ❌ DON'T:
- Don't wrap every single component (over-engineering)
- Don't use ErrorBoundary for expected errors (use try-catch)
- Don't ignore errors in event handlers (boundaries don't catch these)
- Don't use error boundaries for control flow
- Don't forget to test error recovery

## Testing Error Boundaries

### Manual Testing:

Create a test component that throws an error:

```tsx
function ErrorTestComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test error for error boundary');
  }

  return (
    <button onClick={() => setShouldError(true)}>
      Trigger Error
    </button>
  );
}

// Wrap with error boundary to test
<GameErrorBoundary section="test">
  <ErrorTestComponent />
</GameErrorBoundary>
```

### Automated Testing:

```tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

function ThrowError() {
  throw new Error('Test error');
}

test('catches errors and displays fallback', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument();
  expect(screen.getByText(/Test error/i)).toBeInTheDocument();
});
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- ✅ **23.1**: Implement React Error Boundaries for component error catching
- ✅ **23.2**: Display user-friendly error messages in Vietnamese
- ✅ **23.5**: Provide recovery options (reload, return to menu)

## Future Enhancements

Potential improvements for future iterations:

1. **Error Tracking Integration**
   - Sentry, LogRocket, or similar service
   - Automatic error reporting in production
   - User session replay

2. **Error Analytics**
   - Track error frequency
   - Identify problematic components
   - Monitor error trends

3. **Smart Recovery**
   - Automatic retry with exponential backoff
   - State restoration after error
   - Partial component recovery

4. **User Feedback**
   - Allow users to report errors
   - Collect additional context
   - Email error reports

## Related Documentation

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Vietnamese Language Support](../../docs/vietnamese-context.md)
- [Accessibility Guidelines](../../docs/accessibility.md)
- [Testing Strategy](../../docs/testing.md)
