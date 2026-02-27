/**
 * Example integration of useGameLoop with resource generation
 * This demonstrates how to use the game loop hook in a real game component
 */

'use client';

import React from 'react';
import { useGameLoop, useFPSCounter } from './useGameLoop';
import { generateResources } from '@/lib/resources/generation';
import { useGameStore } from '@/store';
import { ResourceType } from '@/types/resource';

/**
 * Example 1: Basic game loop with resource generation
 */
export function BasicGameLoopExample() {
  const resources = useGameStore((state) => state.resources);
  const setResource = useGameStore((state) => state.setResource);
  const isPaused = useGameStore((state) => state.game?.isPaused ?? false);

  useGameLoop(
    (deltaTime) => {
      // Generate resources based on elapsed time
      const newResources = generateResources(
        {
          food: resources.food,
          gold: resources.gold,
          army: resources.army,
        },
        resources.caps,
        resources.generation,
        deltaTime
      );

      // Update state with new resource values
      setResource(ResourceType.FOOD, newResources.food);
      setResource(ResourceType.GOLD, newResources.gold);
      setResource(ResourceType.ARMY, newResources.army);
    },
    {
      fps: 60,
      enabled: !isPaused,
    }
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Resources</h2>
      <div className="space-y-2">
        <div>Food: {Math.floor(resources.food)} / {resources.caps.food}</div>
        <div>Gold: {Math.floor(resources.gold)} / {resources.caps.gold}</div>
        <div>Army: {Math.floor(resources.army)} / {resources.caps.army}</div>
      </div>
    </div>
  );
}

/**
 * Example 2: Game loop with multiple systems
 */
export function MultiSystemGameLoopExample() {
  const isPaused = useGameStore((state) => state.game?.isPaused ?? false);
  const resources = useGameStore((state) => state.resources);
  const setResource = useGameStore((state) => state.setResource);

  useGameLoop(
    (deltaTime) => {
      // System 1: Resource generation
      const newResources = generateResources(
        {
          food: resources.food,
          gold: resources.gold,
          army: resources.army,
        },
        resources.caps,
        resources.generation,
        deltaTime
      );

      setResource(ResourceType.FOOD, newResources.food);
      setResource(ResourceType.GOLD, newResources.gold);
      setResource(ResourceType.ARMY, newResources.army);

      // System 2: Unit updates (placeholder)
      // updateUnits(deltaTime);

      // System 3: AI updates (placeholder)
      // updateAI(deltaTime);

      // System 4: Combat updates (placeholder)
      // updateCombat(deltaTime);
    },
    {
      fps: 60,
      enabled: !isPaused,
      maxDeltaTime: 0.1, // Cap at 100ms
    }
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Multi-System Game Loop</h2>
      <p className="text-sm text-gray-600">
        Running resource generation, units, AI, and combat systems
      </p>
    </div>
  );
}

/**
 * Example 3: Game loop with FPS counter
 */
export function GameLoopWithFPSCounter() {
  const fps = useFPSCounter();
  const isPaused = useGameStore((state) => state.game?.isPaused ?? false);
  const resources = useGameStore((state) => state.resources);
  const setResource = useGameStore((state) => state.setResource);

  useGameLoop(
    (deltaTime) => {
      const newResources = generateResources(
        {
          food: resources.food,
          gold: resources.gold,
          army: resources.army,
        },
        resources.caps,
        resources.generation,
        deltaTime
      );

      setResource(ResourceType.FOOD, newResources.food);
      setResource(ResourceType.GOLD, newResources.gold);
      setResource(ResourceType.ARMY, newResources.army);
    },
    { enabled: !isPaused }
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Game Loop with FPS</h2>
        <div className="px-3 py-1 bg-black/10 rounded">
          FPS: {fps}
        </div>
      </div>
      <div className="space-y-2">
        <div>Food: {Math.floor(resources.food)}</div>
        <div>Gold: {Math.floor(resources.gold)}</div>
        <div>Army: {Math.floor(resources.army)}</div>
      </div>
    </div>
  );
}

/**
 * Example 4: Pausable game loop
 */
