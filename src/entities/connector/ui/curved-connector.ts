/**
 * Curved Connector Renderer
 *
 * Renders a smooth bezier curve connector between two shapes.
 */

import type { Connector } from '../model/types';
import { isCurvedConnector } from '../model/types';
import type { Shape } from '@/entities/shape';
import { generateCurveControlPoints } from '../lib/connector-geometry';
import { renderConnectorBase } from './base-connector-renderer';

/**
 * Render a curved (bezier) connector
 *
 * @param ctx - Canvas rendering context
 * @param connector - The connector to render
 * @param shapes - Map of shape ID to shape object
 * @param isSelected - Whether the connector is selected
 * @param scale - Current canvas scale
 * @param themeStrokeColor - Optional default stroke color from theme
 */
export function renderCurvedConnector(
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Map<string, Shape>,
  isSelected: boolean,
  scale: number,
  themeStrokeColor?: string
): void {
  renderConnectorBase(
    ctx,
    connector,
    shapes,
    isSelected,
    scale,
    themeStrokeColor,
    isCurvedConnector,
    'curved',
    ({ ctx, connector, start, end }) => {
      // Type assertion is safe because renderConnectorBase validates the type
      const curvedConnector = connector as Extract<
        typeof connector,
        { connectorType: 'curved' }
      >;

      // Generate control points for bezier curve
      const curvature = curvedConnector.curvature ?? 1.0;
      const [cp1, cp2] = generateCurveControlPoints(start, end, curvature);

      // Draw the bezier curve
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
      ctx.stroke();

      // Calculate angles at the curve endpoints for arrowheads
      // Use the tangent at the endpoint (derivative of bezier curve at t=1)
      const endAngle = Math.atan2(end.y - cp2.y, end.x - cp2.x);
      // Calculate angle at the start of the curve (derivative at t=0)
      const startAngle = Math.atan2(cp1.y - start.y, cp1.x - start.x) + Math.PI;

      return { endAngle, startAngle };
    }
  );
}
