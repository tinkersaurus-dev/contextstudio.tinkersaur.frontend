import { Shape } from '@/entities/shape';
import { renderBaseShape } from '@/entities/shape/ui/base-shape';
import { renderShapeFromRegistry } from '@/entities/shape/lib/shape-registry';
import { renderSelectionBox, SelectionBox } from './selection-box-renderer';
import type { ShapeRenderContext } from '@/shared/lib/rendering';
import { createError, logError, ErrorSeverity } from '@/shared/lib/core/result';

/**
 * Render a single shape using the standardized context pattern
 *
 * @param context - Shape rendering context
 */
export function renderShape(context: ShapeRenderContext): void {
  const { ctx, shape, isSelected, scale, themeColors } = context;
  renderBaseShape(ctx, shape, isSelected, scale, renderShapeFromRegistry, themeColors);
}

/**
 * Renders all shapes to the canvas
 *
 * Includes per-shape error handling to prevent single shape failures from affecting others.
 */
export function renderShapes(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  selectedEntityIds: Set<string>,
  scale: number,
  selectionBox: SelectionBox | null = null,
  themeColors?: { fill: string; stroke: string; text: string }
): void {
  shapes.forEach((shape) => {
    try {
      const isSelected = selectedEntityIds.has(shape.id);

      // Use standardized rendering context
      renderShape({ ctx, shape, isSelected, scale, themeColors });
    } catch (error) {
      const appError = createError(
        `Error rendering shape ${shape.id}`,
        ErrorSeverity.Error,
        {
          code: 'SHAPE_RENDER_ERROR',
          context: { shapeId: shape.id, shapeType: shape.shapeType },
          cause: error instanceof Error ? error : undefined,
        }
      );
      logError(appError);
      // Continue rendering other shapes despite error
    }
  });

  // Render selection box if active
  if (selectionBox) {
    try {
      // Note: We don't have access to theme colors here, so using defaults
      // In the future, could pass theme colors as a parameter
      renderSelectionBox(ctx, selectionBox, scale);
    } catch (error) {
      const appError = createError(
        'Error rendering selection box',
        ErrorSeverity.Error,
        {
          code: 'SELECTION_BOX_RENDER_ERROR',
          cause: error instanceof Error ? error : undefined,
        }
      );
      logError(appError);
    }
  }
}
