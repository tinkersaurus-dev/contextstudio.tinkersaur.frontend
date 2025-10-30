/**
 * Mouse Interaction Manager
 *
 * Unified mouse handling system that consolidates event setup and handler logic.
 * Implements a clear state machine for pan/drag/select modes with explicit state transitions.
 *
 * This manager replaces the previous split between mouse-input.ts and mouse-handlers.ts,
 * providing a single entry point with better encapsulation and clearer state management.
 */

import { getCanvasMousePosition, CanvasTransform, type Point } from '@/shared/lib/canvas-transform';
import { MOUSE_BUTTONS } from '@/shared/config/mouse-config';
import { ZOOM_CONFIG } from '@/shared/config/canvas-config';
import { GridSystem } from '@/shared/lib/grid-system';
import type { EntityInteractionCallbacks } from './mouse-input-types';

/**
 * Interaction modes for the state machine
 */
enum InteractionMode {
  IDLE = 'idle',
  PANNING = 'panning',
  DRAGGING = 'dragging',
  SELECTING = 'selecting',
}

/**
 * Consolidated mouse interaction state
 */
interface MouseState {
  // Pan state
  panStartX: number;
  panStartY: number;
  panStartPanX: number;
  panStartPanY: number;

  // Drag state
  dragStartX: number;
  dragStartY: number;
  draggedEntityIds: string[];
  initialPositions: Map<string, Point>;

  // Selection box state
  selectionStartX: number;
  selectionStartY: number;
  selectionCurrentX: number;
  selectionCurrentY: number;

  // Double click tracking
  lastClickTime: number;
  lastClickedEntityId: string | null;
  doubleClickThreshold: number;
}

/**
 * MouseInteractionManager
 *
 * Manages all mouse interactions for the canvas with a clear state machine.
 * Handles pan, drag, select, zoom, and double-click operations.
 */
export class MouseInteractionManager {
  private mode: InteractionMode = InteractionMode.IDLE;
  private state: MouseState;
  private canvas: HTMLCanvasElement;
  private getTransform: () => CanvasTransform;
  private setTransform: (transform: CanvasTransform) => void;
  private callbacks?: EntityInteractionCallbacks;

  // Bound event handlers for proper cleanup
  private boundHandleWheel: (event: WheelEvent) => void;
  private boundHandleMouseDown: (event: MouseEvent) => void;
  private boundHandleMouseMove: (event: MouseEvent) => void;
  private boundHandleMouseUp: () => void;
  private boundHandleContextMenu: (event: MouseEvent) => void;

  constructor(
    canvas: HTMLCanvasElement,
    getTransform: () => CanvasTransform,
    setTransform: (transform: CanvasTransform) => void,
    callbacks?: EntityInteractionCallbacks
  ) {
    this.canvas = canvas;
    this.getTransform = getTransform;
    this.setTransform = setTransform;
    this.callbacks = callbacks;

    // Initialize state
    this.state = {
      panStartX: 0,
      panStartY: 0,
      panStartPanX: 0,
      panStartPanY: 0,
      dragStartX: 0,
      dragStartY: 0,
      draggedEntityIds: [],
      initialPositions: new Map(),
      selectionStartX: 0,
      selectionStartY: 0,
      selectionCurrentX: 0,
      selectionCurrentY: 0,
      lastClickTime: 0,
      lastClickedEntityId: null,
      doubleClickThreshold: 300, // 300ms
    };

    // Bind event handlers
    this.boundHandleWheel = this.onWheel.bind(this);
    this.boundHandleMouseDown = this.onMouseDown.bind(this);
    this.boundHandleMouseMove = this.onMouseMove.bind(this);
    this.boundHandleMouseUp = this.onMouseUp.bind(this);
    this.boundHandleContextMenu = this.onContextMenu.bind(this);
  }

  /**
   * Set up event listeners and return cleanup function
   */
  setup(): () => void {
    this.canvas.addEventListener('wheel', this.boundHandleWheel, { passive: false });
    this.canvas.addEventListener('mousedown', this.boundHandleMouseDown);
    this.canvas.addEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.addEventListener('mouseup', this.boundHandleMouseUp);
    this.canvas.addEventListener('mouseleave', this.boundHandleMouseUp);
    this.canvas.addEventListener('contextmenu', this.boundHandleContextMenu);

    return () => this.destroy();
  }

