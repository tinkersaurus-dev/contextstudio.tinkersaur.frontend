/**
 * Canvas Renderer
 *
 * Centralized canvas rendering logic for the diagram canvas.
 * This separates rendering concerns from component logic for better testability.
 */

import { renderGrid, DEFAULT_GRID_CONFIG, type GridConfig } from './grid-renderer';
import { renderShapes } from './shape-renderer';
import type { SelectionBox } from './selection-box-renderer';
import type { Shape } from '@/entities/shape';
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
  /** Set of selected entity IDs */
  selectedEntityIds: Set<string>;
  /** Optional selection box for multi-select */
  selectionBox?: SelectionBox | null;
  /** Optional grid configuration */
  gridConfig?: GridConfig;
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
 *   selectedEntityIds: new Set(['shape-1', 'shape-2']),
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
    selectedEntityIds,
    selectionBox = null,
    gridConfig = DEFAULT_GRID_CONFIG,
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
