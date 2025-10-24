/**
 * Mouse Input Types
 *
 * Shared type definitions for mouse input handling.
 */

import type { DiagramEntity } from '@/entities/diagram-entity';
import type { SnapMode } from '@/shared/lib/snap-to-grid';

// Zoom state
export interface ZoomState {
  scale: number;
  panX: number;
  panY: number;
}

// Selection box state (for rendering)
export interface SelectionBoxState {
  isSelecting: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

/**
 * Entity query callbacks for hit detection and retrieval
 */
export interface EntityQueryCallbacks {
  /** Get entity at a specific world coordinate point */
  getEntityAtPoint: (x: number, y: number) => DiagramEntity | null;
  /** Check if an entity is currently selected */
  isSelected: (id: string) => boolean;
  /** Get all currently selected entities */
  getSelectedEntities: () => DiagramEntity[];
}

/**
 * Entity selection management callbacks
 */
export interface EntitySelectionCallbacks {
  /** Set the selected entities (replaces current selection) */
  setSelectedEntities: (ids: string[]) => void;
  /** Add an entity to the current selection */
  addToSelection: (id: string) => void;
  /** Toggle an entity's selection state */
  toggleSelection: (id: string) => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Select all entities within a bounding box */
  selectEntitiesInBox: (x1: number, y1: number, x2: number, y2: number) => void;
  /** Callback when selection box changes (for rendering) */
  onSelectionBoxChange?: (box: SelectionBoxState | null) => void;
}

/**
 * Entity drag and manipulation callbacks
 */
export interface EntityDragCallbacks {
  /** Set which entities are currently being dragged */
  setDraggingEntities: (ids: string[]) => void;
  /** Clear all dragging states */
  clearDraggingEntities: () => void;
  /** Update an entity's position */
  updateEntityPosition: (id: string, x: number, y: number) => void;
}

/**
 * Entity creation callbacks
 */
export interface EntityCreationCallbacks {
  /** Create a rectangle at the specified point */
  createRectangleAtPoint: (x: number, y: number) => void;
  /** Open toolset popover at the specified screen and world positions */
  openToolsetPopover?: (screenX: number, screenY: number, worldX: number, worldY: number) => void;
}

/**
 * Canvas settings callbacks
 */
export interface CanvasSettingsCallbacks {
  /** Get the current snap mode */
  getSnapMode: () => SnapMode;
}

/**
 * Complete entity interaction callbacks
 * Combines all callback groups for mouse input handling
 */
export interface EntityInteractionCallbacks
  extends EntityQueryCallbacks,
    EntitySelectionCallbacks,
    EntityDragCallbacks,
    EntityCreationCallbacks,
    CanvasSettingsCallbacks {}
