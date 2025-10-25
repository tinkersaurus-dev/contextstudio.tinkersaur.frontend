/**
 * Mouse Event Handlers
 *
 * Extracted, testable handler functions for mouse input.
 * Separating handlers from setup logic improves testability and maintainability.
 */

import {
  CanvasTransform,
  getCanvasMousePosition,
  type Point,
} from '@/shared/lib/canvas-transform';
import { ZOOM_CONFIG } from '@/shared/config/canvas-config';
import { GridSystem } from '@/shared/lib/grid-system';
import type {
  EntityInteractionCallbacks,
} from './mouse-input-types';

// State types
export interface PanState {
  isPanning: boolean;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
}

export interface DragState {
  isDragging: boolean;
  draggedEntityIds: string[];
  startX: number;
  startY: number;
  initialPositions: Map<string, { x: number; y: number }>;
}

export interface SelectionBoxState {
  isSelecting: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface DoubleClickState {
  lastClickTime: number;
  lastClickedEntityId: string | null;
  doubleClickThreshold: number; // milliseconds
}

// Handler context
export interface MouseHandlerContext {
  canvas: HTMLCanvasElement;
  getCurrentTransform: () => CanvasTransform;
  setTransform: (transform: CanvasTransform) => void;
  entityCallbacks?: EntityInteractionCallbacks;
  panState: PanState;
  dragState: DragState;
  selectionBoxState: SelectionBoxState;
  doubleClickState: DoubleClickState;
}

/**
 * Handle mouse wheel events for zooming
 */
export function handleWheel(
  event: WheelEvent,
  context: MouseHandlerContext
): void {
  event.preventDefault();
  const { canvas, getCurrentTransform, setTransform } = context;

  const mousePos = getCanvasMousePosition(event, canvas);
  const delta = -event.deltaY * ZOOM_CONFIG.zoomSpeed;
  const currentTransform = getCurrentTransform();

  const newTransform = currentTransform.zoom(
    mousePos,
    delta,
    ZOOM_CONFIG.minScale,
    ZOOM_CONFIG.maxScale
  );

  if (!newTransform.equals(currentTransform)) {
    setTransform(newTransform);
  }
}

/**
 * Handle right mouse button down - create shape or open toolset
 */
export function handleRightMouseDown(
  screenX: number,
  screenY: number,
  context: MouseHandlerContext
): void {
  const { getCurrentTransform, entityCallbacks } = context;

  if (!entityCallbacks) return;

  const currentTransform = getCurrentTransform();
  const worldPos = currentTransform.screenToWorld(screenX, screenY);

  if (entityCallbacks.openToolsetPopover) {
    entityCallbacks.openToolsetPopover(screenX, screenY, worldPos.x, worldPos.y);
  } else {
    entityCallbacks.createRectangleAtPoint(worldPos.x, worldPos.y);
  }
}

/**
 * Handle middle mouse button down - start panning
 */
export function handleMiddleMouseDown(
  event: MouseEvent,
  context: MouseHandlerContext
): void {
  const { canvas, getCurrentTransform, panState } = context;
  const currentTransform = getCurrentTransform();

  panState.isPanning = true;
  panState.startX = event.clientX;
  panState.startY = event.clientY;
  panState.startPanX = currentTransform.panX;
  panState.startPanY = currentTransform.panY;
  canvas.style.cursor = 'grabbing';
}

/**
 * Handle left mouse button down on entity - start selection/drag
 */
export function handleEntityMouseDown(
  entityId: string,
  screenX: number,
  screenY: number,
  modifiers: { shift: boolean; ctrl: boolean },
  context: MouseHandlerContext
): void {
  const { canvas, entityCallbacks, dragState, doubleClickState } = context;

  if (!entityCallbacks) return;

  // Check for double-click
  const currentTime = Date.now();
  const timeSinceLastClick = currentTime - doubleClickState.lastClickTime;
  const isDoubleClick =
    timeSinceLastClick < doubleClickState.doubleClickThreshold &&
    doubleClickState.lastClickedEntityId === entityId;

  if (isDoubleClick) {
    // Handle double-click - trigger text editing
    handleEntityDoubleClick(entityId, context);
    // Reset double-click state
    doubleClickState.lastClickTime = 0;
    doubleClickState.lastClickedEntityId = null;
    // Prevent any drag state from being set
    dragState.isDragging = false;
    return;
  }

  // Update double-click tracking
  doubleClickState.lastClickTime = currentTime;
  doubleClickState.lastClickedEntityId = entityId;

  // Handle selection based on modifiers
  if (modifiers.shift) {
    entityCallbacks.addToSelection(entityId);
  } else if (modifiers.ctrl) {
    entityCallbacks.toggleSelection(entityId);
  } else {
    if (!entityCallbacks.isSelected(entityId)) {
      entityCallbacks.setSelectedEntities([entityId]);
    }
  }

  // Start dragging all selected SHAPES (not connectors - they auto-update)
  const selectedEntities = entityCallbacks.getAllSelectedEntities();
  const selectedShapes = selectedEntities.filter((e) => e.type === 'shape');

  dragState.isDragging = true;
  dragState.draggedEntityIds = selectedShapes.map((e) => e.id);
  dragState.startX = screenX;
  dragState.startY = screenY;
  dragState.initialPositions = new Map(
    selectedShapes.map((e) => [e.id, { x: e.position.x, y: e.position.y }])
  );

  // Set dragging state for visual feedback (can include connectors for selection highlight)
  entityCallbacks.setDraggingEntities(selectedEntities.map((e) => e.id));
  canvas.style.cursor = 'move';
}

/**
 * Handle double-click on entity - start text editing
 */
export function handleEntityDoubleClick(
  entityId: string,
  context: MouseHandlerContext
): void {
  const { entityCallbacks } = context;

  if (!entityCallbacks?.startEditingText) return;

  // Check if entity is a shape (only shapes support text editing)
  // First try to find in selected entities
  let entity = entityCallbacks.getAllSelectedEntities().find((e) => e.id === entityId);

  // If not in selection, try to find in all shapes
  if (!entity && entityCallbacks.getAllShapes) {
    const allShapes = entityCallbacks.getAllShapes();
    entity = allShapes.find((e) => e.id === entityId);
  }

  // Only proceed if we found a shape entity
  if (!entity || entity.type !== 'shape') {
    return;
  }

  // Start text editing mode
  entityCallbacks.startEditingText(entityId);
}

/**
 * Handle left mouse button down on empty space - start selection box
 */
export function handleEmptySpaceMouseDown(
  worldX: number,
  worldY: number,
  hasModifier: boolean,
  context: MouseHandlerContext
): void {
  const { canvas, entityCallbacks, selectionBoxState } = context;

  if (!entityCallbacks) return;

  // Clear selection if no modifier key
  if (!hasModifier) {
    entityCallbacks.clearSelection();
  }

  // Start selection box
  selectionBoxState.isSelecting = true;
  selectionBoxState.startX = worldX;
  selectionBoxState.startY = worldY;
  selectionBoxState.currentX = worldX;
  selectionBoxState.currentY = worldY;
  canvas.style.cursor = 'crosshair';
}

/**
 * Handle mouse move during entity drag
 */
export function handleEntityDrag(
  screenX: number,
  screenY: number,
  context: MouseHandlerContext
): void {
  const { getCurrentTransform, entityCallbacks, dragState } = context;

  if (!entityCallbacks) return;

  const currentTransform = getCurrentTransform();
  const deltaX = (screenX - dragState.startX) / currentTransform.scale;
  const deltaY = (screenY - dragState.startY) / currentTransform.scale;
  const snapMode = entityCallbacks.getSnapMode();

  dragState.draggedEntityIds.forEach((id) => {
    const initialPos = dragState.initialPositions.get(id);
    if (initialPos) {
      let newX = initialPos.x + deltaX;
      let newY = initialPos.y + deltaY;

      if (snapMode !== 'none') {
        const snapped = GridSystem.snapPoint(newX, newY, currentTransform.scale, snapMode);
        newX = snapped.x;
        newY = snapped.y;
      }

      // Use internal update during drag (no command created)
      entityCallbacks.updateEntityPositionInternal(id, newX, newY);
    }
  });
}

/**
 * Handle mouse move during selection box
 */
export function handleSelectionBoxDrag(
  worldX: number,
  worldY: number,
  context: MouseHandlerContext
): void {
  const { entityCallbacks, selectionBoxState } = context;

  selectionBoxState.currentX = worldX;
  selectionBoxState.currentY = worldY;

  if (entityCallbacks?.onSelectionBoxChange) {
    entityCallbacks.onSelectionBoxChange(selectionBoxState);
  }
}

/**
 * Handle mouse move during canvas pan
 */
export function handleCanvasPan(
  clientX: number,
  clientY: number,
  context: MouseHandlerContext
): void {
  const { getCurrentTransform, setTransform, panState } = context;

  const currentPos: Point = { x: clientX, y: clientY };
  const panStart: Point = { x: panState.startX, y: panState.startY };
  const initialPan: Point = { x: panState.startPanX, y: panState.startPanY };

  const currentTransform = getCurrentTransform();
  const newTransform = currentTransform.pan(currentPos, panStart, initialPan);

  setTransform(newTransform);
}

/**
 * Handle mouse up - complete drag operation
 */
export function handleDragComplete(context: MouseHandlerContext): void {
  const { canvas, entityCallbacks, dragState } = context;

  if (!entityCallbacks) return;

  // Finalize move by creating a single undo command
  // Collect all moved entities with their before/after positions
  const moves: Array<{
    entityId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }> = [];

  // Get all entities to find current positions
  const allEntities = entityCallbacks.getAllSelectedEntities();

  dragState.draggedEntityIds.forEach((id) => {
    const initialPos = dragState.initialPositions.get(id);
    if (!initialPos) return;

    // Find the entity in the list to get its final position
    const entity = allEntities.find((e) => e.id === id);

    // For shapes, we can get the final position from the entity
    // (Note: This assumes entities have been updated via internal update during drag)
    if (entity && entity.type === 'shape') {
      const shape = entity as { id: string; position: { x: number; y: number } };
      const finalPos = shape.position;

      // Only create move if position actually changed
      if (initialPos.x !== finalPos.x || initialPos.y !== finalPos.y) {
        moves.push({
          entityId: id,
          fromX: initialPos.x,
          fromY: initialPos.y,
          toX: finalPos.x,
          toY: finalPos.y,
        });
      }
    }
  });

  // Finalize all moves with a single command
  if (moves.length > 0) {
    entityCallbacks.finalizeEntityMove(moves);
  }

  // Clean up drag state
  dragState.isDragging = false;
  entityCallbacks.clearDraggingEntities();
  dragState.draggedEntityIds = [];
  dragState.initialPositions.clear();
  canvas.style.cursor = 'default';
}

/**
 * Handle mouse up - complete selection box
 */
export function handleSelectionBoxComplete(context: MouseHandlerContext): void {
  const { canvas, entityCallbacks, selectionBoxState } = context;

  if (!entityCallbacks) return;

  entityCallbacks.selectEntitiesInBox(
    selectionBoxState.startX,
    selectionBoxState.startY,
    selectionBoxState.currentX,
    selectionBoxState.currentY
  );

  selectionBoxState.isSelecting = false;
  if (entityCallbacks.onSelectionBoxChange) {
    entityCallbacks.onSelectionBoxChange(null);
  }
  canvas.style.cursor = 'default';
}

/**
 * Handle mouse up - complete pan operation
 */
export function handlePanComplete(context: MouseHandlerContext): void {
  const { canvas, panState } = context;
  panState.isPanning = false;
  canvas.style.cursor = 'default';
}
