/**
 * Mouse Input Types
 *
 * Shared type definitions for mouse input handling.
 */

import type { DiagramEntity } from '@/entities/diagram-entity';
import type { SnapMode } from '@/shared/lib/grid-system';

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
  /** Find entity at a specific world coordinate point (returns single or null) */
  findEntityAtPoint: (x: number, y: number) => DiagramEntity | null;
  /** Check if an entity is currently selected */
  isSelected: (id: string) => boolean;
  /** Get all currently selected entities (returns array) */
  getAllSelectedEntities: () => DiagramEntity[];
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
  /**
   * Update an entity's position during drag (internal, no command created)
   * This is called many times per second during drag operations
   */
  updateEntityPositionInternal: (id: string, x: number, y: number) => void;
  /**
   * Finalize entity move and create undo/redo command
   * This is called once when drag completes
   * @param moves - Array of {entityId, fromX, fromY, toX, toY} for all moved entities
   */
  finalizeEntityMove: (moves: Array<{
    entityId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>) => void;
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
  /** Check if default handlers should be skipped (e.g., when handling connection points) */
  shouldSkipDefaultHandlers?: () => boolean;
  /** Check if a world position is on a connection point */
  isConnectionPointAt?: (worldX: number, worldY: number) => boolean;
}

/**
 * Text editing callbacks
 */
export interface TextEditingCallbacks {
  /** Start editing text on a shape */
  startEditingText: (shapeId: string) => void;
  /** Get all shapes for entity lookup */
  getAllShapes?: () => DiagramEntity[];
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
    CanvasSettingsCallbacks,
    TextEditingCallbacks {}

/**
 * Connection point interaction types
 * Used for connector creation via drag-and-drop from connection points
 */
export interface ConnectionPointDragState {
  /** Whether user is currently dragging a connector */
  isDraggingConnector: boolean;
  /** Whether the drag has moved enough to be considered a real drag (not just a click) */
  hasMovedDuringDrag: boolean;
  /** Start point of connector drag */
  connectorDragStart: {
    shapeId: string;
    anchor: string;
    x: number;
    y: number;
  } | null;
  /** Current end point of connector drag */
  connectorDragEnd: { x: number; y: number } | null;
}

/**
 * Connection point hover state
 * Used for showing visual feedback when hovering near connection points
 */
export interface ConnectionPointHoverState {
  /** IDs of shapes that should show connection points (nearby or being dragged to) */
  hoveredShapeIds: string[];
  /** Specific connection point being hovered */
  hoveredConnectionPoint: {
    shapeId: string;
    anchor: string;
  } | null;
}
