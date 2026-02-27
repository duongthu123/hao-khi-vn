/**
 * Map utility functions for coordinate conversion, viewport culling, and boundary constraints
 * Requirements: 27.1
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Viewport {
  zoom: number;
  position: Vector2;
  width: number;
  height: number;
}

export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Convert world coordinates to screen coordinates
 * @param worldPos - Position in world space
 * @param viewport - Current viewport configuration
 * @returns Position in screen space
 */
export function worldToScreen(worldPos: Vector2, viewport: Viewport): Vector2 {
  return {
    x: (worldPos.x - viewport.position.x) * viewport.zoom,
    y: (worldPos.y - viewport.position.y) * viewport.zoom,
  };
}

/**
 * Convert screen coordinates to world coordinates
 * @param screenPos - Position in screen space
 * @param viewport - Current viewport configuration
 * @returns Position in world space
 */
export function screenToWorld(screenPos: Vector2, viewport: Viewport): Vector2 {
  return {
    x: screenPos.x / viewport.zoom + viewport.position.x,
    y: screenPos.y / viewport.zoom + viewport.position.y,
  };
}

/**
 * Check if a world position is visible in the viewport
 * @param worldPos - Position in world space to check
 * @param viewport - Current viewport configuration
 * @param margin - Optional margin to extend viewport bounds (default: 0)
 * @returns True if position is within viewport bounds (including margin)
 */
export function isInViewport(worldPos: Vector2, viewport: Viewport, margin = 0): boolean {
  const viewportWidth = viewport.width / viewport.zoom;
  const viewportHeight = viewport.height / viewport.zoom;
  
  return (
    worldPos.x >= viewport.position.x - margin &&
    worldPos.x <= viewport.position.x + viewportWidth + margin &&
    worldPos.y >= viewport.position.y - margin &&
    worldPos.y <= viewport.position.y + viewportHeight + margin
  );
}

/**
 * Constrain position to map boundaries
 * Ensures the viewport doesn't show area outside the playable map
 * @param pos - Desired viewport position
 * @param viewport - Current viewport configuration
 * @param mapBounds - Map boundary constraints
 * @returns Constrained position that keeps viewport within map bounds
 */
export function constrainPosition(pos: Vector2, viewport: Viewport, mapBounds: MapBounds): Vector2 {
  const viewportWidth = viewport.width / viewport.zoom;
  const viewportHeight = viewport.height / viewport.zoom;

  const constrainedX = Math.max(
    mapBounds.minX,
    Math.min(mapBounds.maxX - viewportWidth, pos.x)
  );
  const constrainedY = Math.max(
    mapBounds.minY,
    Math.min(mapBounds.maxY - viewportHeight, pos.y)
  );

  return { x: constrainedX, y: constrainedY };
}

/**
 * Calculate viewport rectangle for culling
 * Returns the world-space rectangle representing the visible area
 * @param viewport - Current viewport configuration
 * @param margin - Optional margin to extend viewport bounds (default: 0)
 * @returns Rectangle in world space representing visible area
 */
export function getViewportRect(viewport: Viewport, margin = 0): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  return {
    x: viewport.position.x - margin / viewport.zoom,
    y: viewport.position.y - margin / viewport.zoom,
    width: viewport.width / viewport.zoom + (2 * margin) / viewport.zoom,
    height: viewport.height / viewport.zoom + (2 * margin) / viewport.zoom,
  };
}
