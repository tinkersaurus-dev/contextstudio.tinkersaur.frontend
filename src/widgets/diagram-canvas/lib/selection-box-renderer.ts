/**
 * Selection Box Rendering
 *
 * Renders the selection box rectangle when user drags to multi-select entities
 */

import { getBoundingBox, renderSelectionBoxRect } from '@/shared/lib/rendering';

export interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export function renderSelectionBox(
  ctx: CanvasRenderingContext2D,
  selectionBox: SelectionBox,
  scale: number,
  strokeColor?: string,
  fillColor?: string
): void {
  const { startX, startY, endX, endY } = selectionBox;

  const box = getBoundingBox(startX, startY, endX, endY);

  renderSelectionBoxRect(ctx, box.minX, box.minY, box.width, box.height, scale, strokeColor, fillColor);
}
