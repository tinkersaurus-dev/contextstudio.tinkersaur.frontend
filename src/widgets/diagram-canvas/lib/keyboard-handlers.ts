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
 */
export function handleDeleteKey(context: KeyboardHandlerContext): void {
  const { callbacks } = context;

  // Get all selected entities
  const selectedEntities = callbacks.getAllSelectedEntities();

  if (selectedEntities.length === 0) {
    return; // Nothing to delete
  }

  // Separate shapes and connectors
  const shapeIds: string[] = [];
  const connectorIds: string[] = [];

  selectedEntities.forEach((entity) => {
    if (entity.type === 'shape') {
      shapeIds.push(entity.id);
    } else if (entity.type === 'connector') {
      connectorIds.push(entity.id);
    }
  });

  // Delete shapes first (this will cascade delete attached connectors)
  shapeIds.forEach((id) => {
    callbacks.deleteShape(id);
  });

  // Delete standalone connectors (ones not attached to deleted shapes)
  connectorIds.forEach((id) => {
    callbacks.deleteConnector(id);
  });
}
