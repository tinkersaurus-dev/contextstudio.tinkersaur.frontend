import { DiagramEntity } from '@/entities/diagram-entity';
import {
  screenToWorld,
  calculateZoomToPoint,
  calculatePan,
  getCanvasMousePosition,
  type Point,
  type Transform,
} from '@/shared/lib/canvas-coordinates';
import { ZOOM_CONFIG } from '@/shared/config/canvas-config';

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

export interface EntityInteractionCallbacks {
  getEntityAtPoint: (x: number, y: number) => DiagramEntity | null;
  isSelected: (id: string) => boolean;
  getSelectedEntities: () => DiagramEntity[];
  setSelectedEntities: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectEntitiesInBox: (x1: number, y1: number, x2: number, y2: number) => void;
  setDraggingEntities: (ids: string[]) => void;
  clearDraggingEntities: () => void;
  updateEntityPosition: (id: string, x: number, y: number) => void;
  createRectangleAtPoint: (x: number, y: number) => void;
  onSelectionBoxChange?: (box: SelectionBoxState | null) => void;
}

export function setupMouseInput(
  canvas: HTMLCanvasElement,
  onZoomChange: (state: ZoomState) => void,
  entityCallbacks?: EntityInteractionCallbacks
): () => void {
  // Current viewport state
  let zoomState: ZoomState = {
    scale: 1.0,
    panX: 0,
    panY: 0,
  };

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

    // Calculate new zoom state
    const newZoomState = calculateZoomToPoint(
      mousePos,
      zoomState,
      delta,
      ZOOM_CONFIG.minScale,
      ZOOM_CONFIG.maxScale
    );

    if (newZoomState === zoomState) {
      return; // No change
    }

    zoomState = newZoomState;
    onZoomChange(zoomState);
  };

  const handleMouseDown = (event: MouseEvent) => {
    const screenPos = getCanvasMousePosition(event, canvas);
    const screenX = screenPos.x;
    const screenY = screenPos.y;

    // Right click - create rectangle
    if (event.button === 2 && entityCallbacks) {
      event.preventDefault();
      const worldPos = screenToWorld(screenX, screenY, zoomState);
      entityCallbacks.createRectangleAtPoint(worldPos.x, worldPos.y);
      return;
    }

    // Middle mouse button - start panning
    if (event.button === 1) {
      event.preventDefault();
      panState.isPanning = true;
      panState.startX = event.clientX;
      panState.startY = event.clientY;
      panState.startPanX = zoomState.panX;
      panState.startPanY = zoomState.panY;
      canvas.style.cursor = 'grabbing';
      return;
    }

    // Left click - entity selection/dragging or selection box
    if (event.button === 0 && entityCallbacks) {
      const worldPos = screenToWorld(screenX, screenY, zoomState);
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
      const deltaX = (screenX - dragState.startX) / zoomState.scale;
      const deltaY = (screenY - dragState.startY) / zoomState.scale;

      // Move all dragged entities
      dragState.draggedEntityIds.forEach((id) => {
        const initialPos = dragState.initialPositions.get(id);
        if (initialPos) {
          const newX = initialPos.x + deltaX;
          const newY = initialPos.y + deltaY;
          entityCallbacks.updateEntityPosition(id, newX, newY);
        }
      });
      return;
    }

    // Handle selection box
    if (selectionBoxState.isSelecting && entityCallbacks) {
      const worldPos = screenToWorld(screenX, screenY, zoomState);
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

      zoomState = {
        ...zoomState,
        panX: newPan.x,
        panY: newPan.y,
      };

      onZoomChange(zoomState);
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
