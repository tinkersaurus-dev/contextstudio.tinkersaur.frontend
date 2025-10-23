/**
 * Canvas Coordinate Transformation Utilities
 *
 * Provides utilities for converting between screen space and world space coordinates.
 * These transformations account for zoom (scale) and pan (translation) transformations.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Transform {
  scale: number;
  panX: number;
  panY: number;
}

/**
 * Convert screen coordinates to world coordinates
 *
 * @param screenX - X coordinate in screen space (pixels on canvas)
 * @param screenY - Y coordinate in screen space (pixels on canvas)
 * @param transform - Current canvas transform (scale and pan)
 * @returns Point in world coordinates
 *
 * @example
 * const worldPos = screenToWorld(100, 200, { scale: 2.0, panX: 50, panY: 100 });
 * // worldPos = { x: 25, y: 50 }
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  transform: Transform
): Point {
  return {
    x: (screenX - transform.panX) / transform.scale,
    y: (screenY - transform.panY) / transform.scale,
  };
}

/**
 * Convert world coordinates to screen coordinates
 *
 * @param worldX - X coordinate in world space
 * @param worldY - Y coordinate in world space
 * @param transform - Current canvas transform (scale and pan)
 * @returns Point in screen coordinates
 *
 * @example
 * const screenPos = worldToScreen(25, 50, { scale: 2.0, panX: 50, panY: 100 });
 * // screenPos = { x: 100, y: 200 }
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  transform: Transform
): Point {
  return {
    x: worldX * transform.scale + transform.panX,
    y: worldY * transform.scale + transform.panY,
  };
}

/**
 * Get mouse position relative to canvas element
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

/**
 * Calculate zoom-to-point transformation
 *
 * Zooms toward a specific point while keeping that point stationary under the cursor.
 * This creates an intuitive zoom experience where the content under the mouse stays in place.
 *
 * @param mousePos - Mouse position in screen coordinates
 * @param currentTransform - Current canvas transform
 * @param zoomDelta - Change in zoom level (positive = zoom in, negative = zoom out)
 * @param minScale - Minimum allowed scale
 * @param maxScale - Maximum allowed scale
 * @returns New transform state, or current transform if zoom didn't change
 *
 * @example
 * const newTransform = calculateZoomToPoint(
 *   { x: 400, y: 300 },
 *   { scale: 1.0, panX: 0, panY: 0 },
 *   0.1, // zoom in by 0.1
 *   0.1, // min 10%
 *   5.0  // max 500%
 * );
 */
export function calculateZoomToPoint(
  mousePos: Point,
  currentTransform: Transform,
  zoomDelta: number,
  minScale: number,
  maxScale: number
): Transform {
  const { scale: oldZoom, panX, panY } = currentTransform;

  // Clamp new zoom to valid range
  const newZoom = Math.max(minScale, Math.min(maxScale, oldZoom + zoomDelta));

  // No change if zoom didn't actually change
  if (newZoom === oldZoom) {
    return currentTransform;
  }

  // Calculate point in world coordinates before zoom
  const worldX = (mousePos.x - panX) / oldZoom;
  const worldY = (mousePos.y - panY) / oldZoom;

  // Calculate new pan to keep the same world point under the mouse
  const newPanX = mousePos.x - worldX * newZoom;
  const newPanY = mousePos.y - worldY * newZoom;

  return {
    scale: newZoom,
    panX: newPanX,
    panY: newPanY,
  };
}

/**
 * Calculate pan transformation
 *
 * @param currentPos - Current mouse position
 * @param panStart - Position where panning started
 * @param initialPan - Pan offset when panning started
 * @returns New pan offset
 *
 * @example
 * const newPan = calculatePan(
 *   { x: 150, y: 200 },
 *   { x: 100, y: 150 },
 *   { x: 0, y: 0 }
 * );
 * // newPan = { x: 50, y: 50 }
 */
export function calculatePan(
  currentPos: Point,
  panStart: Point,
  initialPan: Point
): Point {
  const deltaX = currentPos.x - panStart.x;
  const deltaY = currentPos.y - panStart.y;

  return {
    x: initialPan.x + deltaX,
    y: initialPan.y + deltaY,
  };
}
