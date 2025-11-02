/**
 * Canvas Renderer
 *
 * Centralized canvas rendering logic for the diagram canvas.
 * This separates rendering concerns from component logic for better testability.
 */

import { GridSystem, DEFAULT_GRID_CONFIG, type GridConfig } from '@/shared/lib/rendering';
import { renderShapes } from './shape-renderer';
import { renderConnectors } from './connector-renderer';
import { ConnectionPointSystem } from '@/shared/lib/connections';
import { CanvasTransform } from '@/shared/lib/rendering';
import type { SelectionBox } from './selection-box-renderer';
import type { Shape } from '@/entities/shape';
import type { Connector, AnchorPosition } from '@/entities/connector';
import { createError, logError, ErrorSeverity } from '@/shared/lib/core/result';
import type { CanvasTheme } from '@/shared/lib/theming';

export interface CanvasRenderContext {
  /** Canvas element to render to */
  canvas: HTMLCanvasElement;
  /** Canvas transform (zoom and pan) */
  transform: CanvasTransform;
  /** Shapes to render */
  shapes: Shape[];
  /** Connectors to render */
  connectors: Connector[];
  /** Set of selected entity IDs */
  selectedEntityIds: Set<string>;
  /** Optional selection box for multi-select */
  selectionBox?: SelectionBox | null;
  /** Optional grid configuration */
  gridConfig?: GridConfig;
  /** Connector drag state */
  connectorDragStart?: { x: number; y: number } | null;
  connectorDragEnd?: { x: number; y: number } | null;
  /** Whether in connector mode (showing connection points) */
  isConnectorMode?: boolean;
  /** Shape IDs to show connection points for */
  hoveredShapeIds?: string[];
  /** Specific connection point being hovered */
  hoveredConnectionPoint?: { shapeId: string; anchor: AnchorPosition } | null;
  /** Canvas theme with colors for rendering */
  theme: CanvasTheme;
}

/**
 * Render the complete canvas scene
 *
 * Handles all rendering operations including:
 * - Canvas sizing to parent
 * - Background fill
 * - Transform application (zoom and pan)
 * - Grid rendering
 * - Shape rendering
 * - Connector rendering
 * - Selection box rendering
 *
 * Includes error handling to prevent rendering failures from crashing the canvas.
 *
 * @param context - Rendering context with all necessary data
 *
 * @example
 * renderCanvas({
 *   canvas: canvasRef.current,
 *   transform: new CanvasTransform(1.5, 100, 200),
 *   shapes: shapes,
 *   connectors: connectors,
 *   selectedEntityIds: new Set(['shape-1', 'connector-1']),
 *   selectionBox: null,
 * });
 */
export function renderCanvas(context: CanvasRenderContext): void {
  const {
    canvas,
    transform,
    shapes,
    connectors,
    selectedEntityIds,
    selectionBox = null,
    gridConfig = DEFAULT_GRID_CONFIG,
    connectorDragStart = null,
    connectorDragEnd = null,
    hoveredShapeIds = [],
    hoveredConnectionPoint = null,
    theme,
  } = context;

  try {
    // Ensure canvas matches parent size
    const parent = canvas.parentElement;
    if (!parent) {
      const error = createError(
        'Canvas has no parent element',
        ErrorSeverity.Warning,
        { code: 'CANVAS_NO_PARENT' }
      );
      logError(error);
      return;
    }

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Get rendering context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      const error = createError(
        'Failed to get 2D rendering context',
        ErrorSeverity.Error,
        { code: 'CANVAS_CONTEXT_FAILED' }
      );
      logError(error);
      return;
    }

    // Fill canvas with theme background color
    ctx.fillStyle = theme.colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transform to context
    ctx.save();
    transform.applyToContext(ctx);

    try {
      // Render grid with theme colors
      GridSystem.render({
        ctx,
        width: canvas.width,
        height: canvas.height,
        scale: transform.scale,
        panX: transform.panX,
        panY: transform.panY,
        config: gridConfig,
        colors: theme.colors.grid,
      });
    } catch (err) {
      const error = createError(
        'Error rendering grid',
        ErrorSeverity.Error,
        {
          code: 'GRID_RENDER_ERROR',
          cause: err instanceof Error ? err : undefined,
        }
      );
      logError(error);
      // Continue rendering despite grid error
    }

    try {
      // Render all shapes with theme colors
      renderShapes(ctx, shapes, selectedEntityIds, transform.scale, selectionBox, theme.colors.shape);
    } catch (err) {
      const error = createError(
        'Error rendering shapes',
        ErrorSeverity.Error,
        {
          code: 'SHAPES_RENDER_ERROR',
          context: { shapeCount: shapes.length },
          cause: err instanceof Error ? err : undefined,
        }
      );
      logError(error);
      // Continue rendering despite error
    }

    try {
      // Render all connectors with theme colors
      renderConnectors(ctx, connectors, shapes, selectedEntityIds, transform.scale, theme.colors.connector.stroke);
    } catch (err) {
      const error = createError(
        'Error rendering connectors',
        ErrorSeverity.Error,
        {
          code: 'CONNECTORS_RENDER_ERROR',
          context: { connectorCount: connectors.length },
          cause: err instanceof Error ? err : undefined,
        }
      );
      logError(error);
      // Continue rendering despite error
    }

    try {
      // Render connection points for hovered shapes with theme colors
      if (hoveredShapeIds.length > 0) {
        const hoveredShapes = shapes.filter((s) => hoveredShapeIds.includes(s.id));

        hoveredShapes.forEach((shape) => {
          const highlightAnchor =
            hoveredConnectionPoint?.shapeId === shape.id
              ? hoveredConnectionPoint.anchor
              : undefined;
          ConnectionPointSystem.renderConnectionPoints(ctx, shape, {
            scale: transform.scale,
            highlightAnchor,
            colors: theme.colors.connectionPoint,
          });
        });
      }

      // Show preview line if dragging connector with theme color
      if (connectorDragStart && connectorDragEnd) {
        ConnectionPointSystem.renderConnectorPreview(
          ctx,
          connectorDragStart.x,
          connectorDragStart.y,
          connectorDragEnd.x,
          connectorDragEnd.y,
          transform.scale,
          theme.colors.connectionPoint.preview
        );
      }
    } catch (err) {
      const error = createError(
        'Error rendering connection points',
        ErrorSeverity.Error,
        {
          code: 'CONNECTION_POINTS_RENDER_ERROR',
          cause: err instanceof Error ? err : undefined,
        }
      );
      logError(error);
      // Continue to restore context despite error
    }

    // Restore context
    ctx.restore();
  } catch (err) {
    const error = createError(
      'Critical error in canvas rendering',
      ErrorSeverity.Critical,
      {
        code: 'CANVAS_RENDER_CRITICAL',
        cause: err instanceof Error ? err : undefined,
      }
    );
    logError(error);
    // Try to restore a basic canvas state
    try {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.restore();
      }
    } catch {
      // Ignore restore errors
    }
  }
}
