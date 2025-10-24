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
import type { ConnectorRenderContext } from '@/shared/lib/rendering-types';
import { createError, logError, ErrorSeverity } from '@/shared/lib/result';
import { createShapeMap } from '@/shared/lib/map-utils';

/**
 * Render a single connector using the standardized context pattern
 *
 * @param context - Connector rendering context
 */
export function renderConnector(context: ConnectorRenderContext): void {
  const { ctx, connector, shapes, isSelected, scale } = context;
  renderConnectorFromRegistry(ctx, connector, shapes, isSelected, scale);
}

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
  const shapesMap = createShapeMap(shapes);

  // Render each connector
  connectors.forEach((connector) => {
    try {
      // Skip invalid connectors (missing shapes)
      if (!isConnectorValid(connector, shapesMap)) {
        const appError = createError(
          `Skipping invalid connector ${connector.id}: source ${connector.source.shapeId} or target ${connector.target.shapeId} not found`,
          ErrorSeverity.Warning,
          {
            code: 'CONNECTOR_INVALID',
            context: {
              connectorId: connector.id,
              sourceShapeId: connector.source.shapeId,
              targetShapeId: connector.target.shapeId,
            },
          }
        );
        logError(appError);
        return;
      }

      const isSelected = selectedEntityIds.has(connector.id);

      // Use standardized rendering context
      renderConnector({ ctx, connector, shapes: shapesMap, isSelected, scale });
    } catch (error) {
      const appError = createError(
        `Error rendering connector ${connector.id}`,
        ErrorSeverity.Error,
        {
          code: 'CONNECTOR_RENDER_ERROR',
          context: { connectorId: connector.id, connectorType: connector.connectorType },
          cause: error instanceof Error ? error : undefined,
        }
      );
      logError(appError);
      // Continue rendering other connectors despite error
    }
  });
}
