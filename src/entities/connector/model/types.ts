/**
 * Connector Entity Types
 *
 * Defines types and interfaces for connectors (edges/lines) that connect shapes.
 * Connectors are first-class diagram entities alongside shapes.
 */

import { DiagramEntity, DiagramEntityType, Position, Dimensions } from '@/entities/diagram-entity';

/**
 * Connector types define the visual style and routing of connectors
 */
export enum ConnectorType {
  /** Straight line from source to target */
  Straight = 'straight',
  /** Right-angle connector with orthogonal segments */
  Orthogonal = 'orthogonal',
  /** Smooth bezier curve */
  Curved = 'curved',
}

/**
 * Anchor position on a shape for connection points
 * Supports 8 cardinal/ordinal directions plus center
 */
export type AnchorPosition =
  | 'n' // North (top center)
  | 's' // South (bottom center)
  | 'e' // East (right center)
  | 'w' // West (left center)
  | 'ne' // Northeast (top right)
  | 'nw' // Northwest (top left)
  | 'se' // Southeast (bottom right)
  | 'sw' // Southwest (bottom left)
  | 'center'; // Center of shape

/**
 * Connection point - where a connector attaches to a shape
 */
export interface ConnectionPoint {
  /** ID of the shape this connector attaches to */
  shapeId: string;
  /** Anchor position on the shape */
  anchor: AnchorPosition;
}

/**
 * Base interface for all connectors
 * Connectors are a type of DiagramEntity
 */
export interface BaseConnector extends DiagramEntity {
  type: DiagramEntityType.Connector;
  connectorType: ConnectorType;
  /** Source connection point */
  source: ConnectionPoint;
  /** Target connection point */
  target: ConnectionPoint;
  /** Stroke color (defaults to config if not specified) */
  strokeColor?: string;
  /** Stroke width (defaults to config if not specified) */
  strokeWidth?: number;
  /** Show arrowhead at target end */
  arrowEnd?: boolean;
  /** Show arrowhead at source end */
  arrowStart?: boolean;
}

/**
 * Straight line connector
 */
export interface StraightConnector extends BaseConnector {
  connectorType: ConnectorType.Straight;
}

/**
 * Orthogonal (right-angle) connector
 */
export interface OrthogonalConnector extends BaseConnector {
  connectorType: ConnectorType.Orthogonal;
  /** Optional waypoints for custom routing */
  waypoints?: Position[];
}

/**
 * Curved (bezier) connector
 */
export interface CurvedConnector extends BaseConnector {
  connectorType: ConnectorType.Curved;
  /** Curvature factor (0 = straight, 1 = normal curve, >1 = exaggerated) */
  curvature?: number;
}

/**
 * Union type of all connector types
 */
export type Connector = StraightConnector | OrthogonalConnector | CurvedConnector;

/**
 * Type guard to check if an entity is a connector
 */
export function isConnector(entity: DiagramEntity): entity is Connector {
  return entity.type === DiagramEntityType.Connector;
}

/**
 * Type guard to check if a connector is a straight connector
 */
export function isStraightConnector(connector: Connector): connector is StraightConnector {
  return connector.connectorType === ConnectorType.Straight;
}

/**
 * Type guard to check if a connector is an orthogonal connector
 */
export function isOrthogonalConnector(
  connector: Connector
): connector is OrthogonalConnector {
  return connector.connectorType === ConnectorType.Orthogonal;
}

/**
 * Type guard to check if a connector is a curved connector
 */
export function isCurvedConnector(connector: Connector): connector is CurvedConnector {
  return connector.connectorType === ConnectorType.Curved;
}

// Re-export common types for convenience
export type { Position, Dimensions };
