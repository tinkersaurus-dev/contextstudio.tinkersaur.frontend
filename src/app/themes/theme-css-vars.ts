import type { ThemeConfig, ColorPalette } from "./types";

/**
 * Theme CSS Variables System
 *
 * Converts theme configurations to CSS custom properties (CSS variables)
 * and injects them into the document root for runtime theme switching.
 *
 * This allows dynamic theme changes without page reloads while maintaining
 * compatibility with Chakra UI's token system.
 */

/**
 * Convert a color palette to CSS variable declarations
 *
 * @param prefix - CSS variable prefix (e.g., "primary", "secondary")
 * @param palette - Color palette with shades 50-950
 * @returns Object mapping CSS variable names to color values
 */
function paletteToVars(
  prefix: string,
  palette: ColorPalette
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Generate variables for each shade
  Object.entries(palette).forEach(([shade, color]) => {
    vars[`--theme-${prefix}-${shade}`] = color;
  });

  return vars;
}

/**
 * Generate all CSS variables from a theme configuration
 *
 * Creates CSS custom properties for:
 * - Color palettes (primary, secondary, tertiary, neutral, status colors)
 * - Canvas colors (background, grid, selection, shapes, connectors)
 * - UI component colors (header, panel, sidebar, tabs, editor)
 * - Diagram colors (BPMN, sequence, data flow)
 * - Markdown colors
 *
 * @param theme - Theme configuration to convert
 * @returns Object mapping CSS variable names to values
 */
