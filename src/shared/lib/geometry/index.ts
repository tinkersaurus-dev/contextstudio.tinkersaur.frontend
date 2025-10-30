/**
 * Geometry Module
 *
 * Unified geometry utilities for the diagram system.
 * Provides bounding box calculations, position utilities, and connection point logic.
 *
 * @module geometry
 */

// Types
export type { Bounds, BoundsContext, Position, Dimensions } from './types';

// Bounds utilities
export {
  getEntityBounds,
  getShapeBounds,
  getConnectorBounds,
  boundsIntersect,
  pointInBounds,
  expandBounds,
  combineBounds,
} from './bounds';

// Position utilities
export type { PositionReference, PositionOptions } from './positions';
export {
  calculateCenteredPosition,
  calculatePosition,
  calculateShapeCenter,
  getBoundsCenter,
  calculateCenterOffset,
  getAnchorOffsetFromCenter,
  calculateShapeCenterForAnchorPosition,
} from './positions';

// Connection point utilities (re-exported from connection-point-system for backward compatibility)
export {
  getConnectionPointPosition,
  STANDARD_ANCHORS,
  getNearestAnchor,
  getOppositeAnchor,
  distanceToLineSegment,
  angleFromPoints,
  anchorForAngle,
  findConnectionPointAtPosition,
  getShapesNearPosition,
} from '../connections';
