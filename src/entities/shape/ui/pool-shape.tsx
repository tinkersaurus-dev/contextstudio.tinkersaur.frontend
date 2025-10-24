/**
 * BPMN Pool Shape Renderer
 *
 * Renders a pool as a large rectangle on the canvas.
 * Pools are used for grouping BPMN processes.
 */

import type { BaseShape } from '../model/types';

/**
 * Render a BPMN Pool shape (large rectangle for process grouping)
 *
 * @param ctx - Canvas rendering context
 * @param shape - The pool shape to render
 * @param isSelected - Whether the shape is selected
 * @param scale - Current zoom scale
 */
export function renderPool(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  const {
    position,
    dimensions,
    fillColor = '#ffffff',
    strokeColor = '#000000',
    strokeWidth = 0.5,
  } = shape;

  const { x, y } = position;
  const { width, height } = dimensions;

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fillRect(x, y, width, height);

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.strokeRect(x, y, width, height);

  // Draw vertical divider line on left side (20px from left)
  // This is a visual indicator that it's a pool
  const dividerX = x + 20;
  ctx.beginPath();
  ctx.moveTo(dividerX, y);
  ctx.lineTo(dividerX, y + height);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.stroke();
}
