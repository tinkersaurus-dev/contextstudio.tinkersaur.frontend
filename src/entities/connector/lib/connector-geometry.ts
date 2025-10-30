/**
 * Connector Geometry Utilities
 *
 * Geometric calculations for connectors including bounding boxes,
 * path generation, and intersection detection.
 */

import type { Position, Dimensions } from '@/entities/diagram-entity';
import type { Connector, AnchorPosition } from '../model/types';
import type { Shape } from '@/entities/shape';
import { getConnectionPointPosition } from '@/shared/lib/geometry';

/**
 * Calculate actual start and end positions of a connector based on connected shapes
 *
 * @param connector - The connector
 * @param shapes - Map of shape ID to shape object
 * @returns Object with start and end positions, or null if shapes not found
 */
export function getConnectorEndpoints(
  connector: Connector,
  shapes: Map<string, Shape>
): { start: Position; end: Position } | null {
  const sourceShape = shapes.get(connector.source.shapeId);
  const targetShape = shapes.get(connector.target.shapeId);

  if (!sourceShape || !targetShape) {
    return null;
  }

  const start = getConnectionPointPosition(
    sourceShape.position,
    sourceShape.dimensions,
    connector.source.anchor
  );

  const end = getConnectionPointPosition(
    targetShape.position,
    targetShape.dimensions,
    connector.target.anchor
  );

  return { start, end };
}

/**
 * Calculate bounding box for a connector
 * This updates the connector's position and dimensions to encompass the entire path
 *
 * @param connector - The connector
 * @param shapes - Map of shape ID to shape object
 * @returns Updated dimensions and position, or null if shapes not found
 */
export function calculateConnectorBounds(
  connector: Connector,
  shapes: Map<string, Shape>
): { position: Position; dimensions: Dimensions } | null {
  const endpoints = getConnectorEndpoints(connector, shapes);

  if (!endpoints) {
    return null;
  }

  const { start, end } = endpoints;

  // For straight and curved connectors, bounding box is defined by endpoints
  // For orthogonal, we'd need to consider waypoints too
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const maxX = Math.max(start.x, end.x);
  const maxY = Math.max(start.y, end.y);

  // Add small padding to ensure the connector has some clickable area
  const padding = 10;

  return {
    position: {
      x: minX - padding,
      y: minY - padding,
    },
    dimensions: {
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    },
  };
}

/**
 * Generate path for an orthogonal (right-angle) connector
 * Creates a path with horizontal and vertical segments only
 *
 * @param start - Start position
 * @param end - End position
 * @param startAnchor - Optional anchor position at start (for anchor-aware routing)
 * @param endAnchor - Optional anchor position at end (for anchor-aware routing)
 * @returns Array of positions representing the path
 */
export function generateOrthogonalPath(
  start: Position,
  end: Position,
  startAnchor?: AnchorPosition,
  endAnchor?: AnchorPosition
): Position[] {
  const path: Position[] = [start];

  // Determine if we should route vertically first or horizontally first
  // based on the anchor positions
  const isStartVertical = startAnchor === 'n' || startAnchor === 's';
  const isEndVertical = endAnchor === 'n' || endAnchor === 's';

  if (isStartVertical && isEndVertical) {
    // Both anchors are vertical (N/S): go vertical, then horizontal, then vertical
    const midY = (start.y + end.y) / 2;
    path.push({ x: start.x, y: midY });
    path.push({ x: end.x, y: midY });
  } else if (!isStartVertical && !isEndVertical) {
    // Both anchors are horizontal (E/W): go horizontal, then vertical, then horizontal
    const midX = (start.x + end.x) / 2;
    path.push({ x: midX, y: start.y });
    path.push({ x: midX, y: end.y });
  } else if (isStartVertical && !isEndVertical) {
    // Start is vertical, end is horizontal: go vertical then horizontal
    path.push({ x: start.x, y: end.y });
  } else {
    // Start is horizontal, end is vertical: go horizontal then vertical
    path.push({ x: end.x, y: start.y });
  }

  path.push(end);
  return path;
}

/**
 * Generate control points for a cubic bezier curve
 * Used for curved connectors
 *
 * @param start - Start position
 * @param end - End position
 * @param curvature - Curvature factor (0 = straight, 1 = normal, >1 = exaggerated)
 * @returns Control points [cp1, cp2]
 */
export function generateCurveControlPoints(
  start: Position,
  end: Position,
  curvature = 1.0
): [Position, Position] {
  // Calculate distance between points
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Control point offset is proportional to distance
  const offset = Math.hypot(dx, dy) * 0.4 * curvature;

  // Place control points along horizontal axis for natural curve
  const cp1: Position = {
    x: start.x + offset,
    y: start.y,
  };

  const cp2: Position = {
    x: end.x - offset,
    y: end.y,
  };

  return [cp1, cp2];
}

/**
 * Check if a connector is valid (connected shapes exist)
 *
 * @param connector - The connector to validate
 * @param shapes - Map of shape ID to shape object
 * @returns True if both source and target shapes exist
 */
export function isConnectorValid(connector: Connector, shapes: Map<string, Shape>): boolean {
  return shapes.has(connector.source.shapeId) && shapes.has(connector.target.shapeId);
}

/**
 * Get all connectors attached to a specific shape
 *
 * @param shapeId - ID of the shape
 * @param connectors - Array of all connectors
 * @returns Array of connectors attached to the shape
 */
export function getConnectorsForShape(shapeId: string, connectors: Connector[]): Connector[] {
  return connectors.filter(
    (connector) =>
      connector.source.shapeId === shapeId || connector.target.shapeId === shapeId
  );
}

/**
 * Update a connector when a shape moves
 * Recalculates the connector's bounding box
 *
 * @param connector - The connector to update
 * @param shapes - Map of shape ID to shape object
 * @returns Updated connector with new position/dimensions, or null if invalid
 */
export function updateConnectorForShapeMove(
  connector: Connector,
  shapes: Map<string, Shape>
): Partial<Connector> | null {
  const bounds = calculateConnectorBounds(connector, shapes);

  if (!bounds) {
    return null;
  }

  return {
    position: bounds.position,
    dimensions: bounds.dimensions,
  };
}

/**
 * Calculate the angle of rotation for an arrowhead
 *
 * @param from - Start point
 * @param to - End point
 * @returns Angle in radians
 */
export function calculateArrowAngle(from: Position, to: Position): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

/**
 * Get the direction vector from connection point based on anchor
 * Used to determine arrowhead orientation and connector exit direction
 *
 * @param anchor - Anchor position
 * @returns Normalized direction vector
 */
export function getAnchorDirection(anchor: AnchorPosition): Position {
  switch (anchor) {
    case 'n':
      return { x: 0, y: -1 };
    case 's':
      return { x: 0, y: 1 };
    case 'e':
      return { x: 1, y: 0 };
    case 'w':
      return { x: -1, y: 0 };
    case 'ne':
      return { x: 0.707, y: -0.707 };
    case 'nw':
      return { x: -0.707, y: -0.707 };
    case 'se':
      return { x: 0.707, y: 0.707 };
    case 'sw':
      return { x: -0.707, y: 0.707 };
    default:
      return { x: 0, y: 0 };
  }
}
