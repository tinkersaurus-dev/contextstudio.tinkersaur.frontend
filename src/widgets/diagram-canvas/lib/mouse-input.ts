/**
 * Mouse Input Setup
 *
 * Sets up mouse event listeners for canvas interaction.
 * Handler logic is extracted to separate files for better testability.
 */

import { getCanvasMousePosition, screenToWorld } from '@/shared/lib/canvas-coordinates';
import { MOUSE_BUTTONS } from '@/shared/config/mouse-config';
import type {
  ZoomState,
  EntityInteractionCallbacks,
} from './mouse-input-types';
import type {
  PanState,
  DragState,
  SelectionBoxState,
  MouseHandlerContext,
} from './mouse-handlers';
import * as handlers from './mouse-handlers';

// Re-export types for backwards compatibility
export type {
  ZoomState,
  EntityInteractionCallbacks,
  EntityQueryCallbacks,
  EntitySelectionCallbacks,
  EntityDragCallbacks,
  EntityCreationCallbacks,
  CanvasSettingsCallbacks,
} from './mouse-input-types';

/**
 * Setup mouse input handlers for a canvas element
 *
 * @param canvas - Canvas element to attach listeners to
 * @param getZoomState - Function to get current zoom state
 * @param setZoomState - Function to update zoom state
 * @param entityCallbacks - Optional callbacks for entity interaction
 * @returns Cleanup function to remove all event listeners
 */
export function setupMouseInput(
  canvas: HTMLCanvasElement,
  getZoomState: () => ZoomState,
  setZoomState: (state: ZoomState) => void,
  entityCallbacks?: EntityInteractionCallbacks
): () => void {
  // State management
  const panState: PanState = {
    isPanning: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  };

  const dragState: DragState = {
    isDragging: false,
    draggedEntityIds: [],
    startX: 0,
    startY: 0,
    initialPositions: new Map(),
  };

  const selectionBoxState: SelectionBoxState = {
    isSelecting: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  };

  // Handler context
  const context: MouseHandlerContext = {
    canvas,
    getCurrentZoomState: getZoomState,
    setZoomState,
    entityCallbacks,
    panState,
    dragState,
    selectionBoxState,
  };

  // Wheel handler - zoom
  const handleWheel = (event: WheelEvent) => {
    handlers.handleWheel(event, context);
  };

  // Mouse down handler
  const handleMouseDown = (event: MouseEvent) => {
    // Check if we should skip default handlers (e.g., when handling connection points)
    if (entityCallbacks?.shouldSkipDefaultHandlers?.()) {
      return; // Don't handle shape drag/selection when connection point is being handled
    }

    const screenPos = getCanvasMousePosition(event, canvas);
    const screenX = screenPos.x;
    const screenY = screenPos.y;

    // Right click - open toolset popover (or create rectangle)
    if (event.button === MOUSE_BUTTONS.RIGHT && entityCallbacks) {
      event.preventDefault();
      handlers.handleRightMouseDown(screenX, screenY, context);
      return;
    }

    // Middle mouse button - start panning
    if (event.button === MOUSE_BUTTONS.MIDDLE) {
      event.preventDefault();
      handlers.handleMiddleMouseDown(event, context);
      return;
    }

    // Left click - entity selection/dragging or selection box
    if (event.button === MOUSE_BUTTONS.LEFT && entityCallbacks) {
      const worldPos = screenToWorld(screenX, screenY, getZoomState());

      // Check if clicking on a connection point first (before entity/shape check)
      if (entityCallbacks.isConnectionPointAt?.(worldPos.x, worldPos.y)) {
        // Let the React handler deal with connection points
        return;
      }

      const entity = entityCallbacks.getEntityAtPoint(worldPos.x, worldPos.y);

      if (entity) {
        // Clicked on an entity
        handlers.handleEntityMouseDown(
          entity.id,
          screenX,
          screenY,
          {
            shift: event.shiftKey,
            ctrl: event.ctrlKey || event.metaKey,
          },
          context
        );
      } else {
        // Clicked on empty space
        const hasModifier = event.shiftKey || event.ctrlKey || event.metaKey;
        handlers.handleEmptySpaceMouseDown(worldPos.x, worldPos.y, hasModifier, context);
      }
    }
  };

  // Mouse move handler
  const handleMouseMove = (event: MouseEvent) => {
    const screenPos = getCanvasMousePosition(event, canvas);
    const screenX = screenPos.x;
    const screenY = screenPos.y;

    // Handle entity dragging
    if (dragState.isDragging && entityCallbacks) {
      handlers.handleEntityDrag(screenX, screenY, context);
      return;
    }

    // Handle selection box
    if (selectionBoxState.isSelecting && entityCallbacks) {
      const worldPos = screenToWorld(screenX, screenY, getZoomState());
      handlers.handleSelectionBoxDrag(worldPos.x, worldPos.y, context);
      return;
    }

    // Handle canvas panning
    if (panState.isPanning) {
      handlers.handleCanvasPan(event.clientX, event.clientY, context);
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    // Complete entity dragging
    if (dragState.isDragging && entityCallbacks) {
      handlers.handleDragComplete(context);
    }

    // Complete selection box
    if (selectionBoxState.isSelecting && entityCallbacks) {
      handlers.handleSelectionBoxComplete(context);
    }

    // Complete canvas panning
    if (panState.isPanning) {
      handlers.handlePanComplete(context);
    }
  };

  // Context menu handler - prevent default to allow right-click shape creation
  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
  };

  // Attach event listeners
  canvas.addEventListener('wheel', handleWheel, { passive: false });
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('mouseleave', handleMouseUp);
  canvas.addEventListener('contextmenu', handleContextMenu);

  // Return cleanup function
  return () => {
    canvas.removeEventListener('wheel', handleWheel);
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('mouseleave', handleMouseUp);
    canvas.removeEventListener('contextmenu', handleContextMenu);
  };
}
