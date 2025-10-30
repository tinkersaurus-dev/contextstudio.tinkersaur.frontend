/**
 * Grid System
 *
 * Unified system for managing grid rendering, snapping, and calculations.
 * Consolidates all grid-related functionality in one place.
 */

import {
  BASE_GRID,
  GRID_EPSILON,
  DEFAULT_GRID_CONFIG,
  ZOOM_THRESHOLDS,
  type GridConfig,
} from '@/shared/config/canvas-config';
import type { GridRenderContext } from './rendering-types';

/**
 * Snap mode options for grid snapping
 */
export type SnapMode = 'none' | 'minor' | 'major';

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Grid size information
 */
export interface GridSize {
  minor: number;
  major: number;
}

/**
 * Unified Grid System
 *
 * Provides all grid functionality in a single, cohesive API.
 */
export class GridSystem {
  /**
   * Get grid sizes based on current zoom level
   *
   * Grid spacing adapts to maintain visual clarity at different zoom levels.
   *
   * @param zoom - Current zoom/scale level
   * @returns Object containing minor and major grid sizes in world units
   *
   * @example
   * const { minor, major } = GridSystem.getGridSizeForZoom(2.0);
   * // At 200% zoom: { minor: 5, major: 20 }
   */
  static getGridSizeForZoom(zoom: number): GridSize {
    const threshold = ZOOM_THRESHOLDS.find((t) => zoom >= t.minZoom);
    const result = threshold || ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.length - 1];
    return { minor: result.minor, major: result.major };
  }

  /**
   * Snap a coordinate value to the nearest grid line
   *
   * @param value - Coordinate value to snap
   * @param gridSize - Grid spacing
   * @returns Snapped coordinate value
   */
  private static snapToGridLine(value: number, gridSize: number): number {
    return Math.round(value / gridSize) * gridSize;
  }

  /**
   * Snap a point to the nearest minor grid intersection
   *
   * @param x - World x coordinate
   * @param y - World y coordinate
   * @param zoom - Current zoom level
   * @returns Snapped coordinates
   *
   * @example
   * const snapped = GridSystem.snapToMinorGrid(123, 456, 1.5);
   */
  static snapToMinorGrid(x: number, y: number, zoom: number): Point {
    const { minor } = this.getGridSizeForZoom(zoom);
    return {
      x: this.snapToGridLine(x, minor),
      y: this.snapToGridLine(y, minor),
    };
  }

  /**
   * Snap a point to the nearest major grid intersection
   *
   * @param x - World x coordinate
   * @param y - World y coordinate
   * @param zoom - Current zoom level
   * @returns Snapped coordinates
   *
   * @example
   * const snapped = GridSystem.snapToMajorGrid(123, 456, 1.5);
   */
  static snapToMajorGrid(x: number, y: number, zoom: number): Point {
    const { major } = this.getGridSizeForZoom(zoom);
    return {
      x: this.snapToGridLine(x, major),
      y: this.snapToGridLine(y, major),
    };
  }

  /**
   * Snap a point based on the current snap mode
   *
   * @param x - World x coordinate
   * @param y - World y coordinate
   * @param zoom - Current zoom level
   * @param snapMode - Current snap mode ('none', 'minor', or 'major')
   * @returns Snapped coordinates (or original if snap mode is 'none')
   *
   * @example
   * const snapped = GridSystem.snapPoint(123, 456, 1.5, 'minor');
   */
  static snapPoint(x: number, y: number, zoom: number, snapMode: SnapMode): Point {
    switch (snapMode) {
      case 'minor':
        return this.snapToMinorGrid(x, y, zoom);
      case 'major':
        return this.snapToMajorGrid(x, y, zoom);
      case 'none':
      default:
        return { x, y };
    }
  }

  /**
   * Draw grid lines for a specific axis and spacing
   *
   * @private
   */
  private static drawGridLines(
    ctx: CanvasRenderingContext2D,
    axis: 'x' | 'y',
    start: number,
    end: number,
    lineStart: number,
    lineEnd: number,
    gridSize: number,
    skipSize: number | null,
    zoom: number
  ): void {
    const offset = 0.5 / zoom; // Sub-pixel offset for crisp lines

    for (let pos = start; pos <= end; pos += BASE_GRID) {
      // Only draw if this is a multiple of gridSize
      if (Math.abs(pos % gridSize) > GRID_EPSILON) continue;

      // Skip if this is a multiple of skipSize (for avoiding overlap with major lines)
      if (skipSize !== null && Math.abs(pos % skipSize) < GRID_EPSILON) continue;

      ctx.beginPath();
      if (axis === 'x') {
        ctx.moveTo(pos + offset, lineStart);
        ctx.lineTo(pos + offset, lineEnd);
      } else {
        ctx.moveTo(lineStart, pos + offset);
        ctx.lineTo(lineEnd, pos + offset);
      }
      ctx.stroke();
    }
  }

  /**
   * Render the grid on a canvas using standardized context pattern
   *
   * @param context - Grid rendering context
   *
   * @example
   * GridSystem.render({
   *   ctx,
   *   width: 800,
   *   height: 600,
   *   scale: 1.5,
   *   panX: 0,
   *   panY: 0,
   * });
   */
  static render(context: GridRenderContext): void {
    const { ctx, width, height, scale: zoom, panX, panY, config = DEFAULT_GRID_CONFIG } = context;
    const { gridColor, minorLineWidth, majorLineWidth } = config;

    // Get grid sizes based on zoom level
    const { minor: minorGridSize, major: majorGridSize } = this.getGridSizeForZoom(zoom);

    // Set grid color
    ctx.strokeStyle = gridColor;

    // Calculate bounds based on the smallest grid unit to keep lines anchored
    const startX = Math.floor(-panX / zoom / BASE_GRID) * BASE_GRID;
    const startY = Math.floor(-panY / zoom / BASE_GRID) * BASE_GRID;
    const endX = startX + width / zoom + BASE_GRID;
    const endY = startY + height / zoom + BASE_GRID;

    // Draw minor grid lines (skip major grid line positions)
    ctx.lineWidth = minorLineWidth / zoom;
    this.drawGridLines(ctx, 'x', startX, endX, startY, endY, minorGridSize, majorGridSize, zoom);
    this.drawGridLines(ctx, 'y', startY, endY, startX, endX, minorGridSize, majorGridSize, zoom);

    // Draw major grid lines
    ctx.lineWidth = majorLineWidth / zoom;
    this.drawGridLines(ctx, 'x', startX, endX, startY, endY, majorGridSize, null, zoom);
    this.drawGridLines(ctx, 'y', startY, endY, startX, endX, majorGridSize, null, zoom);
  }

}

// Re-export types and constants for convenience
export { DEFAULT_GRID_CONFIG, type GridConfig };
