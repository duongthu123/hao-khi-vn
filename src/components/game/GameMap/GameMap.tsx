'use client';

/**
 * GameMap Component
 * Interactive battlefield map with HTML5 Canvas rendering
 * Implements multiple layers, coordinate system, viewport management,
 * and interactive pan/zoom controls with touch support
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Unit } from '@/types/unit';
import { Building } from '@/store/slices/combatSlice';
import { useGameStore } from '@/store';
import { Quadtree, Rectangle } from '@/lib/utils/quadtree';

export interface Vector2 {
  x: number;
  y: number;
}

export interface GameMapProps {
  units: Unit[];
  buildings: Building[];
  terrain?: TerrainData;
  onUnitClick?: (unit: Unit) => void;
  onTileClick?: (x: number, y: number) => void;
  zoom?: number;
  position?: Vector2;
  width?: number;
  height?: number;
  className?: string;
  enablePanZoom?: boolean;
  minZoom?: number;
  maxZoom?: number;
  mapBounds?: { minX: number; minY: number; maxX: number; maxY: number };
}

export interface TerrainData {
  width: number;
  height: number;
  tiles?: Array<{ x: number; y: number; type: string }>;
}

interface CanvasLayers {
  terrain: HTMLCanvasElement;
  buildings: HTMLCanvasElement;
  units: HTMLCanvasElement;
  effects: HTMLCanvasElement;
}

interface DirtyFlags {
  terrain: boolean;
  buildings: boolean;
  units: boolean;
  effects: boolean;
}

/**
 * GameMap component with multi-layer canvas rendering and interactive controls
 */
