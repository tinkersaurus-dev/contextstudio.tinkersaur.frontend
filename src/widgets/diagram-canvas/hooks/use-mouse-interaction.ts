'use client';

/**
 * Mouse Interaction Hook
 *
 * Replaces the imperative MouseInteractionManager class with a declarative React hook.
 * Manages all mouse interactions for the canvas using React's synthetic event system.
 *
 * This hook provides:
 * - Pan mode (middle mouse button)
 * - Drag mode (dragging selected entities)
 * - Select mode (selection box)
 * - Zoom (mouse wheel)
 * - Double-click detection (start text editing)
 *
 * Uses React synthetic events instead of manual addEventListener for:
 * - Better testability with React Testing Library
 * - Automatic cleanup (no manual removeEventListener needed)
 * - Consistent with React's declarative paradigm
 * - Type safety with React.MouseEvent and React.WheelEvent
 */

import { useState, useCallback, useRef } from 'react';
import { getCanvasMousePosition, CanvasTransform, type Point } from '@/shared/lib/rendering';
import { MOUSE_BUTTONS } from '@/shared/config/mouse-config';
import { ZOOM_CONFIG } from '@/shared/config/canvas-config';
import { GridSystem } from '@/shared/lib/rendering';
import type { EntityInteractionCallbacks } from '../lib/mouse-input-types';

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
 * Mouse interaction state
 */
interface MouseState {
  // Current interaction mode
  mode: InteractionMode;

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

  // Cursor state
  cursor: string;
}

/**
 * Options for the mouse interaction hook
 */
export interface UseMouseInteractionOptions {
  /** Canvas ref to get bounding rect */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Current canvas transform */
  transform: CanvasTransform;
  /** Set transform (for panning and zooming) */
  setTransform: (transform: CanvasTransform) => void;
  /** Entity interaction callbacks */
  callbacks: EntityInteractionCallbacks;
}

/**
 * Mouse interaction handlers returned by the hook
 */
export interface MouseInteractionHandlers {
  /** Handle mouse wheel for zooming */
  handleWheel: (event: React.WheelEvent<HTMLCanvasElement>) => void;
  /** Handle mouse down */
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Handle mouse move */
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Handle mouse up */
  handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Get current cursor style */
  getCursor: () => string;
}

/**
 * Custom hook to manage mouse interactions using React's synthetic event system
 *
 * Replaces the imperative MouseInteractionManager class with a declarative hook pattern.
 * All event handlers use React.MouseEvent instead of native DOM events.
 *
 * @param options - Configuration options
 * @returns Mouse interaction handlers
 *
 * @example
 * const handlers = useMouseInteraction({
 *   canvasRef,
 *   transform,
 *   setTransform,
 *   callbacks: entityCallbacks
 * });
 *
 * return (
 *   <canvas
 *     ref={canvasRef}
 *     onWheel={handlers.handleWheel}
 *     onMouseDown={handlers.handleMouseDown}
 *     onMouseMove={handlers.handleMouseMove}
 *     onMouseUp={handlers.handleMouseUp}
 *     style={{ cursor: handlers.getCursor() }}
 *   />
 * );
 */
