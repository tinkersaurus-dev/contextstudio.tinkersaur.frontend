'use client';

import { useEffect, useRef, useState } from 'react';
import { setupMouseInput, EntityInteractionCallbacks } from '../lib/mouse-input';
import { setupKeyboardInput, KeyboardInteractionCallbacks } from '../lib/keyboard-input';
import { SelectionBox } from '../lib/selection-box-renderer';
import { useCanvasStore } from '../model/canvas-store-provider';
import { createRectangleAtPoint } from '@/entities/shape/lib/shape-factory';
import { createOrthogonalConnector } from '@/entities/connector';
import { CanvasControls, ZoomControl } from '@/widgets/canvas-controls';
import { ToolsetPopover, useToolsetPopoverStore } from '@/widgets/toolset-popover';
import { TextEditOverlay } from '@/widgets/text-edit-overlay';
import { CanvasTransform } from '@/shared/lib/canvas-transform';
import { ConnectionPointSystem } from '@/shared/lib/connection-point-system';
import { useConnectionPointInteraction } from '../hooks/use-connection-point-interaction';
import { useCanvasRendering } from '../hooks/use-canvas-rendering';
import type { DiagramType } from '@/shared/types/content-data';

export interface DiagramCanvasProps {
  /** The diagram type to determine which toolset to display */
  diagramType: DiagramType;
}

export function DiagramCanvas({ diagramType }: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<CanvasTransform>(CanvasTransform.identity());
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Use a ref to always have access to current transform without recreating handlers
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Get values from canvas store using selectors
  const shapes = useCanvasStore((state) => state.shapes);
  const connectors = useCanvasStore((state) => state.connectors);
  const diagramId = useCanvasStore((state) => state.diagramId);

  // Log component lifecycle
  useEffect(() => {
    console.log(`[DiagramCanvas] Mounted for diagram ${diagramId} with ${shapes.length} shapes, ${connectors.length} connectors`);
    return () => {
      console.log(`[DiagramCanvas] Unmounting for diagram ${diagramId}`);
    };
  }, [diagramId, shapes.length, connectors.length]);
  const selectedEntityIds = useCanvasStore((state) => state.selectedEntityIds);
  const snapMode = useCanvasStore((state) => state.snapMode);
  const editingShapeId = useCanvasStore((state) => state.editingShapeId);
  const addShape = useCanvasStore((state) => state.addShape);
  const addConnector = useCanvasStore((state) => state.addConnector);
  const deleteSelectedEntities = useCanvasStore((state) => state.deleteSelectedEntities);
  const findEntityAtPoint = useCanvasStore((state) => state.findEntityAtPoint);
  const isSelected = useCanvasStore((state) => state.isSelected);
  const getAllSelectedEntities = useCanvasStore((state) => state.getAllSelectedEntities);
  const setSelectedEntities = useCanvasStore((state) => state.setSelectedEntities);
  const addToSelection = useCanvasStore((state) => state.addToSelection);
  const toggleSelection = useCanvasStore((state) => state.toggleSelection);
  const clearSelection = useCanvasStore((state) => state.clearSelection);
  const selectEntitiesInBox = useCanvasStore((state) => state.selectEntitiesInBox);
  const setDraggingEntities = useCanvasStore((state) => state.setDraggingEntities);
  const clearDraggingEntities = useCanvasStore((state) => state.clearDraggingEntities);
  const updateShapePositionInternal = useCanvasStore((state) => state.updateShapePositionInternal);
  const finalizeShapeMove = useCanvasStore((state) => state.finalizeShapeMove);
  const setEditingShape = useCanvasStore((state) => state.setEditingShape);
  const updateShapeText = useCanvasStore((state) => state.updateShapeText);
  const undo = useCanvasStore((state) => state.undo);
  const redo = useCanvasStore((state) => state.redo);
  const canUndo = useCanvasStore((state) => state.canUndo);
  const canRedo = useCanvasStore((state) => state.canRedo);

  // Use refs to always have access to current values without recreating handlers
  const snapModeRef = useRef(snapMode);
  snapModeRef.current = snapMode;

  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;

  // Get toolset popover store
  const { open: openToolsetPopover, isOpen: isPopoverOpen } = useToolsetPopoverStore();

  // Use connection point interaction hook
  const {
    state: connectionPointState,
    handlers: connectionPointHandlers,
    isHandlingConnectionPoint,
  } = useConnectionPointInteraction({
    canvasRef,
    transform,
    shapes,
    addConnector,
    openToolsetPopover,
    isPopoverOpen,
    createOrthogonalConnector,
  });

  // Clear pending connector state when popover closes
  useEffect(() => {
    connectionPointHandlers.clearPendingConnector();
  }, [isPopoverOpen, connectionPointHandlers]);

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
        if (connectionPointState.isDraggingConnector) {
          return false;
        }
        return ConnectionPointSystem.isHitByPoint(worldX, worldY, shapesRef.current, {
          scale: transformRef.current.scale,
        });
      },
      startEditingText: (shapeId) => {
        setEditingShape(shapeId);
      },
      getAllShapes: () => shapesRef.current,
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
    setEditingShape,
    connectionPointState.isDraggingConnector,
    isHandlingConnectionPoint,
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

  // Use canvas rendering hook
  useCanvasRendering({
    canvasRef,
    transform,
    shapes,
    connectors,
    selectedEntityIds,
    selectionBox,
    hoveredShapeIds: connectionPointState.hoveredShapeIds,
    hoveredConnectionPoint: connectionPointState.hoveredConnectionPoint,
    isDraggingConnector: connectionPointState.isDraggingConnector,
    hasMovedDuringDrag: connectionPointState.hasMovedDuringDrag,
    connectorDragStart: connectionPointState.connectorDragStart,
    connectorDragEnd: connectionPointState.connectorDragEnd,
  });

  // Handler to reset zoom to 100%
  const handleResetZoom = () => {
    setTransform(CanvasTransform.identity());
  };

  // Get the shape being edited
  const editingShape = editingShapeId ? shapes.find((s) => s.id === editingShapeId) || null : null;

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100%' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        onMouseMove={connectionPointHandlers.handleMouseMove}
        onMouseDown={connectionPointHandlers.handleMouseDown}
        onMouseUp={connectionPointHandlers.handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: connectionPointHandlers.getCursorStyle(),
        }}
      />
      <CanvasControls />
      <ZoomControl zoom={transform.scale} onReset={handleResetZoom} />
      <ToolsetPopover diagramType={diagramType} />
      <TextEditOverlay
        entity={editingShape}
        transform={transform}
        onCommit={(entityId, text) => {
          updateShapeText(entityId, text);
          setEditingShape(null);
        }}
        onCancel={() => setEditingShape(null)}
      />
    </div>
  );
}
