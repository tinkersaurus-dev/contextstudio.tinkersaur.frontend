/**
 * Base Connector Renderer Utilities
 *
 * Shared utilities to reduce duplication across connector renderer functions.
 * Centralizes common patterns like type validation, endpoint retrieval,
 * color/stroke determination, and arrowhead rendering.
 */

import type { Connector } from '../model/types';
import type { Shape } from '@/entities/shape';
import type { Position } from '@/entities/diagram-entity';
import { getConnectorEndpoints } from '../lib/connector-geometry';
import {
  renderArrowhead,
  getConnectorStrokeColor,
  getConnectorStrokeWidth,
} from './connector-rendering-utils';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

/**
 * Configuration for rendering a connector's path
 */
export interface ConnectorRenderConfig {
  /** Canvas rendering context */
  ctx: CanvasRenderingContext2D;
  /** The connector being rendered */
  connector: Connector;
  /** Start position of the connector */
  start: Position;
  /** End position of the connector */
  end: Position;
  /** Current canvas scale */
  scale: number;
  /** Determined stroke color */
  strokeColor: string;
  /** Determined stroke width */
  strokeWidth: number;
}

/**
 * Type guard function signature
 */
export type ConnectorTypeGuard<T extends Connector> = (connector: Connector) => connector is T;

/**
 * Path rendering function signature
 * This function is responsible for drawing the specific connector path
 * (straight line, orthogonal segments, bezier curve, etc.)
 */
export type PathRenderer = (config: ConnectorRenderConfig) => {
  /** Angle at the end of the path for arrowhead rendering */
  endAngle: number;
  /** Angle at the start of the path for arrowhead rendering */
  startAngle: number;
};

/**
 * Render a connector using a base wrapper that handles common operations
 *
 * This utility function eliminates duplication across connector renderers by:
 * - Type guard validation
 * - Endpoint retrieval with early return
 * - Color and stroke width determination
 * - Canvas context setup
 * - Arrowhead rendering at start and end
 *
 * @param ctx - Canvas rendering context
 * @param connector - The connector to render
 * @param shapes - Map of shape ID to shape object
 * @param isSelected - Whether the connector is selected
 * @param scale - Current canvas scale
 * @param themeStrokeColor - Optional default stroke color from theme
 * @param typeGuard - Type guard function to validate connector type
 * @param typeName - Human-readable type name for error messages
 * @param renderPath - Function to render the specific connector path
 *
 * @example
 * ```typescript
 * export function renderStraightConnector(
 *   ctx: CanvasRenderingContext2D,
 *   connector: Connector,
 *   shapes: Map<string, Shape>,
 *   isSelected: boolean,
 *   scale: number,
 *   themeStrokeColor?: string
 * ): void {
 *   renderConnectorBase(
 *     ctx,
 *     connector,
 *     shapes,
 *     isSelected,
 *     scale,
 *     themeStrokeColor,
 *     isStraightConnector,
 *     'straight',
 *     (config) => {
 *       const { ctx, start, end } = config;
 *       ctx.beginPath();
 *       ctx.moveTo(start.x, start.y);
 *       ctx.lineTo(end.x, end.y);
 *       ctx.stroke();
 *
 *       const angle = Math.atan2(end.y - start.y, end.x - start.x);
 *       return { endAngle: angle, startAngle: angle + Math.PI };
 *     }
 *   );
 * }
 * ```
 */
export function renderConnectorBase<T extends Connector>(
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Map<string, Shape>,
  isSelected: boolean,
  scale: number,
  themeStrokeColor: string | undefined,
  typeGuard: ConnectorTypeGuard<T>,
  typeName: string,
  renderPath: PathRenderer
): void {
  // Type guard validation
  if (!typeGuard(connector)) {
    console.error(
      `render${typeName.charAt(0).toUpperCase() + typeName.slice(1)}Connector called with non-${typeName} connector:`,
      connector
    );
    return;
  }

  // Get actual endpoints from connected shapes
  const endpoints = getConnectorEndpoints(connector, shapes);

  if (!endpoints) {
    // Cannot render if shapes are missing
    return;
  }

  const { start, end } = endpoints;

  // Determine stroke color and width with theme colors
  const strokeColor = getConnectorStrokeColor(connector, isSelected, themeStrokeColor);
  const strokeWidth = getConnectorStrokeWidth(connector, isSelected);

  // Set up canvas context
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);

  // Render the specific connector path and get angles for arrowheads
  const { endAngle, startAngle } = renderPath({
    ctx,
    connector,
    start,
    end,
    scale,
    strokeColor,
    strokeWidth,
  });

  // Render arrowhead at end if specified
  if (connector.arrowEnd) {
    renderArrowhead(ctx, end, endAngle, scale, strokeColor);
  }

  // Render arrowhead at start if specified
  if (connector.arrowStart) {
    renderArrowhead(ctx, start, startAngle, scale, strokeColor);
  }
}
