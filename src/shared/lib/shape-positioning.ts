/**
 * Shape Positioning Utilities
 *
 * Helper functions for calculating shape positions when creating shapes
 * connected to other shapes via connectors.
 */

import type { Position, Dimensions } from '@/entities/diagram-entity';
import type { AnchorPosition } from '@/entities/connector/model/types';

/**
 * Calculate the position offset for a shape anchor relative to its center
 *
 * @param shapeDimensions - Width and height of the shape
 * @param anchor - Anchor position on the shape
 * @returns Offset from center to the anchor point
 */
function getAnchorOffsetFromCenter(
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
