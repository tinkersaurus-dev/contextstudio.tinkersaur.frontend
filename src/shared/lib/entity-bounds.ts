/**
 * Entity Bounds
 *
 * Defines bounding box interface and utilities for all diagram entities.
 * Provides consistent bounds calculation and manipulation across shapes and connectors.
 */

import type { DiagramEntity } from '@/entities/diagram-entity';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import { getConnectorEndpoints } from '@/entities/connector';

/**
 * Axis-aligned bounding box
 * Represents the rectangular area occupied by an entity
 */
export interface Bounds {
  /** Left edge X coordinate */
  x: number;
  /** Top edge Y coordinate */
  y: number;
  /** Width of the bounding box */
  width: number;
  /** Height of the bounding box */
  height: number;
}

/**
 * Context for bounds calculation
 * Required for entities that depend on other entities (e.g., connectors need shapes)
 */
export interface BoundsContext {
  /** Map of shape IDs to shapes (required for connector bounds) */
  shapes?: Map<string, Shape>;
}

/**
 * Get the bounding box for any diagram entity
 *
 * @param entity - The entity to get bounds for
 * @param context - Optional context (required for connectors)
 * @returns The entity's bounding box
 *
 * @example
 * const bounds = getEntityBounds(shape);
 * console.log(bounds); // { x: 100, y: 100, width: 120, height: 80 }
 *
 * @example
 * // For connectors, must provide shape context
 * const bounds = getEntityBounds(connector, { shapes: shapesMap });
 */
export function getEntityBounds(
  entity: DiagramEntity,
  context?: BoundsContext
): Bounds {
  // For shapes, bounds are simply position + dimensions
  if ('shapeType' in entity) {
    return getShapeBounds(entity as Shape);
  }

  // For connectors, need to calculate from endpoints
  if ('connectorType' in entity) {
    return getConnectorBounds(entity as Connector, context?.shapes);
  }

  // Fallback: use entity's position and dimensions
  return {
    x: entity.position.x,
    y: entity.position.y,
    width: entity.dimensions.width,
    height: entity.dimensions.height,
  };
}

/**
 * Get bounding box for a shape
 * Shapes have explicit position and dimensions
 *
 * @param shape - Shape to get bounds for
 * @returns The shape's bounding box
 */
export function getShapeBounds(shape: Shape): Bounds {
  return {
    x: shape.position.x,
    y: shape.position.y,
    width: shape.dimensions.width,
    height: shape.dimensions.height,
  };
}

/**
 * Get bounding box for a connector
 * Connectors need to calculate bounds from their endpoint positions
 *
 * @param connector - Connector to get bounds for
 * @param shapesMap - Map of shapes for resolving endpoints
 * @returns The connector's bounding box, or entity's stored bounds if endpoints unavailable
 */
export function getConnectorBounds(
  connector: Connector,
  shapesMap?: Map<string, Shape>
): Bounds {
  if (!shapesMap) {
    // Fallback to stored position/dimensions if no context
    return {
      x: connector.position.x,
      y: connector.position.y,
      width: connector.dimensions.width,
      height: connector.dimensions.height,
    };
  }

  const endpoints = getConnectorEndpoints(connector, shapesMap);
  if (!endpoints) {
    // Fallback if endpoints can't be resolved
    return {
      x: connector.position.x,
      y: connector.position.y,
      width: connector.dimensions.width,
      height: connector.dimensions.height,
    };
  }

  // Calculate bounding box from actual endpoints
  const minX = Math.min(endpoints.start.x, endpoints.end.x);
  const maxX = Math.max(endpoints.start.x, endpoints.end.x);
  const minY = Math.min(endpoints.start.y, endpoints.end.y);
  const maxY = Math.max(endpoints.start.y, endpoints.end.y);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Check if two bounding boxes intersect
 *
 * @param a - First bounding box
 * @param b - Second bounding box
 * @returns True if the boxes intersect
 *
 * @example
 * const intersects = boundsIntersect(shape1Bounds, shape2Bounds);
 */
export function boundsIntersect(a: Bounds, b: Bounds): boolean {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

/**
 * Check if a point is inside a bounding box
 *
 * @param x - Point X coordinate
 * @param y - Point Y coordinate
 * @param bounds - Bounding box to check
 * @returns True if point is inside bounds
 *
 * @example
 * const isInside = pointInBounds(mouseX, mouseY, entityBounds);
 */
export function pointInBounds(x: number, y: number, bounds: Bounds): boolean {
  return (
    x >= bounds.x &&
    x <= bounds.x + bounds.width &&
    y >= bounds.y &&
    y <= bounds.y + bounds.height
  );
}

/**
 * Expand a bounding box by a margin on all sides
 *
 * @param bounds - Original bounds
 * @param margin - Margin to add on all sides
 * @returns New expanded bounds
 *
 * @example
 * const expanded = expandBounds(bounds, 10);
 * // Expands by 10px on all sides (width/height increase by 20)
 */
export function expandBounds(bounds: Bounds, margin: number): Bounds {
  return {
    x: bounds.x - margin,
    y: bounds.y - margin,
    width: bounds.width + margin * 2,
    height: bounds.height + margin * 2,
  };
}

/**
 * Get the center point of a bounding box
 *
 * @param bounds - Bounding box
 * @returns Center point { x, y }
 *
 * @example
 * const center = getBoundsCenter(bounds);
 * console.log(center); // { x: 160, y: 140 }
 */
export function getBoundsCenter(bounds: Bounds): { x: number; y: number } {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Combine multiple bounding boxes into a single bounds that contains all
 *
 * @param boundsList - Array of bounding boxes
 * @returns Combined bounding box, or null if array is empty
 *
 * @example
 * const combinedBounds = combineBounds([shape1Bounds, shape2Bounds]);
 */
export function combineBounds(boundsList: Bounds[]): Bounds | null {
  if (boundsList.length === 0) {
    return null;
  }

  const minX = Math.min(...boundsList.map((b) => b.x));
  const minY = Math.min(...boundsList.map((b) => b.y));
  const maxX = Math.max(...boundsList.map((b) => b.x + b.width));
  const maxY = Math.max(...boundsList.map((b) => b.y + b.height));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
