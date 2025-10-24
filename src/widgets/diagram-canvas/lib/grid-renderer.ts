import {
  BASE_GRID,
  GRID_EPSILON,
  DEFAULT_GRID_CONFIG,
  type GridConfig,
} from '@/shared/config/canvas-config';
import { getGridSizeForZoom } from '@/shared/lib/grid-utils';

// Re-export for external use
export { DEFAULT_GRID_CONFIG, type GridConfig };

/**
 * Draw grid lines for a specific axis and spacing
 */
function drawGridLines(
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

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  config: GridConfig = DEFAULT_GRID_CONFIG
): void {
  const { gridColor, minorLineWidth, majorLineWidth } = config;

  // Get grid sizes based on zoom level - these are FIXED sizes in world space at each threshold
  // The grid will scale with zoom until it hits the next threshold
  const { minor: minorGridSize, major: majorGridSize } = getGridSizeForZoom(zoom);

  // Draw grid - assumes transforms are already applied by caller
  ctx.strokeStyle = gridColor;

  // ALWAYS calculate bounds based on the smallest grid unit to keep lines anchored
  const startX = Math.floor(-panX / zoom / BASE_GRID) * BASE_GRID;
  const startY = Math.floor(-panY / zoom / BASE_GRID) * BASE_GRID;
  const endX = startX + (width / zoom) + BASE_GRID;
  const endY = startY + (height / zoom) + BASE_GRID;

  // Draw minor grid lines (skip major grid line positions)
  ctx.lineWidth = minorLineWidth / zoom;
  drawGridLines(ctx, 'x', startX, endX, startY, endY, minorGridSize, majorGridSize, zoom);
  drawGridLines(ctx, 'y', startY, endY, startX, endX, minorGridSize, majorGridSize, zoom);

  // Draw major grid lines
  ctx.lineWidth = majorLineWidth / zoom;
  drawGridLines(ctx, 'x', startX, endX, startY, endY, majorGridSize, null, zoom);
  drawGridLines(ctx, 'y', startY, endY, startX, endX, majorGridSize, null, zoom);
}
