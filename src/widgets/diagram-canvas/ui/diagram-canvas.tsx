'use client';

import { useEffect, useRef, useState } from 'react';
import { setupMouseInput, ZoomState, EntityInteractionCallbacks } from '../lib/mouse-input';
import { renderGrid, DEFAULT_GRID_CONFIG } from '../lib/grid-renderer';
import { renderShapes } from '../lib/shape-renderer';
import { SelectionBox } from '../lib/selection-box-renderer';
import { useCanvasStore } from '../model/canvas-store';
import { createRectangleAtPoint } from '@/entities/shape/lib/shape-factory';
import { CanvasBadgeMenu } from '@/shared/ui';

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
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill canvas with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply pan and zoom transform - IMPORTANT: scale first, then translate!
      ctx.save();
      ctx.scale(zoomState.scale, zoomState.scale);
      ctx.translate(zoomState.panX / zoomState.scale, zoomState.panY / zoomState.scale);

      // Render grid
      renderGrid(ctx, canvas.width, canvas.height, zoomState.scale, zoomState.panX, zoomState.panY, DEFAULT_GRID_CONFIG);

      // Render all shapes with selection and selection box
      renderShapes(ctx, shapes, selectedEntityIds, zoomState.scale, selectionBox);

      ctx.restore();
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
      <CanvasBadgeMenu
        badgeContent={`${Math.round(zoomState.scale * 100)}%`}
        menuItems={[
          {
            id: 'reset-zoom',
            label: 'Reset',
            onSelect: handleResetZoom,
          },
        ]}
        colorPalette="gray"
        variant="solid"
        size="md"
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
        }}
      />
    </div>
  );
}
