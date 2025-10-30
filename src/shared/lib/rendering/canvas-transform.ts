/**
 * Canvas Transform System
 *
 * Encapsulates all coordinate transformation logic for the diagram canvas.
 * This class provides a unified API for:
 * - Converting between screen and world coordinates
 * - Zooming to a specific point
 * - Panning the canvas
 * - Applying transformations to canvas context
 *
 * @example
 * const transform = new CanvasTransform(1.0, 0, 0);
 * const worldPos = transform.screenToWorld(100, 200);
 * const newTransform = transform.zoom({ x: 100, y: 200 }, 0.1, 0.1, 5.0);
 */

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * Optional pan limits to restrict how far the user can pan
 */
export interface PanLimits {
  /** Minimum horizontal pan offset (most negative value) */
  minPanX?: number;
  /** Maximum horizontal pan offset (most positive value) */
  maxPanX?: number;
  /** Minimum vertical pan offset (most negative value) */
  minPanY?: number;
  /** Maximum vertical pan offset (most positive value) */
  maxPanY?: number;
}

/**
 * Immutable canvas transform system
 *
 * Represents the current view transformation state (zoom and pan).
 * All mutation methods return a new instance - the original is never modified.
 */
export class CanvasTransform {
  /**
   * Create a new canvas transform
   *
   * @param scale - Zoom level (1.0 = 100%, 2.0 = 200%, 0.5 = 50%)
   * @param panX - Horizontal pan offset in screen pixels
   * @param panY - Vertical pan offset in screen pixels
   * @param panLimits - Optional limits to restrict panning
   */
  constructor(
    public readonly scale: number,
    public readonly panX: number,
    public readonly panY: number,
    public readonly panLimits?: PanLimits
  ) {}

  /**
   * Create a default transform with no zoom or pan
   *
   * @param panLimits - Optional pan limits
   */
  static identity(panLimits?: PanLimits): CanvasTransform {
    return new CanvasTransform(1.0, 0, 0, panLimits);
  }

  /**
   * Create a transform from a plain object
   *
   * @param data - Transform data
   * @param panLimits - Optional pan limits
   */
  static from(
    data: { scale: number; panX: number; panY: number },
    panLimits?: PanLimits
  ): CanvasTransform {
    return new CanvasTransform(data.scale, data.panX, data.panY, panLimits);
  }

