'use client';

/**
 * Connection Point Drag Hook
 *
 * Manages drag operations for creating connectors from connection points.
 * Handles mouse down/up events and connector creation logic.
 */

import { useReducer, useCallback, useRef, useEffect } from 'react';
import type { AnchorPosition, Connector } from '@/entities/connector';
import type { Shape } from '@/entities/shape';
import { CanvasTransform } from '@/shared/lib/canvas-transform';
import { ConnectionPointEngine } from '@/shared/lib/connection-point-engine';

/**
 * Drag state for connection point interactions
 */
export interface ConnectionPointDragState {
  /** Whether user is currently dragging a connector */
  isDraggingConnector: boolean;
  /** Whether the drag has moved enough to be considered a real drag (not just a click) */
  hasMovedDuringDrag: boolean;
  /** Start point of connector drag */
  connectorDragStart: {
    shapeId: string;
    anchor: AnchorPosition;
    x: number;
    y: number;
  } | null;
  /** Current end point of connector drag */
  connectorDragEnd: { x: number; y: number } | null;
  /** Pending connector info when dragging to empty canvas (for toolset popover) */
  pendingConnector: {
    sourceShapeId: string;
    sourceAnchor: AnchorPosition;
  } | null;
  /**
   * Whether we're currently handling a connection point interaction
   * Used to prevent other mouse handlers from interfering with connection point logic
   */
  isHandlingConnectionPoint: boolean;
}

/**
 * Actions for the connection drag reducer
 */
type ConnectionDragAction =
  | {
      type: 'START_DRAG';
      payload: {
        start: {
          shapeId: string;
          anchor: AnchorPosition;
          x: number;
          y: number;
        };
        end: { x: number; y: number };
      };
    }
  | {
      type: 'UPDATE_DRAG_POSITION';
      payload: {
        end: { x: number; y: number };
        hasMovedDuringDrag: boolean;
      };
    }
  | {
      type: 'CANCEL_DRAG';
    }
  | {
      type: 'COMPLETE_DRAG';
      payload: {
        sourceShapeId: string;
        sourceAnchor: AnchorPosition;
      } | null;
    }
  | {
      type: 'CLEAR_PENDING_CONNECTOR';
    };

/**
 * Initial state for connection drag
 */
const initialConnectionDragState: ConnectionPointDragState = {
  isDraggingConnector: false,
  hasMovedDuringDrag: false,
  connectorDragStart: null,
  connectorDragEnd: null,
  pendingConnector: null,
  isHandlingConnectionPoint: false,
};

/**
 * Reducer for managing connection drag state
 * Consolidates multiple setState calls into single atomic updates
 */
function connectionDragReducer(
  state: ConnectionPointDragState,
  action: ConnectionDragAction
): ConnectionPointDragState {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDraggingConnector: true,
        hasMovedDuringDrag: false,
        connectorDragStart: action.payload.start,
        connectorDragEnd: action.payload.end,
        isHandlingConnectionPoint: true,
      };

    case 'UPDATE_DRAG_POSITION':
      return {
        ...state,
        connectorDragEnd: action.payload.end,
        hasMovedDuringDrag: action.payload.hasMovedDuringDrag,
      };

    case 'CANCEL_DRAG':
      return {
        ...state,
        isDraggingConnector: false,
        hasMovedDuringDrag: false,
        connectorDragStart: null,
        connectorDragEnd: null,
        isHandlingConnectionPoint: false,
      };

    case 'COMPLETE_DRAG':
      return {
        ...state,
        isDraggingConnector: false,
        hasMovedDuringDrag: false,
        connectorDragStart: null,
        connectorDragEnd: null,
        pendingConnector: action.payload,
        isHandlingConnectionPoint: false,
      };

    case 'CLEAR_PENDING_CONNECTOR':
      return {
        ...state,
        pendingConnector: null,
      };

    default:
      return state;
  }
}

/**
 * Options for the connection point drag hook
 */
