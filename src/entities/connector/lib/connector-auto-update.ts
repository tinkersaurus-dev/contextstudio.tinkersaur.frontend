/**
 * Connector Auto-Update Utilities
 *
 * Automatic recalculation of connector connection points to ensure
 * connectors always attach to the closest/optimal anchors when shapes move.
 */

import type { Connector, ConnectionPoint } from '../model/types';
import type { Shape } from '@/entities/shape';
import { getNearestAnchor } from '@/shared/lib/connection-points';

/**
 * Calculate optimal connection points for a connector based on shape positions
 *
 * This function recalculates the source and target anchors to use the closest
 * connection points between the two shapes. When a shape moves, this ensures
 * the connector always connects via the shortest path.
 *
 * @param connector - The connector to update
 * @param shapes - Map of shape ID to shape object
 * @returns Updated source and target connection points, or null if shapes not found
 *
 * @example
 * const updated = updateConnectorAnchors(connector, shapesMap);
 * if (updated) {
 *   // Apply updated.source and updated.target to the connector
 *   updateConnector(connector.id, { source: updated.source, target: updated.target });
 * }
 */
export function updateConnectorAnchors(
  connector: Connector,
  shapes: Map<string, Shape>
): { source: ConnectionPoint; target: ConnectionPoint } | null {
  const sourceShape = shapes.get(connector.source.shapeId);
  const targetShape = shapes.get(connector.target.shapeId);

  if (!sourceShape || !targetShape) {
    return null;
  }

  // Calculate center positions of both shapes for reference
  const sourceCenterX = sourceShape.position.x + sourceShape.dimensions.width / 2;
  const sourceCenterY = sourceShape.position.y + sourceShape.dimensions.height / 2;
  const targetCenterX = targetShape.position.x + targetShape.dimensions.width / 2;
  const targetCenterY = targetShape.position.y + targetShape.dimensions.height / 2;

  // Find nearest anchor on source shape to target shape's center
  const optimalSourceAnchor = getNearestAnchor(
    sourceShape.position,
    sourceShape.dimensions,
    { x: targetCenterX, y: targetCenterY }
  );

  // Find nearest anchor on target shape to source shape's center
  const optimalTargetAnchor = getNearestAnchor(
    targetShape.position,
    targetShape.dimensions,
    { x: sourceCenterX, y: sourceCenterY }
  );

  return {
    source: {
      shapeId: connector.source.shapeId,
      anchor: optimalSourceAnchor,
    },
    target: {
      shapeId: connector.target.shapeId,
      anchor: optimalTargetAnchor,
    },
  };
}
