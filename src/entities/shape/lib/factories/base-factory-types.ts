/**
 * Base Factory Types
 *
 * Shared type definitions for shape factory functions.
 * Reduces duplication across different shape factories.
 */

import type { PositionReference } from '@/shared/lib/geometry';

/**
 * Base options common to all shape creation functions
 */
export interface BaseCreateShapeOptions {
  /** Fill color for the shape */
  fillColor?: string;
  /** Stroke/border color for the shape */
  strokeColor?: string;
  /** Stroke/border width in pixels */
  strokeWidth?: number;
  /** Text color for shape labels */
  textColor?: string;
  /** Reference point for the provided coordinates ('center' or 'top-left') */
  reference?: PositionReference;
}

/**
 * Options for shapes with rectangular dimensions (width and height)
 */
export interface RectangularShapeOptions extends BaseCreateShapeOptions {
  /** Width of the shape */
  width?: number;
  /** Height of the shape */
  height?: number;
}

/**
 * Options for circular/round shapes (diameter-based)
 */
export interface CircularShapeOptions extends BaseCreateShapeOptions {
  /** Diameter of the circular shape */
  diameter?: number;
}

/**
 * Options for square shapes (size-based)
 */
export interface SquareShapeOptions extends BaseCreateShapeOptions {
  /** Size of the square (both width and height) */
  size?: number;
}
