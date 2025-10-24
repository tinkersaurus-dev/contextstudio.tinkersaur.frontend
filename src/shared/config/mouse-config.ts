/**
 * Mouse Configuration
 *
 * Constants and configuration for mouse interaction handling.
 * Provides standardized values for mouse buttons and modifiers.
 */

/**
 * Mouse button constants
 * Standard mouse button identifiers for use with MouseEvent.button
 */
export const MOUSE_BUTTONS = {
  /** Left mouse button (primary) */
  LEFT: 0,
  /** Middle mouse button (auxiliary/wheel) */
  MIDDLE: 1,
  /** Right mouse button (secondary/context) */
  RIGHT: 2,
  /** Browser back button */
  BACK: 3,
  /** Browser forward button */
  FORWARD: 4,
} as const;

/**
 * Type for mouse button values
 */
export type MouseButton = typeof MOUSE_BUTTONS[keyof typeof MOUSE_BUTTONS];
