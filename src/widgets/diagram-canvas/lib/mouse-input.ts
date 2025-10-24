import { DiagramEntity } from '@/entities/diagram-entity';
import {
  screenToWorld,
  calculateZoomToPoint,
  calculatePan,
  getCanvasMousePosition,
  type Point,
} from '@/shared/lib/canvas-coordinates';
import { ZOOM_CONFIG } from '@/shared/config/canvas-config';
import { snapToGrid, type SnapMode } from '@/shared/lib/snap-to-grid';

// Types
export interface ZoomState {
  scale: number;
  panX: number;
  panY: number;
}

interface PanState {
  isPanning: boolean;
  startX: number;
  startY: number;
  startPanX: number;
  startPanY: number;
}

interface DragState {
  isDragging: boolean;
  draggedEntityIds: string[];
  startX: number;
  startY: number;
  initialPositions: Map<string, { x: number; y: number }>;
}

interface SelectionBoxState {
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

export function setupMouseInput(
  canvas: HTMLCanvasElement,
  getZoomState: () => ZoomState,
  setZoomState: (state: ZoomState) => void,
  entityCallbacks?: EntityInteractionCallbacks
): () => void {
  // Get current viewport state from the getter function
  // This ensures we always use the latest state from React
  const getCurrentZoomState = () => getZoomState();

  // Panning state
  const panState: PanState = {
    isPanning: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  };

  // Dragging state for entities
  const dragState: DragState = {
    isDragging: false,
    draggedEntityIds: [],
    startX: 0,
    startY: 0,
    initialPositions: new Map(),
  };

  // Selection box state
  const selectionBoxState: SelectionBoxState = {
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();

    // Get mouse position relative to canvas
    const mousePos = getCanvasMousePosition(event, canvas);

    // Calculate zoom delta
    const delta = -event.deltaY * ZOOM_CONFIG.zoomSpeed;

    // Get current zoom state
    const currentZoomState = getCurrentZoomState();

    // Calculate new zoom state
    const newZoomState = calculateZoomToPoint(
      mousePos,
      currentZoomState,
      delta,
      ZOOM_CONFIG.minScale,
      ZOOM_CONFIG.maxScale
    );

    if (newZoomState === currentZoomState) {
      return; // No change
    }

    setZoomState(newZoomState);
  };

  const handleMouseDown = (event: MouseEvent) => {
    const screenPos = getCanvasMousePosition(event, canvas);
    const screenX = screenPos.x;
    const screenY = screenPos.y;

    // Right click - open toolset popover (or create rectangle as fallback)
    if (event.button === 2 && entityCallbacks) {
      event.preventDefault();
      const worldPos = screenToWorld(screenX, screenY, getCurrentZoomState());

      // Use toolset popover if available, otherwise fallback to rectangle creation
      if (entityCallbacks.openToolsetPopover) {
        // Pass both screen coordinates (for UI positioning) and world coordinates (for shape creation)
        entityCallbacks.openToolsetPopover(screenX, screenY, worldPos.x, worldPos.y);
      } else {
        entityCallbacks.createRectangleAtPoint(worldPos.x, worldPos.y);
      }
      return;
    }

    // Middle mouse button - start panning
    if (event.button === 1) {
      event.preventDefault();
      const currentZoomState = getCurrentZoomState();
      panState.isPanning = true;
      panState.startX = event.clientX;
      panState.startY = event.clientY;
      panState.startPanX = currentZoomState.panX;
      panState.startPanY = currentZoomState.panY;
      canvas.style.cursor = 'grabbing';
      return;
    }

    // Left click - entity selection/dragging or selection box
    if (event.button === 0 && entityCallbacks) {
      const worldPos = screenToWorld(screenX, screenY, getCurrentZoomState());
      const entity = entityCallbacks.getEntityAtPoint(worldPos.x, worldPos.y);

      if (entity) {
        // Clicked on an entity
        const isShiftHeld = event.shiftKey;
        const isCtrlHeld = event.ctrlKey || event.metaKey;

        if (isShiftHeld) {
          // Shift + Click: Add to selection
          entityCallbacks.addToSelection(entity.id);
        } else if (isCtrlHeld) {
          // Ctrl/Cmd + Click: Toggle selection
          entityCallbacks.toggleSelection(entity.id);
        } else {
          // Regular click
          if (!entityCallbacks.isSelected(entity.id)) {
            // If entity not already selected, select only it
            entityCallbacks.setSelectedEntities([entity.id]);
          }
          // If entity is already selected, keep current selection (for multi-drag)
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
      } else {
        // Clicked on empty space
        if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
          // Clear selection if no modifier key
          entityCallbacks.clearSelection();
        }

        // Start selection box
        selectionBoxState.isSelecting = true;
        selectionBoxState.startX = worldPos.x;
        selectionBoxState.startY = worldPos.y;
        selectionBoxState.currentX = worldPos.x;
        selectionBoxState.currentY = worldPos.y;
        canvas.style.cursor = 'crosshair';
      }
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    const screenPos = getCanvasMousePosition(event, canvas);
    const screenX = screenPos.x;
    const screenY = screenPos.y;

    // Handle entity dragging
    if (dragState.isDragging && entityCallbacks) {
      const currentZoomState = getCurrentZoomState();
      const deltaX = (screenX - dragState.startX) / currentZoomState.scale;
      const deltaY = (screenY - dragState.startY) / currentZoomState.scale;
      const snapMode = entityCallbacks.getSnapMode();

      // Move all dragged entities
      dragState.draggedEntityIds.forEach((id) => {
        const initialPos = dragState.initialPositions.get(id);
        if (initialPos) {
          let newX = initialPos.x + deltaX;
          let newY = initialPos.y + deltaY;

          // Apply snapping if enabled - each entity snaps independently to maintain relative distances
          if (snapMode !== 'none') {
            const snapped = snapToGrid(newX, newY, currentZoomState.scale, snapMode);
            newX = snapped.x;
            newY = snapped.y;
          }

          entityCallbacks.updateEntityPosition(id, newX, newY);
        }
      });
      return;
    }

    // Handle selection box
    if (selectionBoxState.isSelecting && entityCallbacks) {
      const worldPos = screenToWorld(screenX, screenY, getCurrentZoomState());
      selectionBoxState.currentX = worldPos.x;
      selectionBoxState.currentY = worldPos.y;

      // Notify about selection box change for rendering
      if (entityCallbacks.onSelectionBoxChange) {
        entityCallbacks.onSelectionBoxChange(selectionBoxState);
      }
      return;
    }

    // Handle canvas panning
    if (panState.isPanning) {
      const currentPos: Point = { x: event.clientX, y: event.clientY };
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
  };

  const handleMouseUp = () => {
    // Complete entity dragging
    if (dragState.isDragging && entityCallbacks) {
      dragState.isDragging = false;
      entityCallbacks.clearDraggingEntities();
      dragState.draggedEntityIds = [];
      dragState.initialPositions.clear();
      canvas.style.cursor = 'default';
    }

    // Complete selection box
    if (selectionBoxState.isSelecting && entityCallbacks) {
      // Select all entities in the box
      entityCallbacks.selectEntitiesInBox(
        selectionBoxState.startX,
        selectionBoxState.startY,
        selectionBoxState.currentX,
        selectionBoxState.currentY
      );

      // Clear selection box
      selectionBoxState.isSelecting = false;
      if (entityCallbacks.onSelectionBoxChange) {
        entityCallbacks.onSelectionBoxChange(null);
      }
      canvas.style.cursor = 'default';
    }

    // Complete canvas panning
    if (panState.isPanning) {
      panState.isPanning = false;
      canvas.style.cursor = 'default';
    }
  };

  const handleContextMenu = (event: MouseEvent) => {
    // Prevent default context menu to allow right-click shape creation
    event.preventDefault();
  };

  canvas.addEventListener('wheel', handleWheel, { passive: false });
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  canvas.addEventListener('contextmenu', handleContextMenu);

  return () => {
    canvas.removeEventListener('wheel', handleWheel);
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseleave', handleMouseUp);
    canvas.removeEventListener('contextmenu', handleContextMenu);
  };
}