export interface UseConnectionPointDragOptions {
  /** Canvas ref to get bounding rect */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Current canvas transform */
  transform: CanvasTransform;
  /** All shapes on the canvas */
  shapes: Shape[];
  /** Callback to add a connector to the store */
  addConnector: (connector: Connector) => void;
  /** Callback to open toolset popover at position */
  openToolsetPopover: (
    screenX: number,
    screenY: number,
    worldX: number,
    worldY: number,
    pendingConnector?: { sourceShapeId: string; sourceAnchor: AnchorPosition }
  ) => void;
  /** Whether popover is currently open */
  isPopoverOpen: boolean;
  /** Connector creation function */
  createOrthogonalConnector: (
    source: { shapeId: string; anchor: AnchorPosition },
    target: { shapeId: string; anchor: AnchorPosition }
  ) => { ok: true; value: Connector } | { ok: false; error: string };
  /** Callback when hovering over a connection point during drag */
  onHoverConnectionPointChange?: (point: { shapeId: string; anchor: AnchorPosition } | null) => void;
  /** Callback when nearby shapes change during drag */
  onNearbyShapesChange?: (shapeIds: string[]) => void;
}

/**
 * Hook to manage connection point drag operations
 *
 * Handles:
 * - Dragging from connection points to create connectors
 * - Releasing on other connection points (creates connector)
 * - Releasing on empty canvas (opens toolset popover)
 *
 * @param options - Configuration options
 * @returns Drag state and event handlers
 *
 * @example
 * const { dragState, handleMouseDown, handleMouseUp, handleDragMove } = useConnectionPointDrag({
 *   canvasRef,
 *   transform,
 *   shapes,
 *   addConnector,
 *   openToolsetPopover,
 *   isPopoverOpen,
 *   createOrthogonalConnector
 * });
 */
