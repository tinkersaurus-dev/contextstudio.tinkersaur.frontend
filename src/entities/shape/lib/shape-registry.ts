/**
 * Shape Registry Pattern
 *
 * Provides an extensible registry for shape renderers. This allows new shape types
 * to be added without modifying the core rendering logic (Open/Closed Principle).
 */

import { ShapeType, type BaseShape } from '../model/types';
import { renderRectangle } from '../ui/rectangle-shape';

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
  type: ShapeType;
  renderer: ShapeRenderer;
  displayName: string;
}

/**
 * Shape registry - maps shape types to their renderers
 */
class ShapeRegistry {
  private registry: Map<ShapeType, ShapeRegistryEntry>;

  constructor() {
    this.registry = new Map();
    this.registerDefaultShapes();
  }

  /**
   * Register default built-in shapes
   */
  private registerDefaultShapes(): void {
    this.register(ShapeType.Rectangle, renderRectangle, 'Rectangle');
  }

  /**
   * Register a new shape renderer
   *
   * @param type - Shape type enum value
   * @param renderer - Renderer function for this shape
   * @param displayName - Human-readable name for the shape
   *
   * @example
   * shapeRegistry.register(ShapeType.Circle, renderCircle, 'Circle');
   */
  register(type: ShapeType, renderer: ShapeRenderer, displayName: string): void {
    this.registry.set(type, {
      type,
      renderer,
      displayName,
    });
  }

  /**
   * Get renderer for a shape type
   *
   * @param type - Shape type to get renderer for
   * @returns Renderer function or undefined if not registered
   *
   * @example
   * const renderer = shapeRegistry.getRenderer(ShapeType.Rectangle);
   * if (renderer) {
   *   renderer(ctx, shape, isSelected, scale);
   * }
   */
  getRenderer(type: ShapeType): ShapeRenderer | undefined {
    return this.registry.get(type)?.renderer;
  }

  /**
   * Check if a shape type is registered
   *
   * @param type - Shape type to check
   * @returns True if registered, false otherwise
   */
  hasRenderer(type: ShapeType): boolean {
    return this.registry.has(type);
  }

  /**
   * Get display name for a shape type
   *
   * @param type - Shape type
   * @returns Display name or undefined if not registered
   */
  getDisplayName(type: ShapeType): string | undefined {
    return this.registry.get(type)?.displayName;
  }

  /**
   * Get all registered shape types
   *
   * @returns Array of registered shape types
   */
  getAllShapeTypes(): ShapeType[] {
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
   * @param type - Shape type to unregister
   * @returns True if unregistered, false if wasn't registered
   */
  unregister(type: ShapeType): boolean {
    return this.registry.delete(type);
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
  const renderer = shapeRegistry.getRenderer(shape.shapeType);

  if (renderer) {
    renderer(ctx, shape, isSelected, scale);
  } else {
    console.warn(`No renderer registered for shape type: ${shape.shapeType}`);
  }
}
