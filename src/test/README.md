# Testing Infrastructure

This directory contains the testing infrastructure for the Vietnamese Historical Strategy Game.

## Overview

The project uses **Vitest** as the test runner with **React Testing Library** for component testing. The testing setup is configured to provide a comprehensive testing environment with coverage reporting and helpful utilities.

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)

- **Environment**: jsdom (for DOM testing)
- **Globals**: Enabled (no need to import `describe`, `it`, `expect`)
- **Setup Files**: `src/test/setup.ts` (runs before each test file)
- **Coverage Provider**: v8
- **Coverage Reporters**: text, json, html, lcov
- **Coverage Thresholds**: 70% for lines, functions, branches, and statements

### Test Setup (`setup.ts`)

The setup file configures the testing environment with:

- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **Automatic cleanup**: After each test
- **Mocked APIs**:
  - `window.matchMedia` - For responsive design tests
  - `IntersectionObserver` - For visibility detection
  - `ResizeObserver` - For element resize detection
  - `HTMLCanvasElement.getContext` - For canvas rendering tests
  - `SpeechRecognition` - For Web Speech API tests
  - `localStorage` - For storage tests
  - `Audio` - For sound tests

## Test Utilities (`test-utils.tsx`)

Provides helper functions for testing:

### Rendering Utilities

```typescript
import { renderWithProviders } from '@/test/test-utils';

// Render component with all providers (React Query, etc.)
const { getByText } = renderWithProviders(<MyComponent />);
```

### Mock Data Creators

```typescript
import {
  createMockUnit,
  createMockHero,
  createMockGameState,
  createMockResources,
} from '@/test/test-utils';

// Create mock data for tests
const unit = createMockUnit({ health: 50 });
const hero = createMockHero({ faction: 'mongol' });
const gameState = createMockGameState({ game: { phase: 'playing' } });
```

### Animation Testing

```typescript
import { mockAnimationFrame } from '@/test/test-utils';

const { runFrame, runFrames } = mockAnimationFrame();

// Run a single frame
runFrame(16.67);

// Run multiple frames
runFrames(60); // 60 frames at 16.67ms each
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests with coverage in watch mode
npm run test:coverage:watch
```

### Test File Patterns

Tests are located in `__tests__` directories or as `.test.ts(x)` files:

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   └── game/
│       └── __tests__/
│           └── GameMap.test.tsx
├── lib/
│   └── combat/
│       ├── engine.ts
│       └── __tests__/
│           └── engine.test.ts
└── hooks/
    └── __tests__/
        └── useGameLoop.test.ts
```

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen, userEvent } from '@/test/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders with children', () => {
    renderWithProviders(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Hook Tests

```typescript
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useGameLoop } from '../useGameLoop';

describe('useGameLoop', () => {
  it('should call callback with delta time', () => {
    const callback = vi.fn();
    
    renderHook(() => useGameLoop(callback, { fps: 60 }));
    
    // Test implementation...
  });
});
```

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { calculateDamage } from '../engine';

describe('Combat Engine', () => {
  it('should calculate damage correctly', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    
    const damage = calculateDamage(attacker, defender, 'FRONT');
    
    expect(damage).toBe(15);
    
    vi.restoreAllMocks();
  });
});
```

## Best Practices

### 1. Test Behavior, Not Implementation

Focus on testing what the component does, not how it does it:

```typescript
// Good: Test user-facing behavior
expect(screen.getByRole('button')).toBeDisabled();

// Bad: Test implementation details
expect(component.state.disabled).toBe(true);
```

### 2. Use Accessible Queries

Prefer queries that reflect how users interact with your app:

```typescript
// Good: Use accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/username/i);

// Avoid: Use test IDs only as last resort
screen.getByTestId('submit-button');
```

### 3. Mock External Dependencies

Mock APIs, timers, and external services:

```typescript
import { vi } from 'vitest';

// Mock a module
vi.mock('@/lib/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' }),
}));

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();
```

### 4. Clean Up After Tests

Use `beforeEach` and `afterEach` for setup and cleanup:

```typescript
import { beforeEach, afterEach, vi } from 'vitest';

describe('MyComponent', () => {
  beforeEach(() => {
    // Setup before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    vi.restoreAllMocks();
  });
});
```

### 5. Test Edge Cases

Don't just test the happy path:

```typescript
describe('calculateDamage', () => {
  it('should handle zero attack', () => {
    const damage = calculateDamage(zeroAttackUnit, defender, 'FRONT');
    expect(damage).toBe(0);
  });

  it('should never return negative damage', () => {
    const damage = calculateDamage(weakUnit, tankUnit, 'FRONT');
    expect(damage).toBeGreaterThanOrEqual(0);
  });
});
```

## Coverage Reports

After running `npm run test:coverage`, coverage reports are generated in the `coverage/` directory:

- **coverage/index.html**: Interactive HTML report
- **coverage/lcov.info**: LCOV format for CI/CD integration
- **coverage/coverage-final.json**: JSON format for programmatic access

### Coverage Thresholds

The project maintains a minimum of **70% coverage** for:

- Lines
- Functions
- Branches
- Statements

## Continuous Integration

Tests run automatically on:

- Pre-commit (via Husky)
- Pull requests
- Main branch pushes

## Troubleshooting

### Tests Fail with "Cannot find module"

Make sure path aliases are configured in `vitest.config.ts`:

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Canvas Tests Fail

Canvas is mocked in `setup.ts`. If you need specific canvas behavior, extend the mock:

```typescript
HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  // Add your custom mock methods
});
```

### Async Tests Timeout

Increase the timeout for specific tests:

```typescript
it('should handle long operation', async () => {
  // Test implementation
}, 10000); // 10 second timeout
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
