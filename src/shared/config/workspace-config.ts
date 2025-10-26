/**
 * Workspace Configuration
 *
 * Centralized configuration for the design studio workspace,
 * including tab management and content editing settings.
 */

// ============================================================================
// TAB MANAGEMENT
// ============================================================================

/**
 * Maximum number of content tabs that can be open simultaneously
 * (not including the fixed Home tab)
 */
export const MAX_OPEN_TABS = 5;

/**
 * Duration (in milliseconds) to display error messages
 */
export const ERROR_MESSAGE_DURATION = 3000;

/**
 * Auto-save debounce delay (in milliseconds)
 * Prevents excessive updates when editing content rapidly
 */
export const AUTO_SAVE_DEBOUNCE_MS = 500;

// ============================================================================
// TAB UI CONFIGURATION
// ============================================================================

/**
 * Tab close button configuration
 */
export const TAB_CLOSE_BUTTON_CONFIG = {
  size: '2xs' as const,
  ariaLabel: 'Close tab',
} as const;

/**
 * Status message configuration
 */
export const STATUS_MESSAGE_CONFIG = {
  fontSize: 'xs' as const,
  color: 'gray.600' as const,
} as const;

/**
 * Error message configuration
 */
export const ERROR_MESSAGE_CONFIG = {
  fontSize: 'sm' as const,
  colorPalette: 'red' as const,
  padding: 2,
} as const;
