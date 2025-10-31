/**
 * BPMN Event Shape Renderer
 *
 * Renders event shapes based on their subType (start, end, intermediate, etc.)
 */

import type { BaseShape, EventShape } from '../model/types';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';
import { getCanvasColors } from '@/shared/config/canvas-config';

/**
 * Render a BPMN Event shape
 * The specific rendering depends on the event subType
 *
 * @param ctx - Canvas rendering context
 * @param shape - The event shape to render
 * @param isSelected - Whether the shape is selected
 * @param scale - Current zoom scale
 */
export function renderEvent(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  const colors = getCanvasColors();
  const eventShape = shape as EventShape;
  const {
    position,
    dimensions,
    strokeWidth = 0.5,
    subType,
  } = eventShape;

  // Use theme colors as fallback if shape doesn't have custom colors
  const fillColor = eventShape.fillColor ?? colors.defaultShapeFill;
  const strokeColor = eventShape.strokeColor ?? colors.defaultShapeStroke;

  const { x, y } = position;
  const { width } = dimensions;
  const radius = width / 2;
  const centerX = x + radius;
  const centerY = y + radius;

  // All events start with a circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.closePath();

  // Fill
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Stroke outer circle
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
  ctx.stroke();

  // Render subType-specific variations
  switch (subType) {
    case 'end':
      // Draw inner circle for end events (double circle)
      const innerRadius = radius - 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = getScaledLineWidth(strokeWidth * 1.5, scale);
      ctx.stroke();
      break;

    case 'intermediate':
      // Draw double outline for intermediate events
      const intermediateRadius = radius - 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, intermediateRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
      ctx.stroke();
      break;

    case 'start':
    default:
      // Start events and others are just a simple circle (already drawn)
      break;
  }

  // Future: Icon rendering based on subType will go here
  // For example: timer icon, message icon, error icon, etc.
}

/**
 * @deprecated Use renderEvent instead
 * Legacy renderer for start events
 */
export function renderStartEvent(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  renderEvent(ctx, shape, isSelected, scale);
}

/**
 * @deprecated Use renderEvent instead
 * Legacy renderer for end events
 */
export function renderEndEvent(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  renderEvent(ctx, shape, isSelected, scale);
}
