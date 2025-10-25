/**
 * Entity Interfaces
 *
 * Behavioral interfaces that define entity capabilities.
 * These provide a contract for what operations entities support.
 */

import type { Bounds, BoundsContext } from './entity-bounds';
import type { ValidationResult } from './result';

/**
 * Context for rendering operations
 * Contains all information needed to render an entity
 */
export interface RenderContext {
  /** Canvas rendering context */
  ctx: CanvasRenderingContext2D;
  /** Current canvas scale/zoom level */
  scale: number;
  /** Whether the entity is currently selected */
  isSelected: boolean;
  /** Optional dependencies (e.g., shapes map for connectors) */
  dependencies?: unknown;
}

/**
 * Context for hit testing operations
 * Contains information needed to test if a point hits an entity
 */
export interface HitTestContext {
  /** Optional dependencies for complex hit testing (e.g., shapes for connectors) */
  dependencies?: unknown;
  /** Hit tolerance in pixels (default varies by entity type) */
  tolerance?: number;
}

/**
 * Renderable interface
 * Entities that can be drawn to a canvas
 */
export interface Renderable {
  /**
   * Render the entity to a canvas
   * @param context - Rendering context
   */
  render(context: RenderContext): void;
}

/**
 * HitTestable interface
 * Entities that support point-based collision detection
 */
export interface HitTestable {
  /**
   * Test if a point hits this entity
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @param context - Optional hit test context
   * @returns True if the point hits the entity
   */
  hitTest(x: number, y: number, context?: HitTestContext): boolean;
}

/**
 * Bounded interface
 * Entities that have a calculable bounding box
 */
export interface Bounded {
  /**
   * Get the entity's bounding box
   * @param context - Optional context for bounds calculation
   * @returns The entity's bounding box
   */
  getBounds(context?: BoundsContext): Bounds;
}

/**
 * Validatable interface
 * Entities that can be validated for integrity
 */
export interface Validatable {
  /**
   * Validate the entity's data integrity
   * @param context - Optional validation context
   * @returns Validation result with any errors
   */
  validate(context?: ValidationContext): ValidationResult;
}

/**
 * Context for validation operations
 */
export interface ValidationContext {
  /** Optional dependencies for validation (e.g., shapes for connector validation) */
  dependencies?: unknown;
  /** Whether to perform strict validation */
  strict?: boolean;
}

/**
 * Selectable interface
 * Entities that can be selected by users
 */
export interface Selectable {
  /** Unique identifier for selection tracking */
  id: string;
  /** Whether the entity is currently selected */
  isSelected?: boolean;
}

/**
 * Movable interface
 * Entities that can be repositioned
 */
export interface Movable {
  /** Current position */
  position: { x: number; y: number };
  /**
   * Move the entity by a delta
   * @param dx - Delta X
   * @param dy - Delta Y
   */
  move?(dx: number, dy: number): void;
}

/**
 * Clonable interface
 * Entities that can be duplicated
 */
export interface Clonable<T> {
  /**
   * Create a copy of the entity
   * @param overrides - Optional property overrides
   * @returns Cloned entity
   */
  clone(overrides?: Partial<T>): T;
}

/**
 * Complete entity interface
 * An entity that implements all standard behaviors
 */
export interface FullEntity
  extends Renderable,
    HitTestable,
    Bounded,
    Validatable,
    Selectable,
    Movable {}

/**
 * Entity operation result
 * Used for operations that may succeed or fail
 */
export interface EntityOperationResult<T = void> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Result data if successful */
  data?: T;
  /** Error message if failed */
  error?: string;
}
