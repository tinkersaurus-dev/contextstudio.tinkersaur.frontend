/**
 * Entity System
 *
 * Unified system for entity operations across the diagram canvas.
 * Provides a single entry point for rendering, hit testing, bounds calculation,
 * validation, and creation of all entity types.
 *
 * This is a thin facade that delegates to specialized classes:
 * - EntityRenderer for rendering operations
 * - EntityHitTester for hit detection
 * - EntityBoundsCalculator for bounds calculation
 * - entity-validation.ts for validation
 *
 * This consolidates entity operations that were previously scattered across:
 * - Rendering in widgets/diagram-canvas/lib/shape-renderer.ts and connector-renderer.ts
 * - Hit detection in widgets/diagram-canvas/lib/canvas-hit-detection.ts
 * - Validation in shared/lib/entity-validation.ts
 * - Creation in entities/.../factories/
 */

import type { DiagramEntity } from '@/entities/diagram-entity';
import { DiagramEntityType } from '@/entities/diagram-entity';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import { EntityRenderer } from './entity-renderer';
import { EntityHitTester } from './entity-hit-tester';
import { EntityBoundsCalculator, type Bounds } from './entity-bounds-calculator';
import {
  validateEntity,
  validateShape,
  validateConnector,
  type ValidationResult,
} from './entity-validation';
import type {
  EntityContext,
  HitTestContext,
  BoundsContext,
} from './rendering-types';

// Re-export Bounds type for backward compatibility
export type { Bounds };

/**
 * Entity System
 *
 * Static class providing unified operations for all diagram entities.
 * Consolidates rendering, hit testing, bounds calculation, and validation
 * into a single, consistent API.
 *
 * @example
 * // Render an entity
 * EntitySystem.render(entity, { ctx, scale, isSelected, shapes: shapesMap });
 *
 * @example
 * // Hit test an entity
 * const hit = EntitySystem.hitTest(entity, mouseX, mouseY, { shapes: shapesMap });
 *
 * @example
 * // Get entity bounds
 * const bounds = EntitySystem.getBounds(entity, { shapes: shapesMap });
 *
 * @example
 * // Validate an entity
 * const result = EntitySystem.validate(entity, { shapes: shapesMap });
 */
export class EntitySystem {
  // =========================================================================
  // Rendering Operations (delegated to EntityRenderer)
  // =========================================================================

  /**
   * Render any diagram entity to a canvas
   *
   * Delegates to EntityRenderer for actual rendering.
   * Shapes are rendered via shape registry, connectors via connector registry.
   *
   * @param entity - Entity to render
   * @param context - Rendering context (ctx, scale, isSelected, shapes for connectors)
   *
   * @example
   * EntitySystem.render(shape, { ctx, scale: 1.0, isSelected: true });
   *
   * @example
   * EntitySystem.render(connector, {
   *   ctx,
   *   scale: 1.0,
   *   isSelected: false,
   *   shapes: shapesMap
   * });
   */
  static render(entity: DiagramEntity, context: EntityContext): void {
    return EntityRenderer.render(entity, context);
  }

  // =========================================================================
  // Hit Testing Operations (delegated to EntityHitTester)
  // =========================================================================

  /**
   * Test if a point hits an entity
   *
   * Delegates to EntityHitTester for hit detection.
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
   * const hit = EntitySystem.hitTest(shape, mouseX, mouseY);
   *
   * @example
   * const hit = EntitySystem.hitTest(connector, mouseX, mouseY, {
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
    return EntityHitTester.hitTest(entity, x, y, context);
  }

  // =========================================================================
  // Bounds Calculation Operations (delegated to EntityBoundsCalculator)
  // =========================================================================

  /**
   * Get the bounding box for any entity
   *
   * Delegates to EntityBoundsCalculator for bounds calculation.
   * Returns the axis-aligned bounding rectangle that contains the entity.
   * For shapes, this is simply position + dimensions.
   * For connectors, calculated from endpoint positions.
   *
   * @param entity - Entity to get bounds for
   * @param context - Optional bounds context (shapes map for connectors)
   * @returns The entity's bounding box
   *
   * @example
   * const bounds = EntitySystem.getBounds(shape);
   *
   * @example
   * const bounds = EntitySystem.getBounds(connector, { shapes: shapesMap });
   */
  static getBounds(entity: DiagramEntity, context?: BoundsContext): Bounds {
    return EntityBoundsCalculator.getBounds(entity, context);
  }

  // =========================================================================
  // Validation Operations
  // =========================================================================

