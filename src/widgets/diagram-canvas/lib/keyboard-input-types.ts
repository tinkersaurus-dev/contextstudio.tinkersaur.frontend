/**
 * Keyboard Input Types
 *
 * Shared type definitions for keyboard input handling.
 */

import type { DiagramEntity } from '@/entities/diagram-entity';

/**
 * Entity query callbacks for retrieving entities
 */
export interface EntityQueryCallbacks {
  /** Get all currently selected entities (returns array) */
  getAllSelectedEntities: () => DiagramEntity[];
}

/**
 * Entity deletion callbacks
 */
export interface EntityDeletionCallbacks {
  /** Delete all currently selected entities (uses bulk delete command) */
  deleteSelectedEntities: () => void;
}

/**
 * Undo/Redo callbacks
 */
export interface UndoRedoCallbacks {
  /** Undo the most recent command */
  undo: () => void;
  /** Redo the most recently undone command */
  redo: () => void;
  /** Check if undo is available */
  canUndo: () => boolean;
  /** Check if redo is available */
  canRedo: () => boolean;
}

/**
 * Complete keyboard interaction callbacks
 * Combines query, deletion, and undo/redo callbacks for keyboard input handling
 */
export interface KeyboardInteractionCallbacks
  extends EntityQueryCallbacks,
    EntityDeletionCallbacks,
    UndoRedoCallbacks {}
