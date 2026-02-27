# Map Rendering Optimization

This document describes the performance optimizations implemented for the GameMap component to achieve smooth 60 FPS gameplay even with many units and buildings on the map.

## Optimizations Implemented

### 1. Viewport Culling

**What it does**: Only renders entities that are visible within the current viewport, skipping entities outside the visible area.

**Implementation**:
- Uses quadtree spatial indexing to efficiently query visible entities
- Queries viewport range with a margin (100px) for smooth scrolling
- Separates visible units and buildings before rendering

**Benefits**:
- Reduces rendering workload proportional to viewport size, not total entity count
- Enables smooth performance with hundreds or thousands of entities on large maps
- Minimal overhead for spatial queries using quadtree

### 2. Quadtree Spatial Indexing

**What it does**: Organizes entities in a hierarchical spatial data structure for efficient collision detection and range queries.

**Implementation**:
- Custom Quadtree class in `src/lib/utils/quadtree.ts`
- Automatically subdivides space when capacity is exceeded
- Supports rectangular and circular range queries
- Rebuilds quadtree when units or buildings change

**Benefits**:
- O(log n) query time instead of O(n) for finding nearby entities
- Efficient collision detection for combat system
- Scalable to thousands of entities

**API**:
```typescript
// Create quadtree
const quadtree = new Quadtree<Unit>(boundary, capacity);

// Insert items
quadtree.insert({ position: { x, y }, data: unit });

// Query rectangular range
const items = quadtree.query({ x, y, width, height });

// Query circular range
const items = quadtree.queryCircle({ x, y }, radius);
```

### 3. Dirty Flag System

**What it does**: Tracks which canvas layers need to be redrawn, skipping layers that haven't changed.

**Implementation**:
- Separate dirty flags for terrain, buildings, units, and effects layers
- Layers marked dirty when:
  - Viewport changes (pan/zoom)
  - Units or buildings change
  - Effects are added/removed
- Render functions check dirty flag and skip if clean
- Flags cleared after successful render

**Benefits**:
- Avoids redundant rendering of static layers (terrain)
- Reduces CPU/GPU workload when only some layers change
- Enables efficient partial updates

**Usage**:
```typescript
// Mark a layer as dirty
dirtyFlagsRef.current.units = true;

// Render only checks dirty layers
if (!dirtyFlagsRef.current.units) return; // Skip if clean
```

### 4. Frame Rate Management

**What it does**: Maintains consistent 60 FPS by throttling render calls and skipping frames when necessary.

**Implementation**:
- Target frame time: 16.67ms (60 FPS)
- Tracks last frame time and delta time
- Skips frames if delta time is less than target
- Calculates and tracks actual FPS for monitoring

**Benefits**:
- Prevents excessive rendering that wastes resources
- Maintains smooth, consistent frame rate
- Adapts to device performance capabilities
- Provides FPS metrics for debugging

**Monitoring**:
```typescript
// Access FPS for debugging
const fps = getFPS(); // Returns current FPS (updated every second)
```

## Performance Characteristics

### Before Optimization
- Rendered all entities every frame
- O(n) complexity for finding nearby entities
- Redraws all layers even when unchanged
- Unthrottled rendering could exceed 60 FPS unnecessarily

### After Optimization
- Renders only visible entities (viewport culling)
- O(log n) complexity for spatial queries (quadtree)
- Redraws only changed layers (dirty flags)
- Maintains consistent 60 FPS (frame rate management)

### Expected Performance
- **Small maps (< 50 entities)**: 60 FPS consistently
- **Medium maps (50-200 entities)**: 60 FPS with occasional drops to 55+ FPS
- **Large maps (200-1000 entities)**: 50-60 FPS depending on viewport density
- **Very large maps (1000+ entities)**: 45-60 FPS, scales with viewport size not total count

## Testing

### Quadtree Tests
Located in `src/lib/utils/__tests__/quadtree.test.ts`:
- Insert/query operations
- Boundary checking
- Subdivision behavior
- Circular range queries
- Performance with 1000+ items

### GameMap Tests
Located in `src/components/game/GameMap/GameMap.test.tsx`:
- Rendering with units and buildings
- Pan and zoom controls
- Touch gestures
- Boundary constraints
- Store integration

## Future Enhancements

### Potential Improvements
1. **Object pooling**: Reuse canvas objects to reduce garbage collection
2. **Web Workers**: Offload quadtree rebuilding to background thread
3. **Level of Detail (LOD)**: Render distant entities with less detail
4. **Instanced rendering**: Use WebGL for rendering many similar entities
5. **Occlusion culling**: Skip entities hidden behind buildings/terrain

### Monitoring and Debugging
The component exposes a debug API for performance monitoring:
```typescript
// Access via component internals (for debugging)
const { getFPS, markDirty } = _debugAPI;

// Get current FPS
console.log('Current FPS:', getFPS());

// Manually mark layer as dirty
markDirty('units');
```

## Configuration

### Adjustable Parameters

**Quadtree capacity** (default: 4):
```typescript
const quadtree = new Quadtree(boundary, 8); // Higher = less subdivision
```

**Target FPS** (default: 60):
```typescript
const targetFrameTime = 1000 / 30; // 30 FPS for lower-end devices
```

**Viewport margin** (default: 100px):
```typescript
const margin = 200; // Larger margin = smoother scrolling, more entities rendered
```

## Requirements Satisfied

This implementation satisfies the following requirements:

- **12.7**: Optimize rendering for performance with many units
- **12.8**: Only re-render changed elements
- **21.7**: Maintain 60 FPS during gameplay

## Conclusion

These optimizations enable the GameMap component to handle large-scale battles with hundreds of units while maintaining smooth 60 FPS performance. The combination of viewport culling, spatial indexing, dirty flags, and frame rate management provides a scalable foundation for the game's rendering system.
