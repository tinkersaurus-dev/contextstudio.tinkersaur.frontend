/**
 * Straight Connector Renderer
 *
 * Renders a straight line connector between two shapes.
 */

import type { Connector } from '../model/types';
import { isStraightConnector } from '../model/types';
import type { Shape } from '@/entities/shape';
import { getConnectorEndpoints } from '../lib/connector-geometry';
import {
  renderArrowhead,
  getConnectorStrokeColor,
  getConnectorStrokeWidth,
} from './connector-rendering-utils';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

/**
 * Render a straight line connector
 *
 * @param ctx - Canvas rendering context
 * @param connector - The connector to render
 * @param shapes - Map of shape ID to shape object
 * @param isSelected - Whether the connector is selected
 * @param scale - Current canvas scale
 */
export function renderStraightConnector(
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Map<string, Shape>,
  isSelected: boolean,
  scale: number
): void {
  if (!isStraightConnector(connector)) {
    console.error('renderStraightConnector called with non-straight connector:', connector);
    return;
  }

  const straightConnector = connector;

  // Get actual endpoints from connected shapes
  const endpoints = getConnectorEndpoints(straightConnector, shapes);

  if (!endpoints) {
    // Cannot render if shapes are missing
    return;
  }

  const { start, end } = endpoints;

  // Determine stroke color and width
  const strokeColor = getConnectorStrokeColor(straightConnector, isSelected);
  const strokeWidth = getConnectorStrokeWidth(straightConnector, isSelected);

  // Draw the line
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
  ctx.stroke();

  // Calculate angle for arrowheads
  const angle = Math.atan2(end.y - start.y, end.x - start.x);

  // Render arrowhead at end if specified
  if (straightConnector.arrowEnd) {
    renderArrowhead(ctx, end, angle, scale, strokeColor);
  }

  // Render arrowhead at start if specified
  if (straightConnector.arrowStart) {
    renderArrowhead(ctx, start, angle + Math.PI, scale, strokeColor);
  }
}
