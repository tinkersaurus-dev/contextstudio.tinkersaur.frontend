/**
 * Connection Point Renderer
 *
 * Renders connection points on shapes when in connector mode or hovering.
 */

import type { Shape } from '@/entities/shape';
import { getConnectionPointPosition, STANDARD_ANCHORS } from '@/shared/lib/connection-points';
import { CANVAS_COLORS, CONNECTION_POINT_CONFIG } from '@/shared/config/canvas-config';

/**
 * Render connection points for a single shape
 *
 * @param ctx - Canvas rendering context
 * @param shape - Shape to render connection points for
 * @param scale - Current canvas scale
 * @param highlightAnchor - Optional anchor to highlight (e.g., on hover)
 */
export function renderConnectionPointsForShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  scale: number,
  highlightAnchor?: string
): void {
  const { radius, hoverRadius } = CONNECTION_POINT_CONFIG;

  // Render each standard anchor point
  STANDARD_ANCHORS.forEach((anchor) => {
    const position = getConnectionPointPosition(
      shape.position,
      shape.dimensions,
      anchor
    );

    const isHighlighted = anchor === highlightAnchor;
    const pointRadius = (isHighlighted ? hoverRadius : radius) / scale;
    const strokeWidth = (isHighlighted ? 2 : 1.5) / scale;

    // Draw connection point circle
    ctx.beginPath();
    ctx.arc(position.x, position.y, pointRadius, 0, Math.PI * 2);

    // Fill
    ctx.fillStyle = isHighlighted
      ? CANVAS_COLORS.connectionPointHover
      : CANVAS_COLORS.connectionPoint;
    ctx.fill();

    // Stroke (white border for visibility)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  });
}

/**
 * Render connection points for multiple shapes
 *
 * @param ctx - Canvas rendering context
 * @param shapes - Array of shapes to render connection points for
 * @param scale - Current canvas scale
 */
export function renderConnectionPoints(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  scale: number
): void {
  shapes.forEach((shape) => {
    renderConnectionPointsForShape(ctx, shape, scale);
  });
}

/**
 * Render a preview line while creating a connector
 *
 * @param ctx - Canvas rendering context
 * @param startX - Start X coordinate
 * @param startY - Start Y coordinate
 * @param endX - End X coordinate (e.g., mouse position)
 * @param endY - End Y coordinate (e.g., mouse position)
 * @param scale - Current canvas scale
 */
export function renderConnectorPreview(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  scale: number
): void {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);

  // Dashed line for preview
  ctx.setLineDash([8 / scale, 4 / scale]);
  ctx.strokeStyle = CANVAS_COLORS.connectionPoint;
  ctx.lineWidth = 2 / scale;
  ctx.stroke();

  // Reset line dash
  ctx.setLineDash([]);
}
