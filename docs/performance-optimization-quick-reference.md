# Performance Optimization Quick Reference

## Quick Start

### Enable Performance Monitoring

```typescript
import { enablePerformanceLogging } from '@/lib/utils/performanceProfiler';

// In development
if (process.env.NODE_ENV === 'development') {
  enablePerformanceLogging();
}
```

### Use Optimized Game Loop

```typescript
import { useGameLoop } from '@/hooks/useGameLoop';

function GameComponent() {
  const isPaused = useStore((state) => state.game.isPaused);
  
  useGameLoop(
    (deltaTime) => {
      // Update game logic
      updateResources(deltaTime);
      updateUnits(deltaTime);
    },
    {
      fps: 60,
      enabled: !isPaused,
      enableProfiling: process.env.NODE_ENV === 'development',
    }
  );
  
  return <div>Game content</div>;
}
```

## Performance Checklist

### ✅ Game Loop
- [x] Fixed time step with accumulator
- [x] Frame skipping prevention
- [x] Spiral of death protection
- [x] Performance profiling enabled in dev

### ✅ Canvas Rendering
- [x] Dirty flag system for layers
- [x] Viewport culling with quadtree
- [x] Offscreen canvas for static content
- [x] Batch rendering by type/owner
- [x] Reduced canvas state changes

### ✅ State Management
- [x] Refs for high-frequency updates
- [x] Memoized calculations
- [x] Throttled/debounced updates
- [x] Minimal re-renders

### ✅ Memory Management
- [x] Object pooling for vectors
- [x] Cache invalidation strategy
- [x] Cleanup on unmount
- [x] Stable memory usage

## Common Patterns

### Pattern 1: High-Frequency Updates

```typescript
// ❌ Bad: Triggers re-render every frame
const [position, setPosition] = useState({ x: 0, y: 0 });

function handlePan(delta) {
  setPosition(prev => ({ x: prev.x + delta.x, y: prev.y + delta.y }));
}

// ✅ Good: Use ref for updates, state only when needed
const positionRef = useRef({ x: 0, y: 0 });
const [position, setPosition] = useState({ x: 0, y: 0 });

function handlePan(delta) {
  positionRef.current.x += delta.x;
  positionRef.current.y += delta.y;
  // Only update state when panning stops
}

function handlePanEnd() {
  setPosition({ ...positionRef.current });
}
```

### Pattern 2: Expensive Calculations

```typescript
// ❌ Bad: Recalculates every render
function Component({ units, zoom, cameraPos }) {
  const screenPositions = units.map(unit => 
    worldToScreen(unit.position, zoom, cameraPos)
  );
  // ...
}

// ✅ Good: Memoize calculations
function Component({ units, zoom, cameraPos }) {
  const screenPositions = useMemo(
    () => units.map(unit => worldToScreen(unit.position, zoom, cameraPos)),
    [units, zoom, cameraPos]
  );
  // ...
}
```

### Pattern 3: Canvas Rendering

```typescript
// ❌ Bad: Render everything every frame
function renderFrame() {
  clearCanvas();
  renderTerrain();
  renderBuildings();
  renderUnits();
  renderEffects();
}

// ✅ Good: Only render dirty layers
function renderFrame() {
  if (dirtyFlags.terrain) {
    renderTerrain();
    dirtyFlags.terrain = false;
  }
  if (dirtyFlags.units) {
    renderUnits();
    dirtyFlags.units = false;
  }
  // ...
}
```

### Pattern 4: Batch Operations

```typescript
// ❌ Bad: Individual operations
units.forEach(unit => {
  ctx.fillStyle = getColorForUnit(unit);
  ctx.fillRect(unit.x, unit.y, size, size);
});

// ✅ Good: Batch by type
const unitsByType = groupBy(units, 'type');
for (const [type, typeUnits] of unitsByType) {
  ctx.fillStyle = getColorForType(type);
  typeUnits.forEach(unit => {
    ctx.fillRect(unit.x, unit.y, size, size);
  });
}
```

