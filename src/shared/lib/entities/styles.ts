/**
 * Entity Styling System
 *
 * Decouples rendering functions from selection state by providing a styling layer.
 * Rendering functions receive pre-computed styles instead of selection booleans,
 * improving separation of concerns and enabling flexible styling scenarios.
 *
 * Benefits:
 * - Rendering logic doesn't know about selection state
 * - Easy to add new states (hover, disabled, error, etc.)
 * - Testable without mocking selection state
 * - Single source of truth for style decisions
 * - Supports themes and accessibility
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import { STROKE_WIDTHS } from '@/shared/config/canvas-config';
import { getScaledLineWidth } from '@/shared/lib/rendering/canvas-utils';

// ============================================================================
// STYLE INTERFACES
// ============================================================================

/**
 * Styling options for rendering shapes
 *
 * Currently shapes don't have selection-dependent styling (selection is rendered
 * as a separate overlay), but this interface allows for future extensions like:
 * - Hover effects
 * - Disabled states
 * - Error/warning highlights
 * - Theme variants
 */
export interface ShapeStyle {
  /**
   * Optional fill color override
   * If undefined, use the shape's own fillColor
   */
  fillColor?: string;

  /**
   * Optional stroke color override
   * If undefined, use the shape's own strokeColor
   */
  strokeColor?: string;

  /**
   * Optional stroke width override
   * If undefined, use the shape's own strokeWidth
   */
  strokeWidth?: number;

  /**
   * Optional opacity override
   * If undefined, use 1.0 (fully opaque)
   */
  opacity?: number;
}

/**
 * Styling options for rendering connectors
 *
 * Connectors change their stroke appearance based on state.
 * This interface provides the computed style values.
 */
export interface ConnectorStyle {
  /**
   * Stroke color for the connector line
   */
  strokeColor: string;

  /**
   * Stroke width for the connector line
   */
  strokeWidth: number;

  /**
   * Optional opacity override
   * If undefined, use 1.0 (fully opaque)
   */
  opacity?: number;
}

/**
 * Unified entity style type
 */
export type EntityStyle = ShapeStyle | ConnectorStyle;

/**
 * Style state enum for semantic styling
 * Allows expressing intent rather than visual properties
 */
export enum StyleState {
  /** Normal/default state */
  Normal = 'normal',
  /** Entity is selected */
  Selected = 'selected',
  /** Entity is being hovered */
  Hover = 'hover',
  /** Entity is disabled */
  Disabled = 'disabled',
  /** Entity has an error */
  Error = 'error',
  /** Entity has a warning */
  Warning = 'warning',
}

// ============================================================================
// STYLE RESOLUTION FUNCTIONS
// ============================================================================

/**
 * Resolve connector styling based on state
 *
 * @param connector - The connector to style
 * @param state - The visual state to apply (defaults to Normal)
 * @param themeColors - Optional theme colors for defaults
 * @returns Computed connector style
 *
 * @example
 * const style = resolveConnectorStyle(connector, StyleState.Selected, { normal: '#1F2937', selected: '#3B82F6' });
 * ctx.strokeStyle = style.strokeColor;
 * ctx.lineWidth = style.strokeWidth;
 */
export function resolveConnectorStyle(
  connector: Connector,
  state: StyleState = StyleState.Normal,
  themeColors?: { normal?: string; selected?: string; hover?: string }
): ConnectorStyle {
  // Determine stroke color based on state
  let strokeColor: string;
  let strokeWidth: number;

  switch (state) {
    case StyleState.Selected:
      strokeColor = themeColors?.selected ?? '#ff6b35';
      strokeWidth = STROKE_WIDTHS.connectorSelected;
      break;

    case StyleState.Hover:
      strokeColor = themeColors?.hover ?? '#3B82F6';
      strokeWidth = STROKE_WIDTHS.connectorSelected; // Same width as selected
      break;

    case StyleState.Normal:
    default:
      strokeColor = connector.strokeColor ?? themeColors?.normal ?? '#1F2937';
      strokeWidth = connector.strokeWidth ?? STROKE_WIDTHS.connector;
      break;
  }

  return {
    strokeColor,
    strokeWidth,
    opacity: 1.0,
  };
}

/**
 * Convenience function: Resolve connector style from boolean selection state
 *
 * @param connector - The connector to style
 * @param isSelected - Whether the connector is selected
 * @returns Computed connector style
 *
 * @example
 * const isSelected = selectedIds.has(connector.id);
 * const style = resolveConnectorStyleFromSelection(connector, isSelected);
 */
