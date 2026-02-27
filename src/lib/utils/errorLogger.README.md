# Error Logger

Centralized error logging utility for the Vietnamese Historical Strategy Game.

## Overview

The error logger provides a consistent way to log errors throughout the application with rich context information. It automatically logs to console in development mode and provides hooks for production error reporting services.

## Features

- **Context-rich logging**: Capture component name, action, state, and custom context
- **Severity levels**: Categorize errors as low, medium, high, or critical
- **Development mode**: Detailed console logging with formatting and grouping
- **Production ready**: Placeholder for integration with error reporting services (Sentry, LogRocket, etc.)
- **In-memory storage**: Keep last 100 errors for debugging
- **Export functionality**: Export logs as JSON for analysis

## Usage

### Basic Error Logging

```typescript
import { logError } from '@/lib/utils/errorLogger';

try {
  // Some operation that might fail
  processGameData();
} catch (error) {
  logError(error as Error, {
    component: 'GameMap',
    action: 'processGameData',
  });
}
```

### With Context and Severity

```typescript
import { logError } from '@/lib/utils/errorLogger';

try {
  // Critical operation
  saveGameState(state);
} catch (error) {
  logError(
    error as Error,
    {
      component: 'SaveSystem',
      action: 'saveGameState',
      state: {
        slotNumber: 1,
        playerName: state.profile.name,
        resources: state.resources,
      },
    },
    'critical' // Severity level
  );
}
```

### In Error Boundaries

The error logger is automatically integrated with all ErrorBoundary components:

```typescript
// ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  import('@/lib/utils/errorLogger').then(({ logError }) => {
    logError(error, {
      component: 'ErrorBoundary',
      action: 'componentDidCatch',
      state: {
        componentStack: errorInfo.componentStack,
      },
    }, 'high');
  });
}
```

### Retrieving Logs

```typescript
import { 
  getErrorLogs, 
  getErrorLogsBySeverity, 
  getErrorLogsByComponent 
} from '@/lib/utils/errorLogger';

// Get all logs
const allLogs = getErrorLogs();

// Get critical errors only
const criticalErrors = getErrorLogsBySeverity('critical');

// Get errors from specific component
const mapErrors = getErrorLogsByComponent('GameMap');
```

### Exporting Logs

```typescript
import { exportErrorLogs } from '@/lib/utils/errorLogger';

// Export as JSON string
const logsJson = exportErrorLogs();

// Download as file
const blob = new Blob([logsJson], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `error-logs-${Date.now()}.json`;
a.click();
```

## Error Context

The `ErrorContext` interface allows you to provide rich information about the error:

```typescript
interface ErrorContext {
  component?: string;      // Component where error occurred
  action?: string;         // Action being performed
  state?: Record<string, unknown>; // Relevant state information
  userId?: string;         // User identifier (if available)
  timestamp?: number;      // Automatically added
  url?: string;           // Automatically added
  userAgent?: string;     // Automatically added
  [key: string]: unknown; // Any additional custom fields
}
```

## Severity Levels

- **low**: Minor issues that don't affect functionality (e.g., missing optional data)
- **medium**: Issues that affect some functionality but have fallbacks (default)
- **high**: Significant issues that affect core functionality
- **critical**: Severe issues that prevent the application from working

## Development vs Production

### Development Mode
- Logs to console with color-coded severity
- Includes full stack traces
- Groups related information for readability
- Shows all context information

### Production Mode
- Minimal console logging
- Ready for integration with error reporting services
- Includes placeholder for Sentry, LogRocket, or custom API

## Production Integration

To integrate with a production error reporting service, modify the `logToProduction` method in `errorLogger.ts`:

### Sentry Example

```typescript
private logToProduction(entry: ErrorLogEntry): void {
  if (typeof window !== 'undefined' && window.Sentry) {
    window.Sentry.captureException(entry.error, {
      level: this.mapSeverityToSentryLevel(entry.severity),
      extra: entry.context,
      tags: {
        component: entry.context.component,
        action: entry.context.action,
      },
    });
  }
}
```

### Custom API Example

```typescript
private logToProduction(entry: ErrorLogEntry): void {
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: entry.error.message,
      stack: entry.error.stack,
      context: entry.context,
      severity: entry.severity,
      timestamp: entry.timestamp,
    }),
  }).catch(err => {
    // Silently fail to avoid infinite error loops
    console.error('Failed to report error:', err);
  });
}
```

## Best Practices

1. **Always include component name**: Makes it easier to track down issues
2. **Include relevant action**: Helps understand what the user was doing
3. **Be selective with state**: Only include relevant state to avoid noise
4. **Use appropriate severity**: Helps prioritize bug fixes
5. **Don't log sensitive data**: Avoid logging passwords, tokens, or personal information
6. **Handle async errors**: Use try-catch in async functions

## Examples

### Game Map Error

```typescript
try {
  renderUnits(units);
} catch (error) {
  logError(error as Error, {
    component: 'GameMap',
    action: 'renderUnits',
    state: {
      unitCount: units.length,
      zoom: mapZoom,
      position: mapPosition,
    },
  }, 'high');
}
```

### Combat System Error

```typescript
try {
  const damage = calculateDamage(attacker, defender);
  applyDamage(defender, damage);
} catch (error) {
  logError(error as Error, {
    component: 'CombatEngine',
    action: 'calculateDamage',
    state: {
      attackerId: attacker.id,
      defenderId: defender.id,
      attackerStats: attacker.stats,
      defenderStats: defender.stats,
    },
  }, 'critical');
}
```

### Save System Error

```typescript
try {
  await saveToSlot(slotNumber, gameState);
} catch (error) {
  logError(error as Error, {
    component: 'SaveSystem',
    action: 'saveToSlot',
    state: {
      slotNumber,
      playerLevel: gameState.profile.level,
      hasAutoSave: true,
    },
  }, 'high');
  
  // Show user-friendly error message
  showNotification('Không thể lưu game / Failed to save game', 'error');
}
```

## Testing

The error logger is tested in `src/lib/utils/__tests__/errorLogger.test.ts` with coverage for:
- Basic error logging
- Context enrichment
- Severity levels
- Log retrieval and filtering
- Export functionality

## Related Components

- `ErrorBoundary`: Base error boundary component
- `GameErrorBoundary`: Game-specific error boundary
- `ComponentErrorBoundary`: Lightweight component error boundary

All error boundaries automatically use the error logger for consistent error tracking.
