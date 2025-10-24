/**
 * BPMN Start Event Shape Renderer
 *
 * Renders a start event as a circle on the canvas.
 */

import type { BaseShape } from '../model/types';

/**
 * Render a BPMN Start Event shape (circle)
 *
 * @param ctx - Canvas rendering context
 * @param shape - The start event shape to render
 * @param isSelected - Whether the shape is selected
 * @param scale - Current zoom scale
 */
export function renderStartEvent(
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

  // Draw circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.stroke();
}
