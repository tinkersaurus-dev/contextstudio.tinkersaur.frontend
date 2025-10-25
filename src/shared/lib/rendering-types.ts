/**
 * Rendering Types
 *
 * Standardized types and interfaces for all rendering operations.
 * Provides consistent context objects for shape, connector, and grid rendering.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { GridConfig } from './grid-system';

/**
 * Base rendering context shared by all renderers
 */
export interface BaseRenderContext {
  /** Canvas rendering context */
  ctx: CanvasRenderingContext2D;
  /** Current canvas scale/zoom level */
  scale: number;
}

/**
 * Context for rendering shapes
 */
export interface ShapeRenderContext extends BaseRenderContext {
  /** Shape to render */
  shape: Shape;
  /** Whether the shape is selected */
  isSelected: boolean;
}

/**
 * Context for rendering connectors
 */
export interface ConnectorRenderContext extends BaseRenderContext {
  /** Connector to render */
  connector: Connector;
  /** Map of shapes for resolving connector endpoints */
  shapes: Map<string, Shape>;
  /** Whether the connector is selected */
  isSelected: boolean;
}

/**
 * Context for rendering the grid
 */
export interface GridRenderContext extends BaseRenderContext {
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Pan offset X */
  panX: number;
  /** Pan offset Y */
  panY: number;
  /** Grid configuration */
  config?: GridConfig;
}

/**
 * Generic entity render context
 * Use this when you need to handle both shapes and connectors
 */
export interface EntityRenderContext extends BaseRenderContext {
  /** Entity to render (shape or connector) */
  entity: Shape | Connector;
  /** Whether the entity is selected */
  isSelected: boolean;
  /** Optional shape dependencies (for connectors) */
  shapes?: Map<string, Shape>;
}

/**
 * Helper to check if an entity is a shape
 */
export function isShape(entity: Shape | Connector): entity is Shape {
  return 'shapeType' in entity;
}

/**
 * Helper to check if an entity is a connector
 */
export function isConnector(entity: Shape | Connector): entity is Connector {
  return 'connectorType' in entity;
}

/**
 * Context for hit testing operations
 * Contains all information needed to test if a point hits an entity
 */
export interface HitTestContext {
  /** Map of shapes (required for connector hit testing) */
  shapes?: Map<string, Shape>;
  /** Hit tolerance in pixels */
  tolerance?: number;
}

/**
 * Context for bounds calculation
 * Required for entities that depend on other entities
 */
export interface BoundsContext {
  /** Map of shapes (required for connector bounds) */
  shapes?: Map<string, Shape>;
}

/**
 * Unified entity context for EntitySystem operations
 * Contains all dependencies that any entity might need
 */
export interface EntityContext {
  /** Canvas rendering context (for render operations) */
  ctx?: CanvasRenderingContext2D;
  /** Current canvas scale (for render operations) */
  scale?: number;
  /** Whether entity is selected (for render operations) */
  isSelected?: boolean;
  /** Map of shapes (for connector operations) */
  shapes?: Map<string, Shape>;
  /** Hit tolerance (for hit test operations) */
  tolerance?: number;
}
