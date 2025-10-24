/**
 * Connector Factory
 *
 * Factory functions for creating connector instances with sensible defaults.
 */

import type {
  Connector,
  StraightConnector,
  OrthogonalConnector,
  CurvedConnector,
  ConnectionPoint,
} from '../../model/types';
import { ConnectorType } from '../../model/types';
import { DiagramEntityType } from '@/entities/diagram-entity';
import { generateEntityId } from '@/shared/lib/id-generator';
import { CANVAS_COLORS, STROKE_WIDTHS } from '@/shared/config/canvas-config';

/**
 * Options for creating a connector
 */
export interface ConnectorCreationOptions {
  /** Source connection point */
  source: ConnectionPoint;
  /** Target connection point */
  target: ConnectionPoint;
  /** Connector type (defaults to straight) */
  connectorType?: ConnectorType;
  /** Stroke color (defaults to config) */
  strokeColor?: string;
  /** Stroke width (defaults to config) */
  strokeWidth?: number;
  /** Show arrowhead at target end */
  arrowEnd?: boolean;
  /** Show arrowhead at source end */
  arrowStart?: boolean;
  /** Curvature for curved connectors */
  curvature?: number;
}

/**
 * Create a connector with the specified options
 *
 * @param options - Connector creation options
 * @returns A new connector instance
 *
 * @example
 * const connector = createConnector({
 *   source: { shapeId: 'shape-1', anchor: 'e' },
 *   target: { shapeId: 'shape-2', anchor: 'w' },
 *   connectorType: ConnectorType.Straight,
 *   arrowEnd: true,
 * });
 */
export function createConnector(options: ConnectorCreationOptions): Connector {
  const {
    source,
    target,
    connectorType = ConnectorType.Straight,
    strokeColor = CANVAS_COLORS.connectorStroke,
    strokeWidth = STROKE_WIDTHS.connector,
    arrowEnd = true,
    arrowStart = false,
    curvature = 1.0,
  } = options;

  // Generate unique ID
  const id = generateEntityId('connector');

  // Base connector properties
  const baseConnector = {
    id,
    type: DiagramEntityType.Connector,
    source,
    target,
    strokeColor,
    strokeWidth,
    arrowEnd,
    arrowStart,
    // Position and dimensions will be calculated when rendering
    // based on connected shapes
    position: { x: 0, y: 0 },
    dimensions: { width: 0, height: 0 },
  };

  // Create specific connector type
  switch (connectorType) {
    case ConnectorType.Straight:
      return {
        ...baseConnector,
        connectorType: ConnectorType.Straight,
      } as StraightConnector;

    case ConnectorType.Orthogonal:
      return {
        ...baseConnector,
        connectorType: ConnectorType.Orthogonal,
        waypoints: [],
      } as OrthogonalConnector;

    case ConnectorType.Curved:
      return {
        ...baseConnector,
        connectorType: ConnectorType.Curved,
        curvature,
      } as CurvedConnector;

    default:
      throw new Error(`Unknown connector type: ${connectorType}`);
  }
}

/**
 * Create a straight line connector
 *
 * @param source - Source connection point
 * @param target - Target connection point
 * @param options - Additional options
 * @returns A new straight connector
 */
export function createStraightConnector(
  source: ConnectionPoint,
  target: ConnectionPoint,
  options: Partial<ConnectorCreationOptions> = {}
): StraightConnector {
  return createConnector({
    source,
    target,
    connectorType: ConnectorType.Straight,
    ...options,
  }) as StraightConnector;
}

/**
 * Create an orthogonal (right-angle) connector
 *
 * @param source - Source connection point
 * @param target - Target connection point
 * @param options - Additional options
 * @returns A new orthogonal connector
 */
export function createOrthogonalConnector(
  source: ConnectionPoint,
  target: ConnectionPoint,
  options: Partial<ConnectorCreationOptions> = {}
): OrthogonalConnector {
  return createConnector({
    source,
    target,
    connectorType: ConnectorType.Orthogonal,
    ...options,
  }) as OrthogonalConnector;
}

/**
 * Create a curved (bezier) connector
 *
 * @param source - Source connection point
 * @param target - Target connection point
 * @param options - Additional options
 * @returns A new curved connector
 */
export function createCurvedConnector(
  source: ConnectionPoint,
  target: ConnectionPoint,
  options: Partial<ConnectorCreationOptions> = {}
): CurvedConnector {
  return createConnector({
    source,
    target,
    connectorType: ConnectorType.Curved,
    ...options,
  }) as CurvedConnector;
}
