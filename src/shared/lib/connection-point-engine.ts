/**
 * Connection Point Engine
 *
 * Business logic layer for connection point interactions.
 * Encapsulates all connection point logic in a testable, framework-agnostic class.
 * This class can be used outside React contexts and makes the system more modular.
 */

import type { Position } from '@/entities/diagram-entity';
import type { AnchorPosition } from '@/entities/connector/model/types';
import type { Shape } from '@/entities/shape';
import {
  findConnectionPointAtPosition,
  getShapesNearPosition,
} from './connection-point-system';
import { CONNECTION_POINT_CONFIG } from '@/shared/config/canvas-config';

/**
 * Represents a connection point on a shape
 */
export interface ConnectionPoint {
  shapeId: string;
  anchor: AnchorPosition;
  position: Position;
}

/**
 * Configuration for the connection point engine
 */
export interface ConnectionPointEngineConfig {
  /** Distance tolerance for hit detection (in world units) */
  hitTolerance?: number;
  /** Distance to consider shapes "near" a position (in world units) */
  proximityDistance?: number;
  /** Minimum drag distance before considering it a real drag (in world units) */
  dragThreshold?: number;
}

/**
 * Connection Point Engine
 *
 * Encapsulates all connection point business logic independent of React.
 * Handles connection point detection, proximity calculations, and drag validation.
 *
 * @example
 * ```typescript
 * const engine = new ConnectionPointEngine(shapes, {
 *   hitTolerance: 10,
 *   proximityDistance: 50
 * });
 *
 * const point = engine.findConnectionPoint(100, 150, 1.5);
 * const nearbyShapes = engine.getNearbyShapes(100, 150);
 * ```
 */
export class ConnectionPointEngine {
  private shapes: Shape[];
  private config: Required<ConnectionPointEngineConfig>;

  constructor(shapes: Shape[], config: ConnectionPointEngineConfig = {}) {
    this.shapes = shapes;
    this.config = {
      hitTolerance: config.hitTolerance ?? CONNECTION_POINT_CONFIG.hitTolerance,
      proximityDistance: config.proximityDistance ?? 50,
      dragThreshold: config.dragThreshold ?? CONNECTION_POINT_CONFIG.dragThreshold,
    };
  }

  /**
   * Update the shapes array
   * Call this when shapes change to keep the engine in sync
   */
  updateShapes(shapes: Shape[]): void {
    this.shapes = shapes;
  }

  /**
   * Find a connection point at a specific world position
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @param scale - Current canvas scale (used to adjust tolerance)
   * @returns Connection point if found, null otherwise
   *
   * @example
   * const point = engine.findConnectionPoint(100, 150, 1.5);
   * if (point) {
   *   console.log(`Found connection point at ${point.anchor} on shape ${point.shapeId}`);
   * }
   */
  findConnectionPoint(
    worldX: number,
    worldY: number,
    scale: number = 1
  ): ConnectionPoint | null {
    const adjustedTolerance = this.config.hitTolerance / scale;
    return findConnectionPointAtPosition(worldX, worldY, this.shapes, adjustedTolerance);
  }

  /**
   * Get shapes that are near a world position
   * Used to determine which shapes should show connection points on hover
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @returns Array of shapes near the position
   *
   * @example
   * const nearbyShapes = engine.getNearbyShapes(100, 150);
   * // Show connection points for these shapes
   */
  getNearbyShapes(worldX: number, worldY: number): Shape[] {
    const nearby = getShapesNearPosition(
      worldX,
      worldY,
      this.shapes,
      this.config.proximityDistance
    );
    // Filter to return only the shapes from the original array
    return this.shapes.filter((shape) => nearby.some((n) => n.id === shape.id));
  }

  /**
   * Check if a position is on a connection point
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @param scale - Current canvas scale
   * @returns True if position is on a connection point
   *
   * @example
   * const isOnPoint = engine.isOnConnectionPoint(100, 150, 1.5);
   */
  isOnConnectionPoint(worldX: number, worldY: number, scale: number = 1): boolean {
    return this.findConnectionPoint(worldX, worldY, scale) !== null;
  }

  /**
   * Check if two connection points are the same
   *
   * @param point1 - First connection point
   * @param point2 - Second connection point
   * @returns True if the points are the same
   *
   * @example
   * const isSame = engine.isSameConnectionPoint(startPoint, endPoint);
   */
  isSameConnectionPoint(
    point1: { shapeId: string; anchor: AnchorPosition },
    point2: { shapeId: string; anchor: AnchorPosition }
  ): boolean {
    return point1.shapeId === point2.shapeId && point1.anchor === point2.anchor;
  }

  /**
   * Calculate the distance between two points
   *
   * @param start - Starting position
   * @param end - Ending position
   * @returns Distance between the points
   *
   * @example
   * const distance = engine.calculateDistance(startPos, currentPos);
   */
  calculateDistance(start: Position, end: Position): number {
    return Math.hypot(end.x - start.x, end.y - start.y);
  }

  /**
   * Check if a drag has moved enough to be considered a real drag (not just a click)
   *
   * @param start - Starting position
   * @param current - Current position
   * @param scale - Current canvas scale (threshold is adjusted by scale)
   * @returns True if the drag distance exceeds the threshold
   *
   * @example
   * const isRealDrag = engine.shouldConsiderDrag(dragStart, currentPos, 1.5);
   */
  shouldConsiderDrag(start: Position, current: Position, scale: number = 1): boolean {
    const distance = this.calculateDistance(start, current);
    const adjustedThreshold = this.config.dragThreshold / scale;
    return distance > adjustedThreshold;
  }

  /**
   * Validate if a connector can be created between two connection points
   *
   * @param start - Starting connection point
   * @param end - Ending connection point
   * @returns Validation result with ok flag and optional error message
   *
   * @example
   * const validation = engine.canCreateConnector(startPoint, endPoint);
   * if (!validation.ok) {
   *   console.error(validation.error);
   * }
   */
  canCreateConnector(
    start: { shapeId: string; anchor: AnchorPosition },
    end: { shapeId: string; anchor: AnchorPosition } | null
  ): { ok: true } | { ok: false; error: string } {
    if (!end) {
      return { ok: false, error: 'No target connection point' };
    }

    if (this.isSameConnectionPoint(start, end)) {
      return { ok: false, error: 'Cannot connect to the same point' };
    }

    return { ok: true };
  }

  /**
   * Get the current configuration
   */
  getConfig(): Readonly<Required<ConnectionPointEngineConfig>> {
    return { ...this.config };
  }

  /**
   * Update the configuration
   *
   * @param config - Partial configuration to update
   *
   * @example
   * engine.updateConfig({ hitTolerance: 15, proximityDistance: 60 });
   */
  updateConfig(config: Partial<ConnectionPointEngineConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
