'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useStore } from 'zustand';
import { setupMouseInput, EntityInteractionCallbacks } from '../lib/mouse-input';
import { setupKeyboardInput, KeyboardInteractionCallbacks } from '../lib/keyboard-input';
import { SelectionBox } from '../lib/selection-box-renderer';
import { createCanvasStore } from '../model/canvas-store';
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
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

export interface DiagramCanvasProps {
  /** Unique identifier for the diagram */
  diagramId: string;
  /** Initial shapes to render */
  initialShapes: Shape[];
  /** Initial connectors to render */
  initialConnectors: Connector[];
  /** The diagram type to determine which toolset to display */
  diagramType: DiagramType;
  /** Callback when diagram state changes (for auto-save) */
  onDiagramChange?: (snapshot: { shapes: Shape[]; connectors: Connector[] }) => void;
}

export function DiagramCanvas({
  diagramId,
  initialShapes,
  initialConnectors,
  diagramType,
  onDiagramChange
}: DiagramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<CanvasTransform>(CanvasTransform.identity());
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Use a ref to always have access to current transform without recreating handlers
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Create internal store instance for this diagram (isolated per diagram ID)
  const store = useMemo(() => {
    return createCanvasStore({
      id: diagramId,
      name: 'Diagram', // Name not used by canvas, just required by Diagram type
      shapes: initialShapes,
      connectors: initialConnectors,
      diagramType,
      metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId]); // Only recreate if diagram ID changes (ignore shape/connector changes as they're synced separately)

  // Sync props to internal store when they change externally
  useEffect(() => {
    const currentState = store.getState();
    const hasChanges =
      currentState.shapes.length !== initialShapes.length ||
      currentState.connectors.length !== initialConnectors.length;

    if (hasChanges) {
      store.setState({
        shapes: [...initialShapes],
        connectors: [...initialConnectors],
      });
    }
  }, [store, initialShapes, initialConnectors, diagramId]);

  // Notify parent when diagram changes (for auto-save)
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      onDiagramChange?.({
        shapes: state.shapes,
        connectors: state.connectors,
      });
    });

    return unsubscribe;
  }, [store, onDiagramChange]);

  // Get values from canvas store using selectors
  const shapes = useStore(store, (state) => state.shapes);
  const connectors = useStore(store, (state) => state.connectors);
  const selectedEntityIds = useStore(store, (state) => state.selectedEntityIds);
  const snapMode = useStore(store, (state) => state.snapMode);
  const editingShapeId = useStore(store, (state) => state.editingShapeId);
  const addShape = useStore(store, (state) => state.addShape);
  const addConnector = useStore(store, (state) => state.addConnector);
  const deleteSelectedEntities = useStore(store, (state) => state.deleteSelectedEntities);
  const findEntityAtPoint = useStore(store, (state) => state.findEntityAtPoint);
  const isSelected = useStore(store, (state) => state.isSelected);
  const getAllSelectedEntities = useStore(store, (state) => state.getAllSelectedEntities);
  const setSelectedEntities = useStore(store, (state) => state.setSelectedEntities);
  const addToSelection = useStore(store, (state) => state.addToSelection);
  const toggleSelection = useStore(store, (state) => state.toggleSelection);
  const clearSelection = useStore(store, (state) => state.clearSelection);
  const selectEntitiesInBox = useStore(store, (state) => state.selectEntitiesInBox);
  const setDraggingEntities = useStore(store, (state) => state.setDraggingEntities);
  const clearDraggingEntities = useStore(store, (state) => state.clearDraggingEntities);
  const updateShapePositionInternal = useStore(store, (state) => state.updateShapePositionInternal);
  const finalizeShapeMove = useStore(store, (state) => state.finalizeShapeMove);
  const setEditingShape = useStore(store, (state) => state.setEditingShape);
  const updateShapeText = useStore(store, (state) => state.updateShapeText);
  const undo = useStore(store, (state) => state.undo);
  const redo = useStore(store, (state) => state.redo);
  const canUndo = useStore(store, (state) => state.canUndo);
  const canRedo = useStore(store, (state) => state.canRedo);

  // Use refs to always have access to current values without recreating handlers
  const snapModeRef = useRef(snapMode);
  const shapesRef = useRef(shapes);

  // Use refs for store methods to avoid recreating effect on every store change
  const addShapeRef = useRef(addShape);
  const findEntityAtPointRef = useRef(findEntityAtPoint);
  const isSelectedRef = useRef(isSelected);
  const getAllSelectedEntitiesRef = useRef(getAllSelectedEntities);
  const setSelectedEntitiesRef = useRef(setSelectedEntities);
  const addToSelectionRef = useRef(addToSelection);
  const toggleSelectionRef = useRef(toggleSelection);
  const clearSelectionRef = useRef(clearSelection);
  const selectEntitiesInBoxRef = useRef(selectEntitiesInBox);
  const setDraggingEntitiesRef = useRef(setDraggingEntities);
  const clearDraggingEntitiesRef = useRef(clearDraggingEntities);
  const updateShapePositionInternalRef = useRef(updateShapePositionInternal);
  const finalizeShapeMoveRef = useRef(finalizeShapeMove);
  const setEditingShapeRef = useRef(setEditingShape);

  // Get toolset popover store
  const { open: openToolsetPopover, isOpen: isPopoverOpen } = useToolsetPopoverStore();

  const openToolsetPopoverRef = useRef(openToolsetPopover);

  // Update all refs after render to follow React rules (no synchronous updates during render)
  useEffect(() => {
    snapModeRef.current = snapMode;
    shapesRef.current = shapes;
    addShapeRef.current = addShape;
    findEntityAtPointRef.current = findEntityAtPoint;
    isSelectedRef.current = isSelected;
    getAllSelectedEntitiesRef.current = getAllSelectedEntities;
    setSelectedEntitiesRef.current = setSelectedEntities;
    addToSelectionRef.current = addToSelection;
    toggleSelectionRef.current = toggleSelection;
    clearSelectionRef.current = clearSelection;
    selectEntitiesInBoxRef.current = selectEntitiesInBox;
    setDraggingEntitiesRef.current = setDraggingEntities;
    clearDraggingEntitiesRef.current = clearDraggingEntities;
    updateShapePositionInternalRef.current = updateShapePositionInternal;
    finalizeShapeMoveRef.current = finalizeShapeMove;
    setEditingShapeRef.current = setEditingShape;
    openToolsetPopoverRef.current = openToolsetPopover;
  }, [
    snapMode,
    shapes,
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
    setEditingShape,
    openToolsetPopover,
  ]);

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
      findEntityAtPoint: (...args) => findEntityAtPointRef.current(...args),
      isSelected: (...args) => isSelectedRef.current(...args),
      getAllSelectedEntities: () => getAllSelectedEntitiesRef.current(),
      setSelectedEntities: (...args) => setSelectedEntitiesRef.current(...args),
      addToSelection: (...args) => addToSelectionRef.current(...args),
      toggleSelection: (...args) => toggleSelectionRef.current(...args),
      clearSelection: () => clearSelectionRef.current(),
      selectEntitiesInBox: (...args) => selectEntitiesInBoxRef.current(...args),
      setDraggingEntities: (...args) => setDraggingEntitiesRef.current(...args),
      clearDraggingEntities: () => clearDraggingEntitiesRef.current(),
      updateEntityPositionInternal: (id, x, y) => {
        updateShapePositionInternalRef.current(id, x, y);
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
        finalizeShapeMoveRef.current(shapeMoves);
      },
      createRectangleAtPoint: (x, y) => {
        const newShapeResult = createRectangleAtPoint(x, y);
        if (newShapeResult.ok) {
          addShapeRef.current(newShapeResult.value);
        } else {
          console.error('Failed to create rectangle:', newShapeResult.error);
        }
      },
      openToolsetPopover: (screenX, screenY, worldX, worldY) => {
        openToolsetPopoverRef.current(screenX, screenY, worldX, worldY);
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
        setEditingShapeRef.current(shapeId);
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
    // Only depend on connectionPointState.isDraggingConnector and isHandlingConnectionPoint
    // All store methods are accessed via refs to avoid recreating effect constantly
  }, [connectionPointState.isDraggingConnector, isHandlingConnectionPoint]);

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
      <CanvasControls snapMode={snapMode} setSnapMode={useStore(store, (state) => state.setSnapMode)} />
      <ZoomControl zoom={transform.scale} onReset={handleResetZoom} />
      <ToolsetPopover diagramType={diagramType} addShape={addShape} addConnector={addConnector} />
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
