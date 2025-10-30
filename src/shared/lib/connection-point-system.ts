/**
 * Connection Point System
 *
 * Unified system for managing connection points on shapes.
 * Consolidates calculation, rendering, hit detection logic, and geometry utilities.
 */

import type { Position, Dimensions } from '@/entities/diagram-entity';
import type { AnchorPosition } from '@/entities/connector/model/types';
import type { Shape } from '@/entities/shape';
import { CANVAS_COLORS, CONNECTION_POINT_CONFIG } from '@/shared/config/canvas-config';
import { activeTheme } from '@/app/theme';

// ============================================================================
// GEOMETRY UTILITIES
// ============================================================================

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

// ============================================================================
// CONNECTION POINT SYSTEM CLASS
// ============================================================================

/**
 * Represents a connection point on a shape
 */
export interface ConnectionPoint {
  shapeId: string;
  anchor: AnchorPosition;
  position: Position;
}

/**
 * Options for finding connection points
 */
export interface FindConnectionPointOptions {
  /** Distance tolerance for hit detection (in world units) */
  tolerance?: number;
  /** Current canvas scale (used to adjust tolerance) */
  scale?: number;
}

/**
 * Options for rendering connection points
 */
export interface RenderConnectionPointOptions {
  /** Canvas scale for adjusting sizes */
  scale: number;
  /** Optional anchor to highlight */
  highlightAnchor?: AnchorPosition;
}

/**
 * Unified Connection Point System
 *
 * Provides all connection point functionality in a single, cohesive API.
 */
export class ConnectionPointSystem {
  /**
   * Find a connection point at a specific world position
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @param shapes - Array of shapes to check
   * @param options - Options for finding connection points
   * @returns Connection point if found, null otherwise
   *
   * @example
   * const point = ConnectionPointSystem.findAtPosition(100, 150, shapes, {
   *   scale: 1.5,
   *   tolerance: 10
   * });
   */
  static findAtPosition(
    worldX: number,
    worldY: number,
    shapes: Shape[],
    options: FindConnectionPointOptions = {}
  ): ConnectionPoint | null {
    const { scale = 1, tolerance = CONNECTION_POINT_CONFIG.hitTolerance } = options;
    const adjustedTolerance = tolerance / scale;

    return findConnectionPointAtPosition(worldX, worldY, shapes, adjustedTolerance);
  }

  /**
   * Check if a specific world position is on a connection point
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @param shapes - Array of shapes to check
   * @param options - Options for hit detection
   * @returns True if position is on a connection point
   *
   * @example
   * const isHit = ConnectionPointSystem.isHitByPoint(100, 150, shapes, { scale: 1.5 });
   */
  static isHitByPoint(
    worldX: number,
    worldY: number,
    shapes: Shape[],
    options: FindConnectionPointOptions = {}
  ): boolean {
    return this.findAtPosition(worldX, worldY, shapes, options) !== null;
  }

  /**
   * Get all connection points for a shape
   *
   * @param shape - Shape to get connection points for
   * @returns Array of connection points
   *
   * @example
   * const points = ConnectionPointSystem.getConnectionPoints(shape);
   * // Returns 4 points for the cardinal directions (N, E, S, W)
   */
  static getConnectionPoints(shape: Shape): ConnectionPoint[] {
    return STANDARD_ANCHORS.map((anchor) => ({
      shapeId: shape.id,
      anchor,
      position: getConnectionPointPosition(shape.position, shape.dimensions, anchor),
    }));
  }

  /**
   * Get connection point for a specific anchor on a shape
   *
   * @param shape - Shape to get connection point for
   * @param anchor - Anchor position
   * @returns Connection point
   *
   * @example
   * const point = ConnectionPointSystem.getConnectionPoint(shape, 'n');
   */
  static getConnectionPoint(shape: Shape, anchor: AnchorPosition): ConnectionPoint {
    return {
      shapeId: shape.id,
      anchor,
      position: getConnectionPointPosition(shape.position, shape.dimensions, anchor),
    };
  }

  /**
   * Get shapes that are near a world position
   * Used to determine which shapes should show connection points on hover
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @param shapes - Array of shapes to check
   * @param proximityDistance - Distance to consider "near" (in world units)
   * @returns Array of shapes near the position
   *
   * @example
   * const nearbyShapes = ConnectionPointSystem.getShapesNearPosition(
   *   100, 150, shapes, 50
   * );
   */
  static getShapesNearPosition(
    worldX: number,
    worldY: number,
    shapes: Shape[],
    proximityDistance: number
  ): Shape[] {
    const nearby = getShapesNearPosition(worldX, worldY, shapes, proximityDistance);
    // Filter to return only the shapes from the original array
    return shapes.filter((shape) => nearby.some((n) => n.id === shape.id));
  }