export function useMouseInteraction(
  options: UseMouseInteractionOptions
): MouseInteractionHandlers {
  const { canvasRef, transform, setTransform, callbacks } = options;

  // Use refs for transform and callbacks to avoid recreating handlers
  const transformRef = useRef(transform);
  const callbacksRef = useRef(callbacks);

  // Update refs when props change
  transformRef.current = transform;
  callbacksRef.current = callbacks;

  // Mouse state
  const [state, setState] = useState<MouseState>({
    mode: InteractionMode.IDLE,
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
    cursor: 'default',
  });

  // Use a ref to store current state for access in event handlers without causing re-creation
  const stateRef = useRef(state);
  stateRef.current = state;

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Check if this is a double-click on the same entity
   */
  const isDoubleClick = useCallback(
    (entityId: string): boolean => {
      const currentTime = Date.now();
      const currentState = stateRef.current;
      const timeSinceLastClick = currentTime - currentState.lastClickTime;
      return (
        timeSinceLastClick < currentState.doubleClickThreshold &&
        currentState.lastClickedEntityId === entityId
      );
    },
    []
  );

  /**
   * Check if a click should be skipped for default handling
   */
  const shouldSkipClick = useCallback(
    (worldX: number, worldY: number): boolean => {
      const cbs = callbacksRef.current;

      // Skip if we're handling connection points
      if (cbs.shouldSkipDefaultHandlers?.()) {
        return true;
      }

      // Skip if clicking on a connection point
      if (cbs.isConnectionPointAt?.(worldX, worldY)) {
        return true;
      }

      return false;
    },
    []
  );

  // ============================================================================
  // State Machine Transitions
  // ============================================================================

  /**
   * Enter pan mode
   */
  const enterPanMode = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const currentTransform = transformRef.current;

    setState((prev) => ({
      ...prev,
      mode: InteractionMode.PANNING,
      panStartX: event.clientX,
      panStartY: event.clientY,
      panStartPanX: currentTransform.panX,
      panStartPanY: currentTransform.panY,
      cursor: 'grabbing',
    }));
  }, []);

  /**
   * Enter drag mode
   */
  const enterDragMode = useCallback((entityId: string, screenX: number, screenY: number) => {
    const cbs = callbacksRef.current;
    const selectedEntities = cbs.getAllSelectedEntities();
    const selectedShapes = selectedEntities.filter((e) => e.type === 'shape');

    setState((prev) => ({
      ...prev,
      mode: InteractionMode.DRAGGING,
      draggedEntityIds: selectedShapes.map((e) => e.id),
      dragStartX: screenX,
      dragStartY: screenY,
      initialPositions: new Map(
        selectedShapes.map((e) => [e.id, { x: e.position.x, y: e.position.y }])
      ),
      cursor: 'move',
    }));

    // Set dragging state for visual feedback
    cbs.setDraggingEntities(selectedEntities.map((e) => e.id));
  }, []);

  /**
   * Enter select mode
   */
  const enterSelectMode = useCallback((worldX: number, worldY: number, hasModifier: boolean) => {
    const cbs = callbacksRef.current;

    // Clear selection if no modifier key
    if (!hasModifier) {
      cbs.clearSelection();
    }

    setState((prev) => ({
      ...prev,
      mode: InteractionMode.SELECTING,
      selectionStartX: worldX,
      selectionStartY: worldY,
      selectionCurrentX: worldX,
      selectionCurrentY: worldY,
      cursor: 'crosshair',
    }));
  }, []);

  /**
   * Exit current mode and return to idle
   */
  const exitCurrentMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: InteractionMode.IDLE,
      draggedEntityIds: [],
      initialPositions: new Map(),
      cursor: 'default',
    }));
  }, []);

  // ============================================================================
  // Mouse Button Specific Handlers
  // ============================================================================

  /**
   * Handle right mouse button
   */
  const handleRightMouseDown = useCallback(
    (canvasX: number, canvasY: number, viewportX: number, viewportY: number) => {
      const cbs = callbacksRef.current;
      const currentTransform = transformRef.current;
      const worldPos = currentTransform.screenToWorld(canvasX, canvasY);

      if (cbs.openToolsetPopover) {
        cbs.openToolsetPopover(viewportX, viewportY, worldPos.x, worldPos.y);
      } else {
        cbs.createRectangleAtPoint(worldPos.x, worldPos.y);
      }
    },
    []
  );

  /**
   * Handle entity click
   */
  const handleEntityClick = useCallback(
    (
      entityId: string,
      screenX: number,
      screenY: number,
      modifiers: { shift: boolean; ctrl: boolean }
    ) => {
      const cbs = callbacksRef.current;

      // Check for double-click
      if (isDoubleClick(entityId)) {
        // Start text editing on double-click
        let entity = cbs.getAllSelectedEntities().find((e) => e.id === entityId);

        if (!entity && cbs.getAllShapes) {
          const allShapes = cbs.getAllShapes();
          entity = allShapes.find((e) => e.id === entityId);
        }

        if (entity && entity.type === 'shape') {
          cbs.startEditingText(entityId);
        }

        // Reset double-click state
        setState((prev) => ({
          ...prev,
          lastClickTime: 0,
          lastClickedEntityId: null,
        }));
        return;
      }

      // Update double-click tracking
      setState((prev) => ({
        ...prev,
        lastClickTime: Date.now(),
        lastClickedEntityId: entityId,
      }));

      // Handle selection based on modifiers
      if (modifiers.shift) {
        cbs.addToSelection(entityId);
      } else if (modifiers.ctrl) {
        cbs.toggleSelection(entityId);
      } else {
        if (!cbs.isSelected(entityId)) {
          cbs.setSelectedEntities([entityId]);
        }
      }

      // Start dragging
      enterDragMode(entityId, screenX, screenY);
    },
    [isDoubleClick, enterDragMode]
  );

  /**
   * Handle left mouse button
   */
  const handleLeftMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>, screenX: number, screenY: number) => {
      const cbs = callbacksRef.current;
      const currentTransform = transformRef.current;
      const worldPos = currentTransform.screenToWorld(screenX, screenY);

      // Check if we should skip this click
      if (shouldSkipClick(worldPos.x, worldPos.y)) {
        return;
      }

      const entity = cbs.findEntityAtPoint(worldPos.x, worldPos.y);

      if (entity) {
        // Clicked on an entity
        handleEntityClick(entity.id, screenX, screenY, {
          shift: event.shiftKey,
          ctrl: event.ctrlKey || event.metaKey,
        });
      } else {
        // Clicked on empty space
        const hasModifier = event.shiftKey || event.ctrlKey || event.metaKey;
        enterSelectMode(worldPos.x, worldPos.y, hasModifier);
      }
    },
    [shouldSkipClick, handleEntityClick, enterSelectMode]
  );

  // ============================================================================
  // Mode-Specific Mouse Move Handlers
  // ============================================================================

  /**
   * Handle mouse move during panning
   */
  const handlePanningMouseMove = useCallback((clientX: number, clientY: number) => {
    setState((prev) => {
      const currentPos: Point = { x: clientX, y: clientY };
      const panStart: Point = { x: prev.panStartX, y: prev.panStartY };
      const initialPan: Point = { x: prev.panStartPanX, y: prev.panStartPanY };

      const currentTransform = transformRef.current;
      const newTransform = currentTransform.pan(currentPos, panStart, initialPan);

      setTransform(newTransform);

      return prev;
    });
  }, [setTransform]);

  /**
   * Handle mouse move during entity dragging
   */
  const handleDraggingMouseMove = useCallback((screenX: number, screenY: number) => {
    const cbs = callbacksRef.current;
    const currentTransform = transformRef.current;
    const currentState = stateRef.current;

    const deltaX = (screenX - currentState.dragStartX) / currentTransform.scale;
    const deltaY = (screenY - currentState.dragStartY) / currentTransform.scale;
    const snapMode = cbs.getSnapMode();

    currentState.draggedEntityIds.forEach((id) => {
      const initialPos = currentState.initialPositions.get(id);
      if (initialPos) {
        let newX = initialPos.x + deltaX;
        let newY = initialPos.y + deltaY;

        if (snapMode !== 'none') {
          const snapped = GridSystem.snapPoint(newX, newY, currentTransform.scale, snapMode);
          newX = snapped.x;
          newY = snapped.y;
        }

        cbs.updateEntityPositionInternal(id, newX, newY);
      }
    });
  }, []);

  /**
   * Handle mouse move during selection box
   */
  const handleSelectingMouseMove = useCallback((worldX: number, worldY: number) => {
    const cbs = callbacksRef.current;
    const currentState = stateRef.current;

    if (cbs.onSelectionBoxChange) {
      cbs.onSelectionBoxChange({
        isSelecting: true,
        startX: currentState.selectionStartX,
        startY: currentState.selectionStartY,
        currentX: worldX,
        currentY: worldY,
      });
    }

    // Update selection current position
    setState((prev) => ({
      ...prev,
      selectionCurrentX: worldX,
      selectionCurrentY: worldY,
    }));
  }, []);

  // ============================================================================
  // Operation Completion Handlers
  // ============================================================================

  /**
   * Complete drag operation
   */
  const completeDragOperation = useCallback(() => {
    const cbs = callbacksRef.current;
    const currentState = stateRef.current;
    const allEntities = cbs.getAllSelectedEntities();

    const moves: Array<{
      entityId: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }> = [];

    currentState.draggedEntityIds.forEach((id) => {
      const initialPos = currentState.initialPositions.get(id);
      if (!initialPos) return;

      const entity = allEntities.find((e) => e.id === id);

      if (entity && entity.type === 'shape') {
        const shape = entity as { id: string; position: { x: number; y: number } };
        const finalPos = shape.position;

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

    if (moves.length > 0) {
      cbs.finalizeEntityMove(moves);
    }

    cbs.clearDraggingEntities();
  }, []);

  /**
   * Complete selection box operation
   */
  const completeSelectionOperation = useCallback(() => {
    const cbs = callbacksRef.current;
    const currentState = stateRef.current;

    cbs.selectEntitiesInBox(
      currentState.selectionStartX,
      currentState.selectionStartY,
      currentState.selectionCurrentX,
      currentState.selectionCurrentY
    );

    if (cbs.onSelectionBoxChange) {
      cbs.onSelectionBoxChange(null);
    }
  }, []);

  // ============================================================================
  // Event Handlers (React Synthetic Events)
  // ============================================================================

  /**
   * Handle mouse wheel for zooming
   */
  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const mousePos = getCanvasMousePosition(event.nativeEvent, canvas);
    const delta = -event.deltaY * ZOOM_CONFIG.zoomSpeed;
    const currentTransform = transformRef.current;

    const newTransform = currentTransform.zoom(
      mousePos,
      delta,
      ZOOM_CONFIG.minScale,
      ZOOM_CONFIG.maxScale
    );

    if (!newTransform.equals(currentTransform)) {
      setTransform(newTransform);
    }
  }, [canvasRef, setTransform]);

  /**
   * Handle mouse down
   */
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const cbs = callbacksRef.current;

    // Early exit if we should skip default handlers
    if (cbs.shouldSkipDefaultHandlers?.()) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const screenPos = getCanvasMousePosition(event.nativeEvent, canvas);

    // Right click - open toolset popover
    if (event.button === MOUSE_BUTTONS.RIGHT) {
      event.preventDefault();
      handleRightMouseDown(screenPos.x, screenPos.y, event.clientX, event.clientY);
      return;
    }

    // Middle mouse button - start panning
    if (event.button === MOUSE_BUTTONS.MIDDLE) {
      event.preventDefault();
      enterPanMode(event);
      return;
    }

    // Left click - entity selection/dragging or selection box
    if (event.button === MOUSE_BUTTONS.LEFT) {
      handleLeftMouseDown(event, screenPos.x, screenPos.y);
    }
  }, [canvasRef, handleRightMouseDown, enterPanMode, handleLeftMouseDown]);

  /**
   * Handle mouse move
   */
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentState = stateRef.current;
    const screenPos = getCanvasMousePosition(event.nativeEvent, canvas);

    switch (currentState.mode) {
      case InteractionMode.DRAGGING:
        handleDraggingMouseMove(screenPos.x, screenPos.y);
        break;

      case InteractionMode.SELECTING: {
        const currentTransform = transformRef.current;
        const worldPos = currentTransform.screenToWorld(screenPos.x, screenPos.y);
        handleSelectingMouseMove(worldPos.x, worldPos.y);
        break;
      }

      case InteractionMode.PANNING:
        handlePanningMouseMove(event.clientX, event.clientY);
        break;

      case InteractionMode.IDLE:
        // Idle mode - no action needed
        break;
    }
  }, [
    canvasRef,
    handleDraggingMouseMove,
    handleSelectingMouseMove,
    handlePanningMouseMove,
  ]);

  /**
   * Handle mouse up
   */
  const handleMouseUp = useCallback(() => {
    const currentState = stateRef.current;

    switch (currentState.mode) {
      case InteractionMode.DRAGGING:
        completeDragOperation();
        break;

      case InteractionMode.SELECTING:
        completeSelectionOperation();
        break;

      case InteractionMode.PANNING:
        // Nothing to finalize for panning
        break;
    }

    exitCurrentMode();
  }, [completeDragOperation, completeSelectionOperation, exitCurrentMode]);

  /**
   * Get current cursor style
   */
  const getCursor = useCallback(() => {
    return stateRef.current.cursor;
  }, []);

  // ============================================================================
  // Return Handlers
  // ============================================================================

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getCursor,
  };
}
