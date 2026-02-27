/**
 * GameMap component exports
 */

import { GameMap } from './GameMap';

export { GameMap, type GameMapProps, type TerrainData } from './GameMap';
export {
  worldToScreen,
  screenToWorld,
  isInViewport,
  constrainPosition,
  getViewportRect,
  type Vector2,
  type Viewport,
  type MapBounds,
} from './mapUtils';
export default GameMap;
