/**
 * Canvas Rendering Utilities
 *
 * Helper functions for common canvas rendering operations including
 * scale-adjusted line widths, dash patterns, and consistent styling.
 */

import { STROKE_WIDTHS, DASH_PATTERNS } from '@/shared/config/canvas-config';

// Re-export constants for convenience
export { STROKE_WIDTHS, DASH_PATTERNS };

/**
 * Get scale-adjusted line width
 *
 * When zoomed in/out, line widths need to be adjusted to maintain consistent
 * visual appearance. This function calculates the appropriate line width.
 *
 * @param baseWidth - The desired visual width at 1:1 scale
 * @param scale - Current canvas scale/zoom level
 * @returns Adjusted line width for current scale
 *
 * @example
 * ctx.lineWidth = getScaledLineWidth(2, zoomState.scale);
 */
export function getScaledLineWidth(baseWidth: number, scale: number): number {
  return baseWidth / scale;
}

/**
 * Get scale-adjusted dash pattern
 *
 * Dash patterns also need scale adjustment to maintain visual consistency.
 *
 * @param pattern - Base dash pattern [dash length, gap length]
 * @param scale - Current canvas scale/zoom level
 * @returns Adjusted dash pattern for current scale
 *
 * @example
 * ctx.setLineDash(getScaledDashPattern([8, 4], zoomState.scale));
 */
export function getScaledDashPattern(
  pattern: readonly number[],
  scale: number
): number[] {
  return pattern.map((value) => value / scale);
}

/**
 * Get scale-adjusted radius
 *
 * When zoomed in/out, radius values need to be adjusted to maintain consistent
 * visual appearance. This function calculates the appropriate radius.
 *
 * @param baseRadius - The desired visual radius at 1:1 scale
 * @param scale - Current canvas scale/zoom level
 * @returns Adjusted radius for current scale
 *
 * @example
 * const radius = getScaledRadius(CONNECTION_POINT_CONFIG.radius, zoomState.scale);
 * ctx.arc(x, y, radius, 0, Math.PI * 2);
 */
export function getScaledRadius(baseRadius: number, scale: number): number {
  return baseRadius / scale;
}

/**
 * Apply selection styling to canvas context
 *
 * @param ctx - Canvas rendering context
 * @param scale - Current canvas scale/zoom level
 *
 * @example
 * applySelectionStyle(ctx, zoomState.scale);
 * ctx.strokeRect(x, y, width, height);
 */
export function applySelectionStyle(
  ctx: CanvasRenderingContext2D,
  scale: number
): void {
  ctx.strokeStyle = '#ff6b35'; // Placeholder - will be replaced with canvas theme system
  ctx.lineWidth = getScaledLineWidth(STROKE_WIDTHS.selection, scale);
  ctx.setLineDash(getScaledDashPattern(DASH_PATTERNS.selection, scale));
}

/**
 * Apply selection box styling to canvas context
 *
 * @param ctx - Canvas rendering context
 * @param scale - Current canvas scale/zoom level
 *
 * @example
 * applySelectionBoxStyle(ctx, zoomState.scale);
 * ctx.strokeRect(x, y, width, height);
 */
export function applySelectionBoxStyle(
  ctx: CanvasRenderingContext2D,
  scale: number
): void {
  ctx.strokeStyle = '#3B82F6'; // Placeholder - will be replaced with canvas theme system
  ctx.lineWidth = getScaledLineWidth(STROKE_WIDTHS.selectionBox, scale);
  ctx.setLineDash(getScaledDashPattern(DASH_PATTERNS.selectionBox, scale));
}

/**
 * Clear dash pattern from canvas context
 *
 * @param ctx - Canvas rendering context
 *
 * @example
 * ctx.setLineDash([8, 4]);
 * ctx.strokeRect(x, y, width, height);
 * clearDashPattern(ctx); // Reset to solid lines
 */
export function clearDashPattern(ctx: CanvasRenderingContext2D): void {
  ctx.setLineDash([]);
}

/**
 * Render a selection indicator around a rectangle
 *
 * @param ctx - Canvas rendering context
 * @param x - Rectangle x position
 * @param y - Rectangle y position
 * @param width - Rectangle width
 * @param height - Rectangle height
 * @param scale - Current canvas scale/zoom level
 *
 * @example
 * renderSelectionIndicator(ctx, shape.position.x, shape.position.y,
 *                         shape.dimensions.width, shape.dimensions.height, scale);
 */
export function renderSelectionIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
): void {
  ctx.save();
  applySelectionStyle(ctx, scale);
  ctx.strokeRect(x, y, width, height);
  clearDashPattern(ctx);
  ctx.restore();
}

/**
 * Render a selection box (for multi-select drag)
 *
 * @param ctx - Canvas rendering context
 * @param x - Box x position
 * @param y - Box y position
 * @param width - Box width
 * @param height - Box height
 * @param scale - Current canvas scale/zoom level
 *
 * @example
 * renderSelectionBox(ctx, minX, minY, width, height, scale);
 */
export function renderSelectionBoxRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number
): void {
  ctx.save();

  // Fill with semi-transparent color (placeholder - will be replaced with canvas theme system)
  ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  ctx.fillRect(x, y, width, height);

  // Border with dashed line
  applySelectionBoxStyle(ctx, scale);
  ctx.strokeRect(x, y, width, height);
  clearDashPattern(ctx);

  ctx.restore();
}

/**
 * Apply grid line styling
 *
 * @param ctx - Canvas rendering context
 * @param lineWidth - Line width in world coordinates
 * @param scale - Current canvas scale/zoom level
 * @param color - Optional color override
 *
 * @example
 * applyGridLineStyle(ctx, 0.5, scale); // Minor grid lines
 * applyGridLineStyle(ctx, 1.0, scale); // Major grid lines
 */
export function applyGridLineStyle(
  ctx: CanvasRenderingContext2D,
  lineWidth: number,
  scale: number,
  color?: string
): void {
  ctx.strokeStyle = color ?? '#CED8F7'; // Placeholder - will be replaced with canvas theme system
  ctx.lineWidth = lineWidth / scale;
}

/**
 * Calculate bounding box min/max from two points
 *
 * @param x1 - First point x
 * @param y1 - First point y
 * @param x2 - Second point x
 * @param y2 - Second point y
 * @returns Object with min/max coordinates and width/height
 *
 * @example
 * const box = getBoundingBox(100, 100, 50, 200);
 * // { minX: 50, minY: 100, maxX: 100, maxY: 200, width: 50, height: 100 }
 */
export function getBoundingBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.abs(maxX - minX),
    height: Math.abs(maxY - minY),
  };
}
