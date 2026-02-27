/**
 * Example integration of useAILoop with game components
 * Demonstrates how to use the AI loop hook in a real game
 */

'use client';

import React from 'react';
import { useAILoop, useAIState, useAIMetrics } from './useAILoop';
import { useGameStore } from '@/store';

/**
 * Example 1: Basic AI loop integration
 */
export function BasicAILoopExample() {
  const isPaused = useStore((state) => state.game.isPaused);
  const isPlaying = useStore((state) => state.game.phase === 'playing');
  
  // Enable AI when game is playing and not paused
  useAILoop({ enabled: isPlaying && !isPaused });
  
  const aiState = useAIState();
  const aiUnits = useStore((state) => state.getAIUnits());
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">AI Status</h2>
      <div className="space-y-2">
        <div>AI Units: {aiUnits.length}</div>
        <div>AI Food: {Math.floor(aiState.resources.food)}</div>
        <div>AI Gold: {Math.floor(aiState.resources.gold)}</div>
        <div>Last Spawn: {aiState.lastSpawnTime.toFixed(1)}s</div>
      </div>
    </div>
  );
}

/**
 * Example 2: AI loop with metrics display
 */
export function AILoopWithMetricsExample() {
  const isPaused = useStore((state) => state.game.isPaused);
  const isPlaying = useStore((state) => state.game.phase === 'playing');
  
  useAILoop({ enabled: isPlaying && !isPaused });
  
  const metrics = useAIMetrics();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">AI Metrics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 p-3 rounded">
          <div className="text-sm text-gray-600">Units</div>
          <div className="text-2xl font-bold">
            {metrics.unitCount} / {metrics.unitLimit}
          </div>
        </div>
        
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-gray-600">Food</div>
          <div className="text-2xl font-bold">
            {Math.floor(metrics.resources.food)}
          </div>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded">
          <div className="text-sm text-gray-600">Gold</div>
          <div className="text-2xl font-bold">
            {Math.floor(metrics.resources.gold)}
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-gray-600">Spawn Interval</div>
          <div className="text-2xl font-bold">{metrics.spawnInterval}s</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 3: Complete game component with AI and resource loops
 */
export function CompleteGameWithAIExample() {
  const isPaused = useStore((state) => state.game.isPaused);
  const isPlaying = useStore((state) => state.game.phase === 'playing');
  const difficulty = useStore((state) => state.game.difficulty);
  
  // Enable AI loop
  useAILoop({ 
    enabled: isPlaying && !isPaused,
    updateInterval: 1000, // 1 second updates
  });
  
  const aiMetrics = useAIMetrics();
  const playerUnits = useStore((state) => state.getPlayerUnits());
  const aiUnits = useStore((state) => state.getAIUnits());
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Game with AI</h1>
          <div className="text-sm">
            Difficulty: <span className="font-semibold">{difficulty}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Player Side */}
          <div className="border-2 border-blue-500 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3 text-blue-700">Player</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Units:</span>
                <span className="font-bold">{playerUnits.length}</span>
              </div>
            </div>
          </div>
          
          {/* AI Side */}
          <div className="border-2 border-red-500 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3 text-red-700">AI Opponent</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Units:</span>
                <span className="font-bold">
                  {aiMetrics.unitCount} / {aiMetrics.unitLimit}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Food:</span>
                <span className="font-bold">
                  {Math.floor(aiMetrics.resources.food)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gold:</span>
                <span className="font-bold">
                  {Math.floor(aiMetrics.resources.gold)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Spawn Rate:</span>
                <span className="font-bold">{aiMetrics.spawnInterval}s</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Battle Status</h3>
          <div className="text-sm text-gray-600">
            {isPlaying ? (
              isPaused ? (
                <span className="text-yellow-600">⏸ Game Paused</span>
              ) : (
                <span className="text-green-600">▶ Battle in Progress</span>
              )
            ) : (
              <span className="text-gray-500">Waiting to start...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 4: AI loop with custom update interval
 */
export function CustomIntervalAILoopExample() {
  const [updateInterval, setUpdateInterval] = React.useState(1000);
  const isPaused = useStore((state) => state.game.isPaused);
  const isPlaying = useStore((state) => state.game.phase === 'playing');
  
  useAILoop({ 
    enabled: isPlaying && !isPaused,
    updateInterval,
  });
  
  const aiMetrics = useAIMetrics();
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Custom AI Update Interval</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Update Interval: {updateInterval}ms
        </label>
        <input
          type="range"
          min="500"
          max="3000"
          step="500"
          value={updateInterval}
          onChange={(e) => setUpdateInterval(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-600">
          <span>500ms (Fast)</span>
          <span>1500ms (Normal)</span>
          <span>3000ms (Slow)</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div>AI Units: {aiMetrics.unitCount}</div>
        <div>Last Update: {aiMetrics.lastUpdateTime.toFixed(2)}s</div>
      </div>
    </div>
  );
}
