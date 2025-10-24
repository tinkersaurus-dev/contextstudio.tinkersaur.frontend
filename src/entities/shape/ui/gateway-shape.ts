/**
 * BPMN Gateway Shape Renderer
 *
 * Renders a gateway as a diamond (rotated square) on the canvas.
 */

import type { BaseShape } from '../model/types';

/**
 * Render a BPMN Gateway shape (diamond)
 *
 * @param ctx - Canvas rendering context
 * @param shape - The gateway shape to render
 * @param isSelected - Whether the shape is selected
 * @param scale - Current zoom scale
 */
export function renderGateway(
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

  // Calculate diamond center point
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Draw diamond
  ctx.beginPath();
  ctx.moveTo(centerX, y); // Top point
  ctx.lineTo(x + width, centerY); // Right point
  ctx.lineTo(centerX, y + height); // Bottom point
  ctx.lineTo(x, centerY); // Left point
  ctx.closePath();

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.stroke();
}
