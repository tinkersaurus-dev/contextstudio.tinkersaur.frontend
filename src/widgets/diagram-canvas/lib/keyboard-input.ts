/**
 * Keyboard Input Setup
 *
 * Sets up keyboard event listeners for canvas interaction.
 * Handler logic is extracted to separate files for better testability.
 *
 * IMPORTANT: Keyboard handlers now check canvas visibility to prevent
 * hidden canvases (in inactive tabs) from processing keyboard events.
 */

import type React from 'react';
import type { KeyboardInteractionCallbacks } from './keyboard-input-types';
import * as handlers from './keyboard-handlers';
import type { KeyboardHandlerContext } from './keyboard-handlers';

// Re-export types for backwards compatibility
export type { KeyboardInteractionCallbacks } from './keyboard-input-types';

/**
 * Build keydown event handler
 *
 * @param context - Handler context with callbacks
 * @param canvasRef - Optional ref to the canvas element (for visibility check)
 */
function buildKeyDownHandler(
  context: KeyboardHandlerContext,
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
) {
  return (event: KeyboardEvent) => {
    // Don't handle keyboard shortcuts if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    // ISOLATION FIX: If canvas ref is provided, only process events if the canvas
    // is visible and not hidden via CSS. This prevents hidden canvases (in inactive tabs)
    // from processing keyboard events when multiple canvas instances are mounted.
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const computedStyle = window.getComputedStyle(canvas);

      // Skip if canvas is hidden (visibility: hidden or display: none)
      if (computedStyle.visibility === 'hidden' || computedStyle.display === 'none') {
        return;
      }

      // Skip if canvas has pointer-events: none (indicates it's not the active tab)
      if (computedStyle.pointerEvents === 'none') {
        return;
      }
    }

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
 * @param canvasRef - Optional ref to the canvas element (for visibility-aware event handling)
 * @returns Cleanup function to remove all event listeners
 */
export function setupKeyboardInput(
  callbacks: KeyboardInteractionCallbacks,
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
): () => void {
  // Build handler context
  const context: KeyboardHandlerContext = {
    callbacks,
  };

  // Build event handler with optional canvas ref for visibility checks
  const keydownHandler = buildKeyDownHandler(context, canvasRef);

  // Attach listener
  attachEventListeners(keydownHandler);

  // Return cleanup function
  return createCleanupFunction(keydownHandler);
}