export function useConnectionPointDrag(
  options: UseConnectionPointDragOptions
): {
  dragState: ConnectionPointDragState;
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  handleDragMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  clearPendingConnector: () => void;
  isHandlingConnectionPointRef: React.MutableRefObject<{ current: boolean }>;
} {
  const {
    canvasRef,
    transform,
    shapes,
    addConnector,
    openToolsetPopover,
    isPopoverOpen,
    createOrthogonalConnector,
    onHoverConnectionPointChange,
    onNearbyShapesChange,
  } = options;

  // Connection point drag state (consolidated with useReducer)
  const [dragState, dispatch] = useReducer(connectionDragReducer, initialConnectionDragState);

  // Use refs to always have access to current values without recreating handlers
  const transformRef = useRef(transform);
  const engineRef = useRef(new ConnectionPointEngine(shapes));

  // Update refs after render
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Update engine when shapes change
  useEffect(() => {
    engineRef.current.updateShapes(shapes);
  }, [shapes]);

  /**
   * Create a stable ref-like object that always returns the current state value.
   * This maintains the external interface for consumers that expect a ref with .current property.
   */
  const isHandlingConnectionPointRef = useRef({ current: dragState.isHandlingConnectionPoint });

  // Update the ref's current value to always reflect latest state
  useEffect(() => {
    isHandlingConnectionPointRef.current.current = dragState.isHandlingConnectionPoint;
  }, [dragState.isHandlingConnectionPoint]);

  // Clear pending connector state when popover closes
  const clearPendingConnector = useCallback(() => {
    if (!isPopoverOpen && dragState.pendingConnector) {
      dispatch({ type: 'CLEAR_PENDING_CONNECTOR' });
    }
  }, [isPopoverOpen, dragState.pendingConnector]);

  /**
   * Handle mouse down on connection points to start dragging
   */
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      // Only handle left mouse button
      if (event.button !== 0) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const worldPos = transformRef.current.screenToWorld(screenX, screenY);

      // Check if clicking on a connection point
      const connectionPoint = engineRef.current.findConnectionPoint(
        worldPos.x,
        worldPos.y,
        transformRef.current.scale
      );

      if (connectionPoint) {
        // Start dragging a connector
        // IMPORTANT: Prevent native event AND stop React propagation
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();

        // Single dispatch replaces 4 setState calls AND sets the handling flag atomically
        dispatch({
          type: 'START_DRAG',
          payload: {
            start: {
              shapeId: connectionPoint.shapeId,
              anchor: connectionPoint.anchor,
              x: connectionPoint.position.x,
              y: connectionPoint.position.y,
            },
            end: { x: worldPos.x, y: worldPos.y },
          },
        });
      }
    },
    [canvasRef]
  );

  /**
   * Handle mouse move during drag to update drag position
   */
  const handleDragMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragState.isDraggingConnector || !dragState.connectorDragStart) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const worldPos = transformRef.current.screenToWorld(screenX, screenY);
      const endPoint = { x: worldPos.x, y: worldPos.y };

      // Check if we've moved enough to consider this a real drag
      let shouldMarkAsMoved = dragState.hasMovedDuringDrag;
      if (!dragState.hasMovedDuringDrag) {
        const startPos = {
          x: dragState.connectorDragStart.x,
          y: dragState.connectorDragStart.y,
        };
        shouldMarkAsMoved = engineRef.current.shouldConsiderDrag(
          startPos,
          worldPos,
          transformRef.current.scale
        );
      }

      // Update drag position
      dispatch({
        type: 'UPDATE_DRAG_POSITION',
        payload: {
          end: endPoint,
          hasMovedDuringDrag: shouldMarkAsMoved,
        },
      });

      // Show connection points on nearby shapes while dragging
      const nearbyShapes = engineRef.current.getNearbyShapes(worldPos.x, worldPos.y);
      onNearbyShapesChange?.(nearbyShapes.map((s) => s.id));

      // Check if hovering over a specific connection point
      const connectionPoint = engineRef.current.findConnectionPoint(
        worldPos.x,
        worldPos.y,
        transformRef.current.scale
      );

      onHoverConnectionPointChange?.(
        connectionPoint
          ? {
              shapeId: connectionPoint.shapeId,
              anchor: connectionPoint.anchor,
            }
          : null
      );
    },
    [
      dragState.isDraggingConnector,
      dragState.connectorDragStart,
      dragState.hasMovedDuringDrag,
      canvasRef,
      onNearbyShapesChange,
      onHoverConnectionPointChange,
    ]
  );

  /**
   * Handle mouse up to complete connector creation
   */
  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragState.isDraggingConnector || !dragState.connectorDragStart) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Only create connector if we actually dragged (not just a click)
      if (!dragState.hasMovedDuringDrag) {
        // Reset drag state without creating connector
        dispatch({ type: 'CANCEL_DRAG' });
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const worldPos = transformRef.current.screenToWorld(screenX, screenY);

      // Check if releasing on a connection point
      const targetPoint = engineRef.current.findConnectionPoint(
        worldPos.x,
        worldPos.y,
        transformRef.current.scale
      );

      if (targetPoint) {
        // Prevent connecting to the same point
        const isSamePoint = engineRef.current.isSameConnectionPoint(
          {
            shapeId: dragState.connectorDragStart.shapeId,
            anchor: dragState.connectorDragStart.anchor,
          },
          {
            shapeId: targetPoint.shapeId,
            anchor: targetPoint.anchor,
          }
        );

        if (!isSamePoint) {
          // Create the connector
          const connectorResult = createOrthogonalConnector(
            {
              shapeId: dragState.connectorDragStart.shapeId,
              anchor: dragState.connectorDragStart.anchor,
            },
            {
              shapeId: targetPoint.shapeId,
              anchor: targetPoint.anchor,
            }
          );

          if (connectorResult.ok) {
            addConnector(connectorResult.value);
          } else {
            console.error('Failed to create connector:', connectorResult.error);
          }
        }

        // Reset drag state after connecting to target
        dispatch({ type: 'COMPLETE_DRAG', payload: null });
      } else {
        // Released on empty canvas - open toolset popover for shape creation
        const connector = {
          sourceShapeId: dragState.connectorDragStart.shapeId,
          sourceAnchor: dragState.connectorDragStart.anchor,
        };

        // Complete drag with pending connector
        dispatch({
          type: 'COMPLETE_DRAG',
          payload: connector,
        });

        // Open the toolset popover at the release position with pending connector
        // Use viewport coordinates (event.clientX/Y) for UI positioning
        openToolsetPopover(event.clientX, event.clientY, worldPos.x, worldPos.y, connector);
      }
    },
    [
      dragState.isDraggingConnector,
      dragState.connectorDragStart,
      dragState.hasMovedDuringDrag,
      canvasRef,
      createOrthogonalConnector,
      addConnector,
      openToolsetPopover,
    ]
  );

  return {
    dragState,
    handleMouseDown,
    handleMouseUp,
    handleDragMove,
    clearPendingConnector,
    isHandlingConnectionPointRef,
  };
}
