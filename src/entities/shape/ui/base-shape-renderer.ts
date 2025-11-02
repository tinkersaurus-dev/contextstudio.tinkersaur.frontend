/**
 * Base Shape Renderer Utilities
 *
 * Shared utilities to reduce duplication across shape renderer functions.
 * Centralizes common patterns like color fallback logic and canvas setup.
 */

import type { BaseShape } from '../model/types';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

/**
 * Default theme colors for shapes
 */
const DEFAULT_THEME_COLORS = {
  fill: '#F3F4F6',
  stroke: '#1F2937',
  text: '#111827',
};

/**
 * Resolved colors for rendering a shape
 */
export interface ShapeColors {
  fill: string;
  stroke: string;
  text: string;
}

/**
 * Get resolved colors for a shape with proper fallback chain
 *
 * Priority order:
 * 1. Shape-specific colors (shape.fillColor, shape.strokeColor, shape.textColor)
 * 2. Theme colors passed to the renderer (themeColors.fill, themeColors.stroke, themeColors.text)
 * 3. Default hardcoded colors
 *
 * @param shape - The shape to get colors for
 * @param themeColors - Optional theme colors from the canvas theme
 * @returns Resolved colors for fill, stroke, and text
 *
 * @example
 * ```typescript
 * const colors = getShapeColors(shape, themeColors);
 * ctx.fillStyle = colors.fill;
 * ctx.strokeStyle = colors.stroke;
 * ```
 */
export function getShapeColors(
  shape: BaseShape,
  themeColors?: { fill: string; stroke: string; text: string }
): ShapeColors {
  return {
    fill: shape.fillColor ?? themeColors?.fill ?? DEFAULT_THEME_COLORS.fill,
    stroke: shape.strokeColor ?? themeColors?.stroke ?? DEFAULT_THEME_COLORS.stroke,
    text: shape.textColor ?? themeColors?.text ?? DEFAULT_THEME_COLORS.text,
  };
}

/**
 * Setup canvas context for shape rendering
 *
 * This utility function:
 * - Resolves colors with proper fallback chain
 * - Calculates scaled stroke width
 * - Applies fillStyle and strokeStyle to context
 * - Applies lineWidth to context
 *
 * @param ctx - Canvas rendering context
 * @param shape - The shape being rendered
 * @param scale - Current canvas scale
 * @param themeColors - Optional theme colors from the canvas theme
 * @returns Resolved colors (useful for additional rendering)
 *
 * @example
 * ```typescript
 * const colors = setupShapeContext(ctx, shape, scale, themeColors);
 * // Now ctx is ready with fillStyle, strokeStyle, and lineWidth set
 * ctx.fillRect(x, y, width, height);
 * ctx.strokeRect(x, y, width, height);
 * ```
 */
export function setupShapeContext(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  scale: number,
  themeColors?: { fill: string; stroke: string; text: string }
): ShapeColors {
  const colors = getShapeColors(shape, themeColors);
  const strokeWidth = shape.strokeWidth ?? 0.5;

  ctx.fillStyle = colors.fill;
  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = getScaledLineWidth(strokeWidth, scale);

  return colors;
}

/**
 * Render a simple filled and stroked path
 *
 * This is a convenience function for shapes that follow the pattern:
 * 1. Begin path
 * 2. Draw geometry
 * 3. Close path
 * 4. Fill
 * 5. Stroke
 *
 * @param ctx - Canvas rendering context
 * @param drawPath - Function that draws the path geometry (without begin/close/fill/stroke)
 *
 * @example
 * ```typescript
 * setupShapeContext(ctx, shape, scale, themeColors);
 * renderFilledAndStrokedPath(ctx, () => {
 *   ctx.rect(x, y, width, height);
 * });
 * ```
 */
export function renderFilledAndStrokedPath(
  ctx: CanvasRenderingContext2D,
  drawPath: () => void
): void {
  ctx.beginPath();
  drawPath();
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
