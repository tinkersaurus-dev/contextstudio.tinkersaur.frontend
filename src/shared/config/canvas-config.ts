import { getThemeCSSVar } from "@/app/themes/theme-css-vars";

/**
 * Canvas Configuration
 *
 * Centralized configuration for all canvas-related settings including zoom, grid, colors, and defaults.
 * This provides a single source of truth for canvas behavior and theming.
 *
 * Colors are loaded dynamically from CSS variables to support runtime theme switching.
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
 *
 * Note: gridColor is a fallback. Use getCanvasColors().grid for runtime theme support.
 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  minorGridSize: 20,
  majorGridSize: 100,
  gridColor: "#CED8F7", // Fallback color
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
 * Canvas color palette interface
 */
export interface CanvasColors {
  // Background
  background: string;

  // Grid
  grid: string;

  // Selection
  selectionBorder: string;
  selectionFill: string;

  // Selection Box (multi-select)
  selectionBoxBorder: string;
  selectionBoxFill: string;

  // Default Shape Colors
  defaultShapeFill: string;
  defaultShapeStroke: string;
  shapeText: string;

  // Connector Colors
  connectorStroke: string;
  connectorStrokeSelected: string;
  connectorStrokeHover: string;

  // Connection Point Colors
  connectionPoint: string;
  connectionPointHover: string;
  connectionPointBorder: string;
}

/**
 * Get current canvas colors from CSS variables
 *
 * This function reads theme colors dynamically from CSS variables,
 * allowing canvas rendering to respond to theme changes without reloads.
 *
 * Call this function each time you need canvas colors to ensure you
 * get the current theme's values.
 *
 * @returns Canvas color palette with current theme values
 *
 * @example
 * ```tsx
 * const colors = getCanvasColors();
 * ctx.fillStyle = colors.background;
 * ctx.strokeStyle = colors.selectionBorder;
 * ```
 */
export function getCanvasColors(): CanvasColors {
  return {
    // Background
    background: getThemeCSSVar("--theme-canvas-background") || "#f7f7f7",

    // Grid
    grid: getThemeCSSVar("--theme-canvas-grid") || "#CED8F7",

    // Selection
    selectionBorder: getThemeCSSVar("--theme-canvas-selection-border") || "#ff6b35",
    selectionFill: getThemeCSSVar("--theme-canvas-selection-fill") || "rgba(255, 107, 53, 0.1)",

    // Selection Box (multi-select)
    selectionBoxBorder: getThemeCSSVar("--theme-canvas-selection-box-border") || "#3b82f6",
    selectionBoxFill: getThemeCSSVar("--theme-canvas-selection-box-fill") || "rgba(59, 130, 246, 0.1)",

    // Default Shape Colors
    defaultShapeFill: getThemeCSSVar("--theme-canvas-shapes-fill") || "#ffffff",
    defaultShapeStroke: getThemeCSSVar("--theme-canvas-shapes-stroke") || "#000000",
    shapeText: getThemeCSSVar("--theme-canvas-shapes-text") || "#000000",

    // Connector Colors
    connectorStroke: getThemeCSSVar("--theme-canvas-connectors-default") || "#000000",
    connectorStrokeSelected: getThemeCSSVar("--theme-canvas-connectors-selected") || "#ff6b35",
    connectorStrokeHover: getThemeCSSVar("--theme-canvas-connectors-hover") || "#3b82f6",

    // Connection Point Colors
    connectionPoint: getThemeCSSVar("--theme-canvas-connection-points-default") || "#3b82f6",
    connectionPointHover: getThemeCSSVar("--theme-canvas-connection-points-hover") || "#ff6b35",
    connectionPointBorder: getThemeCSSVar("--theme-canvas-connection-points-border") || "#ffffff",
  };
}

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
  connector: 2,
  connectorSelected: 3,
  connectionPoint: 2, // For connection point preview lines
} as const;

/**
 * Dash patterns for dashed lines
 */
export const DASH_PATTERNS = {
  selection: [8, 4], // [dash length, gap length]
  selectionBox: [5, 5],
  connectionPoint: [8, 4], // For connection point preview lines
} as const;

/**
 * Arrowhead configuration
 */
export const ARROWHEAD_CONFIG = {
  length: 12, // Length of arrowhead in pixels
  width: 8, // Width of arrowhead base in pixels
  angle: Math.PI / 6, // Angle of arrowhead (30 degrees)
} as const;

/**
 * Connection point configuration
 */
export const CONNECTION_POINT_CONFIG = {
  radius: 4, // Radius of connection point circles
  hoverRadius: 6, // Radius when hovering
  hitTolerance: 10, // Hit detection tolerance in pixels
  dragThreshold: 5, // Minimum drag distance before considering it a real drag (pixels)
} as const;

/**
 * Connector hit detection configuration
 */
export const CONNECTOR_HIT_CONFIG = {
  tolerance: 8, // Distance tolerance for clicking on connectors (pixels)
  hoverTolerance: 10, // Distance tolerance for hovering (pixels)
} as const;

/**
 * Shape proximity detection configuration
 */
export const SHAPE_PROXIMITY_CONFIG = {
  defaultDistance: 50, // Default distance to consider shapes "near" in world units
} as const;

/**
 * Shape rendering configuration
 * Constants for shape-specific rendering details like event circles and text layout
 */
export const SHAPE_RENDERING_CONFIG = {
  // Event shape rendering
  event: {
    endEventInnerGap: 3,          // Gap (pixels) between outer and inner circles for end events (double circle)
    intermediateEventInnerGap: 2, // Gap (pixels) between outer and inner circles for intermediate events (double circle)
  },
  // Text rendering within and around shapes
  text: {
    horizontalPadding: 8,   // Horizontal padding (pixels) for text within shapes
    minBelowWidth: 120,     // Minimum width (pixels) for text placed below small shapes (e.g., events, gateways)
    belowOffset: 5,         // Vertical offset (pixels) between shape bottom and text when placed below
  },
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
 * Note: This is used as a reference. Actual shapes may have different default sizes.
 */
export const DEFAULT_SHAPE_DIMENSIONS = {
  width: 120,
  height: 80,
} as const;

/**
 * Offset for centering shapes on creation point
 * Deprecated: Use calculateShapeCenterOffset() utility function instead.
 * This constant is kept for backwards compatibility but should not be used for new code.
 * @deprecated
 */
export const SHAPE_CREATION_OFFSET = {
  x: 60, // Half of default width (120 / 2)
  y: 40, // Half of default height (80 / 2)
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
