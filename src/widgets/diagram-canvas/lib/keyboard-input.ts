/**
 * Keyboard Input Setup
 *
 * Sets up keyboard event listeners for canvas interaction.
 * Handler logic is extracted to separate files for better testability.
 */

import type { KeyboardInteractionCallbacks } from './keyboard-input-types';
import * as handlers from './keyboard-handlers';
import type { KeyboardHandlerContext } from './keyboard-handlers';

// Re-export types for backwards compatibility
export type { KeyboardInteractionCallbacks } from './keyboard-input-types';

/**
 * Build keydown event handler
 */
function buildKeyDownHandler(context: KeyboardHandlerContext) {
  return (event: KeyboardEvent) => {
    // Check for platform-specific modifier key
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifierKey = isMac ? event.metaKey : event.ctrlKey;

    // Handle Undo: Ctrl+Z / Cmd+Z (without Shift)
    if (modifierKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      handlers.handleUndoKey(context);
      return;
    }

    // Handle Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y (Windows)
    if (
      (modifierKey && event.shiftKey && event.key.toLowerCase() === 'z') ||
      (!isMac && event.ctrlKey && event.key.toLowerCase() === 'y')
    ) {
      event.preventDefault();
      handlers.handleRedoKey(context);
      return;
    }

    // Handle Delete or Backspace key
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // Prevent default behavior (e.g., browser back navigation on Backspace)
      event.preventDefault();
      handlers.handleDeleteKey(context);
      return;
    }
  };
}

/**
 * Attach keyboard event listeners to window
 */
function attachEventListeners(
  keydownHandler: (event: KeyboardEvent) => void
): void {
  window.addEventListener('keydown', keydownHandler);
}

/**
 * Create cleanup function to remove keyboard event listeners
 */
function createCleanupFunction(
  keydownHandler: (event: KeyboardEvent) => void
): () => void {
  return () => {
    window.removeEventListener('keydown', keydownHandler);
  };
}

/**
 * Setup keyboard input handlers for the canvas
 *
 * @param callbacks - Callbacks for entity interaction (selection, deletion)
 * @returns Cleanup function to remove all event listeners
 */
export function setupKeyboardInput(
  callbacks: KeyboardInteractionCallbacks
): () => void {
  // Build handler context
  const context: KeyboardHandlerContext = {
    callbacks,
  };

  // Build event handler
  const keydownHandler = buildKeyDownHandler(context);

  // Attach listener
  attachEventListeners(keydownHandler);

  // Return cleanup function
  return createCleanupFunction(keydownHandler);
}
