/**
 * BPMN Task Shape Renderer
 *
 * Renders a task shape as a rounded rectangle on the canvas.
 */

import type { BaseShape, TaskShape } from '../model/types';
import { setupShapeContext, renderFilledAndStrokedPath } from './base-shape-renderer';

/**
 * Render a BPMN Task shape (rounded rectangle)
 *
 * @param ctx - Canvas rendering context
 * @param shape - The task shape to render
 * @param isSelected - Whether the shape is selected
 * @param scale - Current zoom scale
 */
export function renderTask(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number,
  themeColors?: { fill: string; stroke: string; text: string }
): void {
  const taskShape = shape as TaskShape;
  const { position, dimensions, cornerRadius = 8 } = taskShape;
  const { x, y } = position;
  const { width, height } = dimensions;

  // Setup canvas context with proper colors and line width
  setupShapeContext(ctx, taskShape, scale, themeColors);

  // Draw rounded rectangle path and render
  renderFilledAndStrokedPath(ctx, () => {
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + width - cornerRadius, y);
    ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
    ctx.lineTo(x + width, y + height - cornerRadius);
    ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
    ctx.lineTo(x + cornerRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
  });
}
