/**
 * Connection Point System
 *
 * Domain-specific system for managing connection points on shapes.
 * These are the anchor points where connectors attach to shapes.
 */

// Export from system (primary exports)
export {
  getConnectionPointPosition,
  findConnectionPointAtPosition,
  getShapesNearPosition,
  STANDARD_ANCHORS,
  getNearestAnchor,
  getOppositeAnchor,
  distanceToLineSegment,
  angleFromPoints,
  anchorForAngle,
  ConnectionPointSystem,
  type ConnectionPoint,
  type FindConnectionPointOptions,
  type RenderConnectionPointOptions,
  type AnchorPosition,
} from './connection-point-system';

// Export from engine
export {
  ConnectionPointEngine,
  type ConnectionPointEngineConfig,
} from './connection-point-engine';
