/**
 * Mouse Input Setup
 *
 * Sets up mouse event listeners for canvas interaction.
 * Handler logic is extracted to separate files for better testability.
 */

import { getCanvasMousePosition, CanvasTransform } from '@/shared/lib/canvas-transform';
import { MOUSE_BUTTONS } from '@/shared/config/mouse-config';
import type {
  EntityInteractionCallbacks,
} from './mouse-input-types';
import type {
  PanState,
  DragState,
  SelectionBoxState,
  DoubleClickState,
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
 * Create initial state objects for mouse interaction
 */
function createMouseStates() {
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

  const doubleClickState: DoubleClickState = {
    lastClickTime: 0,
    lastClickedEntityId: null,
    doubleClickThreshold: 300, // 300ms
  };

  return { panState, dragState, selectionBoxState, doubleClickState };
}

/**
 * Build wheel event handler for zooming
 */
function buildWheelHandler(context: MouseHandlerContext) {
  return (event: WheelEvent) => {
    handlers.handleWheel(event, context);
  };
}

/**
 * Check if a click should be skipped for default handling
 */
function shouldSkipClick(
  callbacks: EntityInteractionCallbacks | undefined,
  worldX: number,
  worldY: number
): boolean {
  if (!callbacks) return false;

  // Skip if we're handling connection points
  if (callbacks.shouldSkipDefaultHandlers?.()) {
    return true;
  }

  // Skip if clicking on a connection point
  if (callbacks.isConnectionPointAt?.(worldX, worldY)) {
    return true;
  }

  return false;
}

/**
 * Handle left mouse button down events
 */
function handleLeftMouseDown(
  event: MouseEvent,
  screenX: number,
  screenY: number,
  context: MouseHandlerContext
): void {
  const { getCurrentTransform, entityCallbacks } = context;

  if (!entityCallbacks) return;

  const currentTransform = getCurrentTransform();
  const worldPos = currentTransform.screenToWorld(screenX, screenY);

  // Check if we should skip this click
  if (shouldSkipClick(entityCallbacks, worldPos.x, worldPos.y)) {
    return;
  }

  const entity = entityCallbacks.findEntityAtPoint(worldPos.x, worldPos.y);

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

/**
 * Build mouse down event handler
 */
function buildMouseDownHandler(context: MouseHandlerContext) {
  return (event: MouseEvent) => {
    const { canvas, entityCallbacks } = context;

    // Early exit if we should skip default handlers
    if (entityCallbacks?.shouldSkipDefaultHandlers?.()) {
      return;
    }

    const screenPos = getCanvasMousePosition(event, canvas);

    // Right click - open toolset popover (or create rectangle)
    if (event.button === MOUSE_BUTTONS.RIGHT && entityCallbacks) {
      event.preventDefault();
      handlers.handleRightMouseDown(screenPos.x, screenPos.y, context);
      return;
    }

    // Middle mouse button - start panning
    if (event.button === MOUSE_BUTTONS.MIDDLE) {
      event.preventDefault();
      handlers.handleMiddleMouseDown(event, context);
      return;
    }

    // Left click - entity selection/dragging or selection box
    if (event.button === MOUSE_BUTTONS.LEFT) {
      handleLeftMouseDown(event, screenPos.x, screenPos.y, context);
    }
  };
}

/**
 * Build mouse move event handler
 */
function buildMouseMoveHandler(context: MouseHandlerContext) {
  return (event: MouseEvent) => {
    const { canvas, getCurrentTransform, entityCallbacks, dragState, selectionBoxState, panState } = context;

    const screenPos = getCanvasMousePosition(event, canvas);

    // Handle entity dragging
    if (dragState.isDragging && entityCallbacks) {
      handlers.handleEntityDrag(screenPos.x, screenPos.y, context);
      return;
    }

    // Handle selection box
    if (selectionBoxState.isSelecting && entityCallbacks) {
      const currentTransform = getCurrentTransform();
      const worldPos = currentTransform.screenToWorld(screenPos.x, screenPos.y);
      handlers.handleSelectionBoxDrag(worldPos.x, worldPos.y, context);
      return;
    }

    // Handle canvas panning
    if (panState.isPanning) {
      handlers.handleCanvasPan(event.clientX, event.clientY, context);
    }
  };
}

/**
 * Build mouse up event handler
 */
function buildMouseUpHandler(context: MouseHandlerContext) {
  return () => {
    const { entityCallbacks, dragState, selectionBoxState, panState } = context;

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
}

/**
 * Build context menu event handler
 */
function buildContextMenuHandler() {
  return (event: MouseEvent) => {
    event.preventDefault();
  };
}

/**
 * Attach all event listeners to the canvas
 */
function attachEventListeners(
  canvas: HTMLCanvasElement,
  handlers: {
    wheel: (event: WheelEvent) => void;
    mousedown: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    mouseup: () => void;
    contextmenu: (event: MouseEvent) => void;
  }
): void {
  canvas.addEventListener('wheel', handlers.wheel, { passive: false });
  canvas.addEventListener('mousedown', handlers.mousedown);
  canvas.addEventListener('mousemove', handlers.mousemove);
  canvas.addEventListener('mouseup', handlers.mouseup);
  canvas.addEventListener('mouseleave', handlers.mouseup);
  canvas.addEventListener('contextmenu', handlers.contextmenu);
}

/**
 * Create cleanup function to remove all event listeners
 */
function createCleanupFunction(
  canvas: HTMLCanvasElement,
  handlers: {
    wheel: (event: WheelEvent) => void;
    mousedown: (event: MouseEvent) => void;
    mousemove: (event: MouseEvent) => void;
    mouseup: () => void;
    contextmenu: (event: MouseEvent) => void;
  }
): () => void {
  return () => {
    canvas.removeEventListener('wheel', handlers.wheel);
    canvas.removeEventListener('mousedown', handlers.mousedown);
    canvas.removeEventListener('mousemove', handlers.mousemove);
    canvas.removeEventListener('mouseup', handlers.mouseup);
    canvas.removeEventListener('mouseleave', handlers.mouseup);
    canvas.removeEventListener('contextmenu', handlers.contextmenu);
  };
}

/**
 * Setup mouse input handlers for a canvas element
 *
 * @param canvas - Canvas element to attach listeners to
 * @param getTransform - Function to get current transform
 * @param setTransform - Function to update transform
 * @param entityCallbacks - Optional callbacks for entity interaction
 * @returns Cleanup function to remove all event listeners
 */
export function setupMouseInput(
  canvas: HTMLCanvasElement,
  getTransform: () => CanvasTransform,
  setTransform: (transform: CanvasTransform) => void,
  entityCallbacks?: EntityInteractionCallbacks
): () => void {
  // Create state objects
  const { panState, dragState, selectionBoxState, doubleClickState } = createMouseStates();

  // Build handler context
  const context: MouseHandlerContext = {
    canvas,
    getCurrentTransform: getTransform,
    setTransform,
    entityCallbacks,
    panState,
    dragState,
    selectionBoxState,
    doubleClickState,
  };

  // Build event handlers
  const eventHandlers = {
    wheel: buildWheelHandler(context),
    mousedown: buildMouseDownHandler(context),
    mousemove: buildMouseMoveHandler(context),
    mouseup: buildMouseUpHandler(context),
    contextmenu: buildContextMenuHandler(),
  };

  // Attach listeners
  attachEventListeners(canvas, eventHandlers);

  // Return cleanup function
  return createCleanupFunction(canvas, eventHandlers);
}
