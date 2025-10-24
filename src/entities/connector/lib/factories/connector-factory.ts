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
import { Result, ok, err } from '@/shared/lib/result';
import { validateConnector } from '@/shared/lib/entity-validation';

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
 * @returns A Result containing the new connector or an error message
 *
 * @example
 * ```typescript
 * const result = createConnector({
 *   source: { shapeId: 'shape-1', anchor: 'e' },
 *   target: { shapeId: 'shape-2', anchor: 'w' },
 *   connectorType: ConnectorType.Straight,
 *   arrowEnd: true,
 * });
 *
 * if (result.ok) {
 *   // Use result.value
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function createConnector(options: ConnectorCreationOptions): Result<Connector> {
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
  let connector: Connector;
  switch (connectorType) {
    case ConnectorType.Straight:
      connector = {
        ...baseConnector,
        connectorType: ConnectorType.Straight,
      } as StraightConnector;
      break;

    case ConnectorType.Orthogonal:
      connector = {
        ...baseConnector,
        connectorType: ConnectorType.Orthogonal,
        waypoints: [],
      } as OrthogonalConnector;
      break;

    case ConnectorType.Curved:
      connector = {
        ...baseConnector,
        connectorType: ConnectorType.Curved,
        curvature,
      } as CurvedConnector;
      break;

    default:
      return err(`Unknown connector type: ${connectorType}`);
  }

  // Validate the created connector
  const validationResult = validateConnector(connector);
  if (!validationResult.valid) {
    return err(`Connector validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(connector);
}

/**
 * Create a straight line connector
 *
 * @param source - Source connection point
 * @param target - Target connection point
 * @param options - Additional options
 * @returns A Result containing the new straight connector or an error
 */
export function createStraightConnector(
  source: ConnectionPoint,
  target: ConnectionPoint,
  options: Partial<ConnectorCreationOptions> = {}
): Result<StraightConnector> {
  const result = createConnector({
    source,
    target,
    connectorType: ConnectorType.Straight,
    ...options,
  });

  if (!result.ok) {
    return result;
  }

  return ok(result.value as StraightConnector);
}

/**
 * Create an orthogonal (right-angle) connector
 *
 * @param source - Source connection point
 * @param target - Target connection point
 * @param options - Additional options
 * @returns A Result containing the new orthogonal connector or an error
 */
export function createOrthogonalConnector(
  source: ConnectionPoint,
  target: ConnectionPoint,
  options: Partial<ConnectorCreationOptions> = {}
): Result<OrthogonalConnector> {
  const result = createConnector({
    source,
    target,
    connectorType: ConnectorType.Orthogonal,
    ...options,
  });

  if (!result.ok) {
    return result;
  }

  return ok(result.value as OrthogonalConnector);
}

/**
 * Create a curved (bezier) connector
 *
 * @param source - Source connection point
 * @param target - Target connection point
 * @param options - Additional options
 * @returns A Result containing the new curved connector or an error
 */
export function createCurvedConnector(
  source: ConnectionPoint,
  target: ConnectionPoint,
  options: Partial<ConnectorCreationOptions> = {}
): Result<CurvedConnector> {
  const result = createConnector({
    source,
    target,
    connectorType: ConnectorType.Curved,
    ...options,
  });

  if (!result.ok) {
    return result;
  }

  return ok(result.value as CurvedConnector);
}
