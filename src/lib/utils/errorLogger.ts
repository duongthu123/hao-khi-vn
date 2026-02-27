/**
 * Error Logger Utility
 * 
 * Provides centralized error logging with context information
 * Logs to console in development and can be extended for production error reporting
 */

export interface ErrorContext {
  component?: string;
  action?: string;
  state?: Record<string, unknown>;
  userId?: string;
  timestamp?: number;
  url?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface ErrorLogEntry {
  error: Error;
  context: ErrorContext;
  timestamp: number;
  severity: ErrorSeverity;
  environment: 'development' | 'production';
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100; // Keep last 100 errors in memory
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log an error with context information
   */
  logError(
    error: Error,
    context: ErrorContext = {},
    severity: ErrorSeverity = 'medium'
  ): void {
    const enrichedContext = this.enrichContext(context);
    
    const logEntry: ErrorLogEntry = {
      error,
      context: enrichedContext,
      timestamp: Date.now(),
      severity,
      environment: this.isDevelopment ? 'development' : 'production',
    };

    // Add to in-memory log
    this.addToLog(logEntry);

    // Log to console in development
    if (this.isDevelopment) {
      this.logToConsole(logEntry);
    } else {
      // In production, send to error reporting service
      this.logToProduction(logEntry);
    }
  }

  /**
   * Enrich context with additional information
   */
  private enrichContext(context: ErrorContext): ErrorContext {
    return {
      ...context,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };
  }

  /**
   * Add log entry to in-memory storage
   */
  private addToLog(entry: ErrorLogEntry): void {
    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Log to console in development mode with formatting
   */
  private logToConsole(entry: ErrorLogEntry): void {
    const { error, context, severity, timestamp } = entry;
    
    // Choose console method based on severity
    const consoleMethod = severity === 'critical' || severity === 'high' 
      ? console.error 
      : console.warn;

    // Format timestamp
    const timeStr = new Date(timestamp).toISOString();

    // Log with grouping for better readability
    console.group(
      `%c[${severity.toUpperCase()}] Error in ${context.component || 'Unknown Component'}`,
      `color: ${this.getSeverityColor(severity)}; font-weight: bold;`
    );
    
    consoleMethod('Time:', timeStr);
    consoleMethod('Error:', error);
    
    if (context.action) {
      console.log('Action:', context.action);
    }
    
    if (context.state) {
      console.log('State:', context.state);
    }
    
    if (context.component) {
      console.log('Component:', context.component);
    }
    
    // Log additional context
    const additionalContext = { ...context };
    delete additionalContext.component;
    delete additionalContext.action;
    delete additionalContext.state;
    
    if (Object.keys(additionalContext).length > 0) {
      console.log('Additional Context:', additionalContext);
    }
    
    // Log stack trace
    if (error.stack) {
      console.log('Stack Trace:', error.stack);
    }
    
    console.groupEnd();
  }

  /**
   * Get color for severity level
   */
  private getSeverityColor(severity: ErrorSeverity): string {
    const colors = {
      low: '#3b82f6',      // blue
      medium: '#f59e0b',   // amber
      high: '#ef4444',     // red
      critical: '#dc2626', // dark red
    };
    return colors[severity];
  }

  /**
   * Log to production error reporting service
   * This is a placeholder for future integration with services like Sentry, LogRocket, etc.
   */
  private logToProduction(entry: ErrorLogEntry): void {
    // Placeholder for production error reporting
    // In a real implementation, you would send to a service like:
    // - Sentry: Sentry.captureException(entry.error, { extra: entry.context })
    // - LogRocket: LogRocket.captureException(entry.error, { extra: entry.context })
    // - Custom API: fetch('/api/errors', { method: 'POST', body: JSON.stringify(entry) })
    
    // For now, just log a minimal message to console
    console.error('[Production Error]', entry.error.message, {
      component: entry.context.component,
      action: entry.context.action,
      severity: entry.severity,
    });
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by severity
   */
  getLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
    return this.logs.filter(log => log.severity === severity);
  }

  /**
   * Get logs filtered by component
   */
  getLogsByComponent(component: string): ErrorLogEntry[] {
    return this.logs.filter(log => log.context.component === component);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON (useful for debugging)
   */
  exportLogs(): string {
    return JSON.stringify(
      this.logs.map(log => ({
        message: log.error.message,
        stack: log.error.stack,
        context: log.context,
        timestamp: log.timestamp,
        severity: log.severity,
      })),
      null,
      2
    );
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

/**
 * Log an error with context
 * 
 * @example
 * ```typescript
 * try {
 *   // Some operation
 * } catch (error) {
 *   logError(error as Error, {
 *     component: 'GameMap',
 *     action: 'renderUnits',
 *     state: { unitCount: units.length }
 *   });
 * }
 * ```
 */
export function logError(
  error: Error,
  context?: ErrorContext,
  severity?: ErrorSeverity
): void {
  errorLogger.logError(error, context, severity);
}

/**
 * Get all error logs
 */
export function getErrorLogs(): ErrorLogEntry[] {
  return errorLogger.getLogs();
}

/**
 * Get error logs by severity
 */
export function getErrorLogsBySeverity(severity: ErrorSeverity): ErrorLogEntry[] {
  return errorLogger.getLogsBySeverity(severity);
}

/**
 * Get error logs by component
 */
export function getErrorLogsByComponent(component: string): ErrorLogEntry[] {
  return errorLogger.getLogsByComponent(component);
}

/**
 * Clear all error logs
 */
export function clearErrorLogs(): void {
  errorLogger.clearLogs();
}

/**
 * Export error logs as JSON string
 */
export function exportErrorLogs(): string {
  return errorLogger.exportLogs();
}

export default errorLogger;
