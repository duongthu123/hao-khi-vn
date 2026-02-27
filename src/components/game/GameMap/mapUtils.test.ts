/**
 * Unit tests for GameMap utility functions
 * Tests coordinate conversion, viewport culling, and boundary constraints
 * Requirements: 27.1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  worldToScreen,
  screenToWorld,
  isInViewport,
  constrainPosition,
  getViewportRect,
  type Vector2,
  type Viewport,
  type MapBounds,
} from './mapUtils';

describe('Map Utility Functions', () => {
  describe('Coordinate Conversion', () => {
    let viewport: Viewport;

    beforeEach(() => {
      viewport = {
        zoom: 1,
        position: { x: 0, y: 0 },
        width: 800,
        height: 600,
      };
    });

    describe('worldToScreen', () => {
      it('converts world coordinates to screen coordinates at zoom 1', () => {
        const worldPos = { x: 100, y: 100 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBe(100);
        expect(screenPos.y).toBe(100);
      });

      it('converts world coordinates to screen coordinates at zoom 2', () => {
        viewport.zoom = 2;
        const worldPos = { x: 100, y: 100 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBe(200);
        expect(screenPos.y).toBe(200);
      });

      it('converts world coordinates to screen coordinates at zoom 0.5', () => {
        viewport.zoom = 0.5;
        const worldPos = { x: 100, y: 100 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBe(50);
        expect(screenPos.y).toBe(50);
      });

      it('accounts for viewport position offset', () => {
        viewport.position = { x: 50, y: 50 };
        const worldPos = { x: 100, y: 100 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBe(50);
        expect(screenPos.y).toBe(50);
      });

      it('handles negative world coordinates', () => {
        const worldPos = { x: -100, y: -100 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBe(-100);
        expect(screenPos.y).toBe(-100);
      });

      it('handles combined zoom and position offset', () => {
        viewport.zoom = 2;
        viewport.position = { x: 50, y: 50 };
        const worldPos = { x: 100, y: 100 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBe(100); // (100 - 50) * 2
        expect(screenPos.y).toBe(100);
      });

      it('converts origin point correctly', () => {
        viewport.position = { x: 100, y: 100 };
        const worldPos = { x: 100, y: 100 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBe(0);
        expect(screenPos.y).toBe(0);
      });

      it('handles fractional coordinates', () => {
        viewport.zoom = 1.5;
        const worldPos = { x: 100.5, y: 200.75 };
        const screenPos = worldToScreen(worldPos, viewport);
        
        expect(screenPos.x).toBeCloseTo(150.75);
        expect(screenPos.y).toBeCloseTo(301.125);
      });
    });

    describe('screenToWorld', () => {
      it('converts screen coordinates to world coordinates at zoom 1', () => {
        const screenPos = { x: 100, y: 100 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBe(100);
        expect(worldPos.y).toBe(100);
      });

      it('converts screen coordinates to world coordinates at zoom 2', () => {
        viewport.zoom = 2;
        const screenPos = { x: 200, y: 200 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBe(100);
        expect(worldPos.y).toBe(100);
      });

      it('converts screen coordinates to world coordinates at zoom 0.5', () => {
        viewport.zoom = 0.5;
        const screenPos = { x: 50, y: 50 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBe(100);
        expect(worldPos.y).toBe(100);
      });

      it('accounts for viewport position offset', () => {
        viewport.position = { x: 50, y: 50 };
        const screenPos = { x: 50, y: 50 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBe(100);
        expect(worldPos.y).toBe(100);
      });

      it('handles negative screen coordinates', () => {
        const screenPos = { x: -100, y: -100 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBe(-100);
        expect(worldPos.y).toBe(-100);
      });

      it('handles combined zoom and position offset', () => {
        viewport.zoom = 2;
        viewport.position = { x: 50, y: 50 };
        const screenPos = { x: 100, y: 100 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBe(100); // 100 / 2 + 50
        expect(worldPos.y).toBe(100);
      });

      it('converts origin point correctly', () => {
        viewport.position = { x: 100, y: 100 };
        const screenPos = { x: 0, y: 0 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBe(100);
        expect(worldPos.y).toBe(100);
      });

      it('handles fractional coordinates', () => {
        viewport.zoom = 1.5;
        const screenPos = { x: 150.75, y: 301.125 };
        const worldPos = screenToWorld(screenPos, viewport);
        
        expect(worldPos.x).toBeCloseTo(100.5);
        expect(worldPos.y).toBeCloseTo(200.75);
      });
    });

    describe('Round-trip conversion', () => {
      it('converts world to screen and back to world', () => {
        const originalWorld = { x: 123.45, y: 678.90 };
        const screenPos = worldToScreen(originalWorld, viewport);
        const finalWorld = screenToWorld(screenPos, viewport);
        
        expect(finalWorld.x).toBeCloseTo(originalWorld.x);
        expect(finalWorld.y).toBeCloseTo(originalWorld.y);
      });

      it('converts screen to world and back to screen', () => {
        const originalScreen = { x: 123.45, y: 678.90 };
        const worldPos = screenToWorld(originalScreen, viewport);
        const finalScreen = worldToScreen(worldPos, viewport);
        
        expect(finalScreen.x).toBeCloseTo(originalScreen.x);
        expect(finalScreen.y).toBeCloseTo(originalScreen.y);
      });

      it('maintains accuracy with zoom and offset', () => {
        viewport.zoom = 2.5;
        viewport.position = { x: 123, y: 456 };
        
        const originalWorld = { x: 789.12, y: 345.67 };
        const screenPos = worldToScreen(originalWorld, viewport);
        const finalWorld = screenToWorld(screenPos, viewport);
        
        expect(finalWorld.x).toBeCloseTo(originalWorld.x);
        expect(finalWorld.y).toBeCloseTo(originalWorld.y);
      });
    });
  });

  describe('Viewport Culling', () => {
    let viewport: Viewport;

    beforeEach(() => {
      viewport = {
        zoom: 1,
        position: { x: 0, y: 0 },
        width: 800,
        height: 600,
      };
    });

    describe('isInViewport', () => {
      it('returns true for position inside viewport', () => {
        const pos = { x: 400, y: 300 };
        expect(isInViewport(pos, viewport)).toBe(true);
      });

      it('returns true for position at viewport origin', () => {
        const pos = { x: 0, y: 0 };
        expect(isInViewport(pos, viewport)).toBe(true);
      });

      it('returns true for position at viewport edge', () => {
        const pos = { x: 800, y: 600 };
        expect(isInViewport(pos, viewport)).toBe(true);
      });

      it('returns false for position outside viewport left', () => {
        const pos = { x: -100, y: 300 };
        expect(isInViewport(pos, viewport)).toBe(false);
      });

      it('returns false for position outside viewport right', () => {
        const pos = { x: 900, y: 300 };
        expect(isInViewport(pos, viewport)).toBe(false);
      });

      it('returns false for position outside viewport top', () => {
        const pos = { x: 400, y: -100 };
        expect(isInViewport(pos, viewport)).toBe(false);
      });

      it('returns false for position outside viewport bottom', () => {
        const pos = { x: 400, y: 700 };
        expect(isInViewport(pos, viewport)).toBe(false);
      });

      it('accounts for viewport position offset', () => {
        viewport.position = { x: 100, y: 100 };
        const pos = { x: 500, y: 400 }; // Inside offset viewport
        expect(isInViewport(pos, viewport)).toBe(true);
      });

      it('accounts for zoom level', () => {
        viewport.zoom = 2;
        // At zoom 2, viewport shows 400x300 world units
        const pos = { x: 300, y: 200 }; // Inside zoomed viewport
        expect(isInViewport(pos, viewport)).toBe(true);
        
        const outsidePos = { x: 500, y: 400 }; // Outside zoomed viewport
        expect(isInViewport(outsidePos, viewport)).toBe(false);
      });

      it('includes margin when specified', () => {
        const pos = { x: -50, y: 300 }; // Outside viewport
        expect(isInViewport(pos, viewport, 0)).toBe(false);
        expect(isInViewport(pos, viewport, 100)).toBe(true); // Inside with margin
      });

      it('handles negative margin', () => {
        const pos = { x: 50, y: 50 }; // Inside viewport
        expect(isInViewport(pos, viewport, 0)).toBe(true);
        expect(isInViewport(pos, viewport, -100)).toBe(false); // Outside with negative margin
      });

      it('works with combined zoom, position, and margin', () => {
        viewport.zoom = 2;
        viewport.position = { x: 100, y: 100 };
        const margin = 50;
        
        // Position just outside viewport but within margin
        const pos = { x: 75, y: 150 };
        expect(isInViewport(pos, viewport, margin)).toBe(true);
      });
    });

    describe('getViewportRect', () => {
      it('calculates viewport rectangle at zoom 1', () => {
        const rect = getViewportRect(viewport);
        
        expect(rect.x).toBe(0);
        expect(rect.y).toBe(0);
        expect(rect.width).toBe(800);
        expect(rect.height).toBe(600);
      });

      it('calculates viewport rectangle at zoom 2', () => {
        viewport.zoom = 2;
        const rect = getViewportRect(viewport);
        
        expect(rect.x).toBe(0);
        expect(rect.y).toBe(0);
        expect(rect.width).toBe(400); // 800 / 2
        expect(rect.height).toBe(300); // 600 / 2
      });

      it('calculates viewport rectangle at zoom 0.5', () => {
        viewport.zoom = 0.5;
        const rect = getViewportRect(viewport);
        
        expect(rect.x).toBe(0);
        expect(rect.y).toBe(0);
        expect(rect.width).toBe(1600); // 800 / 0.5
        expect(rect.height).toBe(1200); // 600 / 0.5
      });

      it('accounts for viewport position', () => {
        viewport.position = { x: 100, y: 200 };
        const rect = getViewportRect(viewport);
        
        expect(rect.x).toBe(100);
        expect(rect.y).toBe(200);
        expect(rect.width).toBe(800);
        expect(rect.height).toBe(600);
      });

      it('includes margin in calculations', () => {
        const margin = 100;
        const rect = getViewportRect(viewport, margin);
        
        expect(rect.x).toBe(-100); // 0 - 100/1
        expect(rect.y).toBe(-100);
        expect(rect.width).toBe(1000); // 800 + 2*100/1
        expect(rect.height).toBe(800); // 600 + 2*100/1
      });

      it('scales margin with zoom', () => {
        viewport.zoom = 2;
        const margin = 100;
        const rect = getViewportRect(viewport, margin);
        
        expect(rect.x).toBe(-50); // 0 - 100/2
        expect(rect.y).toBe(-50);
        expect(rect.width).toBe(500); // 400 + 2*100/2
        expect(rect.height).toBe(400); // 300 + 2*100/2
      });

      it('handles combined zoom, position, and margin', () => {
        viewport.zoom = 1.5;
        viewport.position = { x: 200, y: 150 };
        const margin = 75;
        const rect = getViewportRect(viewport, margin);
        
        expect(rect.x).toBeCloseTo(150); // 200 - 75/1.5
        expect(rect.y).toBeCloseTo(100); // 150 - 75/1.5
        expect(rect.width).toBeCloseTo(633.33, 1); // 800/1.5 + 2*75/1.5
        expect(rect.height).toBeCloseTo(500); // 600/1.5 + 2*75/1.5
      });
    });
  });

  describe('Boundary Constraints', () => {
    let viewport: Viewport;
    let mapBounds: MapBounds;

    beforeEach(() => {
      viewport = {
        zoom: 1,
        position: { x: 0, y: 0 },
        width: 800,
        height: 600,
      };
      
      mapBounds = {
        minX: 0,
        minY: 0,
        maxX: 2000,
        maxY: 1500,
      };
    });

    describe('constrainPosition', () => {
      it('returns position unchanged when within bounds', () => {
        const pos = { x: 500, y: 400 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(500);
        expect(constrained.y).toBe(400);
      });

      it('constrains position to minimum X boundary', () => {
        const pos = { x: -100, y: 400 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(0);
        expect(constrained.y).toBe(400);
      });

      it('constrains position to minimum Y boundary', () => {
        const pos = { x: 500, y: -100 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(500);
        expect(constrained.y).toBe(0);
      });

      it('constrains position to maximum X boundary', () => {
        const pos = { x: 2000, y: 400 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(1200); // 2000 - 800
        expect(constrained.y).toBe(400);
      });

      it('constrains position to maximum Y boundary', () => {
        const pos = { x: 500, y: 1500 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(500);
        expect(constrained.y).toBe(900); // 1500 - 600
      });

      it('constrains both X and Y when outside bounds', () => {
        const pos = { x: -100, y: -100 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(0);
        expect(constrained.y).toBe(0);
      });

      it('accounts for zoom when constraining', () => {
        viewport.zoom = 2;
        // At zoom 2, viewport shows 400x300 world units
        const pos = { x: 1800, y: 1300 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(1600); // 2000 - 400
        expect(constrained.y).toBe(1200); // 1500 - 300
      });

      it('handles small map bounds', () => {
        mapBounds = { minX: 0, minY: 0, maxX: 400, maxY: 300 };
        // Viewport is larger than map
        const pos = { x: 100, y: 100 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        // Should constrain to show as much map as possible
        expect(constrained.x).toBe(0);
        expect(constrained.y).toBe(0);
      });

      it('handles negative map bounds', () => {
        mapBounds = { minX: -500, minY: -500, maxX: 500, maxY: 500 };
        const pos = { x: -600, y: -600 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(-500);
        expect(constrained.y).toBe(-500);
      });

      it('constrains at exact boundary values', () => {
        const pos = { x: 0, y: 0 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(0);
        expect(constrained.y).toBe(0);
      });

      it('handles fractional positions', () => {
        const pos = { x: 123.456, y: 789.012 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(123.456);
        expect(constrained.y).toBe(789.012);
      });

      it('works with combined zoom and position constraints', () => {
        viewport.zoom = 0.5;
        // At zoom 0.5, viewport shows 1600x1200 world units
        const pos = { x: 1000, y: 800 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(400); // 2000 - 1600
        expect(constrained.y).toBe(300); // 1500 - 1200
      });

      it('prevents viewport from showing area outside map', () => {
        viewport.zoom = 1;
        
        // Try to position viewport so it would show area beyond max bounds
        const pos = { x: 1500, y: 1000 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        // Should be constrained so viewport edge aligns with map edge
        expect(constrained.x).toBe(1200); // maxX - viewport width
        expect(constrained.y).toBe(900); // maxY - viewport height
      });

      it('handles edge case where viewport equals map size', () => {
        mapBounds = { minX: 0, minY: 0, maxX: 800, maxY: 600 };
        const pos = { x: 100, y: 100 };
        const constrained = constrainPosition(pos, viewport, mapBounds);
        
        expect(constrained.x).toBe(0);
        expect(constrained.y).toBe(0);
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles zero zoom gracefully', () => {
      const viewport: Viewport = {
        zoom: 0.001, // Very small zoom
        position: { x: 0, y: 0 },
        width: 800,
        height: 600,
      };
      
      const worldPos = { x: 100, y: 100 };
      const screenPos = worldToScreen(worldPos, viewport);
      
      expect(screenPos.x).toBeCloseTo(0.1);
      expect(screenPos.y).toBeCloseTo(0.1);
    });

    it('handles very large zoom values', () => {
      const viewport: Viewport = {
        zoom: 100,
        position: { x: 0, y: 0 },
        width: 800,
        height: 600,
      };
      
      const worldPos = { x: 1, y: 1 };
      const screenPos = worldToScreen(worldPos, viewport);
      
      expect(screenPos.x).toBe(100);
      expect(screenPos.y).toBe(100);
    });

    it('handles very large world coordinates', () => {
      const viewport: Viewport = {
        zoom: 1,
        position: { x: 0, y: 0 },
        width: 800,
        height: 600,
      };
      
      const worldPos = { x: 1000000, y: 1000000 };
      const screenPos = worldToScreen(worldPos, viewport);
      
      expect(screenPos.x).toBe(1000000);
      expect(screenPos.y).toBe(1000000);
    });

    it('maintains precision with multiple conversions', () => {
      const viewport: Viewport = {
        zoom: 1.7,
        position: { x: 234.56, y: 789.01 },
        width: 800,
        height: 600,
      };
      
      const originalWorld = { x: 456.78, y: 901.23 };
      
      // Convert multiple times
      let pos = originalWorld;
      for (let i = 0; i < 10; i++) {
        const screen = worldToScreen(pos, viewport);
        pos = screenToWorld(screen, viewport);
      }
      
      expect(pos.x).toBeCloseTo(originalWorld.x, 10);
      expect(pos.y).toBeCloseTo(originalWorld.y, 10);
    });
  });
});
