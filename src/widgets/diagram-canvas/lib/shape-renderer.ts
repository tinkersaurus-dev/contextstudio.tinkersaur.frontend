import { Shape } from '@/entities/shape';
import { renderBaseShape } from '@/entities/shape/ui/base-shape';
import { renderShapeFromRegistry } from '@/entities/shape/lib/shape-registry';
import { renderSelectionBox, SelectionBox } from './selection-box-renderer';

/**
 * Renders all shapes to the canvas
 */
export function renderShapes(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  selectedEntityIds: Set<string>,
  scale: number,
  selectionBox: SelectionBox | null = null
): void {
  shapes.forEach((shape) => {
    const isSelected = selectedEntityIds.has(shape.id);

    // Use registry pattern for extensible shape rendering
    renderBaseShape(ctx, shape, isSelected, scale, renderShapeFromRegistry);
  });

  // Render selection box if active
  if (selectionBox) {
    renderSelectionBox(ctx, selectionBox, scale);
  }
}
