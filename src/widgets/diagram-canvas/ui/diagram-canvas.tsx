'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/shallow';
import { EntityInteractionCallbacks } from '../lib/mouse-input-types';
import { SelectionBox } from '../lib/selection-box-renderer';
import { createCanvasStore, type CanvasStore } from '../model/canvas-store';
import { createRectangleAtPoint } from '@/entities/shape/lib/shape-factory';
import { createOrthogonalConnector } from '@/entities/connector';
import { CanvasControls, CanvasTextControls, ZoomControl } from '@/widgets/canvas-controls';
import { ToolsetPopover, createToolsetPopoverStore } from '@/widgets/toolset-popover';
import { TextEditOverlay } from '@/widgets/text-edit-overlay';
import { CanvasTransform } from '@/shared/lib/rendering';
import { ConnectionPointSystem } from '@/shared/lib/connections';
import { getMermaidImporter } from '@/shared/lib/mermaid/mermaid-parser-registry';
import { useConnectionPointInteraction } from '../hooks/use-connection-point-interaction';
import { useMouseInteraction } from '../hooks/use-mouse-interaction';
import { useKeyboardInteraction } from '../hooks/use-keyboard-interaction';
import { useCanvasRendering } from '../hooks/use-canvas-rendering';
import { useColorMode } from '@/shared/ui/color-mode';
import { useThemeVariant } from '@/app/themes/use-theme-variant';
import type { DiagramType } from '@/shared/types/content-data';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

// ============================================================================
// MEMOIZED SELECTORS - Created once, stable across renders
// ============================================================================

/**
 * Select core canvas state (shapes, connectors, selection, editing)
 * This groups the most frequently accessed state values together
 */
const selectCanvasState = (state: ReturnType<CanvasStore['getState']>) => ({
  shapes: state.shapes,
  connectors: state.connectors,
  selectedEntityIds: state.selectedEntityIds,
  snapMode: state.snapMode,
  editingShapeId: state.editingShapeId,
});

/**
 * Select all entity manipulation actions
 * These are stable functions that don't change, but we group them
 * for better organization and to avoid individual subscriptions
 */
const selectEntityActions = (state: ReturnType<CanvasStore['getState']>) => ({
  addShape: state.addShape,
  addConnector: state.addConnector,
  deleteSelectedEntities: state.deleteSelectedEntities,
  findEntityAtPoint: state.findEntityAtPoint,
  isSelected: state.isSelected,
  getAllSelectedEntities: state.getAllSelectedEntities,
  setSelectedEntities: state.setSelectedEntities,
  addToSelection: state.addToSelection,
  toggleSelection: state.toggleSelection,
  clearSelection: state.clearSelection,
  selectEntitiesInBox: state.selectEntitiesInBox,
  setDraggingEntities: state.setDraggingEntities,
  clearDraggingEntities: state.clearDraggingEntities,
  updateShapePositionInternal: state.updateShapePositionInternal,
  finalizeShapeMove: state.finalizeShapeMove,
  setEditingShape: state.setEditingShape,
  updateShapeText: state.updateShapeText,
  setSnapMode: state.setSnapMode,
  importDiagram: state.importDiagram,
});

/**
 * Select undo/redo state and actions
 * Grouped separately as they're used by keyboard handlers
 */
