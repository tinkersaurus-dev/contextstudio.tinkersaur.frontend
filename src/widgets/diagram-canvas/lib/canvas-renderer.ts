/**
 * Canvas Renderer
 *
 * Centralized canvas rendering logic for the diagram canvas.
 * This separates rendering concerns from component logic for better testability.
 */

import { renderGrid, DEFAULT_GRID_CONFIG, type GridConfig } from './grid-renderer';
import { renderShapes } from './shape-renderer';
import { renderConnectors } from './connector-renderer';
import {
  renderConnectionPointsForShape,
  renderConnectorPreview,
} from './connection-point-renderer';
import type { SelectionBox } from './selection-box-renderer';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import { CANVAS_COLORS } from '@/shared/config/canvas-config';

export interface CanvasRenderContext {
  /** Canvas element to render to */
  canvas: HTMLCanvasElement;
  /** Current zoom/scale level */
  scale: number;
  /** Pan offset X */
  panX: number;
  /** Pan offset Y */
  panY: number;
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
  hoveredConnectionPoint?: { shapeId: string; anchor: string } | null;
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
 *   scale: 1.5,
 *   panX: 100,
 *   panY: 200,
 *   shapes: shapes,
 *   connectors: connectors,
 *   selectedEntityIds: new Set(['shape-1', 'connector-1']),
 *   selectionBox: null,
 * });
 */
export function renderCanvas(context: CanvasRenderContext): void {
  const {
    canvas,
    scale,
    panX,
    panY,
    shapes,
    connectors,
    selectedEntityIds,
    selectionBox = null,
    gridConfig = DEFAULT_GRID_CONFIG,
    connectorDragStart = null,
    connectorDragEnd = null,
    hoveredShapeIds = [],
    hoveredConnectionPoint = null,
  } = context;

  try {
    // Ensure canvas matches parent size
    const parent = canvas.parentElement;
    if (!parent) {
      console.warn('Canvas has no parent element, skipping render');
      return;
    }

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Get rendering context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D rendering context');
      return;
    }

    // Fill canvas with background color
    ctx.fillStyle = CANVAS_COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply pan and zoom transform
    // IMPORTANT: scale first, then translate!
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(panX / scale, panY / scale);

    try {
      // Render grid
      renderGrid(ctx, canvas.width, canvas.height, scale, panX, panY, gridConfig);
    } catch (error) {
      console.error('Error rendering grid:', error);
      // Continue rendering despite grid error
    }

    try {
      // Render all shapes with selection and selection box
      renderShapes(ctx, shapes, selectedEntityIds, scale, selectionBox);
    } catch (error) {
      console.error('Error rendering shapes:', error);
      // Continue rendering despite error
    }

    try {
      // Render all connectors
      renderConnectors(ctx, connectors, shapes, selectedEntityIds, scale);
    } catch (error) {
      console.error('Error rendering connectors:', error);
      // Continue rendering despite error
    }

    try {
      // Render connection points for hovered shapes
      if (hoveredShapeIds.length > 0) {
        const hoveredShapes = shapes.filter((s) => hoveredShapeIds.includes(s.id));

        hoveredShapes.forEach((shape) => {
          const highlightAnchor =
            hoveredConnectionPoint?.shapeId === shape.id
              ? hoveredConnectionPoint.anchor
              : undefined;
          renderConnectionPointsForShape(ctx, shape, scale, highlightAnchor);
        });
      }

      // Show preview line if dragging connector
      if (connectorDragStart && connectorDragEnd) {
        renderConnectorPreview(
          ctx,
          connectorDragStart.x,
          connectorDragStart.y,
          connectorDragEnd.x,
          connectorDragEnd.y,
          scale
        );
      }
    } catch (error) {
      console.error('Error rendering connection points:', error);
      // Continue to restore context despite error
    }

    // Restore context
    ctx.restore();
  } catch (error) {
    console.error('Critical error in canvas rendering:', error);
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
