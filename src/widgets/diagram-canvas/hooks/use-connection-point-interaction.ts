'use client';

/**
 * Connection Point Interaction Hook
 *
 * Manages connection point hover detection, dragging, and connector creation.
 * Handles the visual feedback and interaction flow when users create connectors
 * between shapes by dragging from connection points.
 */

import { useState, useRef, useCallback } from 'react';
import type { AnchorPosition, Connector } from '@/entities/connector';
import type { Shape } from '@/entities/shape';
import { ConnectionPointSystem } from '@/shared/lib/connection-point-system';
import { CanvasTransform } from '@/shared/lib/canvas-transform';
import {
  CONNECTION_POINT_CONFIG,
  SHAPE_PROXIMITY_CONFIG,
} from '@/shared/config/canvas-config';

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
 * Handles:
 * - Hovering over connection points (shows visual feedback)
 * - Dragging from connection points to create connectors
 * - Releasing on other connection points (creates connector)
 * - Releasing on empty canvas (opens toolset popover)
 *
 * @param options - Configuration options
 * @returns Connection point state and event handlers
 */
export function useConnectionPointInteraction(
  options: UseConnectionPointInteractionOptions
): {
  state: ConnectionPointState;
  handlers: ConnectionPointInteractionHandlers;
  isHandlingConnectionPoint: React.MutableRefObject<boolean>;
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

  // Connection point hover and drag state
  const [hoveredShapeIds, setHoveredShapeIds] = useState<string[]>([]);
  const [hoveredConnectionPoint, setHoveredConnectionPoint] = useState<{
    shapeId: string;
    anchor: AnchorPosition;
  } | null>(null);
  const [isDraggingConnector, setIsDraggingConnector] = useState(false);
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);
  const [connectorDragStart, setConnectorDragStart] = useState<{
    shapeId: string;
    anchor: AnchorPosition;
    x: number;
    y: number;
  } | null>(null);
  const [connectorDragEnd, setConnectorDragEnd] = useState<{ x: number; y: number } | null>(
    null
  );
  const [pendingConnector, setPendingConnector] = useState<{
    sourceShapeId: string;
    sourceAnchor: AnchorPosition;
  } | null>(null);

  // Store whether we're handling a connection point to prevent other handlers
  const isHandlingConnectionPoint = useRef(false);

  // Use a ref to always have access to current transform without recreating handlers
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const isDraggingConnectorRef = useRef(isDraggingConnector);
  isDraggingConnectorRef.current = isDraggingConnector;

  // Clear pending connector state when popover closes
  const clearPendingConnector = useCallback(() => {
    if (!isPopoverOpen && pendingConnector) {
      setPendingConnector(null);
    }
  }, [isPopoverOpen, pendingConnector]);

  // Handle mouse move for connection point hover detection
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const worldPos = transformRef.current.screenToWorld(screenX, screenY);

      // If dragging a connector, update the drag end position
      if (isDraggingConnector && connectorDragStart) {
        setConnectorDragEnd({ x: worldPos.x, y: worldPos.y });

        // Check if we've moved enough to consider this a real drag
        if (!hasMovedDuringDrag) {
          const distance = Math.hypot(
            worldPos.x - connectorDragStart.x,
            worldPos.y - connectorDragStart.y
          );
          if (distance > CONNECTION_POINT_CONFIG.dragThreshold / transformRef.current.scale) {
            setHasMovedDuringDrag(true);
          }
        }

        // Show connection points on nearby shapes while dragging
        const nearbyShapes = ConnectionPointSystem.getShapesNearPosition(
          worldPos.x,
          worldPos.y,
          shapes,
          SHAPE_PROXIMITY_CONFIG.defaultDistance
        );
        setHoveredShapeIds(nearbyShapes.map((s) => s.id));

        // Check if hovering over a specific connection point
        const connectionPoint = ConnectionPointSystem.findAtPosition(
          worldPos.x,
          worldPos.y,
          shapes,
          { scale: transformRef.current.scale }
        );

        if (connectionPoint) {
          setHoveredConnectionPoint({
            shapeId: connectionPoint.shapeId,
            anchor: connectionPoint.anchor,
          });
        } else {
          setHoveredConnectionPoint(null);
        }
        return;
      }

      // Check if hovering near any shapes
      const nearbyShapes = ConnectionPointSystem.getShapesNearPosition(
        worldPos.x,
        worldPos.y,
        shapes,
        SHAPE_PROXIMITY_CONFIG.defaultDistance
      );

      if (nearbyShapes.length > 0) {
        setHoveredShapeIds(nearbyShapes.map((s) => s.id));

        // Check if hovering over a specific connection point
        const connectionPoint = ConnectionPointSystem.findAtPosition(
          worldPos.x,
          worldPos.y,
          shapes,
          { scale: transformRef.current.scale }
        );

        if (connectionPoint) {
          setHoveredConnectionPoint({
            shapeId: connectionPoint.shapeId,
            anchor: connectionPoint.anchor,
          });
        } else {
          setHoveredConnectionPoint(null);
        }
      } else {
        setHoveredShapeIds([]);
        setHoveredConnectionPoint(null);
      }
    },
    [
      canvasRef,
      shapes,
      isDraggingConnector,
      connectorDragStart,
      hasMovedDuringDrag,
    ]
  );

  // Handle mouse down on connection points
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
      const connectionPoint = ConnectionPointSystem.findAtPosition(
        worldPos.x,
        worldPos.y,
        shapes,
        { scale: transformRef.current.scale }
      );

      if (connectionPoint) {
        // Start dragging a connector
        // IMPORTANT: Prevent native event AND stop React propagation
        event.preventDefault();
        event.stopPropagation();
        event.nativeEvent.stopImmediatePropagation();

        isHandlingConnectionPoint.current = true;

        setIsDraggingConnector(true);
        setHasMovedDuringDrag(false);
        setConnectorDragStart({
          shapeId: connectionPoint.shapeId,
          anchor: connectionPoint.anchor,
          x: connectionPoint.position.x,
          y: connectionPoint.position.y,
        });
        setConnectorDragEnd({ x: worldPos.x, y: worldPos.y });
      }
    },
    [canvasRef, shapes]
  );

  // Handle mouse up to complete connector creation
  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDraggingConnector || !connectorDragStart) {
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Only create connector if we actually dragged (not just a click)
      if (!hasMovedDuringDrag) {
        // Reset drag state without creating connector
        setIsDraggingConnector(false);
        setHasMovedDuringDrag(false);
        setConnectorDragStart(null);
        setConnectorDragEnd(null);
        setHoveredConnectionPoint(null);

        // Reset flag to allow normal mouse handlers again
        setTimeout(() => {
          isHandlingConnectionPoint.current = false;
        }, 0);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const worldPos = transformRef.current.screenToWorld(screenX, screenY);

      // Check if releasing on a connection point
      const targetPoint = ConnectionPointSystem.findAtPosition(
        worldPos.x,
        worldPos.y,
        shapes,
        { scale: transformRef.current.scale }
      );

      if (targetPoint) {
        // Prevent connecting to the same point
        const isSamePoint =
          targetPoint.shapeId === connectorDragStart.shapeId &&
          targetPoint.anchor === connectorDragStart.anchor;

        if (!isSamePoint) {
          // Create the connector
          const connectorResult = createOrthogonalConnector(
            {
              shapeId: connectorDragStart.shapeId,
              anchor: connectorDragStart.anchor,
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
      } else {
        // Released on empty canvas - open toolset popover for shape creation
        const connector = {
          sourceShapeId: connectorDragStart.shapeId,
          sourceAnchor: connectorDragStart.anchor,
        };

        // Store pending connector state locally
        setPendingConnector(connector);

        // Open the toolset popover at the release position with pending connector
        // Use viewport coordinates (event.clientX/Y) for UI positioning
        openToolsetPopover(event.clientX, event.clientY, worldPos.x, worldPos.y, connector);
      }

      // Reset drag state
      setIsDraggingConnector(false);
      setHasMovedDuringDrag(false);
      setConnectorDragStart(null);
      setConnectorDragEnd(null);
      setHoveredConnectionPoint(null);

      // Reset flag after a short delay to ensure other handlers see it
      setTimeout(() => {
        isHandlingConnectionPoint.current = false;
      }, 0);
    },
    [
      isDraggingConnector,
      connectorDragStart,
      hasMovedDuringDrag,
      canvasRef,
      shapes,
      createOrthogonalConnector,
      addConnector,
      openToolsetPopover,
    ]
  );

  // Get cursor style based on connection point interaction state
  const getCursorStyle = useCallback(() => {
    if (hoveredConnectionPoint) return 'crosshair';
    if (isDraggingConnector) return 'crosshair';
    return 'default';
  }, [hoveredConnectionPoint, isDraggingConnector]);

  const state: ConnectionPointState = {
    hoveredShapeIds,
    hoveredConnectionPoint,
    isDraggingConnector,
    hasMovedDuringDrag,
    connectorDragStart,
    connectorDragEnd,
    pendingConnector,
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
    isHandlingConnectionPoint,
  };
}
