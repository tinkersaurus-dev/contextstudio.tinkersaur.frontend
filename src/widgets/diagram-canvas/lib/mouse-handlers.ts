/**
 * Mouse Event Handlers
 *
 * Extracted, testable handler functions for mouse input.
 * Separating handlers from setup logic improves testability and maintainability.
 */

import {
  screenToWorld,
  calculateZoomToPoint,
  calculatePan,
  getCanvasMousePosition,
  type Point,
} from '@/shared/lib/canvas-coordinates';
import { ZOOM_CONFIG } from '@/shared/config/canvas-config';
import { snapToGrid } from '@/shared/lib/snap-to-grid';
import type {
  ZoomState,
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

// Handler context
export interface MouseHandlerContext {
  canvas: HTMLCanvasElement;
  getCurrentZoomState: () => ZoomState;
  setZoomState: (state: ZoomState) => void;
  entityCallbacks?: EntityInteractionCallbacks;
  panState: PanState;
  dragState: DragState;
  selectionBoxState: SelectionBoxState;
}

/**
 * Handle mouse wheel events for zooming
 */
export function handleWheel(
  event: WheelEvent,
  context: MouseHandlerContext
): void {
  event.preventDefault();
  const { canvas, getCurrentZoomState, setZoomState } = context;

  const mousePos = getCanvasMousePosition(event, canvas);
  const delta = -event.deltaY * ZOOM_CONFIG.zoomSpeed;
  const currentZoomState = getCurrentZoomState();

  const newZoomState = calculateZoomToPoint(
    mousePos,
    currentZoomState,
    delta,
    ZOOM_CONFIG.minScale,
    ZOOM_CONFIG.maxScale
  );

  if (newZoomState !== currentZoomState) {
    setZoomState(newZoomState);
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
  const { getCurrentZoomState, entityCallbacks } = context;

  if (!entityCallbacks) return;

  const worldPos = screenToWorld(screenX, screenY, getCurrentZoomState());

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
  const { canvas, getCurrentZoomState, panState } = context;
  const currentZoomState = getCurrentZoomState();

  panState.isPanning = true;
  panState.startX = event.clientX;
  panState.startY = event.clientY;
  panState.startPanX = currentZoomState.panX;
  panState.startPanY = currentZoomState.panY;
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
  const { canvas, entityCallbacks, dragState } = context;

  if (!entityCallbacks) return;

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

  // Start dragging all selected entities
  const selectedEntities = entityCallbacks.getSelectedEntities();
  dragState.isDragging = true;
  dragState.draggedEntityIds = selectedEntities.map((e) => e.id);
  dragState.startX = screenX;
  dragState.startY = screenY;
  dragState.initialPositions = new Map(
    selectedEntities.map((e) => [e.id, { x: e.position.x, y: e.position.y }])
  );
  entityCallbacks.setDraggingEntities(dragState.draggedEntityIds);
  canvas.style.cursor = 'move';
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
  const { getCurrentZoomState, entityCallbacks, dragState } = context;

  if (!entityCallbacks) return;

  const currentZoomState = getCurrentZoomState();
  const deltaX = (screenX - dragState.startX) / currentZoomState.scale;
  const deltaY = (screenY - dragState.startY) / currentZoomState.scale;
  const snapMode = entityCallbacks.getSnapMode();

  dragState.draggedEntityIds.forEach((id) => {
    const initialPos = dragState.initialPositions.get(id);
    if (initialPos) {
      let newX = initialPos.x + deltaX;
      let newY = initialPos.y + deltaY;

      if (snapMode !== 'none') {
        const snapped = snapToGrid(newX, newY, currentZoomState.scale, snapMode);
        newX = snapped.x;
        newY = snapped.y;
      }

      entityCallbacks.updateEntityPosition(id, newX, newY);
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
  const { getCurrentZoomState, setZoomState, panState } = context;

  const currentPos: Point = { x: clientX, y: clientY };
  const panStart: Point = { x: panState.startX, y: panState.startY };
  const initialPan: Point = { x: panState.startPanX, y: panState.startPanY };

  const newPan = calculatePan(currentPos, panStart, initialPan);
  const currentZoomState = getCurrentZoomState();

  setZoomState({
    ...currentZoomState,
    panX: newPan.x,
    panY: newPan.y,
  });
}

/**
 * Handle mouse up - complete drag operation
 */
export function handleDragComplete(context: MouseHandlerContext): void {
  const { canvas, entityCallbacks, dragState } = context;

  if (!entityCallbacks) return;

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
