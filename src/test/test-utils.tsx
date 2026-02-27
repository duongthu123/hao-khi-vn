/**
 * Test Utilities
 * Provides helper functions and custom render methods for testing
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a test query client with default options
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Wrapper component that provides all necessary providers for testing
 */
interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom render function that wraps components with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Create a mock unit for testing
 */
export function createMockUnit(overrides = {}) {
  return {
    id: 'test-unit-1',
    type: 'infantry' as const,
    faction: 'vietnamese' as const,
    position: { x: 0, y: 0 },
    health: 100,
    maxHealth: 100,
    attack: 40,
    defense: 50,
    speed: 30,
    direction: 'north' as const,
    status: [],
    owner: 'player' as const,
    ...overrides,
  };
}

/**
 * Create a mock hero for testing
 */
export function createMockHero(overrides = {}) {
  return {
    id: 'test-hero-1',
    name: 'Test Hero',
    nameVietnamese: 'Anh Hùng Thử Nghiệm',
    faction: 'vietnamese' as const,
    rarity: 'common' as const,
    stats: {
      attack: 50,
      defense: 50,
      speed: 50,
      leadership: 50,
      intelligence: 50,
    },
    abilities: [],
    portrait: '/images/heroes/test.png',
    description: 'A test hero',
    historicalContext: 'Test context',
    ...overrides,
  };
}

/**
 * Create mock game state for testing
 */
export function createMockGameState(overrides = {}) {
  return {
    version: '1.0.0',
    metadata: {
      slot: 0,
      timestamp: Date.now(),
      playerName: 'Test Player',
      progress: 0,
      resources: { food: 100, gold: 100, army: 10 },
      level: 1,
      playTime: 0,
      version: '1.0.0',
    },
    game: {
      phase: 'menu' as const,
      difficulty: 'normal' as const,
      currentLevel: 1,
      elapsedTime: 0,
    },
    hero: {
      selectedHero: null,
      unlockedHeroes: [],
    },
    combat: {
      units: [],
      buildings: [],
      activeEffects: [],
    },
    resources: {
      food: 100,
      gold: 100,
      army: 10,
      foodCap: 1000,
      goldCap: 1000,
      armyCap: 100,
      generation: {
        foodPerSecond: 1,
        goldPerSecond: 1,
        armyPerSecond: 0.1,
      },
    },
    collection: {
      heroes: [],
      items: [],
      completionPercentage: 0,
    },
    profile: {
      name: 'Test Player',
      rank: 'Recruit',
      level: 1,
      experience: 0,
      wins: 0,
      losses: 0,
      achievements: [],
      statistics: {
        totalPlayTime: 0,
        unitsDefeated: 0,
        resourcesGathered: 0,
        quizzesCompleted: 0,
      },
    },
    research: {
      completed: [],
      inProgress: null,
      progress: 0,
      available: [],
    },
    quiz: {
      questionsAnswered: 0,
      correctAnswers: 0,
      completedCategories: [],
      rewards: [],
    },
    ...overrides,
  };
}

/**
 * Create mock resources for testing
 */
export function createMockResources(overrides = {}) {
  return {
    food: 100,
    gold: 100,
    army: 10,
    ...overrides,
  };
}

/**
 * Mock requestAnimationFrame for testing animations
 */
export function mockAnimationFrame() {
  let callbacks: FrameRequestCallback[] = [];
  let rafId = 0;
  let currentTime = 0;

  const raf = (callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return ++rafId;
  };

  const cancelRaf = (id: number) => {
    callbacks = callbacks.filter((_, index) => index + 1 !== id);
  };

  const runFrame = (deltaTime = 16.67) => {
    currentTime += deltaTime;
    const cbs = [...callbacks];
    callbacks = [];
    cbs.forEach((cb) => cb(currentTime));
  };

  const runFrames = (count: number, deltaTime = 16.67) => {
    for (let i = 0; i < count; i++) {
      runFrame(deltaTime);
    }
  };

  return {
    raf,
    cancelRaf,
    runFrame,
    runFrames,
    getCurrentTime: () => currentTime,
  };
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
