/**
 * Shape Position Utilities
 *
 * Helper functions for calculating shape positions and offsets.
 * Provides utilities for centering shapes and converting between coordinate systems.
 */

import type { Position, Dimensions } from '@/entities/diagram-entity';

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
 * Calculate position based on centering preference
 *
 * @param x - X coordinate (either center or top-left depending on centered param)
 * @param y - Y coordinate (either center or top-left depending on centered param)
 * @param width - Width of the shape
 * @param height - Height of the shape
 * @param centered - If true, (x,y) is treated as center; if false, as top-left
 * @returns Position object for top-left corner
 *
 * @example
 * // Centered mode
 * const pos1 = calculatePosition(100, 100, 120, 80, true);
 * // Returns: { x: 40, y: 60 }
 *
 * // Top-left mode
 * const pos2 = calculatePosition(100, 100, 120, 80, false);
 * // Returns: { x: 100, y: 100 }
 */
export function calculatePosition(
  x: number,
  y: number,
  width: number,
  height: number,
  centered: boolean
): Position {
  if (centered) {
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
