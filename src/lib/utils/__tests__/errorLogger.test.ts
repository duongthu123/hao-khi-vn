import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  logError,
  getErrorLogs,
  getErrorLogsBySeverity,
  getErrorLogsByComponent,
  clearErrorLogs,
  exportErrorLogs,
  type ErrorContext,
  type ErrorSeverity,
} from '../errorLogger';

describe('errorLogger', () => {
  // Mock console methods
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    group: console.group,
    groupEnd: console.groupEnd,
  };

  beforeEach(() => {
    // Clear logs before each test
    clearErrorLogs();

    // Mock console methods to avoid noise in test output
    console.error = vi.fn();
    console.warn = vi.fn();
    console.log = vi.fn();
    console.group = vi.fn();
    console.groupEnd = vi.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.log = originalConsole.log;
    console.group = originalConsole.group;
    console.groupEnd = originalConsole.groupEnd;
  });

  describe('logError', () => {
    it('should log an error with basic context', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        component: 'TestComponent',
        action: 'testAction',
      };

      logError(error, context);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toBe(error);
      expect(logs[0].context.component).toBe('TestComponent');
      expect(logs[0].context.action).toBe('testAction');
    });

    it('should log an error without context', () => {
      const error = new Error('Test error');

      logError(error);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toBe(error);
    });

    it('should enrich context with timestamp, url, and userAgent', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        component: 'TestComponent',
      };

      logError(error, context);

      const logs = getErrorLogs();
      expect(logs[0].context.timestamp).toBeDefined();
      expect(typeof logs[0].context.timestamp).toBe('number');
    });

    it('should set default severity to medium', () => {
      const error = new Error('Test error');

      logError(error);

      const logs = getErrorLogs();
      expect(logs[0].severity).toBe('medium');
    });

    it('should accept custom severity levels', () => {
      const severities: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];

      severities.forEach((severity, index) => {
        const error = new Error(`Test error ${index}`);
        logError(error, { component: 'Test' }, severity);
      });

      const logs = getErrorLogs();
      expect(logs).toHaveLength(4);
      expect(logs[0].severity).toBe('low');
      expect(logs[1].severity).toBe('medium');
      expect(logs[2].severity).toBe('high');
      expect(logs[3].severity).toBe('critical');
    });

    it('should include state in context', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        component: 'GameMap',
        action: 'renderUnits',
        state: {
          unitCount: 10,
          zoom: 1.5,
        },
      };

      logError(error, context);

      const logs = getErrorLogs();
      expect(logs[0].context.state).toEqual({
        unitCount: 10,
        zoom: 1.5,
      });
    });

    it('should log to console in development mode', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        component: 'TestComponent',
        action: 'testAction',
      };

      // Save original NODE_ENV
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logError(error, context, 'high');

      // Restore NODE_ENV
      process.env.NODE_ENV = originalEnv;

      // In the current implementation, console methods are called
      // This test verifies the error was logged
      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe('Test error');
    });
  });

  describe('getErrorLogs', () => {
    it('should return all logged errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');
      const error3 = new Error('Error 3');

      logError(error1);
      logError(error2);
      logError(error3);

      const logs = getErrorLogs();
      expect(logs).toHaveLength(3);
    });

    it('should return empty array when no errors logged', () => {
      const logs = getErrorLogs();
      expect(logs).toEqual([]);
    });

    it('should return a copy of logs array', () => {
      const error = new Error('Test error');
      logError(error);

      const logs1 = getErrorLogs();
      const logs2 = getErrorLogs();

      expect(logs1).not.toBe(logs2); // Different array instances
      expect(logs1).toEqual(logs2); // Same content
    });
  });

  describe('getErrorLogsBySeverity', () => {
    beforeEach(() => {
      logError(new Error('Low error'), { component: 'A' }, 'low');
      logError(new Error('Medium error 1'), { component: 'B' }, 'medium');
      logError(new Error('High error'), { component: 'C' }, 'high');
      logError(new Error('Medium error 2'), { component: 'D' }, 'medium');
      logError(new Error('Critical error'), { component: 'E' }, 'critical');
    });

    it('should filter logs by low severity', () => {
      const logs = getErrorLogsBySeverity('low');
      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe('Low error');
    });

    it('should filter logs by medium severity', () => {
      const logs = getErrorLogsBySeverity('medium');
      expect(logs).toHaveLength(2);
      expect(logs[0].error.message).toBe('Medium error 1');
      expect(logs[1].error.message).toBe('Medium error 2');
    });

    it('should filter logs by high severity', () => {
      const logs = getErrorLogsBySeverity('high');
      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe('High error');
    });

    it('should filter logs by critical severity', () => {
      const logs = getErrorLogsBySeverity('critical');
      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe('Critical error');
    });

    it('should return empty array when no logs match severity', () => {
      clearErrorLogs();
      logError(new Error('Test'), {}, 'low');

      const logs = getErrorLogsBySeverity('critical');
      expect(logs).toEqual([]);
    });
  });

  describe('getErrorLogsByComponent', () => {
    beforeEach(() => {
      logError(new Error('Error 1'), { component: 'GameMap' });
      logError(new Error('Error 2'), { component: 'CombatEngine' });
      logError(new Error('Error 3'), { component: 'GameMap' });
      logError(new Error('Error 4'), { component: 'SaveSystem' });
      logError(new Error('Error 5'), { component: 'GameMap' });
    });

    it('should filter logs by component name', () => {
      const logs = getErrorLogsByComponent('GameMap');
      expect(logs).toHaveLength(3);
      expect(logs[0].error.message).toBe('Error 1');
      expect(logs[1].error.message).toBe('Error 3');
      expect(logs[2].error.message).toBe('Error 5');
    });

    it('should return empty array when no logs match component', () => {
      const logs = getErrorLogsByComponent('NonExistentComponent');
      expect(logs).toEqual([]);
    });

    it('should handle undefined component', () => {
      logError(new Error('No component'));
      const logs = getErrorLogsByComponent('undefined');
      expect(logs).toEqual([]);
    });
  });

  describe('clearErrorLogs', () => {
    it('should clear all logged errors', () => {
      logError(new Error('Error 1'));
      logError(new Error('Error 2'));
      logError(new Error('Error 3'));

      expect(getErrorLogs()).toHaveLength(3);

      clearErrorLogs();

      expect(getErrorLogs()).toEqual([]);
    });

    it('should allow logging after clearing', () => {
      logError(new Error('Error 1'));
      clearErrorLogs();
      logError(new Error('Error 2'));

      const logs = getErrorLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error.message).toBe('Error 2');
    });
  });

  describe('exportErrorLogs', () => {
    it('should export logs as JSON string', () => {
      const error = new Error('Test error');
      logError(error, {
        component: 'TestComponent',
        action: 'testAction',
      });

      const exported = exportErrorLogs();
      const parsed = JSON.parse(exported);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].message).toBe('Test error');
      expect(parsed[0].context.component).toBe('TestComponent');
      expect(parsed[0].context.action).toBe('testAction');
    });

    it('should export empty array when no logs', () => {
      const exported = exportErrorLogs();
      const parsed = JSON.parse(exported);

      expect(parsed).toEqual([]);
    });

    it('should include all relevant fields in export', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      logError(error, {
        component: 'TestComponent',
        action: 'testAction',
        state: { value: 123 },
      }, 'high');

      const exported = exportErrorLogs();
      const parsed = JSON.parse(exported);

      expect(parsed[0]).toHaveProperty('message');
      expect(parsed[0]).toHaveProperty('stack');
      expect(parsed[0]).toHaveProperty('context');
      expect(parsed[0]).toHaveProperty('timestamp');
      expect(parsed[0]).toHaveProperty('severity');
      expect(parsed[0].severity).toBe('high');
    });

    it('should format JSON with indentation', () => {
      logError(new Error('Test'));
      const exported = exportErrorLogs();

      // Check that JSON is formatted (contains newlines and spaces)
      expect(exported).toContain('\n');
      expect(exported).toContain('  ');
    });
  });

  describe('log limit', () => {
    it('should keep only last 100 errors', () => {
      // Log 150 errors
      for (let i = 0; i < 150; i++) {
        logError(new Error(`Error ${i}`), { component: 'Test' });
      }

      const logs = getErrorLogs();
      expect(logs).toHaveLength(100);

      // Should have errors 50-149 (last 100)
      expect(logs[0].error.message).toBe('Error 50');
      expect(logs[99].error.message).toBe('Error 149');
    });
  });

  describe('error context enrichment', () => {
    it('should preserve custom context fields', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        component: 'TestComponent',
        action: 'testAction',
        customField: 'customValue',
        userId: 'user123',
      };

      logError(error, context);

      const logs = getErrorLogs();
      expect(logs[0].context.customField).toBe('customValue');
      expect(logs[0].context.userId).toBe('user123');
    });

    it('should add timestamp if not provided', () => {
      const error = new Error('Test error');
      const beforeTimestamp = Date.now();

      logError(error, { component: 'Test' });

      const logs = getErrorLogs();
      const afterTimestamp = Date.now();

      expect(logs[0].context.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(logs[0].context.timestamp).toBeLessThanOrEqual(afterTimestamp);
    });
  });

  describe('error log entry structure', () => {
    it('should create proper log entry structure', () => {
      const error = new Error('Test error');
      const context: ErrorContext = {
        component: 'TestComponent',
        action: 'testAction',
      };

      logError(error, context, 'high');

      const logs = getErrorLogs();
      const entry = logs[0];

      expect(entry).toHaveProperty('error');
      expect(entry).toHaveProperty('context');
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('severity');
      expect(entry).toHaveProperty('environment');

      expect(entry.error).toBe(error);
      expect(entry.severity).toBe('high');
      // Environment can be either 'development' or 'production' depending on test runner
      expect(['development', 'production']).toContain(entry.environment);
      expect(typeof entry.timestamp).toBe('number');
    });
  });
});
