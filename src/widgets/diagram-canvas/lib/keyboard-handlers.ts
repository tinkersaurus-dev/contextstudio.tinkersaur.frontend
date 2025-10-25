/**
 * Keyboard Handlers
 *
 * Pure functions for handling keyboard events.
 * Extracted for testability and separation of concerns.
 */

import type { KeyboardInteractionCallbacks } from './keyboard-input-types';

/**
 * Context for keyboard handlers
 */
export interface KeyboardHandlerContext {
  callbacks: KeyboardInteractionCallbacks;
}

/**
 * Handle Delete/Backspace key press
 *
 * Deletes all currently selected entities (shapes and connectors).
 * Shapes will automatically cascade delete their attached connectors.
 *
 * This now uses the bulk delete operation which creates a single
 * composite command for undo/redo.
 */
export function handleDeleteKey(context: KeyboardHandlerContext): void {
  const { callbacks } = context;

  // Use bulk delete operation (creates single undo/redo command)
  callbacks.deleteSelectedEntities();
}

/**
 * Handle Undo key press (Ctrl+Z / Cmd+Z)
 *
 * Undoes the most recent command in the history.
 */
export function handleUndoKey(context: KeyboardHandlerContext): void {
  const { callbacks } = context;

  if (callbacks.canUndo()) {
    callbacks.undo();
  }
}

/**
 * Handle Redo key press (Ctrl+Shift+Z / Cmd+Shift+Z / Ctrl+Y)
 *
 * Redoes the most recently undone command.
 */
export function handleRedoKey(context: KeyboardHandlerContext): void {
  const { callbacks } = context;

  if (callbacks.canRedo()) {
    callbacks.redo();
  }
}