export const GameMap: React.FC<GameMapProps> = ({
  units = [],
  buildings = [],
  terrain,
  onUnitClick,
  onTileClick,
  zoom: propZoom,
  position: propPosition,
  width = 800,
  height = 600,
  className = '',
  enablePanZoom = true,
  minZoom = 0.5,
  maxZoom = 3,
  mapBounds,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<Partial<CanvasLayers>>({});
  const animationFrameRef = useRef<number>();
  
  // Dirty flags for optimized rendering
  const dirtyFlagsRef = useRef<DirtyFlags>({
    terrain: true,
    buildings: true,
    units: true,
    effects: true,
  });

  // Quadtree for spatial indexing
  const quadtreeRef = useRef<Quadtree<Unit | Building> | null>(null);
  
  // Frame rate management
  const lastFrameTimeRef = useRef<number>(0);
  const targetFrameTime = 1000 / 60; // 60 FPS
  const fpsRef = useRef<number>(60);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);

  // Get map view from store
  const ui = useGameStore((state) => state.ui);
  const setMapZoom = useGameStore((state) => state.setMapZoom);
  const setMapPosition = useGameStore((state) => state.setMapPosition);
  const storeZoom = ui.mapZoom;
  const storePosition = ui.mapPosition;

  // Use prop values if provided, otherwise use store values
  const zoom = propZoom !== undefined ? propZoom : storeZoom;
  const position = propPosition !== undefined ? propPosition : storePosition;

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number }>(position);

  // Selection state
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [hoveredUnitId, setHoveredUnitId] = useState<string | null>(null);

  // Touch state for pinch zoom
  const touchesRef = useRef<{ id: number; x: number; y: number }[]>([]);
  const lastPinchDistanceRef = useRef<number | null>(null);

  // Smooth transition state
  const transitionRef = useRef<{
    active: boolean;
    startZoom: number;
    targetZoom: number;
    startPosition: Vector2;
    targetPosition: Vector2;
    startTime: number;
    duration: number;
  } | null>(null);

  // Viewport state
  const viewportRef = useRef({
    zoom,
    position,
    width,
    height,
  });

  // Update viewport when props change
  useEffect(() => {
    viewportRef.current = { zoom, position, width, height };
    lastPositionRef.current = position;
    
    // Mark layers as dirty when viewport changes
    dirtyFlagsRef.current.terrain = true;
    dirtyFlagsRef.current.buildings = true;
    dirtyFlagsRef.current.units = true;
    dirtyFlagsRef.current.effects = true;
  }, [zoom, position, width, height]);

  /**
   * Rebuild quadtree with current entities
   */
  const rebuildQuadtree = useCallback(() => {
    // Define map bounds for quadtree
    const bounds: Rectangle = mapBounds
      ? {
          x: mapBounds.minX,
          y: mapBounds.minY,
          width: mapBounds.maxX - mapBounds.minX,
          height: mapBounds.maxY - mapBounds.minY,
        }
      : {
          x: 0,
          y: 0,
          width: terrain?.width ? terrain.width * 32 : 2000,
          height: terrain?.height ? terrain.height * 32 : 2000,
        };

    // Create new quadtree
    quadtreeRef.current = new Quadtree<Unit | Building>(bounds, 4);

    // Insert all units
    units.forEach((unit) => {
      quadtreeRef.current!.insert({
        position: unit.position,
        data: unit,
      });
    });

    // Insert all buildings
    buildings.forEach((building) => {
      quadtreeRef.current!.insert({
        position: building.position,
        data: building,
      });
    });
  }, [units, buildings, mapBounds, terrain]);

  /**
   * Get visible entities using quadtree
   */
  const getVisibleEntities = useCallback((): {
    units: Unit[];
    buildings: Building[];
  } => {
    if (!quadtreeRef.current) {
      return { units, buildings };
    }

    const { position, width, height, zoom } = viewportRef.current;
    const margin = 100; // Extra margin for smooth scrolling

    // Query viewport range with margin
    const viewportRange: Rectangle = {
      x: position.x - margin / zoom,
      y: position.y - margin / zoom,
      width: width / zoom + (2 * margin) / zoom,
      height: height / zoom + (2 * margin) / zoom,
    };

    const visibleItems = quadtreeRef.current.query(viewportRange);

    // Separate units and buildings
    const visibleUnits: Unit[] = [];
    const visibleBuildings: Building[] = [];

    visibleItems.forEach((item) => {
      if ('type' in item.data && 'direction' in item.data) {
        // It's a unit
        visibleUnits.push(item.data as Unit);
      } else {
        // It's a building
        visibleBuildings.push(item.data as Building);
      }
    });

    return { units: visibleUnits, buildings: visibleBuildings };
  }, [units, buildings]);

  /**
   * Mark a layer as dirty (needs redraw)
   * Exported for future use by animation system
   */
  // const _markDirty = useCallback((layer: keyof DirtyFlags) => {
  //   dirtyFlagsRef.current[layer] = true;
  // }, []);

  /**
   * Calculate current FPS
   */
  const updateFPS = useCallback((currentTime: number) => {
    frameCountRef.current++;
    
    if (currentTime - lastFpsUpdateRef.current >= 1000) {
      fpsRef.current = frameCountRef.current;
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = currentTime;
    }
  }, []);

  /**
   * Get current FPS
   * Exported for debugging and performance monitoring
   */
  // const _getFPS = useCallback((): number => {
  //   return fpsRef.current;
  // }, []);

  // Expose FPS getter for debugging (can be accessed via ref)
  // const _debugAPI = { getFPS: _getFPS, markDirty: _markDirty };

  /**
   * Initialize canvas layers
   */
  const initializeLayers = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const dpr = window.devicePixelRatio || 1;

    // Create canvas layers if they don't exist
    const layerNames: (keyof CanvasLayers)[] = ['terrain', 'buildings', 'units', 'effects'];
    
    layerNames.forEach((layerName, index) => {
      if (!layersRef.current[layerName]) {
        const canvas = document.createElement('canvas');
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = `${index}`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        
        container.appendChild(canvas);
        layersRef.current[layerName] = canvas;
      }
    });
  }, [width, height]);

  /**
   * Constrain position to map boundaries
   */
  const constrainPosition = useCallback((pos: Vector2, currentZoom: number): Vector2 => {
    if (!mapBounds) return pos;

    const viewportWidth = width / currentZoom;
    const viewportHeight = height / currentZoom;

    const constrainedX = Math.max(
      mapBounds.minX,
      Math.min(mapBounds.maxX - viewportWidth, pos.x)
    );
    const constrainedY = Math.max(
      mapBounds.minY,
      Math.min(mapBounds.maxY - viewportHeight, pos.y)
    );

    return { x: constrainedX, y: constrainedY };
  }, [mapBounds, width, height]);

  /**
   * Smooth transition animation using easing
   */
  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  /**
   * Start a smooth transition to target zoom and position
   */
  const startTransition = useCallback((
    targetZoom: number,
    targetPosition: Vector2,
    duration: number = 300
  ) => {
    transitionRef.current = {
      active: true,
      startZoom: viewportRef.current.zoom,
      targetZoom,
      startPosition: viewportRef.current.position,
      targetPosition,
      startTime: Date.now(),
      duration,
    };
  }, []);

  /**
   * Update transition animation
   */
  const updateTransition = useCallback(() => {
    if (!transitionRef.current || !transitionRef.current.active) return false;

    const { startZoom, targetZoom, startPosition, targetPosition, startTime, duration } = transitionRef.current;
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    const newZoom = startZoom + (targetZoom - startZoom) * easedProgress;
    const newPosition = {
      x: startPosition.x + (targetPosition.x - startPosition.x) * easedProgress,
      y: startPosition.y + (targetPosition.y - startPosition.y) * easedProgress,
    };

    viewportRef.current.zoom = newZoom;
    viewportRef.current.position = newPosition;

    if (progress >= 1) {
      transitionRef.current.active = false;
      // Update store with final values
      if (propZoom === undefined) setMapZoom(targetZoom);
      if (propPosition === undefined) setMapPosition(targetPosition);
      return false;
    }

    return true;
  }, [propZoom, propPosition, setMapZoom, setMapPosition]);

  /**
   * Handle zoom with center point
   */
  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    if (!enablePanZoom) return;

    const currentZoom = viewportRef.current.zoom;
    const currentPosition = viewportRef.current.position;

    // Calculate new zoom level
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    let newZoom = currentZoom * zoomFactor;
    newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

    // If center point provided, zoom towards that point
    let newPosition = currentPosition;
    if (centerX !== undefined && centerY !== undefined) {
      const worldPosBefore = {
        x: centerX / currentZoom + currentPosition.x,
        y: centerY / currentZoom + currentPosition.y,
      };
      const worldPosAfter = {
        x: centerX / newZoom + currentPosition.x,
        y: centerY / newZoom + currentPosition.y,
      };
      newPosition = {
        x: currentPosition.x + (worldPosBefore.x - worldPosAfter.x),
        y: currentPosition.y + (worldPosBefore.y - worldPosAfter.y),
      };
    }

    // Constrain position to boundaries
    newPosition = constrainPosition(newPosition, newZoom);

    // Start smooth transition
    startTransition(newZoom, newPosition, 200);
  }, [enablePanZoom, minZoom, maxZoom, constrainPosition, startTransition]);

  /**
   * Handle pan with delta movement
   */
  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    if (!enablePanZoom) return;

    const currentZoom = viewportRef.current.zoom;
    const currentPosition = viewportRef.current.position;

    const newPosition = {
      x: currentPosition.x - deltaX / currentZoom,
      y: currentPosition.y - deltaY / currentZoom,
    };

    // Constrain position to boundaries
    const constrainedPosition = constrainPosition(newPosition, currentZoom);
    
    viewportRef.current.position = constrainedPosition;
    lastPositionRef.current = constrainedPosition;

    // Mark all layers as dirty when panning
    dirtyFlagsRef.current.terrain = true;
    dirtyFlagsRef.current.buildings = true;
    dirtyFlagsRef.current.units = true;
    dirtyFlagsRef.current.effects = true;

    // Update store immediately for smooth panning
    if (propPosition === undefined) {
      setMapPosition(constrainedPosition);
    }
  }, [enablePanZoom, constrainPosition, propPosition, setMapPosition]);

  /**
   * Mouse wheel handler for zooming
   */
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!enablePanZoom) return;
    
    event.preventDefault();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = event.clientX - rect.left;
    const centerY = event.clientY - rect.top;

    handleZoom(event.deltaY > 0 ? -1 : 1, centerX, centerY);
  }, [enablePanZoom, handleZoom]);

  /**
   * Mouse down handler for panning
   */
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!enablePanZoom || event.button !== 0) return;

    setIsPanning(true);
    panStartRef.current = { x: event.clientX, y: event.clientY };
    
    // Prevent text selection during drag
    event.preventDefault();
  }, [enablePanZoom]);

  /**
   * Mouse move handler for panning
   */
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isPanning || !panStartRef.current) return;

    const deltaX = event.clientX - panStartRef.current.x;
    const deltaY = event.clientY - panStartRef.current.y;

    handlePan(deltaX, deltaY);

    panStartRef.current = { x: event.clientX, y: event.clientY };
  }, [isPanning, handlePan]);

  /**
   * Mouse up handler for panning
   */
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStartRef.current = null;
  }, []);

  /**
   * Touch start handler for mobile gestures
   */
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!enablePanZoom) return;

    const touches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    }));

    touchesRef.current = touches;

    if (touches.length === 1) {
      // Single touch - start panning
      setIsPanning(true);
      panStartRef.current = { x: touches[0].x, y: touches[0].y };
    } else if (touches.length === 2) {
      // Two touches - prepare for pinch zoom
      setIsPanning(false);
      const distance = Math.sqrt(
        Math.pow(touches[1].x - touches[0].x, 2) +
        Math.pow(touches[1].y - touches[0].y, 2)
      );
      lastPinchDistanceRef.current = distance;
    }
  }, [enablePanZoom]);

  /**
   * Touch move handler for mobile gestures
   */
  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!enablePanZoom) return;

    event.preventDefault();

    const touches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    }));

    if (touches.length === 1 && isPanning && panStartRef.current) {
      // Single touch panning
      const deltaX = touches[0].x - panStartRef.current.x;
      const deltaY = touches[0].y - panStartRef.current.y;

      handlePan(deltaX, deltaY);

      panStartRef.current = { x: touches[0].x, y: touches[0].y };
    } else if (touches.length === 2 && lastPinchDistanceRef.current !== null) {
      // Pinch zoom
      const distance = Math.sqrt(
        Math.pow(touches[1].x - touches[0].x, 2) +
        Math.pow(touches[1].y - touches[0].y, 2)
      );

      const delta = distance - lastPinchDistanceRef.current;
      
      // Calculate center point between two touches
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = ((touches[0].x + touches[1].x) / 2) - rect.left;
        const centerY = ((touches[0].y + touches[1].y) / 2) - rect.top;
        
        handleZoom(delta, centerX, centerY);
      }

      lastPinchDistanceRef.current = distance;
    }

    touchesRef.current = touches;
  }, [enablePanZoom, isPanning, handlePan, handleZoom]);

  /**
   * Touch end handler for mobile gestures
   */
  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    const touches = Array.from(event.touches).map(touch => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
    }));

    touchesRef.current = touches;

    if (touches.length === 0) {
      setIsPanning(false);
      panStartRef.current = null;
      lastPinchDistanceRef.current = null;
    } else if (touches.length === 1) {
      // Transition from pinch to pan
      setIsPanning(true);
      panStartRef.current = { x: touches[0].x, y: touches[0].y };
      lastPinchDistanceRef.current = null;
    }
  }, []);

  /**
   * Convert world coordinates to screen coordinates
   */
  const worldToScreen = useCallback((worldPos: Vector2): Vector2 => {
    const { zoom, position } = viewportRef.current;
    return {
      x: (worldPos.x - position.x) * zoom,
      y: (worldPos.y - position.y) * zoom,
    };
  }, []);

  /**
   * Convert screen coordinates to world coordinates
   */
  const screenToWorld = useCallback((screenPos: Vector2): Vector2 => {
    const { zoom, position } = viewportRef.current;
    return {
      x: screenPos.x / zoom + position.x,
      y: screenPos.y / zoom + position.y,
    };
  }, []);

  /**
   * Check if a world position is visible in the viewport
   * Kept for backward compatibility and future use
   */
  // const _isInViewport = useCallback((worldPos: Vector2, margin = 50): boolean => {
  //   const { position, width, height, zoom } = viewportRef.current;
  //   const viewportWidth = width / zoom;
  //   const viewportHeight = height / zoom;
  //   
  //   return (
  //     worldPos.x >= position.x - margin &&
  //     worldPos.x <= position.x + viewportWidth + margin &&
  //     worldPos.y >= position.y - margin &&
  //     worldPos.y <= position.y + viewportHeight + margin
  //   );
  // }, []);

  /**
   * Render terrain layer
   */
  const renderTerrain = useCallback(() => {
    // Skip if not dirty
    if (!dirtyFlagsRef.current.terrain) return;
    
    const canvas = layersRef.current.terrain;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = '#2d5016'; // Dark green terrain
    ctx.fillRect(0, 0, width, height);

    // Draw grid if terrain data exists
    if (terrain) {
      const { zoom, position } = viewportRef.current;
      const tileSize = 32 * zoom;
      
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      // Draw vertical lines
      for (let x = 0; x < terrain.width; x++) {
        const screenX = (x * 32 - position.x) * zoom;
        if (screenX >= -tileSize && screenX <= width + tileSize) {
          ctx.beginPath();
          ctx.moveTo(screenX, 0);
          ctx.lineTo(screenX, height);
          ctx.stroke();
        }
      }

      // Draw horizontal lines
      for (let y = 0; y < terrain.height; y++) {
        const screenY = (y * 32 - position.y) * zoom;
        if (screenY >= -tileSize && screenY <= height + tileSize) {
          ctx.beginPath();
          ctx.moveTo(0, screenY);
          ctx.lineTo(width, screenY);
          ctx.stroke();
        }
      }
    }
    
    // Mark as clean
    dirtyFlagsRef.current.terrain = false;
  }, [terrain, width, height]);

  /**
   * Render buildings layer
   */
  const renderBuildings = useCallback(() => {
    // Skip if not dirty
    if (!dirtyFlagsRef.current.buildings) return;
    
    const canvas = layersRef.current.buildings;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get visible buildings using quadtree
    const { buildings: visibleBuildings } = getVisibleEntities();

    // Render each visible building
    visibleBuildings.forEach((building) => {
      const screenPos = worldToScreen(building.position);
      const size = 40 * viewportRef.current.zoom;

      // Draw building
      ctx.fillStyle = building.owner === 'player' ? '#3b82f6' : '#ef4444';
      ctx.fillRect(screenPos.x - size / 2, screenPos.y - size / 2, size, size);

      // Draw health bar
      const healthPercent = building.health / building.maxHealth;
      const barWidth = size;
      const barHeight = 4;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(screenPos.x - barWidth / 2, screenPos.y - size / 2 - 8, barWidth, barHeight);
      
      ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(screenPos.x - barWidth / 2, screenPos.y - size / 2 - 8, barWidth * healthPercent, barHeight);
    });
    
    // Mark as clean
    dirtyFlagsRef.current.buildings = false;
  }, [worldToScreen, getVisibleEntities, width, height]);

  /**
   * Render units layer with selection, highlighting, and status indicators
   */
  const renderUnits = useCallback(() => {
    // Skip if not dirty
    if (!dirtyFlagsRef.current.units) return;
    
    const canvas = layersRef.current.units;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get visible units using quadtree
    const { units: visibleUnits } = getVisibleEntities();

    // Render each visible unit
    visibleUnits.forEach((unit) => {
      const screenPos = worldToScreen(unit.position);
      const size = 24 * viewportRef.current.zoom;
      const isSelected = unit.id === selectedUnitId;
      const isHovered = unit.id === hoveredUnitId;

      // Draw selection/hover ring
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, size / 2 + 4, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? '#fbbf24' : '#94a3b8';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add glow effect for selected units
        if (isSelected) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(screenPos.x, screenPos.y, size / 2 + 4, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Draw unit circle
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, size / 2, 0, Math.PI * 2);
      ctx.fillStyle = unit.owner === 'player' ? '#60a5fa' : '#f87171';
      ctx.fill();
      ctx.strokeStyle = unit.owner === 'player' ? '#2563eb' : '#dc2626';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw unit type indicator (small icon in center)
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.max(10, size / 3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const typeIcon = getUnitTypeIcon(unit.type);
      ctx.fillText(typeIcon, screenPos.x, screenPos.y);

      // Draw direction indicator
      const directionAngle = getDirectionAngle(unit.direction);
      const indicatorLength = size / 2 + 5;
      const endX = screenPos.x + Math.cos(directionAngle) * indicatorLength;
      const endY = screenPos.y + Math.sin(directionAngle) * indicatorLength;
      
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw health bar
      const healthPercent = unit.health / unit.maxHealth;
      const barWidth = size * 1.5;
      const barHeight = 4;
      const barY = screenPos.y - size / 2 - 8;
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);
      
      // Health fill
      ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(screenPos.x - barWidth / 2, barY, barWidth * healthPercent, barHeight);
      
      // Health bar border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenPos.x - barWidth / 2, barY, barWidth, barHeight);

      // Draw status effect indicators
      if (unit.status && unit.status.length > 0) {
        const statusY = screenPos.y + size / 2 + 6;
        const statusSize = Math.max(6, size / 4);
        const statusSpacing = statusSize + 2;
        const totalWidth = unit.status.length * statusSpacing - 2;
        let statusX = screenPos.x - totalWidth / 2;

        unit.status.forEach((effect) => {
          // Draw status effect icon
          ctx.beginPath();
          ctx.arc(statusX + statusSize / 2, statusY + statusSize / 2, statusSize / 2, 0, Math.PI * 2);
          ctx.fillStyle = getStatusEffectColor(effect.type);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();

          statusX += statusSpacing;
        });
      }

      // Draw unit stats for selected unit
      if (isSelected && viewportRef.current.zoom >= 1) {
        const statsY = screenPos.y + size / 2 + (unit.status.length > 0 ? 18 : 10);
        const fontSize = Math.max(10, size / 3);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenPos.x - 30, statsY, 60, fontSize + 4);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(`⚔${unit.attack} 🛡${unit.defense}`, screenPos.x, statsY + 2);
      }
    });
    
    // Mark as clean
    dirtyFlagsRef.current.units = false;
  }, [worldToScreen, getVisibleEntities, width, height, selectedUnitId, hoveredUnitId]);

  /**
   * Render effects layer
   */
  const renderEffects = useCallback(() => {
    // Skip if not dirty
    if (!dirtyFlagsRef.current.effects) return;
    
    const canvas = layersRef.current.effects;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Effects rendering will be implemented when needed
    // This layer is for temporary visual effects like explosions, abilities, etc.
    
    // Mark as clean
    dirtyFlagsRef.current.effects = false;
  }, [width, height]);

  /**
   * Main render loop with transition support and frame rate management
   */
  const renderFrame = useCallback((currentTime: number = performance.now()) => {
    // Frame rate management - target 60 FPS
    const deltaTime = currentTime - lastFrameTimeRef.current;
    
    if (deltaTime < targetFrameTime) {
      // Skip this frame to maintain target FPS
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      return;
    }
    
    lastFrameTimeRef.current = currentTime;
    
    // Update FPS counter
    updateFPS(currentTime);
    
    // Update transition if active
    const transitionActive = updateTransition();
    
    // Render only dirty layers
    renderTerrain();
    renderBuildings();
    renderUnits();
    renderEffects();

    // Continue animation loop if transition is active or if any layer is dirty
    const anyDirty = Object.values(dirtyFlagsRef.current).some(dirty => dirty);
    if (transitionActive || anyDirty) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [renderTerrain, renderBuildings, renderUnits, renderEffects, updateTransition, updateFPS]);

  /**
   * Handle canvas click for unit selection
   */
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isPanning) return;

    const rect = containerRef.current.getBoundingClientRect();
    const screenPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const worldPos = screenToWorld(screenPos);

    // Check if clicked on a unit
    const clickedUnit = units.find((unit) => {
      const distance = Math.sqrt(
        Math.pow(unit.position.x - worldPos.x, 2) +
        Math.pow(unit.position.y - worldPos.y, 2)
      );
      return distance < 20; // Click tolerance
    });

    if (clickedUnit) {
      // Select the unit
      setSelectedUnitId(clickedUnit.id);
      
      // Call the callback if provided
      if (onUnitClick) {
        onUnitClick(clickedUnit);
      }
      
      // Mark units layer as dirty to redraw with selection
      dirtyFlagsRef.current.units = true;
    } else {
      // Deselect if clicking empty space
      setSelectedUnitId(null);
      dirtyFlagsRef.current.units = true;
      
      // Call tile click callback
      if (onTileClick) {
        onTileClick(Math.floor(worldPos.x / 32), Math.floor(worldPos.y / 32));
      }
    }
  }, [units, screenToWorld, onUnitClick, onTileClick, isPanning]);

  /**
   * Handle mouse move for hover effects
   */
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isPanning) return;

    const rect = containerRef.current.getBoundingClientRect();
    const screenPos = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const worldPos = screenToWorld(screenPos);

    // Check if hovering over a unit
    const hoveredUnit = units.find((unit) => {
      const distance = Math.sqrt(
        Math.pow(unit.position.x - worldPos.x, 2) +
        Math.pow(unit.position.y - worldPos.y, 2)
      );
      return distance < 20; // Hover tolerance
    });

    const newHoveredId = hoveredUnit ? hoveredUnit.id : null;
    
    // Only update if hover state changed
    if (newHoveredId !== hoveredUnitId) {
      setHoveredUnitId(newHoveredId);
      dirtyFlagsRef.current.units = true;
    }
  }, [units, screenToWorld, hoveredUnitId, isPanning]);

  // Initialize layers on mount
  useEffect(() => {
    initializeLayers();
    
    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [initializeLayers]);

  // Rebuild quadtree when units or buildings change
  useEffect(() => {
    rebuildQuadtree();
    
    // Mark buildings and units layers as dirty
    dirtyFlagsRef.current.buildings = true;
    dirtyFlagsRef.current.units = true;
  }, [units, buildings, rebuildQuadtree]);

  // Set up mouse and wheel event listeners
  useEffect(() => {
    if (!enablePanZoom) return;

    const container = containerRef.current;
    if (!container) return;

    // Add wheel listener with passive: false to allow preventDefault
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Add global mouse move and up listeners for panning
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [enablePanZoom, handleWheel, handleMouseMove, handleMouseUp]);

  // Render when dependencies change
  useEffect(() => {
    // Cancel any existing animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Start render loop
    animationFrameRef.current = requestAnimationFrame(renderFrame);
  }, [renderFrame]);

  // Mark units layer dirty when selection or hover changes
  useEffect(() => {
    dirtyFlagsRef.current.units = true;
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
    }
  }, [selectedUnitId, hoveredUnitId, renderFrame]);

  return (
    <div
      ref={containerRef}
      className={`relative bg-black ${enablePanZoom ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      style={{ 
        width, 
        height,
        touchAction: enablePanZoom ? 'none' : 'auto',
        userSelect: 'none',
      }}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

/**
 * Helper function to convert direction enum to angle in radians
 */
function getDirectionAngle(direction: string): number {
  const angles: Record<string, number> = {
    north: -Math.PI / 2,
    northeast: -Math.PI / 4,
    east: 0,
    southeast: Math.PI / 4,
    south: Math.PI / 2,
    southwest: (3 * Math.PI) / 4,
    west: Math.PI,
    northwest: (-3 * Math.PI) / 4,
  };
  return angles[direction] || 0;
}

/**
 * Helper function to get unit type icon
 */
function getUnitTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    infantry: '⚔',
    cavalry: '🐎',
    archer: '🏹',
    siege: '🎯',
  };
  return icons[type] || '●';
}

/**
 * Helper function to get status effect color
 */
function getStatusEffectColor(type: string): string {
  const colors: Record<string, string> = {
    stun: '#fbbf24', // Yellow
    poison: '#a855f7', // Purple
    buff: '#22c55e', // Green
    debuff: '#ef4444', // Red
    slow: '#60a5fa', // Blue
    haste: '#f97316', // Orange
  };
  return colors[type] || '#94a3b8'; // Gray default
}

export default GameMap;
