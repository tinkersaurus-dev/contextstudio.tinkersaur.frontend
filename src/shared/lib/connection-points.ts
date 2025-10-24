/**
 * Connection Point Utilities
 *
 * Utilities for calculating connection point positions on shapes and
 * determining optimal anchor points for connectors.
 */

import type { Position, Dimensions } from '@/entities/diagram-entity';
import type { AnchorPosition } from '@/entities/connector/model/types';

/**
 * Calculate the world coordinates of a connection point on a shape
 *
 * @param shapePosition - Top-left position of the shape
 * @param shapeDimensions - Width and height of the shape
 * @param anchor - Anchor position (n, s, e, w, ne, nw, se, sw, center)
 * @returns World coordinates of the connection point
 *
 * @example
 * const point = getConnectionPointPosition(
 *   { x: 100, y: 100 },
 *   { width: 80, height: 60 },
 *   'n'
 * );
 * // Returns: { x: 140, y: 100 } (top center)
 */
export function getConnectionPointPosition(
  shapePosition: Position,
  shapeDimensions: Dimensions,
  anchor: AnchorPosition
): Position {
  const { x, y } = shapePosition;
  const { width, height } = shapeDimensions;

  // Calculate center point
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Map anchor positions to coordinates
  switch (anchor) {
    case 'n': // North (top center)
      return { x: centerX, y };
    case 's': // South (bottom center)
      return { x: centerX, y: y + height };
    case 'e': // East (right center)
      return { x: x + width, y: centerY };
    case 'w': // West (left center)
      return { x, y: centerY };
    case 'ne': // Northeast (top right)
      return { x: x + width, y };
    case 'nw': // Northwest (top left)
      return { x, y };
    case 'se': // Southeast (bottom right)
      return { x: x + width, y: y + height };
    case 'sw': // Southwest (bottom left)
      return { x, y: y + height };
    case 'center': // Center
      return { x: centerX, y: centerY };
    default:
      // Fallback to center for unknown anchors
      console.warn(`Unknown anchor position: ${anchor}, defaulting to center`);
      return { x: centerX, y: centerY };
  }
}

/**
 * Get all standard anchor positions
 * Returns the 4 cardinal positions (N, E, S, W)
 */
export const STANDARD_ANCHORS: readonly AnchorPosition[] = [
  'n',
  'e',
  's',
  'w',
] as const;

/**
 * Calculate the nearest anchor point on a shape to a given world position
 *
 * @param shapePosition - Top-left position of the shape
 * @param shapeDimensions - Width and height of the shape
 * @param targetPosition - Target position to find nearest anchor to
 * @param anchors - Array of anchor positions to consider (defaults to all standard anchors)
 * @returns The nearest anchor position
 *
 * @example
 * const nearestAnchor = getNearestAnchor(
 *   { x: 100, y: 100 },
 *   { width: 80, height: 60 },
 *   { x: 200, y: 130 }
 * );
 * // Returns: 'e' (right center is closest to the target)
 */
export function getNearestAnchor(
  shapePosition: Position,
  shapeDimensions: Dimensions,
  targetPosition: Position,
  anchors: readonly AnchorPosition[] = STANDARD_ANCHORS
): AnchorPosition {
  let nearestAnchor: AnchorPosition = anchors[0];
  let minDistance = Infinity;

  for (const anchor of anchors) {
    const anchorPos = getConnectionPointPosition(shapePosition, shapeDimensions, anchor);
    const distance = Math.hypot(
      anchorPos.x - targetPosition.x,
      anchorPos.y - targetPosition.y
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestAnchor = anchor;
    }
  }

  return nearestAnchor;
}

/**
 * Get the opposite anchor position
 * Useful for determining default target anchor when creating connectors
 *
 * @param anchor - The anchor position
 * @returns The opposite anchor position
 *
 * @example
 * getOppositeAnchor('n'); // Returns: 's'
 * getOppositeAnchor('ne'); // Returns: 'sw'
 */
export function getOppositeAnchor(anchor: AnchorPosition): AnchorPosition {
  const opposites: Record<AnchorPosition, AnchorPosition> = {
    n: 's',
    s: 'n',
    e: 'w',
    w: 'e',
    ne: 'sw',
    nw: 'se',
    se: 'nw',
    sw: 'ne',
    center: 'center',
  };

  return opposites[anchor];
}

