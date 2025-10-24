/**
 * BPMN End Event Shape Renderer
 *
 * Renders an end event as a double circle on the canvas.
 */

import type { BaseShape } from '../model/types';

/**
 * Render a BPMN End Event shape (double circle)
 *
 * @param ctx - Canvas rendering context
 * @param shape - The end event shape to render
 * @param isSelected - Whether the shape is selected
 * @param scale - Current zoom scale
 */
export function renderEndEvent(
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
  const { width } = dimensions;
  const radius = width / 2;
  const centerX = x + radius;
  const centerY = y + radius;
  const innerRadius = radius - 3; // Gap between circles

  // Draw outer circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke outer circle
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.stroke();

  // Draw inner circle (no fill, just stroke)
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = (strokeWidth * 1.5) / scale; // Slightly thicker inner circle
  ctx.stroke();
}
