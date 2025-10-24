/**
 * Connection Point System
 *
 * Unified system for managing connection points on shapes.
 * Consolidates calculation, rendering, and hit detection logic.
 */

import type { Position } from '@/entities/diagram-entity';
import type { AnchorPosition } from '@/entities/connector/model/types';
import type { Shape } from '@/entities/shape';
import {
  getConnectionPointPosition,
  STANDARD_ANCHORS,
  getNearestAnchor,
  getOppositeAnchor,
  findConnectionPointAtPosition,
  getShapesNearPosition,
  anchorForAngle,
  angleFromPoints,
} from './connection-points';
import { CANVAS_COLORS, CONNECTION_POINT_CONFIG } from '@/shared/config/canvas-config';

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

      // Stroke (white border for visibility)
      ctx.strokeStyle = '#ffffff';
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

// Re-export types for convenience
export type { AnchorPosition };
export { STANDARD_ANCHORS };