  /**
   * Clean up event listeners and reset state
   */
  destroy(): void {
    this.canvas.removeEventListener('wheel', this.boundHandleWheel);
    this.canvas.removeEventListener('mousedown', this.boundHandleMouseDown);
    this.canvas.removeEventListener('mousemove', this.boundHandleMouseMove);
    this.canvas.removeEventListener('mouseup', this.boundHandleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.boundHandleMouseUp);
    this.canvas.removeEventListener('contextmenu', this.boundHandleContextMenu);

    // Reset to idle mode
    this.exitCurrentMode();
  }

  // ============================================================================
  // Event Handlers
  // ============================================================================

  /**
   * Handle mouse wheel events for zooming
   */
  private onWheel(event: WheelEvent): void {
    event.preventDefault();

    const mousePos = getCanvasMousePosition(event, this.canvas);
    const delta = -event.deltaY * ZOOM_CONFIG.zoomSpeed;
    const currentTransform = this.getTransform();

    const newTransform = currentTransform.zoom(
      mousePos,
      delta,
      ZOOM_CONFIG.minScale,
      ZOOM_CONFIG.maxScale
    );

    if (!newTransform.equals(currentTransform)) {
      this.setTransform(newTransform);
    }
  }

  /**
   * Handle mouse down events - route based on button
   */
  private onMouseDown(event: MouseEvent): void {
    // Early exit if we should skip default handlers
    if (this.callbacks?.shouldSkipDefaultHandlers?.()) {
      return;
    }

    const screenPos = getCanvasMousePosition(event, this.canvas);

    // Right click - open toolset popover (or create rectangle)
    if (event.button === MOUSE_BUTTONS.RIGHT && this.callbacks) {
      event.preventDefault();
      this.handleRightMouseDown(screenPos.x, screenPos.y, event.clientX, event.clientY);
      return;
    }

    // Middle mouse button - start panning
    if (event.button === MOUSE_BUTTONS.MIDDLE) {
      event.preventDefault();
      this.enterPanMode(event);
      return;
    }

    // Left click - entity selection/dragging or selection box
    if (event.button === MOUSE_BUTTONS.LEFT) {
      this.handleLeftMouseDown(event, screenPos.x, screenPos.y);
    }
  }

  /**
   * Handle mouse move events - route based on current mode
   */
  private onMouseMove(event: MouseEvent): void {
    const screenPos = getCanvasMousePosition(event, this.canvas);

    switch (this.mode) {
      case InteractionMode.DRAGGING:
        if (this.callbacks) {
          this.handleDraggingMouseMove(screenPos.x, screenPos.y);
        }
        break;

      case InteractionMode.SELECTING:
        if (this.callbacks) {
          const currentTransform = this.getTransform();
          const worldPos = currentTransform.screenToWorld(screenPos.x, screenPos.y);
          this.handleSelectingMouseMove(worldPos.x, worldPos.y);
        }
        break;

      case InteractionMode.PANNING:
        this.handlePanningMouseMove(event.clientX, event.clientY);
        break;

      case InteractionMode.IDLE:
        // Could handle hover effects here
        break;
    }
  }

  /**
   * Handle mouse up events - complete current operation
   */
  private onMouseUp(): void {
    switch (this.mode) {
      case InteractionMode.DRAGGING:
        if (this.callbacks) {
          this.completeDragOperation();
        }
        break;

      case InteractionMode.SELECTING:
        if (this.callbacks) {
          this.completeSelectionOperation();
        }
        break;

      case InteractionMode.PANNING:
        this.completePanOperation();
        break;
    }

    this.exitCurrentMode();
  }

