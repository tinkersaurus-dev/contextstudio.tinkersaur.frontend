import { BaseShape } from '../model/types';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

/**
 * Renders a rectangle shape to the canvas
 */
export function renderRectangle(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  const { position, dimensions, strokeWidth = 0.5 } = shape;

  // Use placeholder colors as fallback if shape doesn't have custom colors
  // Will be replaced with canvas theme system
  const fillColor = shape.fillColor ?? '#F3F4F6';
  const strokeColor = shape.strokeColor ?? '#1F2937';

  // Fill the rectangle
  ctx.fillStyle = fillColor;
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);

  // Stroke the rectangle
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
}
