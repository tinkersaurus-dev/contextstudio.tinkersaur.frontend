import { BaseShape } from '../model/types';
import { setupShapeContext } from './base-shape-renderer';

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
  const { position, dimensions } = shape;

  // Setup canvas context with proper colors and line width
  setupShapeContext(ctx, shape, scale, themeColors);

  // Fill and stroke the rectangle
  ctx.fillRect(position.x, position.y, dimensions.width, dimensions.height);
  ctx.strokeRect(position.x, position.y, dimensions.width, dimensions.height);
}
