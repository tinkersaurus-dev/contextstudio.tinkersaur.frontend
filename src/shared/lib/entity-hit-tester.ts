/**
 * Entity Hit Tester
 *
 * Specialized class responsible for hit detection on diagram entities.
 * Part of the EntitySystem refactoring to follow Single Responsibility Principle.
 *
 * This class handles:
 * - Point-based hit testing for shapes and connectors
 * - Finding entities at specific points
 * - Finding entities within bounding boxes
 * - Bounds intersection testing
 */

import type { DiagramEntity } from '@/entities/diagram-entity';
import { DiagramEntityType } from '@/entities/diagram-entity';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import {
  isPointInShape,
  isPointOnConnector,
} from '@/widgets/diagram-canvas/lib/canvas-hit-detection';
import type { HitTestContext, BoundsContext } from './rendering-types';
import type { Bounds } from './geometry/types';

/**
 * Entity Hit Tester
 *
 * Static class providing hit detection operations for diagram entities.
 * Performs type-appropriate hit detection for shapes and connectors.
 */
export class EntityHitTester {
  // =========================================================================
  // Hit Testing Operations
  // =========================================================================

  /**
   * Test if a point hits an entity
   *
   * Performs type-appropriate hit detection:
   * - Shapes: Bounding box test
   * - Connectors: Line proximity test
   *
   * @param entity - Entity to test
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @param context - Optional hit test context (shapes map for connectors, tolerance)
   * @returns True if point hits the entity
   *
   * @example
   * const hit = EntityHitTester.hitTest(shape, mouseX, mouseY);
   *
   * @example
   * const hit = EntityHitTester.hitTest(connector, mouseX, mouseY, {
   *   shapes: shapesMap,
   *   tolerance: 10
   * });
   */
  static hitTest(
    entity: DiagramEntity,
    x: number,
    y: number,
    context?: HitTestContext
  ): boolean {
    if (entity.type === DiagramEntityType.Shape) {
      return this.hitTestShape(entity as Shape, x, y);
    } else if (entity.type === DiagramEntityType.Connector) {
      const shapes = context?.shapes;
      if (!shapes) {
        // Without shapes, can't accurately test connector
        return false;
      }
      return this.hitTestConnector(entity as Connector, x, y, shapes);
    }
    return false;
  }

  /**
   * Test if a point hits a shape
   *
   * @param shape - Shape to test
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @returns True if point is inside shape bounds
   */
  private static hitTestShape(shape: Shape, x: number, y: number): boolean {
    return isPointInShape(x, y, shape);
  }

  /**
   * Test if a point hits a connector
   *
   * @param connector - Connector to test
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @param shapes - Map of shapes for endpoint resolution
   * @returns True if point is near connector line
   */
  private static hitTestConnector(
    connector: Connector,
    x: number,
    y: number,
    shapes: Map<string, Shape>
  ): boolean {
    return isPointOnConnector(x, y, connector, shapes);
  }

  // =========================================================================
  // Batch Operations
  // =========================================================================

  /**
   * Find the first entity at a point
   *
   * Tests entities in reverse order (topmost first) and returns the first hit.
   *
   * @param entities - Array of entities to test
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @param context - Optional hit test context
   * @returns First entity at point, or null if none found
   *
   * @example
   * const entity = EntityHitTester.findEntityAtPoint(
   *   [...shapes, ...connectors],
   *   mouseX,
   *   mouseY,
   *   { shapes: shapesMap }
   * );
   */
  static findEntityAtPoint(
    entities: DiagramEntity[],
    x: number,
    y: number,
    context?: HitTestContext
  ): DiagramEntity | null {
    // Iterate in reverse (topmost first)
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      if (this.hitTest(entity, x, y, context)) {
        return entity;
      }
    }
    return null;
  }

  /**
   * Find all entities in a bounding box
   *
   * Returns entities whose bounds intersect with the given box.
   * Requires getBounds function to be passed in to avoid circular dependency.
   *
   * @param entities - Array of entities to check
   * @param boxBounds - Bounding box to check against
   * @param getBounds - Function to get entity bounds
   * @param context - Optional bounds context
   * @returns Array of entities in the box
   *
   * @example
   * const selected = EntityHitTester.findEntitiesInBox(
   *   [...shapes, ...connectors],
   *   { x: 0, y: 0, width: 100, height: 100 },
   *   EntityBoundsCalculator.getBounds,
   *   { shapes: shapesMap }
   * );
   */
  static findEntitiesInBox(
    entities: DiagramEntity[],
    boxBounds: Bounds,
    getBounds: (entity: DiagramEntity, context?: BoundsContext) => Bounds,
    context?: BoundsContext
  ): DiagramEntity[] {
    return entities.filter((entity) => {
      const entityBounds = getBounds(entity, context);
      return this.boundsIntersect(entityBounds, boxBounds);
    });
  }

  /**
   * Check if two bounding boxes intersect
   *
   * @param a - First bounds
   * @param b - Second bounds
   * @returns True if bounds intersect
   */
  static boundsIntersect(a: Bounds, b: Bounds): boolean {
    return !(
      a.x + a.width < b.x ||
      a.x > b.x + b.width ||
      a.y + a.height < b.y ||
      a.y > b.y + b.height
    );
  }
}
