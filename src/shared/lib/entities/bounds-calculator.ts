/**
 * Entity Bounds Calculator
 *
 * Specialized class responsible for calculating bounding boxes of diagram entities.
 * Part of the EntitySystem refactoring to follow Single Responsibility Principle.
 *
 * This class handles:
 * - Calculating bounds for shapes and connectors
 * - Testing bounds intersection
 */

import type { DiagramEntity } from '@/entities/diagram-entity';
import { DiagramEntityType } from '@/entities/diagram-entity';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import {
  getEntityBounds,
  getShapeBounds,
  getConnectorBounds,
} from './geometry/bounds';
import type { Bounds } from './geometry/types';
import type { BoundsContext } from './rendering-types';

// Re-export Bounds type for convenience
export type { Bounds };

/**
 * Entity Bounds Calculator
 *
 * Static class providing bounds calculation for diagram entities.
 * Returns axis-aligned bounding rectangles for shapes and connectors.
 */
export class EntityBoundsCalculator {
  // =========================================================================
  // Bounds Calculation Operations
  // =========================================================================

  /**
   * Get the bounding box for any entity
   *
   * Returns the axis-aligned bounding rectangle that contains the entity.
   * For shapes, this is simply position + dimensions.
   * For connectors, calculated from endpoint positions.
   *
   * @param entity - Entity to get bounds for
   * @param context - Optional bounds context (shapes map for connectors)
   * @returns The entity's bounding box
   *
   * @example
   * const bounds = EntityBoundsCalculator.getBounds(shape);
   *
   * @example
   * const bounds = EntityBoundsCalculator.getBounds(connector, { shapes: shapesMap });
   */
  static getBounds(entity: DiagramEntity, context?: BoundsContext): Bounds {
    if (entity.type === DiagramEntityType.Shape) {
      return getShapeBounds(entity as Shape);
    } else if (entity.type === DiagramEntityType.Connector) {
      return getConnectorBounds(entity as Connector, context?.shapes);
    }
    // Fallback
    return getEntityBounds(entity, context);
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
