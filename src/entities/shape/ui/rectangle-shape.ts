import { BaseShape } from '../model/types';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

/**
 * Renders a rectangle shape to the canvas
 */
export function renderRectangle(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number,
  themeColors?: { fill: string; stroke: string; text: string }
): void {
  const { position, dimensions, strokeWidth = 0.5 } = shape;

  // Use shape colors if specified, otherwise fallback to theme colors
  const fillColor = shape.fillColor ?? themeColors?.fill ?? '#F3F4F6';
  const strokeColor = shape.strokeColor ?? themeColors?.stroke ?? '#1F2937';

  // Fill the rectangle
  ctx.fillStyle = fillColor;
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);

  // Stroke the rectangle
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
}
