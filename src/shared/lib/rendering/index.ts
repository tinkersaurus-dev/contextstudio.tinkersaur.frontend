/**
 * Rendering Utilities
 *
 * Canvas rendering utilities including transforms, grid system,
 * text wrapping, and font loading.
 */

// Rendering types and contexts
export * from './types';

// Canvas utilities
export * from './canvas-utils';

// Canvas transform (export Point from here as primary)
export {
  CanvasTransform,
  getCanvasMousePosition,
  type Point,
  type Bounds,
  type PanLimits,
} from './canvas-transform';

// Grid system (avoid Point collision)
export {
  GridSystem,
  DEFAULT_GRID_CONFIG,
  type GridConfig,
  type GridSize,
  type SnapMode,
} from './grid-system';

// Text and font utilities
export * from './text-wrapping';
export * from './font-loader';
