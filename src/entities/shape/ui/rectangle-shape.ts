import { BaseShape } from '../model/types';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';
import { getCanvasColors } from '@/shared/config/canvas-config';

/**
 * Renders a rectangle shape to the canvas
 */
export function renderRectangle(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  const colors = getCanvasColors();
  const { position, dimensions, strokeWidth = 0.5 } = shape;

  // Use theme colors as fallback if shape doesn't have custom colors
  const fillColor = shape.fillColor ?? colors.defaultShapeFill;
  const strokeColor = shape.strokeColor ?? colors.defaultShapeStroke;

  // Fill the rectangle
  ctx.fillStyle = fillColor;
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);

  // Stroke the rectangle
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
}
