/**
 * Entity Renderer
 *
 * Specialized class responsible for rendering diagram entities.
 * Part of the EntitySystem refactoring to follow Single Responsibility Principle.
 *
 * This class handles:
 * - Rendering individual shapes and connectors
 * - Batch rendering operations
 * - Error handling during rendering
 */

import type { DiagramEntity } from '@/entities/diagram-entity';
import { DiagramEntityType } from '@/entities/diagram-entity';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import { renderShapeFromRegistry } from '@/entities/shape/lib/shape-registry';
import { renderConnectorFromRegistry } from '@/entities/connector/lib/connector-registry';
import { renderBaseShape } from '@/entities/shape/ui/base-shape';
import type { EntityContext } from './rendering-types';

/**
 * Entity Renderer
 *
 * Static class providing rendering operations for all diagram entities.
 * Delegates to specialized renderers based on entity type.
 */
export class EntityRenderer {
  // =========================================================================
  // Rendering Operations
  // =========================================================================

  /**
   * Render any diagram entity to a canvas
   *
   * Delegates to specialized renderers based on entity type.
   * Shapes are rendered via shape registry, connectors via connector registry.
   *
   * @param entity - Entity to render
   * @param context - Rendering context (ctx, scale, isSelected, shapes for connectors)
   *
   * @example
   * EntityRenderer.render(shape, { ctx, scale: 1.0, isSelected: true });
   *
   * @example
   * EntityRenderer.render(connector, {
   *   ctx,
   *   scale: 1.0,
   *   isSelected: false,
   *   shapes: shapesMap
   * });
   */
  static render(entity: DiagramEntity, context: EntityContext): void {
    const { ctx, scale, isSelected } = context;

    if (!ctx || scale === undefined || isSelected === undefined) {
      throw new Error(
        'EntityRenderer.render requires ctx, scale, and isSelected in context'
      );
    }

    if (entity.type === DiagramEntityType.Shape) {
      this.renderShape(entity as Shape, ctx, isSelected, scale);
    } else if (entity.type === DiagramEntityType.Connector) {
      const { shapes } = context;
      if (!shapes) {
        throw new Error(
          'EntityRenderer.render requires shapes map in context for connectors'
        );
      }
      this.renderConnector(entity as Connector, ctx, shapes, isSelected, scale);
    }
  }

  /**
   * Render a shape entity
   *
   * @param shape - Shape to render
   * @param ctx - Canvas context
   * @param isSelected - Whether shape is selected
   * @param scale - Canvas scale
   */
  private static renderShape(
    shape: Shape,
    ctx: CanvasRenderingContext2D,
    isSelected: boolean,
    scale: number
  ): void {
    renderBaseShape(ctx, shape, isSelected, scale, renderShapeFromRegistry);
  }

  /**
   * Render a connector entity
   *
   * @param connector - Connector to render
   * @param ctx - Canvas context
   * @param shapes - Map of shapes for endpoint resolution
   * @param isSelected - Whether connector is selected
   * @param scale - Canvas scale
   */
  private static renderConnector(
    connector: Connector,
    ctx: CanvasRenderingContext2D,
    shapes: Map<string, Shape>,
    isSelected: boolean,
    scale: number
  ): void {
    renderConnectorFromRegistry(ctx, connector, shapes, isSelected, scale);
  }

  // =========================================================================
  // Batch Operations
  // =========================================================================

  /**
   * Render multiple entities
   *
   * Efficiently renders an array of entities with shared context.
   * Includes per-entity error handling to prevent cascade failures.
   *
   * @param entities - Array of entities to render
   * @param context - Shared rendering context
   * @param selectedIds - Set of selected entity IDs
   *
   * @example
   * EntityRenderer.renderMany([...shapes, ...connectors], {
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
    entities.forEach((entity) => {
      try {
        this.render(entity, {
          ...context,
          isSelected: selectedIds.has(entity.id),
        });
      } catch (error) {
        console.error(`Error rendering entity ${entity.id}:`, error);
        // Continue rendering other entities
      }
    });
  }
}
