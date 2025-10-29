/**
 * Shape Registry Pattern
 *
 * Provides an extensible registry for shape renderers. This allows new shape types
 * to be added without modifying the core rendering logic (Open/Closed Principle).
 *
 * Supports composite type:subType keys with fallback to base type rendering.
 */

import { type BaseShape, getShapeKey, ShapeType } from '../model/types';
import { renderRectangle } from '../ui/rectangle-shape';
import { renderTask } from '../ui/task-shape';
import { renderEvent } from '../ui/event-shape';
import { renderGateway } from '../ui/gateway-shape';
import { renderPool } from '../ui/pool-shape';

/**
 * Shape renderer function signature
 */
export type ShapeRenderer = (
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
) => void;

/**
 * Shape registry entry
 */
interface ShapeRegistryEntry {
  key: string; // Can be "type" or "type:subType"
  renderer: ShapeRenderer;
  displayName: string;
}

/**
 * Shape registry - maps shape types (and subtypes) to their renderers
 * Supports composite keys like "event:start" with fallback to base type "event"
 */
class ShapeRegistry {
  private registry: Map<string, ShapeRegistryEntry>;

  constructor() {
    this.registry = new Map();
    this.registerDefaultShapes();
  }

  /**
   * Register default built-in shapes
   */
  private registerDefaultShapes(): void {
    // Register base types
    this.register('rectangle', renderRectangle, 'Rectangle');
    this.register('task', renderTask, 'Task');
    this.register('event', renderEvent, 'Event');
    this.register('gateway', renderGateway, 'Gateway');
    this.register('pool', renderPool, 'Pool');

    // Optionally register specific event subtypes with same renderer
    // (they share the base renderer which handles subtypes internally)
    this.register('event:start', renderEvent, 'Start Event');
    this.register('event:end', renderEvent, 'End Event');
    this.register('event:intermediate', renderEvent, 'Intermediate Event');
  }

  /**
   * Register a new shape renderer
   *
   * @param key - Shape type key (e.g., "task" or "event:start")
   * @param renderer - Renderer function for this shape
   * @param displayName - Human-readable name for the shape
   *
   * @example
   * shapeRegistry.register('task:user', renderUserTask, 'User Task');
   * shapeRegistry.register('event:timer', renderEvent, 'Timer Event');
   */
  register(key: string, renderer: ShapeRenderer, displayName: string): void {
    this.registry.set(key, {
      key,
      renderer,
      displayName,
    });
  }

  /**
   * Register using legacy ShapeType enum (for backward compatibility)
   * @deprecated Use string-based register method instead
   */
  registerLegacy(type: ShapeType, renderer: ShapeRenderer, displayName: string): void {
    this.registry.set(type, {
      key: type,
      renderer,
      displayName,
    });
  }

  /**
   * Get renderer for a shape by key (with fallback to base type)
   *
   * @param key - Shape key (e.g., "event:start" or just "event")
   * @returns Renderer function or undefined if not registered
   *
   * @example
   * const renderer = shapeRegistry.getRenderer('event:start');
   * // Falls back to 'event' if 'event:start' not found
   */
  getRenderer(key: string): ShapeRenderer | undefined {
    // Try exact match first
    let entry = this.registry.get(key);

    // If not found and key contains ':', try base type
    if (!entry && key.includes(':')) {
      const baseType = key.split(':')[0];
      entry = this.registry.get(baseType);
    }

    return entry?.renderer;
  }

  /**
   * Get renderer for a shape object
   */
  getRendererForShape(shape: BaseShape): ShapeRenderer | undefined {
    const key = getShapeKey(shape);
    return this.getRenderer(key);
  }

  /**
   * Check if a renderer is registered for a key
   *
   * @param key - Shape key to check
   * @returns True if registered (including fallback), false otherwise
   */
  hasRenderer(key: string): boolean {
    if (this.registry.has(key)) {
      return true;
    }

    // Check base type fallback
    if (key.includes(':')) {
      const baseType = key.split(':')[0];
      return this.registry.has(baseType);
    }

    return false;
  }

  /**
   * Get display name for a shape key
   *
   * @param key - Shape key
   * @returns Display name or undefined if not registered
   */
  getDisplayName(key: string): string | undefined {
    const entry = this.registry.get(key);
    if (entry) {
      return entry.displayName;
    }

    // Try base type fallback
    if (key.includes(':')) {
      const baseType = key.split(':')[0];
      return this.registry.get(baseType)?.displayName;
    }

    return undefined;
  }

  /**
   * Get all registered shape keys
   *
   * @returns Array of registered shape keys
   */
  getAllShapeKeys(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get all registry entries
   *
   * @returns Array of all registry entries
   */
  getAllEntries(): ShapeRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  /**
   * Unregister a shape renderer
   *
   * @param key - Shape key to unregister
   * @returns True if unregistered, false if wasn't registered
   */
  unregister(key: string): boolean {
    return this.registry.delete(key);
  }

  /**
   * Clear all registrations (except default shapes)
   */
  reset(): void {
    this.registry.clear();
    this.registerDefaultShapes();
  }
}

/**
 * Global shape registry instance
 */
export const shapeRegistry = new ShapeRegistry();

/**
 * Render a shape using the registry
 * Automatically handles composite type:subType keys with fallback to base type
 *
 * @param ctx - Canvas rendering context
 * @param shape - Shape to render
 * @param isSelected - Whether the shape is selected
 * @param scale - Current canvas scale
 *
 * @example
 * renderShapeFromRegistry(ctx, shape, isSelected, scale);
 */
export function renderShapeFromRegistry(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number
): void {
  const renderer = shapeRegistry.getRendererForShape(shape);

  if (renderer) {
    renderer(ctx, shape, isSelected, scale);
  } else {
    const key = getShapeKey(shape);
    console.warn(`No renderer registered for shape key: ${key}`);
  }
}
