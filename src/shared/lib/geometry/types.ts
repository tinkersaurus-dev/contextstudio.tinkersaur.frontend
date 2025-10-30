/**
 * Geometry Types
 *
 * Core types for geometric calculations across the diagram system.
 * Provides unified type definitions for bounds, positions, and dimensions.
 */

import type { Position, Dimensions } from '@/entities/diagram-entity';
import type { Shape } from '@/entities/shape';

/**
 * Axis-aligned bounding box
 * Represents the rectangular area occupied by an entity
 */
export interface Bounds {
  /** Left edge X coordinate */
  x: number;
  /** Top edge Y coordinate */
  y: number;
  /** Width of the bounding box */
  width: number;
  /** Height of the bounding box */
  height: number;
}

/**
 * Context for bounds calculation
 * Required for entities that depend on other entities (e.g., connectors need shapes)
 */
export interface BoundsContext {
  /** Map of shape IDs to shapes (required for connector bounds) */
  shapes?: Map<string, Shape>;
}

// Re-export commonly used types for convenience
export type { Position, Dimensions };
