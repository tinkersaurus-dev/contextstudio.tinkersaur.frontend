import { RectangleShape, BaseShape } from '../model/types';

/**
 * Renders a rectangle shape to the canvas
 */
export function renderRectangle(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  const { position, dimensions, fillColor = '#ffffff', strokeColor = '#000000', strokeWidth = 2 } = shape;

  // Fill the rectangle
  ctx.fillStyle = fillColor;
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);

  // Stroke the rectangle
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
}
