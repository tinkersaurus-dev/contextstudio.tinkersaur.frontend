'use client';

/**
 * Connection Point Interaction Hook
 *
 * Composes hover and drag hooks to provide a unified interface for connection point interactions.
 * This is the main hook that components should use for connection point functionality.
 */

import { useCallback } from 'react';
import type { AnchorPosition, Connector } from '@/entities/connector';
import type { Shape } from '@/entities/shape';
import { CanvasTransform } from '@/shared/lib/rendering';
import { useConnectionPointHover } from './use-connection-point-hover';
import { useConnectionPointDrag } from './use-connection-point-drag';

export interface ConnectionPointState {
  /** IDs of shapes that should show connection points (nearby or being dragged to) */
  hoveredShapeIds: string[];
  /** Specific connection point being hovered */
  hoveredConnectionPoint: {
    shapeId: string;
    anchor: AnchorPosition;
  } | null;
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
}

export interface ConnectionPointInteractionHandlers {
  /** Handle mouse move for connection point hover detection */
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Handle mouse down on connection points */
  handleMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Handle mouse up to complete connector creation */
  handleMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  /** Get cursor style based on connection point interaction state */
  getCursorStyle: () => string;
  /** Clear pending connector state */
  clearPendingConnector: () => void;
}

export interface UseConnectionPointInteractionOptions {
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
}

/**
 * Custom hook to manage connection point interaction state and handlers
 *
 * Composes useConnectionPointHover and useConnectionPointDrag to provide a unified API.
 *
 * Handles:
 * - Hovering over connection points (shows visual feedback)
 * - Dragging from connection points to create connectors
 * - Releasing on other connection points (creates connector)
 * - Releasing on empty canvas (opens toolset popover)
 *
 * @param options - Configuration options
 * @returns Connection point state and event handlers
 *
 * @example
 * const { state, handlers, isHandlingConnectionPoint } = useConnectionPointInteraction({
 *   canvasRef,
 *   transform,
 *   shapes,
 *   addConnector,
 *   openToolsetPopover,
 *   isPopoverOpen,
 *   createOrthogonalConnector
 * });
 */
export function useConnectionPointInteraction(
  options: UseConnectionPointInteractionOptions
): {
  state: ConnectionPointState;
  handlers: ConnectionPointInteractionHandlers;
  isHandlingConnectionPoint: React.MutableRefObject<{ current: boolean }>;
} {
  const {
    canvasRef,
    transform,
    shapes,
    addConnector,
    openToolsetPopover,
    isPopoverOpen,
    createOrthogonalConnector,
  } = options;

  // Use hover hook for hover detection
  const {
    hoverState,
    handleMouseMove: hoverHandleMouseMove,
    setHoveredConnectionPoint,
    setHoveredShapeIds,
  } = useConnectionPointHover({
    canvasRef,
    transform,
    shapes,
  });

  // Use drag hook for drag operations
  const {
    dragState,
    handleMouseDown,
    handleMouseUp,
    handleDragMove,
    clearPendingConnector,
    isHandlingConnectionPointRef,
  } = useConnectionPointDrag({
    canvasRef,
    transform,
    shapes,
    addConnector,
    openToolsetPopover,
    isPopoverOpen,
    createOrthogonalConnector,
    onHoverConnectionPointChange: setHoveredConnectionPoint,
    onNearbyShapesChange: setHoveredShapeIds,
  });

  // Combine mouse move handlers
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      // If dragging, let the drag handler update the position
      if (dragState.isDraggingConnector) {
        handleDragMove(event);
      } else {
        // Otherwise, let the hover handler detect hover
        hoverHandleMouseMove(event);
      }
    },
    [dragState.isDraggingConnector, handleDragMove, hoverHandleMouseMove]
  );

  // Get cursor style based on connection point interaction state
  const getCursorStyle = useCallback(() => {
    if (hoverState.hoveredConnectionPoint) return 'crosshair';
    if (dragState.isDraggingConnector) return 'crosshair';
    return 'default';
  }, [hoverState.hoveredConnectionPoint, dragState.isDraggingConnector]);

  // Combine state from both hooks
  const state: ConnectionPointState = {
    hoveredShapeIds: hoverState.hoveredShapeIds,
    hoveredConnectionPoint: hoverState.hoveredConnectionPoint,
    isDraggingConnector: dragState.isDraggingConnector,
    hasMovedDuringDrag: dragState.hasMovedDuringDrag,
    connectorDragStart: dragState.connectorDragStart,
    connectorDragEnd: dragState.connectorDragEnd,
    pendingConnector: dragState.pendingConnector,
  };

  const handlers: ConnectionPointInteractionHandlers = {
    handleMouseMove,
    handleMouseDown,
    handleMouseUp,
    getCursorStyle,
    clearPendingConnector,
  };

  return {
    state,
    handlers,
    isHandlingConnectionPoint: isHandlingConnectionPointRef,
  };
}
