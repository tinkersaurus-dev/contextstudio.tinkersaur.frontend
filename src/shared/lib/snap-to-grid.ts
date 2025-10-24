import { getGridSizeForZoom } from './grid-utils';

/**
 * Snap-to-Grid Utilities
 *
 * Provides functions to snap coordinates to grid intersection points.
 * Supports both minor and major grid snapping based on current zoom level.
 */

export type SnapMode = 'none' | 'minor' | 'major';

/**
 * Snaps a coordinate value to the nearest grid line
 */
function snapToGridLine(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Snaps a point to the nearest minor grid intersection
 *
 * @param x - World x coordinate
 * @param y - World y coordinate
 * @param zoom - Current zoom level
 * @returns Snapped coordinates
 */
export function snapToMinorGrid(x: number, y: number, zoom: number): { x: number; y: number } {
  const { minor } = getGridSizeForZoom(zoom);
  return {
    x: snapToGridLine(x, minor),
    y: snapToGridLine(y, minor),
  };
}

/**
 * Snaps a point to the nearest major grid intersection
 *
 * @param x - World x coordinate
 * @param y - World y coordinate
 * @param zoom - Current zoom level
 * @returns Snapped coordinates
 */
export function snapToMajorGrid(x: number, y: number, zoom: number): { x: number; y: number } {
  const { major } = getGridSizeForZoom(zoom);
  return {
    x: snapToGridLine(x, major),
    y: snapToGridLine(y, major),
  };
}

/**
 * Snaps a point based on the current snap mode
 *
 * @param x - World x coordinate
 * @param y - World y coordinate
 * @param zoom - Current zoom level
 * @param snapMode - Current snap mode
 * @returns Snapped coordinates (or original if snap mode is 'none')
 */
export function snapToGrid(
  x: number,
  y: number,
  zoom: number,
  snapMode: SnapMode
): { x: number; y: number } {
  switch (snapMode) {
    case 'minor':
      return snapToMinorGrid(x, y, zoom);
    case 'major':
      return snapToMajorGrid(x, y, zoom);
    case 'none':
    default:
      return { x, y };
  }
}
