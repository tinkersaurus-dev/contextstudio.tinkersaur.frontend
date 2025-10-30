/**
 * Position Utilities
 *
 * Comprehensive utilities for position and offset calculations.
 * Handles center calculations, coordinate conversions, and positioning logic.
 */

import type { Position, Dimensions, Bounds } from './types';
import type { AnchorPosition } from '@/entities/connector/model/types';

/**
 * Position reference point
 */
export type PositionReference = 'center' | 'top-left';

/**
 * Options for position calculation
 */
export interface PositionOptions {
  /** Reference point for the provided coordinates */
  reference: PositionReference;
}

/**
 * Calculate the top-left position for a centered shape
 *
 * @param centerX - X coordinate of the center point
 * @param centerY - Y coordinate of the center point
 * @param width - Width of the shape
 * @param height - Height of the shape
 * @returns Position object with x and y coordinates for top-left corner
 *
 * @example
 * const position = calculateCenteredPosition(100, 100, 120, 80);
 * // Returns: { x: 40, y: 60 }
 */
export function calculateCenteredPosition(
  centerX: number,
  centerY: number,
  width: number,
  height: number
): Position {
  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
  };
}

/**
 * Calculate position based on reference point
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Width of the shape
 * @param height - Height of the shape
 * @param options - Position options specifying the reference point
 * @returns Position object for top-left corner
 *
 * @example
 * // Using center as reference
 * const pos1 = calculatePosition(100, 100, 120, 80, { reference: 'center' });
 * // Returns: { x: 40, y: 60 }
 *
 * // Using top-left as reference
 * const pos2 = calculatePosition(100, 100, 120, 80, { reference: 'top-left' });
 * // Returns: { x: 100, y: 100 }
 */
export function calculatePosition(
  x: number,
  y: number,
  width: number,
  height: number,
  options: PositionOptions
): Position {
  if (options.reference === 'center') {
    return calculateCenteredPosition(x, y, width, height);
  }
  return { x, y };
}

/**
 * Calculate the center point of a shape given its top-left position and dimensions
 *
 * @param position - Top-left position of the shape
 * @param dimensions - Width and height of the shape
 * @returns Center point coordinates
 *
 * @example
 * const center = calculateShapeCenter({ x: 40, y: 60 }, { width: 120, height: 80 });
 * // Returns: { x: 100, y: 100 }
 */
export function calculateShapeCenter(position: Position, dimensions: Dimensions): Position {
  return {
    x: position.x + dimensions.width / 2,
    y: position.y + dimensions.height / 2,
  };
}

/**
 * Get the center point of a bounding box
 *
 * @param bounds - Bounding box
 * @returns Center point { x, y }
 *
 * @example
 * const center = getBoundsCenter(bounds);
 * console.log(center); // { x: 160, y: 140 }
 */
export function getBoundsCenter(bounds: Bounds): Position {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Calculate offset needed to center a shape of given dimensions
 *
 * @param width - Width of the shape
 * @param height - Height of the shape
 * @returns Offset object with x and y values
 *
 * @example
 * const offset = calculateCenterOffset(120, 80);
 * // Returns: { x: 60, y: 40 }
 */
export function calculateCenterOffset(width: number, height: number): Position {
  return {
    x: width / 2,
    y: height / 2,
  };
}

/**
 * Calculate the position offset for a shape anchor relative to its center
 *
 * @param shapeDimensions - Width and height of the shape
 * @param anchor - Anchor position on the shape
 * @returns Offset from center to the anchor point
 *
 * @example
 * const offset = getAnchorOffsetFromCenter({ width: 120, height: 80 }, 'n');
 * // Returns: { x: 0, y: -40 } (top center is 40px above center)
 */
export function getAnchorOffsetFromCenter(
  shapeDimensions: Dimensions,
  anchor: AnchorPosition
): Position {
  const { width, height } = shapeDimensions;

  switch (anchor) {
    case 'n': // North (top center)
      return { x: 0, y: -height / 2 };
    case 's': // South (bottom center)
      return { x: 0, y: height / 2 };
    case 'e': // East (right center)
      return { x: width / 2, y: 0 };
    case 'w': // West (left center)
      return { x: -width / 2, y: 0 };
    case 'ne': // Northeast (top right)
      return { x: width / 2, y: -height / 2 };
    case 'nw': // Northwest (top left)
      return { x: -width / 2, y: -height / 2 };
    case 'se': // Southeast (bottom right)
      return { x: width / 2, y: height / 2 };
    case 'sw': // Southwest (bottom left)
      return { x: -width / 2, y: height / 2 };
    case 'center': // Center
      return { x: 0, y: 0 };
    default:
      console.warn(`Unknown anchor position: ${anchor}, defaulting to center`);
      return { x: 0, y: 0 };
  }
}

/**
 * Calculate the center position for a shape such that a specific anchor point
 * is positioned at a target location
 *
 * @param targetPosition - World coordinates where the anchor should be placed
 * @param shapeDimensions - Width and height of the shape
 * @param anchor - Which anchor point should be at the target position
 * @returns Center position for the shape
 *
 * @example
 * // Place a 120x80 shape so its west anchor is at (100, 100)
 * const center = calculateShapeCenterForAnchorPosition(
 *   { x: 100, y: 100 },
 *   { width: 120, height: 80 },
 *   'w'
 * );
 * // Returns: { x: 160, y: 100 } (shape center 60px right of anchor)
 */
export function calculateShapeCenterForAnchorPosition(
  targetPosition: Position,
  shapeDimensions: Dimensions,
  anchor: AnchorPosition
): Position {
  const offset = getAnchorOffsetFromCenter(shapeDimensions, anchor);

  return {
    x: targetPosition.x - offset.x,
    y: targetPosition.y - offset.y,
  };
}