## Performance Targets

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| FPS | 60 | 54-60 | < 54 |
| Frame Time | 16.67ms | < 18ms | > 18ms |
| Drop Rate | 0% | < 2% | > 2% |
| p99 Latency | 20ms | < 33ms | > 33ms |
| Update Time | < 5ms | < 8ms | > 8ms |
| Render Time | < 6ms | < 10ms | > 10ms |

## Debugging Performance Issues

### Step 1: Enable Profiling

```typescript
import { enablePerformanceLogging } from '@/lib/utils/performanceProfiler';
enablePerformanceLogging();
```

Check console for warnings:
- Low FPS
- High update/render time
- High frame drop rate
- High p99 latency

### Step 2: Use Chrome DevTools

1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record (Ctrl+E)
4. Perform slow action
5. Stop recording
6. Analyze flame graph

Look for:
- Long frames (red bars)
- Frequent GC (sawtooth pattern)
- Expensive functions (wide bars)
- Layout thrashing (purple bars)

### Step 3: Identify Bottleneck

Common bottlenecks:
- **Rendering**: Too many canvas operations
- **State Updates**: Unnecessary re-renders
- **Calculations**: Expensive operations in hot path
- **Memory**: Frequent allocations/GC

### Step 4: Apply Optimization

- **Rendering**: Add dirty flags, viewport culling, batch operations
- **State**: Use refs, memoization, throttling
- **Calculations**: Cache results, use lookup tables
- **Memory**: Object pooling, reuse objects

## Tools

### Performance Profiler API

```typescript
import { PerformanceProfiler } from '@/lib/utils/performanceProfiler';

const profiler = new PerformanceProfiler({
  sampleSize: 60,
  targetFPS: 60,
  enableLogging: true,
});

// In game loop
const start = profiler.startFrame();
// ... game logic ...
profiler.endFrame(start);

// Get metrics
const metrics = profiler.getMetrics();
console.log(`FPS: ${metrics.fps}`);
console.log(`Frame Time: ${metrics.frameTime}ms`);

// Get detailed stats
const stats = profiler.getDetailedStats();
console.log(`p95: ${stats.p95}ms`);
console.log(`Drop Rate: ${stats.dropRate}%`);

// Check warnings
const warnings = profiler.getWarnings();
if (warnings.length > 0) {
  console.warn('Performance issues:', warnings);
}
```

### Optimized Renderer API

```typescript
import { OptimizedCanvasRenderer } from '@/components/game/GameMap/GameMapOptimized';

const renderer = new OptimizedCanvasRenderer(canvas);

// Throttled rendering
renderer.requestRender(() => {
  // Render logic
});

// Batch operations
renderer.batchRender([
  () => renderTerrain(ctx),
  () => renderBuildings(ctx),
  () => renderUnits(ctx),
]);

// Cached conversions
const screenPos = renderer.getCachedWorldToScreen(
  worldPos,
  zoom,
  cameraPos,
  'unit-1'
);

// Invalidate cache on camera move
renderer.invalidateCache();

// Cleanup
renderer.dispose();
```

## Best Practices

### DO ✅

- Profile before optimizing
- Focus on hot paths (code called every frame)
- Use refs for high-frequency updates
- Batch similar operations
- Cache expensive calculations
- Use viewport culling for large scenes
- Implement dirty flags for rendering
- Monitor performance in development
- Test with realistic load (100+ entities)

### DON'T ❌

- Optimize prematurely
- Allocate objects in hot paths
- Update state unnecessarily
- Render off-screen entities
- Recalculate unchanged values
- Use complex logic in render loop
- Ignore performance warnings
- Test only with few entities

## Resources

- [Full Documentation](./task-16.5-game-loop-performance-optimization.md)
- [Performance Profiler](../src/lib/utils/performanceProfiler.ts)
- [Optimized Renderer](../src/components/game/GameMap/GameMapOptimized.tsx)
- [Game Loop Hook](../src/hooks/useGameLoop.ts)
- [Performance Tests](../src/__tests__/game-loop-performance.test.ts)

## Support

If you encounter performance issues:

1. Enable profiling and check warnings
2. Use Chrome DevTools to identify bottleneck
3. Review this guide for applicable patterns
4. Check full documentation for detailed solutions
5. Run performance tests to verify improvements