export function generateThemeCSSVars(
  theme: ThemeConfig
): Record<string, string> {
  const vars: Record<string, string> = {};

  // Color palettes
  Object.assign(vars, paletteToVars("primary", theme.primary));
  Object.assign(vars, paletteToVars("secondary", theme.secondary));
  Object.assign(vars, paletteToVars("tertiary", theme.tertiary));
  Object.assign(vars, paletteToVars("neutral", theme.neutral));

  // Status colors
  Object.assign(vars, paletteToVars("info", theme.status.info));
  Object.assign(vars, paletteToVars("success", theme.status.success));
  Object.assign(vars, paletteToVars("warning", theme.status.warning));
  Object.assign(vars, paletteToVars("danger", theme.status.danger));

  // Canvas colors
  vars["--theme-canvas-background"] = theme.canvas.background;
  vars["--theme-canvas-grid-minor"] = theme.canvas.grid.minor;
  vars["--theme-canvas-grid-major"] = theme.canvas.grid.major;
  vars["--theme-canvas-selection-border"] = theme.canvas.selection.border;
  vars["--theme-canvas-selection-fill"] = theme.canvas.selection.fill;
  vars["--theme-canvas-selection-box-border"] =
    theme.canvas.selectionBox.border;
  vars["--theme-canvas-selection-box-fill"] = theme.canvas.selectionBox.fill;
  vars["--theme-canvas-shapes-fill"] = theme.canvas.shapes.fill;
  vars["--theme-canvas-shapes-stroke"] = theme.canvas.shapes.stroke;
  vars["--theme-canvas-shapes-text"] = theme.canvas.shapes.text;
  vars["--theme-canvas-connectors-default"] = theme.canvas.connectors.default;
  vars["--theme-canvas-connectors-selected"] = theme.canvas.connectors.selected;
  vars["--theme-canvas-connectors-hover"] = theme.canvas.connectors.hover;
  vars["--theme-canvas-connection-points-default"] =
    theme.canvas.connectionPoints.default;
  vars["--theme-canvas-connection-points-hover"] =
    theme.canvas.connectionPoints.hover;
  vars["--theme-canvas-connection-points-border"] =
    theme.canvas.connectionPoints.border;

  // UI component colors - Header
  vars["--theme-ui-header-bg"] = theme.ui.header.bg;
  vars["--theme-ui-header-title"] = theme.ui.header.title;
  vars["--theme-ui-header-nav"] = theme.ui.header.nav;
  vars["--theme-ui-header-nav-hover"] = theme.ui.header.navHover;

  // UI component colors - Panel
  vars["--theme-ui-panel-bg"] = theme.ui.panel.bg;
  vars["--theme-ui-panel-text"] = theme.ui.panel.text;

  // UI component colors - Sidebar
  vars["--theme-ui-sidebar-bg"] = theme.ui.sidebar.bg;
  vars["--theme-ui-sidebar-toolbar"] = theme.ui.sidebar.toolbar;
  vars["--theme-ui-sidebar-text"] = theme.ui.sidebar.text;
  vars["--theme-ui-sidebar-border-main"] = theme.ui.sidebar.borderMain;
  vars["--theme-ui-sidebar-border-internal"] = theme.ui.sidebar.borderInternal;
  vars["--theme-ui-sidebar-hover-bg"] = theme.ui.sidebar.hoverBg;
  vars["--theme-ui-sidebar-hover-text"] = theme.ui.sidebar.hoverText;
  vars["--theme-ui-sidebar-hover-button"] = theme.ui.sidebar.hoverButton;

  // UI component colors - Tabs
  vars["--theme-ui-tabs-bg"] = theme.ui.tabs.bg;
  vars["--theme-ui-tabs-border"] = theme.ui.tabs.border;
  vars["--theme-ui-tabs-active-bg"] = theme.ui.tabs.activeBg;
  vars["--theme-ui-tabs-active-text"] = theme.ui.tabs.activeText;
  vars["--theme-ui-tabs-inactive-bg"] = theme.ui.tabs.inactiveBg;
  vars["--theme-ui-tabs-inactive-text"] = theme.ui.tabs.inactiveText;
  vars["--theme-ui-tabs-hover-bg"] = theme.ui.tabs.hoverBg;
  vars["--theme-ui-tabs-hover-text"] = theme.ui.tabs.hoverText;

  // UI component colors - Editor
  vars["--theme-ui-editor-bg"] = theme.ui.editor.bg;
  vars["--theme-ui-editor-text"] = theme.ui.editor.text;
  vars["--theme-ui-editor-line-numbers"] = theme.ui.editor.lineNumbers;
  vars["--theme-ui-editor-line-numbers-text"] = theme.ui.editor.lineNumbersText;
  vars["--theme-ui-editor-line-numbers-border"] =
    theme.ui.editor.lineNumbersBorder;
  vars["--theme-ui-editor-input-border"] = theme.ui.editor.inputBorder;

  // Diagram colors - BPMN
  vars["--theme-diagram-bpmn-task-fill"] = theme.diagrams.bpmn.task.fill;
  vars["--theme-diagram-bpmn-task-stroke"] = theme.diagrams.bpmn.task.stroke;
  vars["--theme-diagram-bpmn-event-fill"] = theme.diagrams.bpmn.event.fill;
  vars["--theme-diagram-bpmn-event-stroke"] = theme.diagrams.bpmn.event.stroke;
  vars["--theme-diagram-bpmn-gateway-fill"] = theme.diagrams.bpmn.gateway.fill;
  vars["--theme-diagram-bpmn-gateway-stroke"] =
    theme.diagrams.bpmn.gateway.stroke;
  vars["--theme-diagram-bpmn-pool-fill"] = theme.diagrams.bpmn.pool.fill;
  vars["--theme-diagram-bpmn-pool-stroke"] = theme.diagrams.bpmn.pool.stroke;

  // Diagram colors - Sequence
  vars["--theme-diagram-sequence-actor-fill"] =
    theme.diagrams.sequence.actor.fill;
  vars["--theme-diagram-sequence-actor-stroke"] =
    theme.diagrams.sequence.actor.stroke;
  vars["--theme-diagram-sequence-lifeline-fill"] =
    theme.diagrams.sequence.lifeline.fill;
  vars["--theme-diagram-sequence-lifeline-stroke"] =
    theme.diagrams.sequence.lifeline.stroke;
  vars["--theme-diagram-sequence-activation-fill"] =
    theme.diagrams.sequence.activation.fill;
  vars["--theme-diagram-sequence-activation-stroke"] =
    theme.diagrams.sequence.activation.stroke;
  vars["--theme-diagram-sequence-note-fill"] = theme.diagrams.sequence.note.fill;
  vars["--theme-diagram-sequence-note-stroke"] =
    theme.diagrams.sequence.note.stroke;

  // Diagram colors - Data Flow
  vars["--theme-diagram-data-flow-process-fill"] =
    theme.diagrams.dataFlow.process.fill;
  vars["--theme-diagram-data-flow-process-stroke"] =
    theme.diagrams.dataFlow.process.stroke;
  vars["--theme-diagram-data-flow-data-store-fill"] =
    theme.diagrams.dataFlow.dataStore.fill;
  vars["--theme-diagram-data-flow-data-store-stroke"] =
    theme.diagrams.dataFlow.dataStore.stroke;
  vars["--theme-diagram-data-flow-entity-fill"] =
    theme.diagrams.dataFlow.entity.fill;
  vars["--theme-diagram-data-flow-entity-stroke"] =
    theme.diagrams.dataFlow.entity.stroke;
  vars["--theme-diagram-data-flow-subprocess-fill"] =
    theme.diagrams.dataFlow.subprocess.fill;
  vars["--theme-diagram-data-flow-subprocess-stroke"] =
    theme.diagrams.dataFlow.subprocess.stroke;

  // Markdown colors
  vars["--theme-markdown-code-bg"] = theme.markdown.code.bg;
  vars["--theme-markdown-code-border"] = theme.markdown.code.border;
  vars["--theme-markdown-blockquote-border"] = theme.markdown.blockquote.border;
  vars["--theme-markdown-blockquote-text"] = theme.markdown.blockquote.text;
  vars["--theme-markdown-link"] = theme.markdown.link;
  vars["--theme-markdown-table-border"] = theme.markdown.table.border;
  vars["--theme-markdown-table-header-bg"] = theme.markdown.table.headerBg;
  vars["--theme-markdown-heading-border"] = theme.markdown.headingBorder;
  vars["--theme-markdown-hr"] = theme.markdown.hr;

  return vars;
}

