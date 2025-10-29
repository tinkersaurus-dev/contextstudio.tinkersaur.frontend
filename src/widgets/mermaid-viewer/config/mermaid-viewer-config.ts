/**
 * Mermaid Viewer Configuration
 *
 * Configuration constants for the Mermaid viewer widget positioning and styling.
 */

/**
 * Position configuration for the Mermaid viewer panel
 */
export const MERMAID_VIEWER_POSITION = {
  /** Distance from the top edge of the canvas */
  top: 16,
  /** Distance from the right edge of the canvas */
  right: 16,
  /** Z-index to ensure it appears above canvas but below modals */
  zIndex: 10,
} as const;

/**
 * Size configuration for the Mermaid viewer panel
 */
export const MERMAID_VIEWER_SIZE = {
  /** Width of the panel when expanded */
  width: 400,
  /** Maximum height of the panel */
  maxHeight: 600,
  /** Minimum height of the panel */
  minHeight: 200,
} as const;

/**
 * Textarea configuration
 */
export const MERMAID_TEXTAREA_CONFIG = {
  /** Number of rows for the textarea */
  rows: 15,
  /** Font family for monospace code display */
  fontFamily: 'monospace',
  /** Font size for the code */
  fontSize: '14px',
  /** Line height for readability */
  lineHeight: '1.5',
} as const;

/**
 * Debounce delay for Mermaid syntax updates (in milliseconds)
 * This prevents excessive re-renders during rapid diagram changes
 */
export const MERMAID_UPDATE_DEBOUNCE_MS = 300;