  /**
   * Validate an entity's data integrity
   *
   * Checks that the entity has valid:
   * - ID, position, dimensions
   * - Type-specific properties (e.g., colors, stroke width)
   * - References (e.g., connector endpoints must reference existing shapes)
   *
   * @param entity - Entity to validate
   * @param context - Optional validation context (shapes map for connectors)
   * @returns Validation result with any errors
   *
   * @example
   * const result = EntitySystem.validate(shape);
   * if (!result.valid) {
   *   console.error('Invalid shape:', result.errors);
   * }
   *
   * @example
   * const result = EntitySystem.validate(connector, { shapes: shapesMap });
   */
  static validate(
    entity: DiagramEntity,
    context?: { shapes?: Map<string, Shape> }
  ): ValidationResult {
    if (entity.type === DiagramEntityType.Shape) {
      return validateShape(entity as Shape);
    } else if (entity.type === DiagramEntityType.Connector) {
      return validateConnector(entity as Connector, context?.shapes);
    }
    // For unknown entity types, use generic validation
    // Cast is safe since validateEntity handles both shapes and connectors
    return validateEntity(entity as Shape | Connector);
  }

  // =========================================================================
  // Entity Type Guards
  // =========================================================================

  /**
   * Check if an entity is a shape
   *
   * @param entity - Entity to check
   * @returns True if entity is a shape
   */
  static isShape(entity: DiagramEntity): entity is Shape {
    return entity.type === DiagramEntityType.Shape;
  }

  /**
   * Check if an entity is a connector
   *
   * @param entity - Entity to check
   * @returns True if entity is a connector
   */
  static isConnector(entity: DiagramEntity): entity is Connector {
    return entity.type === DiagramEntityType.Connector;
  }

  // =========================================================================
  // Batch Operations
  // =========================================================================

  /**
   * Render multiple entities
   *
   * Delegates to EntityRenderer for batch rendering.
   * Efficiently renders an array of entities with shared context.
   * Includes per-entity error handling to prevent cascade failures.
   *
   * @param entities - Array of entities to render
   * @param context - Shared rendering context
   * @param selectedIds - Set of selected entity IDs
   *
   * @example
   * EntitySystem.renderMany([...shapes, ...connectors], {
   *   ctx,
   *   scale: 1.0,
   *   shapes: shapesMap
   * }, selectedEntityIds);
   */
  static renderMany(
    entities: (Shape | Connector)[],
    context: Omit<EntityContext, 'isSelected'>,
    selectedIds: Set<string>
  ): void {
    return EntityRenderer.renderMany(entities, context, selectedIds);
  }

  /**
   * Find the first entity at a point
   *
   * Delegates to EntityHitTester for finding entities at points.
   * Tests entities in reverse order (topmost first) and returns the first hit.
   *
   * @param entities - Array of entities to test
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @param context - Optional hit test context
   * @returns First entity at point, or null if none found
   *
   * @example
   * const entity = EntitySystem.findEntityAtPoint(
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
    return EntityHitTester.findEntityAtPoint(entities, x, y, context);
  }

  /**
   * Find all entities in a bounding box
   *
   * Delegates to EntityHitTester for finding entities in boxes.
   * Returns entities whose bounds intersect with the given box.
   *
   * @param entities - Array of entities to check
   * @param boxBounds - Bounding box to check against
   * @param context - Optional bounds context
   * @returns Array of entities in the box
   *
   * @example
   * const selected = EntitySystem.findEntitiesInBox(
   *   [...shapes, ...connectors],
   *   { x: 0, y: 0, width: 100, height: 100 },
   *   { shapes: shapesMap }
   * );
   */
  static findEntitiesInBox(
    entities: DiagramEntity[],
    boxBounds: Bounds,
    context?: BoundsContext
  ): DiagramEntity[] {
    return EntityHitTester.findEntitiesInBox(
      entities,
      boxBounds,
      EntityBoundsCalculator.getBounds,
      context
    );
  }

  /**
   * Validate multiple entities
   *
   * Validates an array of entities and returns their results.
   *
   * @param entities - Array of entities to validate
   * @param context - Optional validation context
   * @returns Map of entity ID to validation result
   *
   * @example
   * const results = EntitySystem.validateMany(entities, { shapes: shapesMap });
   * results.forEach((result, id) => {
   *   if (!result.valid) {
   *     console.error(`Entity ${id} invalid:`, result.errors);
   *   }
   * });
   */
  static validateMany(
    entities: DiagramEntity[],
    context?: { shapes?: Map<string, Shape> }
  ): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    entities.forEach((entity) => {
      results.set(entity.id, this.validate(entity, context));
    });
    return results;
  }
}
