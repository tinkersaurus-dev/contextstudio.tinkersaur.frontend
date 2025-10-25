'use client';

import { useEffect, useRef, useState } from 'react';
import { setupMouseInput, EntityInteractionCallbacks } from '../lib/mouse-input';
import { setupKeyboardInput, KeyboardInteractionCallbacks } from '../lib/keyboard-input';
import { renderCanvas } from '../lib/canvas-renderer';
import { SelectionBox } from '../lib/selection-box-renderer';
import { useCanvasStore } from '../model/canvas-store';
import { createRectangleAtPoint } from '@/entities/shape/lib/shape-factory';
import { createStraightConnector, type AnchorPosition } from '@/entities/connector';
import { CanvasControls, ZoomControl } from '@/widgets/canvas-controls';
import { ToolsetPopover, useToolsetPopoverStore } from '@/widgets/toolset-popover';
import { CanvasTransform } from '@/shared/lib/canvas-transform';
import { ConnectionPointSystem } from '@/shared/lib/connection-point-system';
import {
  CONNECTION_POINT_CONFIG,
  SHAPE_PROXIMITY_CONFIG,
} from '@/shared/config/canvas-config';

export function DiagramCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<CanvasTransform>(CanvasTransform.identity());
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

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

  // Use a ref to always have access to current transform without recreating handlers
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Get Zustand store
  const {
    shapes,
    connectors,
    selectedEntityIds,
    snapMode,
    addShape,
    addConnector,
    deleteSelectedEntities,
    findEntityAtPoint,
    isSelected,
    getAllSelectedEntities,
    setSelectedEntities,
    addToSelection,
    toggleSelection,
    clearSelection,
    selectEntitiesInBox,
    setDraggingEntities,
    clearDraggingEntities,
    updateShapePositionInternal,
    finalizeShapeMove,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvasStore();

  // Use refs to always have access to current values without recreating handlers
  const snapModeRef = useRef(snapMode);
  snapModeRef.current = snapMode;

  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;

  const isDraggingConnectorRef = useRef(isDraggingConnector);
  isDraggingConnectorRef.current = isDraggingConnector;

  // Get toolset popover store
  const { open: openToolsetPopover } = useToolsetPopoverStore();

  // Setup mouse input handlers (only once)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Entity interaction callbacks
    const entityCallbacks: EntityInteractionCallbacks = {
      findEntityAtPoint,
      isSelected,
      getAllSelectedEntities,
      setSelectedEntities,
      addToSelection,
      toggleSelection,
      clearSelection,
      selectEntitiesInBox,
      setDraggingEntities,
      clearDraggingEntities,
      updateEntityPositionInternal: (id, x, y) => {
        updateShapePositionInternal(id, x, y);
      },
      finalizeEntityMove: (moves) => {
        // Convert entity IDs to shape IDs for the store
        const shapeMoves = moves.map((move) => ({
          shapeId: move.entityId,
          fromX: move.fromX,
          fromY: move.fromY,
          toX: move.toX,
          toY: move.toY,
        }));
        finalizeShapeMove(shapeMoves);
      },
      createRectangleAtPoint: (x, y) => {
        const newShapeResult = createRectangleAtPoint(x, y);
        if (newShapeResult.ok) {
          addShape(newShapeResult.value);
        } else {
          console.error('Failed to create rectangle:', newShapeResult.error);
        }
      },
      openToolsetPopover: (screenX, screenY, worldX, worldY) => {
        openToolsetPopover(screenX, screenY, worldX, worldY);
      },
      onSelectionBoxChange: (box) => {
        if (box) {
          setSelectionBox({
            startX: box.startX,
            startY: box.startY,
            endX: box.currentX,
            endY: box.currentY,
          });
        } else {
          setSelectionBox(null);
        }
      },
      getSnapMode: () => snapModeRef.current,
      shouldSkipDefaultHandlers: () => isHandlingConnectionPoint.current,
      isConnectionPointAt: (worldX, worldY) => {
        // Don't block native handlers if we're already dragging a connector
        // (we need mouseup to work)
        if (isDraggingConnectorRef.current) {
          return false;
        }
        return ConnectionPointSystem.isHitByPoint(worldX, worldY, shapesRef.current, {
          scale: transformRef.current.scale,
        });
      },
    };

    // Pass getter function that always returns current transform
    const cleanup = setupMouseInput(
      canvas,
      () => transformRef.current,
      setTransform,
      entityCallbacks
    );

    return cleanup;
  }, [
    addShape,
    findEntityAtPoint,
    isSelected,
    getAllSelectedEntities,
    setSelectedEntities,
    addToSelection,
    toggleSelection,
    clearSelection,
    selectEntitiesInBox,
    setDraggingEntities,
    clearDraggingEntities,
    updateShapePositionInternal,
    finalizeShapeMove,
    openToolsetPopover,
  ]);

  // Setup keyboard input handlers (only once)
  useEffect(() => {
    // Keyboard interaction callbacks
    const keyboardCallbacks: KeyboardInteractionCallbacks = {
      getAllSelectedEntities,
      deleteSelectedEntities,
      undo,
      redo,
      canUndo,
      canRedo,
    };

    // Setup keyboard input
    const cleanup = setupKeyboardInput(keyboardCallbacks);

    return cleanup;
  }, [getAllSelectedEntities, deleteSelectedEntities, undo, redo, canUndo, canRedo]);

  // Handle mouse move for connection point hover detection
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
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
  };

  // Store whether we're handling a connection point to prevent other handlers
  const isHandlingConnectionPoint = useRef(false);

  // Handle mouse down on connection points
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
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
  };

  // Handle mouse up to complete connector creation
  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
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
        const connectorResult = createStraightConnector(
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
  };

  // Render canvas when state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      // Show connection points for hovered shapes or when dragging
      const shapesToShowPoints = isDraggingConnector ? shapes : shapes.filter(s => hoveredShapeIds.includes(s.id));

      renderCanvas({
        canvas,
        transform,
        shapes,
        connectors,
        selectedEntityIds,
        selectionBox,
        isConnectorMode: shapesToShowPoints.length > 0,
        connectorDragStart:
          connectorDragStart && hasMovedDuringDrag
            ? { x: connectorDragStart.x, y: connectorDragStart.y }
            : null,
        connectorDragEnd: hasMovedDuringDrag ? connectorDragEnd : null,
        hoveredShapeIds,
        hoveredConnectionPoint,
      });
    };

    render();
    window.addEventListener('resize', render);

    return () => {
      window.removeEventListener('resize', render);
    };
  }, [
    transform,
    shapes,
    connectors,
    selectedEntityIds,
    selectionBox,
    hoveredShapeIds,
    hoveredConnectionPoint,
    isDraggingConnector,
    hasMovedDuringDrag,
    connectorDragStart,
    connectorDragEnd,
  ]);

  // Handler to reset zoom to 100%
  const handleResetZoom = () => {
    setTransform(CanvasTransform.identity());
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: hoveredConnectionPoint
            ? 'crosshair'
            : isDraggingConnector
            ? 'crosshair'
            : 'default',
        }}
      />
      <CanvasControls />
      <ZoomControl zoom={transform.scale} onReset={handleResetZoom} />
      <ToolsetPopover />
    </div>
  );
}