/**
 * Calculate distance from a point to a line segment
 * Used for hit detection on connectors
 *
 * @param point - The point to measure from
 * @param lineStart - Start point of the line segment
 * @param lineEnd - End point of the line segment
 * @returns Distance from point to the nearest point on the line segment
 *
 * @example
 * const distance = distanceToLineSegment(
 *   { x: 150, y: 150 },
 *   { x: 100, y: 100 },
 *   { x: 200, y: 200 }
 * );
 */
export function distanceToLineSegment(
  point: Position,
  lineStart: Position,
  lineEnd: Position
): number {
  const { x, y } = point;
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;

  // Calculate line segment length squared
  const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;

  // If line segment is actually a point
  if (lengthSquared === 0) {
    return Math.hypot(x - x1, y - y1);
  }

  // Calculate projection parameter t
  // t = 0 means projection is at lineStart
  // t = 1 means projection is at lineEnd
  // 0 < t < 1 means projection is on the line segment
  let t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / lengthSquared;

  // Clamp t to [0, 1] to stay within line segment
  t = Math.max(0, Math.min(1, t));

  // Calculate nearest point on line segment
  const nearestX = x1 + t * (x2 - x1);
  const nearestY = y1 + t * (y2 - y1);

  // Return distance from point to nearest point
  return Math.hypot(x - nearestX, y - nearestY);
}

/**
 * Calculate angle from one point to another in radians
 * 0 radians points east, π/2 points south (canvas Y increases downward)
 *
 * @param from - Starting point
 * @param to - Ending point
 * @returns Angle in radians
 */
export function angleFromPoints(from: Position, to: Position): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Get recommended anchor for a given angle
 * Helps auto-select best anchor based on direction to target
 *
 * @param angle - Angle in radians
 * @returns Recommended anchor position
 */
export function anchorForAngle(angle: number): AnchorPosition {
  // Normalize angle to [0, 2π)
  const normalized = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  // Divide circle into 8 segments (π/4 each)
  const segment = Math.round((normalized / (Math.PI / 4)) % 8);

  const anchorMap: AnchorPosition[] = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  return anchorMap[segment];
}

/**
 * Find connection point near a world position
 * Returns the shape ID, anchor position, and actual position if within tolerance
 *
 * @param worldX - X coordinate in world space
 * @param worldY - Y coordinate in world space
 * @param shapes - Array of shapes to check
 * @param tolerance - Distance tolerance for detection (in world units)
 * @returns Object with shape ID, anchor, and position, or null if none found
 */
export function findConnectionPointAtPosition(
  worldX: number,
  worldY: number,
  shapes: { id: string; position: Position; dimensions: Dimensions }[],
  tolerance: number
): { shapeId: string; anchor: AnchorPosition; position: Position } | null {
  // Check all shapes
  for (const shape of shapes) {
    // Check all standard anchors
    for (const anchor of STANDARD_ANCHORS) {
      const anchorPos = getConnectionPointPosition(
        shape.position,
        shape.dimensions,
        anchor
      );

      const distance = Math.hypot(worldX - anchorPos.x, worldY - anchorPos.y);

      if (distance <= tolerance) {
        return {
          shapeId: shape.id,
          anchor,
          position: anchorPos,
        };
      }
    }
  }

  return null;
}

/**
 * Get all connection points for shapes near a position
 * Used to show connection points when hovering near a shape
 *
 * @param worldX - X coordinate in world space
 * @param worldY - Y coordinate in world space
 * @param shapes - Array of shapes to check
 * @param proximityDistance - Distance to consider "near" (in world units)
 * @returns Array of shapes that are near the position
 */
export function getShapesNearPosition(
  worldX: number,
  worldY: number,
  shapes: { id: string; position: Position; dimensions: Dimensions }[],
  proximityDistance: number
): Array<{ id: string; position: Position; dimensions: Dimensions }> {
  return shapes.filter((shape) => {
    const { position, dimensions } = shape;

    // Check if point is within proximity distance of shape bounds
    const closestX = Math.max(position.x, Math.min(worldX, position.x + dimensions.width));
    const closestY = Math.max(position.y, Math.min(worldY, position.y + dimensions.height));

    const distance = Math.hypot(worldX - closestX, worldY - closestY);

    return distance <= proximityDistance;
  });
}
