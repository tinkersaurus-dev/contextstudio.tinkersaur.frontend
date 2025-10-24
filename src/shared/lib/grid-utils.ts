/**
 * Grid Utilities
 *
 * Shared utilities for grid-related calculations used across the application.
 * This provides a single source of truth for grid sizing logic.
 */

import { ZOOM_THRESHOLDS } from '@/shared/config/canvas-config';

/**
 * Get grid sizes based on current zoom level
 *
 * This function determines the appropriate minor and major grid spacing
 * based on the current zoom level. Grid spacing adapts to maintain
 * visual clarity at different zoom levels.
 *
 * @param zoom - Current zoom/scale level
 * @returns Object containing minor and major grid sizes in world units
 *
 * @example
 * const { minor, major } = getGridSizeForZoom(2.0);
 * // At 200% zoom: { minor: 5, major: 20 }
 */
export function getGridSizeForZoom(zoom: number): { minor: number; major: number } {
  const threshold = ZOOM_THRESHOLDS.find(t => zoom >= t.minZoom);
  const result = threshold || ZOOM_THRESHOLDS[ZOOM_THRESHOLDS.length - 1];
  return { minor: result.minor, major: result.major };
}
