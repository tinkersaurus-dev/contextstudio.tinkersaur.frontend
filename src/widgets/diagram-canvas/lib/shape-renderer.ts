import { Shape } from '@/entities/shape';
import { renderBaseShape } from '@/entities/shape/ui/base-shape';
import { renderShapeFromRegistry } from '@/entities/shape/lib/shape-registry';
import { renderSelectionBox, SelectionBox } from './selection-box-renderer';

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
  selectionBox: SelectionBox | null = null
): void {
  shapes.forEach((shape) => {
    try {
      const isSelected = selectedEntityIds.has(shape.id);

      // Use registry pattern for extensible shape rendering
      renderBaseShape(ctx, shape, isSelected, scale, renderShapeFromRegistry);
    } catch (error) {
      console.error(`Error rendering shape ${shape.id}:`, error);
      // Continue rendering other shapes despite error
    }
  });

  // Render selection box if active
  if (selectionBox) {
    try {
      renderSelectionBox(ctx, selectionBox, scale);
    } catch (error) {
      console.error('Error rendering selection box:', error);
    }
  }
}
