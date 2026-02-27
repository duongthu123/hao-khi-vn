/**
 * Performance Profiler Utility
 * Provides tools for profiling game loop and rendering performance
 * Validates Requirement 21.7 (60 FPS performance)
 */

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  updateTime: number;
  renderTime: number;
  idleTime: number;
  droppedFrames: number;
}

export interface ProfilerOptions {
  sampleSize?: number;
  targetFPS?: number;
  enableLogging?: boolean;
}

/**
 * Performance profiler for game loop and rendering
 */
export class PerformanceProfiler {
  private samples: number[] = [];
  private updateSamples: number[] = [];
  private renderSamples: number[] = [];
  private sampleSize: number;
  private targetFPS: number;
  private targetFrameTime: number;
  private enableLogging: boolean;
  private droppedFrames: number = 0;
  private totalFrames: number = 0;
  private lastLogTime: number = 0;
  private logInterval: number = 1000; // Log every second

  constructor(options: ProfilerOptions = {}) {
    this.sampleSize = options.sampleSize || 60;
    this.targetFPS = options.targetFPS || 60;
    this.targetFrameTime = 1000 / this.targetFPS;
    this.enableLogging = options.enableLogging || false;
  }

  /**
   * Start profiling a frame
   */
  startFrame(): number {
    return performance.now();
  }

  /**
   * End profiling a frame
   */
  endFrame(startTime: number): void {
    const frameTime = performance.now() - startTime;
    
    this.samples.push(frameTime);
    if (this.samples.length > this.sampleSize) {
      this.samples.shift();
    }

    this.totalFrames++;
    if (frameTime > this.targetFrameTime * 1.5) {
      this.droppedFrames++;
    }

    // Log metrics periodically
    if (this.enableLogging) {
      const now = performance.now();
      if (now - this.lastLogTime >= this.logInterval) {
        this.logMetrics();
        this.lastLogTime = now;
      }
    }
  }

  /**
   * Profile an update operation
   */
  profileUpdate(fn: () => void): void {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    
    this.updateSamples.push(duration);
    if (this.updateSamples.length > this.sampleSize) {
      this.updateSamples.shift();
    }
  }

