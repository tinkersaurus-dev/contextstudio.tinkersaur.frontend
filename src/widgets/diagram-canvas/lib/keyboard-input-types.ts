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
  /** Delete a shape by ID */
  deleteShape: (id: string) => void;
  /** Delete a connector by ID */
  deleteConnector: (id: string) => void;
}

/**
 * Complete keyboard interaction callbacks
 * Combines query and deletion callbacks for keyboard input handling
 */
export interface KeyboardInteractionCallbacks
  extends EntityQueryCallbacks,
    EntityDeletionCallbacks {}
