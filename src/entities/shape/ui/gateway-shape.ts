/**
 * BPMN Gateway Shape Renderer
 *
 * Renders a gateway as a diamond (rotated square) on the canvas.
 */

import type { BaseShape } from '../model/types';
import { setupShapeContext, renderFilledAndStrokedPath } from './base-shape-renderer';

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
  scale: number,
  themeColors?: { fill: string; stroke: string; text: string }
): void {
  const { position, dimensions } = shape;
  const { x, y } = position;
  const { width, height } = dimensions;

  // Calculate diamond center point
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Setup canvas context with proper colors and line width
  setupShapeContext(ctx, shape, scale, themeColors);

  // Draw diamond path and render
  renderFilledAndStrokedPath(ctx, () => {
    ctx.moveTo(centerX, y); // Top point
    ctx.lineTo(x + width, centerY); // Right point
    ctx.lineTo(centerX, y + height); // Bottom point
    ctx.lineTo(x, centerY); // Left point
  });
}
