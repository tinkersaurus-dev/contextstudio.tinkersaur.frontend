/**
 * Connector Registry Pattern
 *
 * Provides an extensible registry for connector renderers. This allows new connector types
 * to be added without modifying the core rendering logic (Open/Closed Principle).
 */

import { ConnectorType, type Connector } from '../model/types';
import type { Shape } from '@/entities/shape';
import { renderStraightConnector } from '../ui/straight-connector';
import { renderOrthogonalConnector } from '../ui/orthogonal-connector';
import { renderCurvedConnector } from '../ui/curved-connector';

/**
 * Connector renderer function signature
 */
export type ConnectorRenderer = (
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Map<string, Shape>,
  isSelected: boolean,
  scale: number
) => void;

/**
 * Connector registry entry
 */
interface ConnectorRegistryEntry {
  type: ConnectorType;
  renderer: ConnectorRenderer;
  displayName: string;
}

/**
 * Connector registry - maps connector types to their renderers
 */
class ConnectorRegistry {
  private registry: Map<ConnectorType, ConnectorRegistryEntry>;

  constructor() {
    this.registry = new Map();
    this.registerDefaultConnectors();
  }

  /**
   * Register default built-in connectors
   */
  private registerDefaultConnectors(): void {
    this.register(ConnectorType.Straight, renderStraightConnector, 'Straight Line');
    this.register(
      ConnectorType.Orthogonal,
      renderOrthogonalConnector,
      'Orthogonal (Right-Angle)'
    );
    this.register(ConnectorType.Curved, renderCurvedConnector, 'Curved (Bezier)');
  }

  /**
   * Register a new connector renderer
   *
   * @param type - Connector type enum value
   * @param renderer - Renderer function for this connector
   * @param displayName - Human-readable name for the connector
   *
   * @example
   * connectorRegistry.register(ConnectorType.Custom, renderCustom, 'Custom');
   */
  register(
    type: ConnectorType,
    renderer: ConnectorRenderer,
    displayName: string
  ): void {
    this.registry.set(type, {
      type,
      renderer,
      displayName,
    });
  }

  /**
   * Get renderer for a connector type
   *
   * @param type - Connector type to get renderer for
   * @returns Renderer function or undefined if not registered
   *
   * @example
   * const renderer = connectorRegistry.getRenderer(ConnectorType.Straight);
   * if (renderer) {
   *   renderer(ctx, connector, shapes, isSelected, scale);
   * }
   */
  getRenderer(type: ConnectorType): ConnectorRenderer | undefined {
    return this.registry.get(type)?.renderer;
  }

  /**
   * Check if a connector type is registered
   *
   * @param type - Connector type to check
   * @returns True if registered, false otherwise
   */
  hasRenderer(type: ConnectorType): boolean {
    return this.registry.has(type);
  }

  /**
   * Get display name for a connector type
   *
   * @param type - Connector type
   * @returns Display name or undefined if not registered
   */
  getDisplayName(type: ConnectorType): string | undefined {
    return this.registry.get(type)?.displayName;
  }

  /**
   * Get all registered connector types
   *
   * @returns Array of registered connector types
   */
  getAllConnectorTypes(): ConnectorType[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get all registry entries
   *
   * @returns Array of all registry entries
   */
  getAllEntries(): ConnectorRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Unregister a connector renderer
   *
   * @param type - Connector type to unregister
   * @returns True if unregistered, false if wasn't registered
   */
  unregister(type: ConnectorType): boolean {
    return this.registry.delete(type);
  }

  /**
   * Clear all registrations (except default connectors)
   */
  reset(): void {
    this.registry.clear();
    this.registerDefaultConnectors();
  }
}

/**
 * Global connector registry instance
 */
export const connectorRegistry = new ConnectorRegistry();

/**
 * Render a connector using the registry
 *
 * @param ctx - Canvas rendering context
 * @param connector - Connector to render
 * @param shapes - Map of shape ID to shape object
 * @param isSelected - Whether the connector is selected
 * @param scale - Current canvas scale
 *
 * @example
 * renderConnectorFromRegistry(ctx, connector, shapes, isSelected, scale);
 */
export function renderConnectorFromRegistry(
  ctx: CanvasRenderingContext2D,
  connector: Connector,
  shapes: Map<string, Shape>,
  isSelected: boolean,
  scale: number
): void {
  const renderer = connectorRegistry.getRenderer(connector.connectorType);

  if (renderer) {
    renderer(ctx, connector, shapes, isSelected, scale);
  } else {
    console.warn(`No renderer registered for connector type: ${connector.connectorType}`);
  }
}
