/**
 * Shape Position Utilities
 *
 * Helper functions for calculating shape positions and offsets.
 * Provides utilities for centering shapes and converting between coordinate systems.
 */

import type { Position, Dimensions } from '@/entities/diagram-entity';

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
