/**
 * BPMN Task Shape Renderer
 *
 * Renders a task shape as a rounded rectangle on the canvas.
 */

import type { BaseShape, TaskShape } from '../model/types';

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
  scale: number
): void {
  const taskShape = shape as TaskShape;
  const {
    position,
    dimensions,
    cornerRadius = 8,
    fillColor = '#ffffff',
    strokeColor = '#000000',
    strokeWidth = 0.5,
  } = taskShape;

  const { x, y } = position;
  const { width, height } = dimensions;

  // Draw rounded rectangle
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.lineTo(x + width - cornerRadius, y);
  ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
  ctx.lineTo(x + width, y + height - cornerRadius);
  ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
  ctx.lineTo(x + cornerRadius, y + height);
  ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
  ctx.lineTo(x, y + cornerRadius);
  ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
  ctx.closePath();

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.stroke();
}
