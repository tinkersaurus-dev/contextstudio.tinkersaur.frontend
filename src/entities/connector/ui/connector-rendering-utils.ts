/**
 * Connector Rendering Utilities
 *
 * Shared utilities for rendering connectors including arrowheads and connection points.
 */

import type { Position } from '@/entities/diagram-entity';
import type { Connector } from '../model/types';
import { ARROWHEAD_CONFIG, STROKE_WIDTHS } from '@/shared/config/canvas-config';

/**
 * Render an arrowhead at a specific position and angle
 *
 * @param ctx - Canvas rendering context
 * @param position - Position of the arrowhead tip
 * @param angle - Angle in radians (direction the arrow points)
 * @param scale - Current canvas scale (for line width adjustment)
 * @param fillColor - Fill color for the arrowhead
 */
export function renderArrowhead(
  ctx: CanvasRenderingContext2D,
  position: Position,
  angle: number,
  scale: number,
  fillColor: string
): void {
  const { length, width } = ARROWHEAD_CONFIG;

  // Scale-adjusted dimensions
  const arrowLength = length / scale;
  const arrowWidth = width / scale;

  ctx.save();

  // Move to arrowhead position and rotate
  ctx.translate(position.x, position.y);
  ctx.rotate(angle);

  // Draw arrowhead as a filled triangle
  ctx.beginPath();
  ctx.moveTo(0, 0); // Tip of arrow
  ctx.lineTo(-arrowLength, arrowWidth / 2); // Bottom left
  ctx.lineTo(-arrowLength, -arrowWidth / 2); // Top left
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();

  ctx.restore();
}

/**
 * Calculate the position along a line at a specific distance from the end
 * Used for positioning arrowheads slightly back from the endpoint
 *
 * @param start - Start point of the line
 * @param end - End point of the line
 * @param distance - Distance from the end point
 * @returns Position along the line
 */
export function getPointAlongLine(
  start: Position,
  end: Position,
  distance: number
): Position {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);

  if (length === 0) {
    return end;
  }

  const ratio = (length - distance) / length;

  return {
    x: start.x + dx * ratio,
    y: start.y + dy * ratio,
  };
}

/**
 * Get the stroke color for a connector based on selection state
 *
 * @param connector - The connector to determine color for
 * @param isSelected - Whether the connector is selected
 * @param themeStrokeColor - Default stroke color from theme
 * @param selectionColor - Selection color from theme
 * @returns The stroke color to use
 */
export function getConnectorStrokeColor(
  connector: Connector,
  isSelected: boolean,
  themeStrokeColor?: string,
  selectionColor?: string
): string {
  return isSelected
    ? (selectionColor ?? '#ff6b35')
    : (connector.strokeColor ?? themeStrokeColor ?? '#1F2937');
}

/**
 * Get the stroke width for a connector based on selection state
 *
 * @param connector - The connector to determine width for
 * @param isSelected - Whether the connector is selected
 * @returns The stroke width to use
 */
export function getConnectorStrokeWidth(
  connector: Connector,
  isSelected: boolean
): number {
  return isSelected
    ? STROKE_WIDTHS.connectorSelected
    : (connector.strokeWidth ?? STROKE_WIDTHS.connector);
}
