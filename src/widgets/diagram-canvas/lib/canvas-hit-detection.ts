/**
 * Canvas Hit Detection
 *
 * Internal hit detection functions used by EntitySystem.
 * These provide low-level hit testing for shapes and connectors.
 *
 * @deprecated Use EntitySystem.hitTest() and EntitySystem.findEntityAtPoint() instead.
 * These functions remain for backward compatibility and internal use by EntitySystem.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { DiagramEntity } from '@/entities/diagram-entity';
import { getConnectorEndpoints } from '@/entities/connector';
import { distanceToLineSegment } from '@/shared/lib/geometry';
import { CONNECTOR_HIT_CONFIG } from '@/shared/config/canvas-config';
import { createShapeMap } from '@/shared/lib/map-utils';

/**
 * Find the topmost entity at a specific point
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param shapes - Array of shapes to check
 * @param connectors - Array of connectors to check
 * @returns The entity at the point, or null if none found
 */
export function getEntityAtPoint(
  x: number,
  y: number,
  shapes: Shape[],
  connectors: Connector[]
): DiagramEntity | null {
  const shapesMap = createShapeMap(shapes);

  // Check shapes first (iterate in reverse to check topmost first)
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (isPointInShape(x, y, shape)) {
      return shape;
    }
  }

  // Check connectors (iterate in reverse to check topmost first)
  for (let i = connectors.length - 1; i >= 0; i--) {
    const connector = connectors[i];
    if (isPointOnConnector(x, y, connector, shapesMap)) {
      return connector;
    }
  }

  return null;
}

/**
 * Check if a point is inside a shape's bounding box
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param shape - Shape to check
 * @returns True if point is inside the shape
 */
export function isPointInShape(x: number, y: number, shape: Shape): boolean {
  const { position, dimensions } = shape;

  return (
    x >= position.x &&
    x <= position.x + dimensions.width &&
    y >= position.y &&
    y <= position.y + dimensions.height
  );
}

/**
 * Check if a point is near a connector line
 *
 * @param x - World X coordinate
 * @param y - World Y coordinate
 * @param connector - Connector to check
 * @param shapesMap - Map of shape IDs to shapes for endpoint calculation
 * @returns True if point is within hit tolerance of the connector
 */
export function isPointOnConnector(
  x: number,
  y: number,
  connector: Connector,
  shapesMap: Map<string, Shape>
): boolean {
  const endpoints = getConnectorEndpoints(connector, shapesMap);

  if (!endpoints) {
    return false;
  }

  const distance = distanceToLineSegment(
    { x, y },
    endpoints.start,
    endpoints.end
  );

  return distance <= CONNECTOR_HIT_CONFIG.tolerance;
}

/**
 * Select all entities within a bounding box
 *
 * @param x1 - First corner X coordinate
 * @param y1 - First corner Y coordinate
 * @param x2 - Second corner X coordinate
 * @param y2 - Second corner Y coordinate
 * @param entities - Array of all entities to check
 * @returns Array of entity IDs that intersect with the box
 */
export function selectEntitiesInBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  entities: DiagramEntity[]
): string[] {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return entities
    .filter((entity) => {
      const { position, dimensions } = entity;
      // Check if entity intersects with selection box
      return !(
        position.x + dimensions.width < minX ||
        position.x > maxX ||
        position.y + dimensions.height < minY ||
        position.y > maxY
      );
    })
    .map((entity) => entity.id);
}

/**
 * Check if two bounding boxes intersect
 *
 * @param x1 - First box X position
 * @param y1 - First box Y position
 * @param w1 - First box width
 * @param h1 - First box height
 * @param x2 - Second box X position
 * @param y2 - Second box Y position
 * @param w2 - Second box width
 * @param h2 - Second box height
 * @returns True if the boxes intersect
 */
export function boxesIntersect(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return !(
    x1 + w1 < x2 ||
    x1 > x2 + w2 ||
    y1 + h1 < y2 ||
    y1 > y2 + h2
  );
}
