/**
 * Error Logger Usage Examples
 * 
 * This file demonstrates various ways to use the error logger
 * in different scenarios throughout the application.
 */

'use client';

import React, { useState } from 'react';
import { logError, getErrorLogs, exportErrorLogs, clearErrorLogs } from './errorLogger';
import { Button } from '@/components/ui/Button';

/**
 * Example 1: Basic Error Logging in a Component
 */
export function BasicErrorLoggingExample() {
  const [result, setResult] = useState<string>('');

  const handleOperation = () => {
    try {
      // Simulate an operation that might fail
      const data = JSON.parse('invalid json');
      setResult('Success: ' + data);
    } catch (error) {
      // Log the error with context
      logError(error as Error, {
        component: 'BasicErrorLoggingExample',
        action: 'handleOperation',
        state: {
          attemptedOperation: 'JSON.parse',
        },
      });
      
      setResult('Error occurred - check console');
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Basic Error Logging</h3>
      <Button onClick={handleOperation}>Trigger Error</Button>
      <p className="mt-2 text-sm">{result}</p>
    </div>
  );
}

/**
 * Example 2: Error Logging with Severity Levels
 */
export function SeverityLevelsExample() {
  const triggerLowSeverity = () => {
    try {
      throw new Error('Minor issue - missing optional data');
    } catch (error) {
      logError(error as Error, {
        component: 'SeverityLevelsExample',
        action: 'triggerLowSeverity',
      }, 'low');
    }
  };

  const triggerCriticalError = () => {
    try {
      throw new Error('Critical failure - cannot save game');
    } catch (error) {
      logError(error as Error, {
        component: 'SeverityLevelsExample',
        action: 'triggerCriticalError',
        state: {
          saveSlot: 1,
          gameState: 'corrupted',
        },
      }, 'critical');
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Severity Levels</h3>
      <div className="space-x-2">
        <Button onClick={triggerLowSeverity} variant="secondary">
          Low Severity
        </Button>
        <Button onClick={triggerCriticalError} variant="danger">
          Critical Error
        </Button>
      </div>
    </div>
  );
}

/**
 * Example 3: Game Map Error Logging
 */
export function GameMapErrorExample() {
  const simulateMapError = () => {
    try {
      // Simulate a map rendering error
      const units = [{ id: 1, x: 100, y: 200 }];
      const invalidUnit = units[10]; // undefined
      const position = invalidUnit.x; // Error!
      console.log(position);
    } catch (error) {
      logError(error as Error, {
        component: 'GameMap',
        action: 'renderUnits',
        state: {
          unitCount: 1,
          zoom: 1.5,
          mapPosition: { x: 0, y: 0 },
        },
      }, 'high');
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Game Map Error</h3>
      <Button onClick={simulateMapError}>Simulate Map Error</Button>
    </div>
  );
}

/**
 * Example 4: Combat System Error Logging
 */
export function CombatSystemErrorExample() {
  const simulateCombatError = () => {
    try {
      // Simulate combat calculation error
      const attacker = { id: 1, attack: 50, health: 100 };
      const defender = null; // Invalid!
      const damage = attacker.attack - defender!.health; // Error!
      console.log(damage);
    } catch (error) {
      logError(error as Error, {
        component: 'CombatEngine',
        action: 'calculateDamage',
        state: {
          attackerId: 1,
          defenderId: null,
          combatPhase: 'attack',
        },
      }, 'critical');
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Combat System Error</h3>
      <Button onClick={simulateCombatError}>Simulate Combat Error</Button>
    </div>
  );
}

/**
 * Example 5: Save System Error Logging
 */
export function SaveSystemErrorExample() {
  const simulateSaveError = () => {
    try {
      // Simulate save operation failure
      const gameState = { player: 'Test', level: 5 };
      localStorage.setItem('save_slot_1', JSON.stringify(gameState));
      
      // Simulate quota exceeded error
      throw new Error('QuotaExceededError: Storage quota exceeded');
    } catch (error) {
      logError(error as Error, {
        component: 'SaveSystem',
        action: 'saveToSlot',
        state: {
          slotNumber: 1,
          playerLevel: 5,
          storageUsed: '5MB',
        },
      }, 'high');
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Save System Error</h3>
      <Button onClick={simulateSaveError}>Simulate Save Error</Button>
    </div>
  );
}

/**
 * Example 6: Viewing and Exporting Error Logs
 */
export function ErrorLogViewerExample() {
  const [logs, setLogs] = useState<string>('No logs yet');

  const viewLogs = () => {
    const errorLogs = getErrorLogs();
    setLogs(`Total errors: ${errorLogs.length}\n\n` + 
      errorLogs.map((log, i) => 
        `${i + 1}. [${log.severity}] ${log.error.message} in ${log.context.component || 'Unknown'}`
      ).join('\n')
    );
  };

  const exportLogs = () => {
    const logsJson = exportErrorLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    clearErrorLogs();
    setLogs('Logs cleared');
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Error Log Viewer</h3>
      <div className="space-x-2 mb-4">
        <Button onClick={viewLogs} variant="secondary">
          View Logs
        </Button>
        <Button onClick={exportLogs} variant="secondary">
          Export Logs
        </Button>
        <Button onClick={clearLogs} variant="ghost">
          Clear Logs
        </Button>
      </div>
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
        {logs}
      </pre>
    </div>
  );
}

/**
 * Example 7: Async Error Logging
 */
export function AsyncErrorExample() {
  const [status, setStatus] = useState<string>('');

  const simulateAsyncError = async () => {
    try {
      setStatus('Loading...');
      
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate error
      throw new Error('Failed to fetch game data from server');
    } catch (error) {
      logError(error as Error, {
        component: 'AsyncErrorExample',
        action: 'simulateAsyncError',
        state: {
          operation: 'fetchGameData',
          retryCount: 0,
        },
      }, 'medium');
      
      setStatus('Error: ' + (error as Error).message);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Async Error Logging</h3>
      <Button onClick={simulateAsyncError}>Trigger Async Error</Button>
      <p className="mt-2 text-sm">{status}</p>
    </div>
  );
}

/**
 * Main Demo Component
 */
export default function ErrorLoggerExamples() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Logger Examples</h1>
        <p className="text-gray-600">
          Demonstrating error logging in various scenarios
        </p>
      </div>

      <BasicErrorLoggingExample />
      <SeverityLevelsExample />
      <GameMapErrorExample />
      <CombatSystemErrorExample />
      <SaveSystemErrorExample />
      <AsyncErrorExample />
      <ErrorLogViewerExample />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Open browser console to see detailed error logs in development mode</li>
          <li>• Use appropriate severity levels to prioritize bug fixes</li>
          <li>• Include relevant state information to help debug issues</li>
          <li>• Export logs for sharing with the development team</li>
          <li>• Clear logs periodically to avoid memory buildup</li>
        </ul>
      </div>
    </div>
  );
}