  /**
   * Clamp pan values to limits
   *
   * @param panX - Horizontal pan offset
   * @param panY - Vertical pan offset
   * @returns Clamped pan values
   */
  private clampPan(panX: number, panY: number): Point {
    const limits = this.panLimits;
    if (!limits) {
      return { x: panX, y: panY };
    }

    return {
      x: Math.max(
        limits.minPanX ?? -Infinity,
        Math.min(limits.maxPanX ?? Infinity, panX)
      ),
      y: Math.max(
        limits.minPanY ?? -Infinity,
        Math.min(limits.maxPanY ?? Infinity, panY)
      ),
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   *
   * Screen coordinates are pixel positions on the canvas element.
   * World coordinates are the logical diagram coordinates.
   *
   * @param screenX - X coordinate in screen space
   * @param screenY - Y coordinate in screen space
   * @returns Point in world coordinates
   *
   * @example
   * const transform = new CanvasTransform(2.0, 50, 100);
   * const worldPos = transform.screenToWorld(100, 200);
   * // worldPos = { x: 25, y: 50 }
   */
  screenToWorld(screenX: number, screenY: number): Point {
    return {
      x: (screenX - this.panX) / this.scale,
      y: (screenY - this.panY) / this.scale,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @returns Point in screen coordinates
   *
   * @example
   * const transform = new CanvasTransform(2.0, 50, 100);
   * const screenPos = transform.worldToScreen(25, 50);
   * // screenPos = { x: 100, y: 200 }
   */
  worldToScreen(worldX: number, worldY: number): Point {
    return {
      x: worldX * this.scale + this.panX,
      y: worldY * this.scale + this.panY,
    };
  }

  /**
   * Calculate zoom-to-point transformation
   *
   * Zooms toward a specific point while keeping that point stationary under the cursor.
   * This creates an intuitive zoom experience where the content under the mouse stays in place.
   *
   * @param mousePos - Mouse position in screen coordinates
   * @param zoomDelta - Change in zoom level (positive = zoom in, negative = zoom out)
   * @param minScale - Minimum allowed scale
   * @param maxScale - Maximum allowed scale
   * @returns New transform state, or this if zoom didn't change
   *
   * @example
   * const transform = new CanvasTransform(1.0, 0, 0);
   * const newTransform = transform.zoom(
   *   { x: 400, y: 300 },
   *   0.1, // zoom in by 0.1
   *   0.1, // min 10%
   *   5.0  // max 500%
   * );
   */
  zoom(mousePos: Point, zoomDelta: number, minScale: number, maxScale: number): CanvasTransform {
    // Clamp new zoom to valid range
    const newScale = Math.max(minScale, Math.min(maxScale, this.scale + zoomDelta));

    // No change if zoom didn't actually change
    if (newScale === this.scale) {
      return this;
    }

    // Calculate point in world coordinates before zoom
    const worldX = (mousePos.x - this.panX) / this.scale;
    const worldY = (mousePos.y - this.panY) / this.scale;

    // Calculate new pan to keep the same world point under the mouse
    const newPanX = mousePos.x - worldX * newScale;
    const newPanY = mousePos.y - worldY * newScale;

    // Apply pan limits
    const clampedPan = this.clampPan(newPanX, newPanY);

    return new CanvasTransform(newScale, clampedPan.x, clampedPan.y, this.panLimits);
  }

  /**
   * Calculate pan transformation
   *
   * Updates the pan offset based on cursor movement.
   *
   * @param currentPos - Current mouse position
   * @param panStart - Position where panning started
   * @param initialPan - Pan offset when panning started
   * @returns New transform with updated pan
   *
   * @example
   * const transform = new CanvasTransform(1.0, 0, 0);
   * const newTransform = transform.pan(
   *   { x: 150, y: 200 },
   *   { x: 100, y: 150 },
   *   { x: 0, y: 0 }
   * );
   * // newTransform.panX = 50, newTransform.panY = 50
   */
  pan(currentPos: Point, panStart: Point, initialPan: Point): CanvasTransform {
    const deltaX = currentPos.x - panStart.x;
    const deltaY = currentPos.y - panStart.y;

    const newPanX = initialPan.x + deltaX;
    const newPanY = initialPan.y + deltaY;

    // Apply pan limits
    const clampedPan = this.clampPan(newPanX, newPanY);

    return new CanvasTransform(
      this.scale,
      clampedPan.x,
      clampedPan.y,
      this.panLimits
    );
  }

  /**
   * Update only the pan offset
   *
   * @param panX - New horizontal pan offset
   * @param panY - New vertical pan offset
   * @returns New transform with updated pan (clamped to limits if set)
   */
  withPan(panX: number, panY: number): CanvasTransform {
    const clampedPan = this.clampPan(panX, panY);
    return new CanvasTransform(this.scale, clampedPan.x, clampedPan.y, this.panLimits);
  }

  /**
   * Update only the scale
   *
   * @param scale - New scale value
   * @returns New transform with updated scale
   */
  withScale(scale: number): CanvasTransform {
    return new CanvasTransform(scale, this.panX, this.panY, this.panLimits);
  }

  /**
   * Apply this transform to a canvas rendering context
   *
   * This modifies the context's transformation matrix to match this transform.
   * The transform consists of:
   * 1. Scale applied first
   * 2. Translation (pan) applied second
   *
   * IMPORTANT: Call ctx.save() before and ctx.restore() after rendering
   * to avoid permanent changes to the context state.
   *
   * @param ctx - Canvas 2D rendering context
   *
   * @example
   * const ctx = canvas.getContext('2d');
   * const transform = new CanvasTransform(2.0, 100, 200);
   *
   * ctx.save();
   * transform.applyToContext(ctx);
   * // ... render content in world coordinates ...
   * ctx.restore();
   */
  applyToContext(ctx: CanvasRenderingContext2D): void {
    // Scale first, then translate
    // This ensures pan values are in screen space, not world space
    ctx.scale(this.scale, this.scale);
    ctx.translate(this.panX / this.scale, this.panY / this.scale);
  }

  /**
   * Get the visible world bounds for a given canvas size
   *
   * Calculates what portion of world space is currently visible
   * within the canvas viewport.
   *
   * @param canvasWidth - Canvas width in pixels
   * @param canvasHeight - Canvas height in pixels
   * @returns Visible bounds in world coordinates
   *
   * @example
   * const transform = new CanvasTransform(2.0, 100, 200);
   * const bounds = transform.getVisibleBounds(800, 600);
   * // bounds = { minX: -50, maxX: 350, minY: -100, maxY: 200 }
   */
  getVisibleBounds(canvasWidth: number, canvasHeight: number): Bounds {
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(canvasWidth, canvasHeight);

    return {
      minX: topLeft.x,
      maxX: bottomRight.x,
      minY: topLeft.y,
      maxY: bottomRight.y,
    };
  }

  /**
   * Check if a point in world coordinates is visible
   *
   * @param worldX - X coordinate in world space
   * @param worldY - Y coordinate in world space
   * @param canvasWidth - Canvas width in pixels
   * @param canvasHeight - Canvas height in pixels
   * @returns True if the point is within the visible viewport
   */
  isPointVisible(
    worldX: number,
    worldY: number,
    canvasWidth: number,
    canvasHeight: number
  ): boolean {
    const bounds = this.getVisibleBounds(canvasWidth, canvasHeight);
    return (
      worldX >= bounds.minX &&
      worldX <= bounds.maxX &&
      worldY >= bounds.minY &&
      worldY <= bounds.maxY
    );
  }

  /**
   * Convert to plain object
   *
   * Useful for serialization or passing to functions expecting plain objects.
   */
  toObject(): { scale: number; panX: number; panY: number } {
    return {
      scale: this.scale,
      panX: this.panX,
      panY: this.panY,
    };
  }

  /**
   * Check equality with another transform
   */
  equals(other: CanvasTransform): boolean {
    return (
      this.scale === other.scale &&
      this.panX === other.panX &&
      this.panY === other.panY
    );
  }

  /**
   * Create a copy of this transform
   */
  clone(): CanvasTransform {
    return new CanvasTransform(this.scale, this.panX, this.panY, this.panLimits);
  }
}

/**
 * Get mouse position relative to canvas element
 *
 * This is a utility function that doesn't depend on transform state.
 *
 * @param event - Mouse event
 * @param canvas - Canvas element
 * @returns Point in canvas screen coordinates
 *
 * @example
 * canvas.addEventListener('click', (event) => {
 *   const pos = getCanvasMousePosition(event, canvas);
 *   console.log(`Clicked at ${pos.x}, ${pos.y}`);
 * });
 */
export function getCanvasMousePosition(
  event: MouseEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
