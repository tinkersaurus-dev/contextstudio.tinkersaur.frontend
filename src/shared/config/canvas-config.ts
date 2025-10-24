/**
 * Canvas Configuration
 *
 * Centralized configuration for all canvas-related settings including zoom, grid, colors, and defaults.
 * This provides a single source of truth for canvas behavior and theming.
 */

// ============================================================================
// ZOOM CONFIGURATION
// ============================================================================

export interface ZoomConfig {
  minScale: number;
  maxScale: number;
  zoomSpeed: number;
}

/**
 * Zoom configuration settings
 */
export const ZOOM_CONFIG: ZoomConfig = {
  minScale: 0.1, // 10% minimum zoom
  maxScale: 5.0, // 500% maximum zoom
  zoomSpeed: 0.001, // Sensitivity of zoom (adjust for faster/slower zooming)
} as const;

// ============================================================================
// GRID CONFIGURATION
// ============================================================================

/**
 * Zoom threshold configuration for adaptive grid
 * Grid spacing changes at different zoom levels to maintain visual clarity
 */
export interface ZoomThreshold {
  minZoom: number;
  minor: number; // Minor grid line spacing in world units
  major: number; // Major grid line spacing in world units
}

/**
 * Grid zoom thresholds - grid spacing adapts based on zoom level
 * Higher zoom = finer grid, lower zoom = coarser grid
 */
export const ZOOM_THRESHOLDS: readonly ZoomThreshold[] = [
  { minZoom: 4.0, minor: 1, major: 4 }, // 400%+ zoom
  { minZoom: 2.0, minor: 5, major: 20 }, // 200% zoom
  { minZoom: 0.75, minor: 10, major: 40 }, // 75% zoom
  { minZoom: 0.5, minor: 20, major: 80 }, // 50% zoom
  { minZoom: 0.25, minor: 40, major: 160 }, // 25% zoom
  { minZoom: 0.0, minor: 80, major: 320 }, // Below 25% zoom
] as const;

export interface GridConfig {
  minorGridSize: number;
  majorGridSize: number;
  gridColor: string;
  minorLineWidth: number;
  majorLineWidth: number;
}

/**
 * Default grid configuration
 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  minorGridSize: 20,
  majorGridSize: 100,
  gridColor: '#CED8F7',
  minorLineWidth: 0.5,
  majorLineWidth: 1,
} as const;

/**
 * Base grid unit for anchoring - smallest grid unit to prevent jitter
 */
export const BASE_GRID = 5;

/**
 * Floating point comparison tolerance for grid calculations
 */
export const GRID_EPSILON = 0.01;

// ============================================================================
// COLOR PALETTE
// ============================================================================

/**
 * Canvas color palette for consistent theming
 */
export const CANVAS_COLORS = {
  // Background
  background: '#ffffff',

  // Grid
  gridMinor: '#CED8F7',
  gridMajor: '#CED8F7',

  // Selection
  selectionBorder: '#ff6b35', // Bright orange
  selectionFill: 'rgba(255, 107, 53, 0.1)', // Semi-transparent orange

  // Selection Box (multi-select)
  selectionBoxBorder: '#3b82f6', // Blue
  selectionBoxFill: 'rgba(59, 130, 246, 0.1)', // Semi-transparent blue

  // Default Shape Colors
  defaultShapeFill: '#ffffff',
  defaultShapeStroke: '#000000',
} as const;

// ============================================================================
// RENDERING CONSTANTS
// ============================================================================

/**
 * Default stroke widths for various elements
 */
export const STROKE_WIDTHS = {
  shape: 1,
  selection: 2,
  selectionBox: 1,
} as const;

/**
 * Dash patterns for dashed lines
 */
export const DASH_PATTERNS = {
  selection: [8, 4], // [dash length, gap length]
  selectionBox: [5, 5],
} as const;

// ============================================================================
// CANVAS DEFAULTS
// ============================================================================

/**
 * Default canvas state
 */
export const DEFAULT_CANVAS_STATE = {
  scale: 1.0,
  panX: 0,
  panY: 0,
} as const;

/**
 * Default shape dimensions
 */
export const DEFAULT_SHAPE_DIMENSIONS = {
  width: 100,
  height: 100,
} as const;

/**
 * Offset for centering shapes on creation point
 */
export const SHAPE_CREATION_OFFSET = {
  x: 50, // Half of default width
  y: 50, // Half of default height
} as const;

// ============================================================================
// LAYOUT CONSTANTS
// ============================================================================

/**
 * Application header height
 */
export const HEADER_HEIGHT = 40; // pixels

/**
 * Canvas controls positioning configuration
 */
export const CANVAS_CONTROLS_POSITION = {
  bottom: 16, // pixels from bottom
  horizontalCenter: '50%', // centered horizontally
} as const;

/**
 * Zoom control positioning configuration
 */
export const ZOOM_CONTROL_POSITION = {
  bottom: 16, // pixels from bottom
  right: 16, // pixels from right
} as const;
