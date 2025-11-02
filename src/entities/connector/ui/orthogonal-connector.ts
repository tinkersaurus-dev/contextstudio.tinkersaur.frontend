/**
 * Orthogonal Connector Renderer
 *
 * Renders a right-angle connector with horizontal and vertical segments.
 */

import type { Connector } from '../model/types';
import { isOrthogonalConnector } from '../model/types';
import type { Shape } from '@/entities/shape';
import type { Position } from '@/entities/diagram-entity';
import { getConnectorEndpoints, generateOrthogonalPath } from '../lib/connector-geometry';
import {
  renderArrowhead,
  getConnectorStrokeColor,
  getConnectorStrokeWidth,
} from './connector-rendering-utils';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

/**
 * Render an orthogonal (right-angle) connector
 *
 * @param ctx - Canvas rendering context
 * @param connector - The connector to render
 * @param shapes - Map of shape ID to shape object
 * @param isSelected - Whether the connector is selected
 * @param scale - Current canvas scale
 * @param themeStrokeColor - Optional default stroke color from theme
 */
export function renderOrthogonalConnector(
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Map<string, Shape>,
  isSelected: boolean,
  scale: number,
  themeStrokeColor?: string
): void {
  if (!isOrthogonalConnector(connector)) {
    console.error('renderOrthogonalConnector called with non-orthogonal connector:', connector);
    return;
  }

  const orthogonalConnector = connector;

  // Get actual endpoints from connected shapes
  const endpoints = getConnectorEndpoints(orthogonalConnector, shapes);

  if (!endpoints) {
    // Cannot render if shapes are missing
    return;
  }

  const { start, end } = endpoints;

  // Generate path (use custom waypoints if specified, otherwise auto-generate)
  let path: Position[];
  if (orthogonalConnector.waypoints && orthogonalConnector.waypoints.length > 0) {
    path = [start, ...orthogonalConnector.waypoints, end];
  } else {
    // Pass anchor information for intelligent routing
    path = generateOrthogonalPath(
      start,
      end,
      orthogonalConnector.source.anchor,
      orthogonalConnector.target.anchor
    );
  }

  // Determine stroke color and width with theme colors
  const strokeColor = getConnectorStrokeColor(orthogonalConnector, isSelected, themeStrokeColor);
  const strokeWidth = getConnectorStrokeWidth(orthogonalConnector, isSelected);

  // Draw the path
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);
  ctx.stroke();

  // Calculate angle for arrowheads based on last segment
  const lastSegment = {
    start: path[path.length - 2],
    end: path[path.length - 1],
  };

  const endAngle = Math.atan2(
    lastSegment.end.y - lastSegment.start.y,
    lastSegment.end.x - lastSegment.start.x
  );

  // Render arrowhead at end if specified
  if (orthogonalConnector.arrowEnd) {
    renderArrowhead(ctx, end, endAngle, scale, strokeColor);
  }

  // Render arrowhead at start if specified
  if (orthogonalConnector.arrowStart) {
    const firstSegment = {
      start: path[0],
      end: path[1],
    };

    const startAngle = Math.atan2(
      firstSegment.end.y - firstSegment.start.y,
      firstSegment.end.x - firstSegment.start.x
    );

    renderArrowhead(ctx, start, startAngle + Math.PI, scale, strokeColor);
  }
}