const selectUndoRedoActions = (state: ReturnType<CanvasStore['getState']>) => ({
  undo: state.undo,
  redo: state.redo,
  canUndo: state.canUndo,
  canRedo: state.canRedo,
});

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<CanvasTransform>(CanvasTransform.identity());
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Get theme mode - component re-renders automatically on theme change
  const { colorMode } = useColorMode();
  const { variant } = useThemeVariant();


  // Use a ref to always have access to current transform without recreating handlers
  const transformRef = useRef(transform);
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Create internal store instance for this diagram (isolated per diagram ID)
  // Store is only recreated when the diagram ID changes (new diagram loaded)
  const store = useMemo(() => createCanvasStore(diagramId), [diagramId]);

  // Create isolated toolset popover store for this canvas instance
  // Note: We intentionally recreate on diagramId change to ensure complete isolation
  const popoverStore = useMemo(() => {
    return createToolsetPopoverStore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagramId]); // Recreate when diagram ID changes to ensure isolation

  // Track which diagram ID has been initialized to prevent re-initialization
  // This is critical to avoid circular updates: canvas changes -> parent saves ->
  // props update -> canvas would reinitialize with stale data
  const initializedDiagramIdRef = useRef<string | null>(null);

  // Initialize store with diagram data ONLY ONCE per diagram ID
  // After initialization, the canvas store becomes the single source of truth.
  // The parent component saves changes via onDiagramChange callback, but those
  // changes should NOT flow back down as props (that would create a feedback loop).
  useEffect(() => {
    // Only initialize if this is a new diagram (different ID than last initialized)
    if (initializedDiagramIdRef.current !== diagramId) {
      store.getState().initialize({
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
      initializedDiagramIdRef.current = diagramId;
    }
    // NOTE: We intentionally exclude initialShapes, initialConnectors, and diagramType
    // from dependencies to prevent re-initialization when parent state updates.
    // The canvas store is the source of truth after initial load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, diagramId]);

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

  // ============================================================================
  // OPTIMIZED STORE SUBSCRIPTIONS (3 grouped subscriptions instead of 27)
  // ============================================================================

  // Subscribe to core canvas state (shapes, connectors, selection, etc.)
  // Using useShallow to prevent re-renders when object reference changes
  // but contents are the same
  const { shapes, connectors, selectedEntityIds, snapMode, editingShapeId } = useStore(
    store,
    useShallow(selectCanvasState)
  );

  // Subscribe to entity manipulation actions (stable functions)
  // These rarely change, but we group them for organization
  const {
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
    setEditingShape,
    updateShapeText,
    setSnapMode,
    importDiagram,
  } = useStore(store, useShallow(selectEntityActions));

  // Subscribe to undo/redo actions (used by keyboard handlers)
  const { undo, redo, canUndo, canRedo } = useStore(store, useShallow(selectUndoRedoActions));

  // Use refs only for state values that need to be accessed in callbacks
  // without triggering effect re-runs (snapMode and shapes change frequently)
  const snapModeRef = useRef(snapMode);
  const shapesRef = useRef(shapes);

  // Update state refs after render
  useEffect(() => {
    snapModeRef.current = snapMode;
    shapesRef.current = shapes;
  }, [snapMode, shapes]);

  // Get toolset popover methods from the isolated store instance
  const { open: openToolsetPopover, isOpen: isPopoverOpen } = useStore(popoverStore);

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

  // Auto-focus wrapper on mount and when switching diagrams
  // This ensures keyboard shortcuts work immediately without requiring a manual click
  useEffect(() => {
    wrapperRef.current?.focus();
  }, [diagramId]);

  // Restore focus to wrapper after popover closes
  // This ensures keyboard shortcuts continue working after interactions with the popover
  useEffect(() => {
    if (!isPopoverOpen) {
      wrapperRef.current?.focus();
    }
  }, [isPopoverOpen]);

  // Setup mouse interaction callbacks
  // Memoize callbacks to avoid recreating them on every render
  const entityCallbacks: EntityInteractionCallbacks = useMemo(
    () => ({
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
      updateEntityPositionInternal: updateShapePositionInternal,
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
      openToolsetPopover,
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
      shouldSkipDefaultHandlers: () => isHandlingConnectionPoint.current.current,
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
      startEditingText: setEditingShape,
      getAllShapes: () => shapesRef.current,
    }),
    [
      connectionPointState.isDraggingConnector,
      isHandlingConnectionPoint,
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
      addShape,
      setEditingShape,
      openToolsetPopover,
    ]
  );

  // Use mouse interaction hook (replaces MouseInteractionManager)
  const mouseHandlers = useMouseInteraction({
    canvasRef,
    transform,
    setTransform,
    callbacks: entityCallbacks,
  });

  // Use keyboard interaction hook (replaces setupKeyboardInput)
  const keyboardHandlers = useKeyboardInteraction({
    callbacks: {
      getAllSelectedEntities,
      deleteSelectedEntities,
      undo,
      redo,
      canUndo,
      canRedo,
    },
  });

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
    colorMode: colorMode ?? 'light',
    variant: variant ?? 'standard',
  });

  // Handler to reset zoom to 100%
  const handleResetZoom = useCallback(() => {
    setTransform(CanvasTransform.identity());
  }, []);

  // Memoize the text edit commit handler
  const handleTextCommit = useCallback((entityId: string, text: string) => {
    updateShapeText(entityId, text);
    setEditingShape(null);
  }, [updateShapeText, setEditingShape]);

  // Memoize the text edit cancel handler
  const handleTextCancel = useCallback(() => {
    setEditingShape(null);
  }, [setEditingShape]);

  // Get the shape being edited (memoize to prevent unnecessary lookups)
  const editingShape = useMemo(
    () => (editingShapeId ? shapes.find((s) => s.id === editingShapeId) || null : null),
    [editingShapeId, shapes]
  );

  // Memoize the AI-generated Mermaid handler
  const handleMermaidGenerated = useCallback((mermaid: string) => {
    // Parse the Mermaid syntax using the importer
    const importerResult = getMermaidImporter(diagramType);
    if (!importerResult.ok) {
      console.error('Failed to get Mermaid importer:', importerResult.error);
      return;
    }

    const importer = importerResult.value;
    const importResult = importer.import(mermaid);

    if (!importResult.ok) {
      console.error('Failed to parse Mermaid syntax:', importResult.error);
      return;
    }

    // Import the parsed shapes and connectors
    importDiagram(importResult.value.shapes, importResult.value.connectors, 'replace');
  }, [importDiagram, diagramType]);

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      onKeyDown={keyboardHandlers.handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      style={{ position: 'relative', width: '100%', height: '100%', outline: 'none' }}
    >
      <canvas
        ref={canvasRef}
        onWheel={mouseHandlers.handleWheel}
        onMouseDown={(e) => {
          // Connection point handlers have priority
          connectionPointHandlers.handleMouseDown(e);
          // Mouse interaction handlers respect shouldSkipDefaultHandlers
          mouseHandlers.handleMouseDown(e);
        }}
        onMouseMove={(e) => {
          // Connection point handlers have priority
          connectionPointHandlers.handleMouseMove(e);
          // Mouse interaction handlers (will check internal state)
          mouseHandlers.handleMouseMove(e);
        }}
        onMouseUp={(e) => {
          // Connection point handlers have priority
          connectionPointHandlers.handleMouseUp(e);
          // Mouse interaction handlers
          mouseHandlers.handleMouseUp(e);
        }}
        onMouseLeave={mouseHandlers.handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: connectionPointHandlers.getCursorStyle() !== 'default'
            ? connectionPointHandlers.getCursorStyle()
            : mouseHandlers.getCursor(),
        }}
      />
      <CanvasControls snapMode={snapMode} setSnapMode={setSnapMode} />
      <ZoomControl zoom={transform.scale} onReset={handleResetZoom} />
      <ToolsetPopover diagramType={diagramType} addShape={addShape} addConnector={addConnector} popoverStore={popoverStore} />
      <TextEditOverlay
        entity={editingShape}
        transform={transform}
        onCommit={handleTextCommit}
        onCancel={handleTextCancel}
      />
      <CanvasTextControls
        shapes={shapes}
        connectors={connectors}
        diagramType={diagramType}
        onImport={importDiagram}
        onMermaidGenerated={handleMermaidGenerated}
      />
    </div>
  );
}
