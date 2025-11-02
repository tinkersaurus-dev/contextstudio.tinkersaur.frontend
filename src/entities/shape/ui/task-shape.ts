/**
 * BPMN Task Shape Renderer
 *
 * Renders a task shape as a rounded rectangle on the canvas.
 */

import type { BaseShape, TaskShape } from '../model/types';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

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
    strokeWidth = 0.5,
  } = taskShape;

  const { x, y } = position;
  const { width, height } = dimensions;

  // Use placeholder colors as fallback if shape doesn't have custom colors
  // Will be replaced with canvas theme system
  const fillColor = taskShape.fillColor ?? '#F3F4F6';
  const strokeColor = taskShape.strokeColor ?? '#1F2937';

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
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
  ctx.stroke();
}