  /**
   * Handle context menu events (prevent default)
   */
  private onContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }

  // ============================================================================
  // Mouse Button Specific Handlers
  // ============================================================================

  /**
   * Handle right mouse button - open toolset or create shape
   */
  private handleRightMouseDown(
    canvasX: number,
    canvasY: number,
    viewportX: number,
    viewportY: number
  ): void {
    if (!this.callbacks) return;

    const currentTransform = this.getTransform();
    const worldPos = currentTransform.screenToWorld(canvasX, canvasY);

    if (this.callbacks.openToolsetPopover) {
      // Pass viewport coordinates for UI positioning, world coordinates for shape creation
      this.callbacks.openToolsetPopover(viewportX, viewportY, worldPos.x, worldPos.y);
    } else {
      this.callbacks.createRectangleAtPoint(worldPos.x, worldPos.y);
    }
  }

  /**
   * Handle left mouse button - entity or empty space
   */
  private handleLeftMouseDown(event: MouseEvent, screenX: number, screenY: number): void {
    if (!this.callbacks) return;

    const currentTransform = this.getTransform();
    const worldPos = currentTransform.screenToWorld(screenX, screenY);

    // Check if we should skip this click
    if (this.shouldSkipClick(worldPos.x, worldPos.y)) {
      return;
    }

    const entity = this.callbacks.findEntityAtPoint(worldPos.x, worldPos.y);

    if (entity) {
      // Clicked on an entity
      this.handleEntityClick(
        entity.id,
        screenX,
        screenY,
        {
          shift: event.shiftKey,
          ctrl: event.ctrlKey || event.metaKey,
        }
      );
    } else {
      // Clicked on empty space
      const hasModifier = event.shiftKey || event.ctrlKey || event.metaKey;
      this.enterSelectMode(worldPos.x, worldPos.y, hasModifier);
    }
  }

  /**
   * Handle entity click - check for double-click or start drag
   */
  private handleEntityClick(
    entityId: string,
    screenX: number,
    screenY: number,
    modifiers: { shift: boolean; ctrl: boolean }
  ): void {
    if (!this.callbacks) return;

    // Check for double-click
    if (this.isDoubleClick(entityId)) {
      this.handleEntityDoubleClick(entityId);
      // Reset double-click state
      this.state.lastClickTime = 0;
      this.state.lastClickedEntityId = null;
      return;
    }

    // Update double-click tracking
    this.state.lastClickTime = Date.now();
    this.state.lastClickedEntityId = entityId;

    // Handle selection based on modifiers
    if (modifiers.shift) {
      this.callbacks.addToSelection(entityId);
    } else if (modifiers.ctrl) {
      this.callbacks.toggleSelection(entityId);
    } else {
      if (!this.callbacks.isSelected(entityId)) {
        this.callbacks.setSelectedEntities([entityId]);
      }
    }

    // Start dragging
    this.enterDragMode(entityId, screenX, screenY);
  }

  /**
   * Handle double-click on entity - start text editing
   */
  private handleEntityDoubleClick(entityId: string): void {
    if (!this.callbacks?.startEditingText) return;

    // Check if entity is a shape (only shapes support text editing)
    let entity = this.callbacks.getAllSelectedEntities().find((e) => e.id === entityId);

    // If not in selection, try to find in all shapes
    if (!entity && this.callbacks.getAllShapes) {
      const allShapes = this.callbacks.getAllShapes();
      entity = allShapes.find((e) => e.id === entityId);
    }

    // Only proceed if we found a shape entity
    if (!entity || entity.type !== 'shape') {
      return;
    }

    // Start text editing mode
    this.callbacks.startEditingText(entityId);
  }

  // ============================================================================
  // State Machine Transitions
  // ============================================================================

  /**
   * Enter pan mode - middle mouse button pressed
   */
  private enterPanMode(event: MouseEvent): void {
    const currentTransform = this.getTransform();

    this.mode = InteractionMode.PANNING;
    this.state.panStartX = event.clientX;
    this.state.panStartY = event.clientY;
    this.state.panStartPanX = currentTransform.panX;
    this.state.panStartPanY = currentTransform.panY;
    this.updateCursor('grabbing');
  }

  /**
   * Enter drag mode - dragging selected entities
   */
  private enterDragMode(entityId: string, screenX: number, screenY: number): void {
    if (!this.callbacks) return;

    // Get all selected SHAPES (not connectors - they auto-update)
    const selectedEntities = this.callbacks.getAllSelectedEntities();
    const selectedShapes = selectedEntities.filter((e) => e.type === 'shape');

    this.mode = InteractionMode.DRAGGING;
    this.state.draggedEntityIds = selectedShapes.map((e) => e.id);
    this.state.dragStartX = screenX;
    this.state.dragStartY = screenY;
    this.state.initialPositions = new Map(
      selectedShapes.map((e) => [e.id, { x: e.position.x, y: e.position.y }])
    );

    // Set dragging state for visual feedback (can include connectors for selection highlight)
    this.callbacks.setDraggingEntities(selectedEntities.map((e) => e.id));
    this.updateCursor('move');
  }

  /**
   * Enter select mode - drawing selection box
   */
  private enterSelectMode(worldX: number, worldY: number, hasModifier: boolean): void {
    if (!this.callbacks) return;

    // Clear selection if no modifier key
    if (!hasModifier) {
      this.callbacks.clearSelection();
    }

    this.mode = InteractionMode.SELECTING;
    this.state.selectionStartX = worldX;
    this.state.selectionStartY = worldY;
    this.state.selectionCurrentX = worldX;
    this.state.selectionCurrentY = worldY;
    this.updateCursor('crosshair');
  }

  /**
   * Exit current mode and return to idle
   */
  private exitCurrentMode(): void {
    this.mode = InteractionMode.IDLE;
    this.updateCursor('default');

    // Reset state (keep double-click tracking)
    this.state.draggedEntityIds = [];
    this.state.initialPositions.clear();
  }

  // ============================================================================
  // Mode-Specific Mouse Move Handlers
  // ============================================================================

  /**
   * Handle mouse move during panning
   */
  private handlePanningMouseMove(clientX: number, clientY: number): void {
    const currentPos: Point = { x: clientX, y: clientY };
    const panStart: Point = { x: this.state.panStartX, y: this.state.panStartY };
    const initialPan: Point = { x: this.state.panStartPanX, y: this.state.panStartPanY };

    const currentTransform = this.getTransform();
    const newTransform = currentTransform.pan(currentPos, panStart, initialPan);

    this.setTransform(newTransform);
  }

  /**
   * Handle mouse move during entity dragging
   */
  private handleDraggingMouseMove(screenX: number, screenY: number): void {
    if (!this.callbacks) return;

    const currentTransform = this.getTransform();
    const deltaX = (screenX - this.state.dragStartX) / currentTransform.scale;
    const deltaY = (screenY - this.state.dragStartY) / currentTransform.scale;
    const snapMode = this.callbacks.getSnapMode();
    const callbacks = this.callbacks; // Capture for use in forEach

    this.state.draggedEntityIds.forEach((id) => {
      const initialPos = this.state.initialPositions.get(id);
      if (initialPos) {
        let newX = initialPos.x + deltaX;
        let newY = initialPos.y + deltaY;

        if (snapMode !== 'none') {
          const snapped = GridSystem.snapPoint(newX, newY, currentTransform.scale, snapMode);
          newX = snapped.x;
          newY = snapped.y;
        }

        // Use internal update during drag (no command created)
        callbacks.updateEntityPositionInternal(id, newX, newY);
      }
    });
  }

  /**
   * Handle mouse move during selection box
   */
  private handleSelectingMouseMove(worldX: number, worldY: number): void {
    this.state.selectionCurrentX = worldX;
    this.state.selectionCurrentY = worldY;

    if (this.callbacks?.onSelectionBoxChange) {
      this.callbacks.onSelectionBoxChange({
        isSelecting: true,
        startX: this.state.selectionStartX,
        startY: this.state.selectionStartY,
        currentX: this.state.selectionCurrentX,
        currentY: this.state.selectionCurrentY,
      });
    }
  }

  // ============================================================================
  // Operation Completion Handlers
  // ============================================================================

  /**
   * Complete drag operation - finalize entity moves
   */
  private completeDragOperation(): void {
    if (!this.callbacks) return;

    // Collect all moved entities with their before/after positions
    const moves: Array<{
      entityId: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }> = [];

    // Get all entities to find current positions
    const allEntities = this.callbacks.getAllSelectedEntities();

    this.state.draggedEntityIds.forEach((id) => {
      const initialPos = this.state.initialPositions.get(id);
      if (!initialPos) return;

      // Find the entity in the list to get its final position
      const entity = allEntities.find((e) => e.id === id);

      // For shapes, we can get the final position from the entity
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
      this.callbacks.finalizeEntityMove(moves);
    }

    // Clean up drag state
    this.callbacks.clearDraggingEntities();
  }

  /**
   * Complete selection box operation
   */
  private completeSelectionOperation(): void {
    if (!this.callbacks) return;

    this.callbacks.selectEntitiesInBox(
      this.state.selectionStartX,
      this.state.selectionStartY,
      this.state.selectionCurrentX,
      this.state.selectionCurrentY
    );

    if (this.callbacks.onSelectionBoxChange) {
      this.callbacks.onSelectionBoxChange(null);
    }
  }

  /**
   * Complete pan operation
   */
  private completePanOperation(): void {
    // Nothing to finalize for panning (transform already updated during move)
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Check if a click should be skipped for default handling
   */
  private shouldSkipClick(worldX: number, worldY: number): boolean {
    if (!this.callbacks) return false;

    // Skip if we're handling connection points
    if (this.callbacks.shouldSkipDefaultHandlers?.()) {
      return true;
    }

    // Skip if clicking on a connection point
    if (this.callbacks.isConnectionPointAt?.(worldX, worldY)) {
      return true;
    }

    return false;
  }

  /**
   * Check if this is a double-click on the same entity
   */
  private isDoubleClick(entityId: string): boolean {
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - this.state.lastClickTime;
    return (
      timeSinceLastClick < this.state.doubleClickThreshold &&
      this.state.lastClickedEntityId === entityId
    );
  }

  /**
   * Update canvas cursor
   */
  private updateCursor(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }
}