  /**
   * Profile a render operation
   */
  profileRender(fn: () => void): void {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    
    this.renderSamples.push(duration);
    if (this.renderSamples.length > this.sampleSize) {
      this.renderSamples.shift();
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const avgFrameTime = this.getAverage(this.samples);
    const avgUpdateTime = this.getAverage(this.updateSamples);
    const avgRenderTime = this.getAverage(this.renderSamples);
    
    return {
      fps: avgFrameTime > 0 ? 1000 / avgFrameTime : 0,
      frameTime: avgFrameTime,
      updateTime: avgUpdateTime,
      renderTime: avgRenderTime,
      idleTime: Math.max(0, this.targetFrameTime - avgFrameTime),
      droppedFrames: this.droppedFrames,
    };
  }

  /**
   * Get detailed statistics
   */
  getDetailedStats(): {
    metrics: PerformanceMetrics;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    dropRate: number;
  } {
    const metrics = this.getMetrics();
    const sorted = [...this.samples].sort((a, b) => a - b);
    
    return {
      metrics,
      min: sorted[0] || 0,
      max: sorted[sorted.length - 1] || 0,
      p50: this.getPercentile(sorted, 0.5),
      p95: this.getPercentile(sorted, 0.95),
      p99: this.getPercentile(sorted, 0.99),
      dropRate: this.totalFrames > 0 ? (this.droppedFrames / this.totalFrames) * 100 : 0,
    };
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(): boolean {
    const metrics = this.getMetrics();
    return metrics.fps >= this.targetFPS * 0.9; // Allow 10% tolerance
  }

  /**
   * Get performance warnings
   */
  getWarnings(): string[] {
    const warnings: string[] = [];
    const metrics = this.getMetrics();
    const stats = this.getDetailedStats();

    if (metrics.fps < this.targetFPS * 0.9) {
      warnings.push(`Low FPS: ${metrics.fps.toFixed(1)} (target: ${this.targetFPS})`);
    }

    if (metrics.updateTime > this.targetFrameTime * 0.5) {
      warnings.push(`High update time: ${metrics.updateTime.toFixed(2)}ms`);
    }

    if (metrics.renderTime > this.targetFrameTime * 0.5) {
      warnings.push(`High render time: ${metrics.renderTime.toFixed(2)}ms`);
    }

    if (stats.dropRate > 5) {
      warnings.push(`High frame drop rate: ${stats.dropRate.toFixed(1)}%`);
    }

    if (stats.p99 > this.targetFrameTime * 2) {
      warnings.push(`High p99 latency: ${stats.p99.toFixed(2)}ms`);
    }

    return warnings;
  }

  /**
   * Reset profiler statistics
   */
  reset(): void {
    this.samples = [];
    this.updateSamples = [];
    this.renderSamples = [];
    this.droppedFrames = 0;
    this.totalFrames = 0;
  }

  /**
   * Log current metrics to console
   */
  private logMetrics(): void {
    const stats = this.getDetailedStats();
    const warnings = this.getWarnings();

    console.group('🎮 Performance Metrics');
    console.log(`FPS: ${stats.metrics.fps.toFixed(1)} (target: ${this.targetFPS})`);
    console.log(`Frame Time: ${stats.metrics.frameTime.toFixed(2)}ms (avg)`);
    console.log(`Update Time: ${stats.metrics.updateTime.toFixed(2)}ms`);
    console.log(`Render Time: ${stats.metrics.renderTime.toFixed(2)}ms`);
    console.log(`Idle Time: ${stats.metrics.idleTime.toFixed(2)}ms`);
    console.log(`Dropped Frames: ${stats.metrics.droppedFrames} (${stats.dropRate.toFixed(1)}%)`);
    console.log(`Percentiles: p50=${stats.p50.toFixed(2)}ms, p95=${stats.p95.toFixed(2)}ms, p99=${stats.p99.toFixed(2)}ms`);
    
    if (warnings.length > 0) {
      console.warn('⚠️ Warnings:', warnings);
    }
    
    console.groupEnd();
  }

  /**
   * Calculate average of samples
   */
  private getAverage(samples: number[]): number {
    if (samples.length === 0) return 0;
    return samples.reduce((sum, val) => sum + val, 0) / samples.length;
  }

  /**
   * Get percentile value from sorted array
   */
  private getPercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 0) return 0;
    const index = Math.floor(sorted.length * percentile);
    return sorted[Math.min(index, sorted.length - 1)];
  }
}

/**
 * Global profiler instance for easy access
 */
let globalProfiler: PerformanceProfiler | null = null;

/**
 * Get or create global profiler instance
 */
export function getGlobalProfiler(options?: ProfilerOptions): PerformanceProfiler {
  if (!globalProfiler) {
    globalProfiler = new PerformanceProfiler(options);
  }
  return globalProfiler;
}

/**
 * Enable performance logging
 */
export function enablePerformanceLogging(): void {
  const profiler = getGlobalProfiler({ enableLogging: true });
  console.log('✅ Performance logging enabled');
  
  // Log initial state
  setTimeout(() => {
    const stats = profiler.getDetailedStats();
    console.log('📊 Initial Performance Stats:', stats);
  }, 2000);
}

/**
 * Disable performance logging
 */
export function disablePerformanceLogging(): void {
  if (globalProfiler) {
    globalProfiler = new PerformanceProfiler({ enableLogging: false });
  }
  console.log('❌ Performance logging disabled');
}

/**
 * Create a performance mark for Chrome DevTools
 */
export function mark(name: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure performance between two marks
 */
export function measure(name: string, startMark: string, endMark: string): void {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
    } catch (e) {
      // Marks might not exist, ignore
    }
  }
}
