'use client';

import { useEffect, useRef, useState } from 'react';
import { setupMouseInput, ZoomState, EntityInteractionCallbacks } from '../lib/mouse-input';
import { renderCanvas } from '../lib/canvas-renderer';
import { SelectionBox } from '../lib/selection-box-renderer';
import { useCanvasStore } from '../model/canvas-store';
import { createRectangleAtPoint } from '@/entities/shape/lib/shape-factory';
import { CanvasControls, ZoomControl } from '@/widgets/canvas-controls';

export function DiagramCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomState, setZoomState] = useState<ZoomState>({ scale: 1.0, panX: 0, panY: 0 });
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Use a ref to always have access to current zoom state without recreating handlers
  const zoomStateRef = useRef(zoomState);
  zoomStateRef.current = zoomState;

  // Get Zustand store
  const {
    shapes,
    selectedEntityIds,
    snapMode,
    addShape,
    updateShape,
    getEntityAtPoint,
    isSelected,
    getSelectedEntities,
    setSelectedEntities,
    addToSelection,
    toggleSelection,
    clearSelection,
    selectEntitiesInBox,
    setDraggingEntities,
    clearDraggingEntities,
  } = useCanvasStore();

  // Use a ref to always have access to current snap mode
  const snapModeRef = useRef(snapMode);
  snapModeRef.current = snapMode;

  // Setup mouse input handlers (only once)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Entity interaction callbacks
    const entityCallbacks: EntityInteractionCallbacks = {
      getEntityAtPoint,
      isSelected,
      getSelectedEntities,
      setSelectedEntities,
      addToSelection,
      toggleSelection,
      clearSelection,
      selectEntitiesInBox,
      setDraggingEntities,
      clearDraggingEntities,
      updateEntityPosition: (id, x, y) => {
        updateShape(id, { position: { x, y } });
      },
      createRectangleAtPoint: (x, y) => {
        const newShape = createRectangleAtPoint(x, y);
        addShape(newShape);
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
    };

    // Pass getter function that always returns current zoom state
    const cleanup = setupMouseInput(
      canvas,
      () => zoomStateRef.current,
      setZoomState,
      entityCallbacks
    );

    return cleanup;
  }, [
    addShape,
    updateShape,
    getEntityAtPoint,
    isSelected,
    getSelectedEntities,
    setSelectedEntities,
    addToSelection,
    toggleSelection,
    clearSelection,
    selectEntitiesInBox,
    setDraggingEntities,
    clearDraggingEntities,
  ]);

  // Render canvas when zoom, shapes, selection, or size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const render = () => {
      renderCanvas({
        canvas,
        scale: zoomState.scale,
        panX: zoomState.panX,
        panY: zoomState.panY,
        shapes,
        selectedEntityIds,
        selectionBox,
      });
    };

    render();
    window.addEventListener('resize', render);

    return () => {
      window.removeEventListener('resize', render);
    };
  }, [zoomState, shapes, selectedEntityIds, selectionBox]);

  // Handler to reset zoom to 100%
  const handleResetZoom = () => {
    setZoomState({ scale: 1.0, panX: 0, panY: 0 });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <CanvasControls />
      <ZoomControl zoom={zoomState.scale} onReset={handleResetZoom} />
    </div>
  );
}
