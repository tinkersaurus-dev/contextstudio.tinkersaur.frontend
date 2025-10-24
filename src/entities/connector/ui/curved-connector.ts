/**
 * Curved Connector Renderer
 *
 * Renders a smooth bezier curve connector between two shapes.
 */

import type { Connector, CurvedConnector } from '../model/types';
import type { Shape } from '@/entities/shape';
import {
  getConnectorEndpoints,
  generateCurveControlPoints,
} from '../lib/connector-geometry';
import {
  renderArrowhead,
  getConnectorStrokeColor,
  getConnectorStrokeWidth,
} from './connector-rendering-utils';

/**
 * Render a curved (bezier) connector
 *
 * @param ctx - Canvas rendering context
 * @param connector - The connector to render
 * @param shapes - Map of shape ID to shape object
 * @param isSelected - Whether the connector is selected
 * @param scale - Current canvas scale
 */
export function renderCurvedConnector(
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Map<string, Shape>,
  isSelected: boolean,
  scale: number
): void {
  const curvedConnector = connector as CurvedConnector;

  // Get actual endpoints from connected shapes
  const endpoints = getConnectorEndpoints(curvedConnector, shapes);

  if (!endpoints) {
    // Cannot render if shapes are missing
    return;
  }

  const { start, end } = endpoints;

  // Generate control points for bezier curve
  const curvature = curvedConnector.curvature ?? 1.0;
  const [cp1, cp2] = generateCurveControlPoints(start, end, curvature);

  // Determine stroke color and width
  const strokeColor = getConnectorStrokeColor(curvedConnector, isSelected);
  const strokeWidth = getConnectorStrokeWidth(curvedConnector, isSelected);

  // Draw the bezier curve
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth / scale;
  ctx.stroke();

  // Calculate angle at the end of the curve for arrowhead
  // Use the tangent at the endpoint (derivative of bezier curve at t=1)
  const endAngle = Math.atan2(end.y - cp2.y, end.x - cp2.x);

  // Render arrowhead at end if specified
  if (curvedConnector.arrowEnd) {
    renderArrowhead(ctx, end, endAngle, scale, strokeColor);
  }

  // Render arrowhead at start if specified
  if (curvedConnector.arrowStart) {
    // Calculate angle at the start of the curve (derivative at t=0)
    const startAngle = Math.atan2(cp1.y - start.y, cp1.x - start.x);
    renderArrowhead(ctx, start, startAngle + Math.PI, scale, strokeColor);
  }
}