/**
 * Inject theme CSS variables into the document root
 *
 * Updates the :root element's style with CSS custom properties
 * generated from the theme configuration. This allows instant
 * theme switching without page reloads.
 *
 * @param theme - Theme configuration to inject
 *
 * @example
 * ```tsx
 * import { getTheme } from './theme-registry';
 * import { injectThemeCSSVars } from './theme-css-vars';
 *
 * const theme = getTheme('dark');
 * injectThemeCSSVars(theme);
 * // All CSS variables are now updated in :root
 * ```
 */
export function injectThemeCSSVars(theme: ThemeConfig): void {
  // Only run in browser environment
  if (typeof document === "undefined") {
    return;
  }

  const vars = generateThemeCSSVars(theme);
  const root = document.documentElement;

  // Apply all CSS variables to :root
  Object.entries(vars).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });
}

/**
 * Get the current value of a theme CSS variable
 *
 * Reads the computed value of a CSS variable from the document root.
 * Useful for canvas/WebGL rendering that needs to read theme colors.
 *
 * @param varName - CSS variable name (with or without -- prefix)
 * @returns The computed CSS variable value, or empty string if not found
 *
 * @example
 * ```tsx
 * const bgColor = getThemeCSSVar('--theme-canvas-background');
 * const primaryColor = getThemeCSSVar('theme-primary-500'); // -- prefix optional
 * ```
 */
export function getThemeCSSVar(varName: string): string {
  if (typeof document === "undefined") {
    return "";
  }

  // Ensure variable name has -- prefix
  const normalizedName = varName.startsWith("--") ? varName : `--${varName}`;

  return getComputedStyle(document.documentElement)
    .getPropertyValue(normalizedName)
    .trim();
}

/**
 * Get all current theme CSS variables as an object
 *
 * Useful for debugging or inspecting the current theme state.
 *
 * @returns Object mapping CSS variable names to their current values
 */
export function getAllThemeCSSVars(): Record<string, string> {
  if (typeof document === "undefined") {
    return {};
  }

  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  const vars: Record<string, string> = {};

  // Get all inline style properties that start with --theme-
  Array.from(root.style).forEach((prop) => {
    if (prop.startsWith("--theme-")) {
      vars[prop] = computedStyle.getPropertyValue(prop).trim();
    }
  });

  return vars;
}