export function PausableGameLoopExample() {
  const [isPaused, setIsPaused] = React.useState(false);
  const resources = useGameStore((state) => state.resources);
  const setResource = useGameStore((state) => state.setResource);

  useGameLoop(
    (deltaTime) => {
      const newResources = generateResources(
        {
          food: resources.food,
          gold: resources.gold,
          army: resources.army,
        },
        resources.caps,
        resources.generation,
        deltaTime
      );

      setResource(ResourceType.FOOD, newResources.food);
      setResource(ResourceType.GOLD, newResources.gold);
      setResource(ResourceType.ARMY, newResources.army);
    },
    { enabled: !isPaused }
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Pausable Game Loop</h2>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div className="space-y-2">
        <div>Status: {isPaused ? 'Paused' : 'Running'}</div>
        <div>Food: {Math.floor(resources.food)}</div>
        <div>Gold: {Math.floor(resources.gold)}</div>
        <div>Army: {Math.floor(resources.army)}</div>
      </div>
    </div>
  );
}

/**
 * Example 5: Custom FPS target
 */
export function CustomFPSGameLoopExample() {
  const [targetFPS, setTargetFPS] = React.useState(60);
  const resources = useGameStore((state) => state.resources);
  const setResource = useGameStore((state) => state.setResource);

  useGameLoop(
    (deltaTime) => {
      const newResources = generateResources(
        {
          food: resources.food,
          gold: resources.gold,
          army: resources.army,
        },
        resources.caps,
        resources.generation,
        deltaTime
      );

      setResource(ResourceType.FOOD, newResources.food);
      setResource(ResourceType.GOLD, newResources.gold);
      setResource(ResourceType.ARMY, newResources.army);
    },
    { fps: targetFPS }
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Custom FPS Target</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Target FPS: {targetFPS}
        </label>
        <input
          type="range"
          min="30"
          max="120"
          step="30"
          value={targetFPS}
          onChange={(e) => setTargetFPS(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>30 FPS</span>
          <span>60 FPS</span>
          <span>120 FPS</span>
        </div>
      </div>
      <div className="space-y-2">
        <div>Food: {Math.floor(resources.food)}</div>
        <div>Gold: {Math.floor(resources.gold)}</div>
        <div>Army: {Math.floor(resources.army)}</div>
      </div>
    </div>
  );
}

/**
 * Example 6: Complete game component with all features
 */
export function CompleteGameExample() {
  const fps = useFPSCounter();
  const [isPaused, setIsPaused] = React.useState(false);
  const resources = useGameStore((state) => state.resources);
  const setResource = useGameStore((state) => state.setResource);
  const [updateCount, setUpdateCount] = React.useState(0);

  useGameLoop(
    (deltaTime) => {
      // Update resources
      const newResources = generateResources(
        {
          food: resources.food,
          gold: resources.gold,
          army: resources.army,
        },
        resources.caps,
        resources.generation,
        deltaTime
      );

      setResource(ResourceType.FOOD, newResources.food);
      setResource(ResourceType.GOLD, newResources.gold);
      setResource(ResourceType.ARMY, newResources.army);

      // Track update count
      setUpdateCount((count) => count + 1);
    },
    {
      fps: 60,
      enabled: !isPaused,
      maxDeltaTime: 0.1,
    }
  );

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Game Loop Demo</h1>
          <div className="flex gap-4 items-center">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded">
              FPS: {fps}
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-4 py-2 rounded font-medium ${
                isPaused
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'
              }`}
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Food</h3>
            <div className="text-2xl font-bold">{Math.floor(resources.food)}</div>
            <div className="text-sm text-gray-600">
              Cap: {resources.caps.food} | +{resources.generation.foodPerSecond.toFixed(1)}/s
            </div>
            <div className="mt-2 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${(resources.food / resources.caps.food) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Gold</h3>
            <div className="text-2xl font-bold">{Math.floor(resources.gold)}</div>
            <div className="text-sm text-gray-600">
              Cap: {resources.caps.gold} | +{resources.generation.goldPerSecond.toFixed(1)}/s
            </div>
            <div className="mt-2 bg-yellow-200 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full transition-all"
                style={{ width: `${(resources.gold / resources.caps.gold) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Army</h3>
            <div className="text-2xl font-bold">{Math.floor(resources.army)}</div>
            <div className="text-sm text-gray-600">
              Cap: {resources.caps.army} | +{resources.generation.armyPerSecond.toFixed(1)}/s
            </div>
            <div className="mt-2 bg-red-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${(resources.army / resources.caps.army) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Statistics</h3>
            <div className="text-sm space-y-1">
              <div>Status: {isPaused ? '⏸ Paused' : '▶ Running'}</div>
              <div>Updates: {updateCount.toLocaleString()}</div>
              <div>FPS: {fps}</div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>
            This demo shows the useGameLoop hook managing resource generation at 60 FPS.
            Resources are updated using delta time for frame-independent behavior.
          </p>
        </div>
      </div>
    </div>
  );
}