  /**
   * Render connection points for a single shape
   *
   * @param ctx - Canvas rendering context
   * @param shape - Shape to render connection points for
   * @param options - Rendering options
   *
   * @example
   * ConnectionPointSystem.renderConnectionPoints(ctx, shape, {
   *   scale: 1.5,
   *   highlightAnchor: 'n'
   * });
   */
  static renderConnectionPoints(
    ctx: CanvasRenderingContext2D,
    shape: Shape,
    options: RenderConnectionPointOptions
  ): void {
    const { scale, highlightAnchor } = options;
    const { radius, hoverRadius } = CONNECTION_POINT_CONFIG;

    // Render each standard anchor point
    STANDARD_ANCHORS.forEach((anchor) => {
      const position = getConnectionPointPosition(
        shape.position,
        shape.dimensions,
        anchor
      );

      const isHighlighted = anchor === highlightAnchor;
      const pointRadius = (isHighlighted ? hoverRadius : radius) / scale;
      const strokeWidth = (isHighlighted ? 2 : 1.5) / scale;

      // Draw connection point circle
      ctx.beginPath();
      ctx.arc(position.x, position.y, pointRadius, 0, Math.PI * 2);

      // Fill
      ctx.fillStyle = isHighlighted
        ? CANVAS_COLORS.connectionPointHover
        : CANVAS_COLORS.connectionPoint;
      ctx.fill();

      // Stroke (border for visibility)
      ctx.strokeStyle = activeTheme.canvas.connectionPoints.border;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    });
  }

  /**
   * Render connection points for multiple shapes
   *
   * @param ctx - Canvas rendering context
   * @param shapes - Array of shapes to render connection points for
   * @param scale - Current canvas scale
   *
   * @example
   * ConnectionPointSystem.renderMultipleShapeConnectionPoints(ctx, shapes, 1.5);
   */
  static renderMultipleShapeConnectionPoints(
    ctx: CanvasRenderingContext2D,
    shapes: Shape[],
    scale: number
  ): void {
    shapes.forEach((shape) => {
      this.renderConnectionPoints(ctx, shape, { scale });
    });
  }

  /**
   * Render a preview line while creating a connector
   *
   * @param ctx - Canvas rendering context
   * @param startX - Start X coordinate
   * @param startY - Start Y coordinate
   * @param endX - End X coordinate (e.g., mouse position)
   * @param endY - End Y coordinate (e.g., mouse position)
   * @param scale - Current canvas scale
   *
   * @example
   * ConnectionPointSystem.renderConnectorPreview(ctx, 100, 100, 200, 200, 1.5);
   */
  static renderConnectorPreview(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    scale: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    // Dashed line for preview
    ctx.setLineDash([8 / scale, 4 / scale]);
    ctx.strokeStyle = CANVAS_COLORS.connectionPoint;
    ctx.lineWidth = 2 / scale;
    ctx.stroke();

    // Reset line dash
    ctx.setLineDash([]);
  }

  /**
   * Find the nearest anchor on a shape to a target position
   *
   * @param shape - Shape to find anchor on
   * @param targetX - Target X coordinate
   * @param targetY - Target Y coordinate
   * @returns Nearest anchor position
   *
   * @example
   * const anchor = ConnectionPointSystem.getNearestAnchor(shape, 200, 200);
   */
  static getNearestAnchor(
    shape: Shape,
    targetX: number,
    targetY: number
  ): AnchorPosition {
    return getNearestAnchor(
      shape.position,
      shape.dimensions,
      { x: targetX, y: targetY }
    );
  }

  /**
   * Get the opposite anchor for a given anchor
   *
   * @param anchor - The anchor position
   * @returns The opposite anchor position
   *
   * @example
   * const opposite = ConnectionPointSystem.getOppositeAnchor('n'); // Returns 's'
   */
  static getOppositeAnchor(anchor: AnchorPosition): AnchorPosition {
    return getOppositeAnchor(anchor);
  }

  /**
   * Calculate the best anchor for a shape based on the direction to a target
   *
   * @param fromX - Starting X coordinate
   * @param fromY - Starting Y coordinate
   * @param toX - Target X coordinate
   * @param toY - Target Y coordinate
   * @returns Recommended anchor position
   *
   * @example
   * const anchor = ConnectionPointSystem.getAnchorForDirection(100, 100, 200, 200);
   */
  static getAnchorForDirection(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): AnchorPosition {
    const angle = angleFromPoints({ x: fromX, y: fromY }, { x: toX, y: toY });
    return anchorForAngle(angle);
  }
}

// Re-export AnchorPosition type for convenience
export type { AnchorPosition };
