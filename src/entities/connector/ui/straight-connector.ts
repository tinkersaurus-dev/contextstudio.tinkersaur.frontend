/**
 * Straight Connector Renderer
 *
 * Renders a straight line connector between two shapes.
 */

import type { Connector } from '../model/types';
import { isStraightConnector } from '../model/types';
import type { Shape } from '@/entities/shape';
import { renderConnectorBase } from './base-connector-renderer';

/**
 * Render a straight line connector
 *
 * @param ctx - Canvas rendering context
 * @param connector - The connector to render
 * @param shapes - Map of shape ID to shape object
 * @param isSelected - Whether the connector is selected
 * @param scale - Current canvas scale
 * @param themeStrokeColor - Optional default stroke color from theme
 */
export function renderStraightConnector(
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
    isStraightConnector,
    'straight',
    ({ ctx, start, end }) => {
      // Draw the straight line
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      // Calculate angle for arrowheads
      const angle = Math.atan2(end.y - start.y, end.x - start.x);

      return {
        endAngle: angle,
        startAngle: angle + Math.PI,
      };
    }
  );
}