export function resolveConnectorStyleFromSelection(
  connector: Connector,
  isSelected: boolean
): ConnectorStyle {
  return resolveConnectorStyle(
    connector,
    isSelected ? StyleState.Selected : StyleState.Normal
  );
}

/**
 * Resolve shape styling based on state
 *
 * Currently shapes don't have selection-dependent styling (selection is rendered
 * as a separate overlay via renderSelectionIndicator), so this returns the shape's
 * own colors. Future enhancements can add state-based styling here.
 *
 * @param shape - The shape to style
 * @returns Computed shape style (currently uses shape's own properties)
 *
 * @example
 * const style = resolveShapeStyle(shape);
 * // Future: Add state parameter for hover effects, etc.
 */
export function resolveShapeStyle(shape: Shape): ShapeStyle {
  // Currently shapes don't have state-dependent styling
  // Selection is handled separately via renderSelectionIndicator
  // This function exists for:
  // 1. API consistency with connectors
  // 2. Future extensibility (hover, disabled, error states)
  // 3. Theme support

  // Future enhancement ideas:
  // - Add optional state parameter (hover, disabled, error, warning)
  // - Hover: Slightly lighter fill, thicker stroke
  // - Disabled: Grayed out, lower opacity
  // - Error: Red border
  // - Warning: Yellow border

  return {
    fillColor: shape.fillColor,
    strokeColor: shape.strokeColor,
    strokeWidth: shape.strokeWidth,
    opacity: 1.0,
  };
}

/**
 * Convenience function: Resolve shape style from boolean selection state
 *
 * Currently this function ignores the selection state, but it exists for:
 * - API consistency with resolveConnectorStyleFromSelection
 * - Future extensibility when shapes gain state-based styling
 * - Maintaining backwards compatibility with existing call sites
 *
 * @param shape - The shape to style
 * @param isSelected - Whether the shape is selected (currently unused)
 * @returns Computed shape style
 *
 * @example
 * const isSelected = selectedIds.has(shape.id);
 * const style = resolveShapeStyleFromSelection(shape, isSelected);
 */
export function resolveShapeStyleFromSelection(
  shape: Shape,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSelected: boolean
): ShapeStyle {
  // Currently selection state doesn't affect shape styling
  // When state-based styling is implemented, use isSelected to determine StyleState
  return resolveShapeStyle(shape);
}

// ============================================================================
// STYLE APPLICATION UTILITIES
// ============================================================================

/**
 * Apply connector style to canvas context
 *
 * Sets strokeStyle and lineWidth from the style object.
 * Convenience function to reduce boilerplate in renderers.
 *
 * @param ctx - Canvas rendering context
 * @param style - Connector style to apply
 * @param scale - Current canvas scale (for width adjustment)
 *
 * @example
 * const style = resolveConnectorStyle(connector, StyleState.Selected);
 * applyConnectorStyle(ctx, style, scale);
 * // ctx.strokeStyle and ctx.lineWidth are now set
 */
export function applyConnectorStyle(
  ctx: CanvasRenderingContext2D,
  style: ConnectorStyle,
  scale: number
): void {
  ctx.strokeStyle = style.strokeColor;
  ctx.lineWidth = getScaledLineWidth(style.strokeWidth, scale);

  if (style.opacity !== undefined && style.opacity !== 1.0) {
    ctx.globalAlpha = style.opacity;
  }
}

/**
 * Apply shape style to canvas context
 *
 * Sets fillStyle, strokeStyle, and lineWidth from the style object.
 * Convenience function to reduce boilerplate in renderers.
 *
 * @param ctx - Canvas rendering context
 * @param style - Shape style to apply
 * @param scale - Current canvas scale (for width adjustment)
 *
 * @example
 * const style = resolveShapeStyle(shape, StyleState.Hover);
 * applyShapeStyle(ctx, style, scale);
 * // ctx.fillStyle, ctx.strokeStyle, ctx.lineWidth are now set
 */
export function applyShapeStyle(
  ctx: CanvasRenderingContext2D,
  style: ShapeStyle,
  scale: number
): void {
  if (style.fillColor) {
    ctx.fillStyle = style.fillColor;
  }

  if (style.strokeColor) {
    ctx.strokeStyle = style.strokeColor;
  }

  if (style.strokeWidth !== undefined) {
    ctx.lineWidth = getScaledLineWidth(style.strokeWidth, scale);
  }

  if (style.opacity !== undefined && style.opacity !== 1.0) {
    ctx.globalAlpha = style.opacity;
  }
}
