/**
 * Connector Renderer
 *
 * Batch rendering logic for connectors on the canvas.
 * Separates connector rendering from general canvas rendering for better organization.
 */

import type { Connector } from '@/entities/connector';
import type { Shape } from '@/entities/shape';
import { renderConnectorFromRegistry } from '@/entities/connector';
import { isConnectorValid } from '@/entities/connector';

/**
 * Render all connectors on the canvas
 *
 * Iterates through connectors and renders each one using the registry.
 * Includes error handling to prevent one bad connector from breaking the entire render.
 *
 * @param ctx - Canvas rendering context
 * @param connectors - Array of connectors to render
 * @param shapes - Array of shapes (needed to resolve connector endpoints)
 * @param selectedEntityIds - Set of selected entity IDs
 * @param scale - Current canvas scale
 *
 * @example
 * renderConnectors(ctx, connectors, shapes, selectedIds, 1.0);
 */
export function renderConnectors(
  ctx: CanvasRenderingContext2D,
  connectors: Connector[],
  shapes: Shape[],
  selectedEntityIds: Set<string>,
  scale: number
): void {
  // Create a map of shapes for efficient lookup
  const shapesMap = new Map(shapes.map((shape) => [shape.id, shape]));

  // Render each connector
  connectors.forEach((connector) => {
    try {
      // Skip invalid connectors (missing shapes)
      if (!isConnectorValid(connector, shapesMap)) {
        console.warn(
          `Skipping invalid connector ${connector.id}: ` +
            `source ${connector.source.shapeId} or target ${connector.target.shapeId} not found`
        );
        return;
      }

      const isSelected = selectedEntityIds.has(connector.id);

      // Render using registry
      renderConnectorFromRegistry(ctx, connector, shapesMap, isSelected, scale);
    } catch (error) {
      console.error(`Error rendering connector ${connector.id}:`, error);
      // Continue rendering other connectors despite error
    }
  });
}
