'use client';

import { useEffect, useRef, useState } from 'react';
import { setupMouseInput, ZoomState, EntityInteractionCallbacks } from '../lib/mouse-input';
import { renderGrid, DEFAULT_GRID_CONFIG } from '../lib/grid-renderer';
import { renderShapes } from '../lib/shape-renderer';
import { SelectionBox } from '../lib/selection-box-renderer';
import { useCanvasStore } from '../model/canvas-store';
import { createRectangleAtPoint } from '@/entities/shape/lib/shape-factory';

export function DiagramCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoomState, setZoomState] = useState<ZoomState>({ scale: 1.0, panX: 0, panY: 0 });
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

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

  // Setup mouse input handlers
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

    const cleanup = setupMouseInput(canvas, setZoomState, entityCallbacks);
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
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          padding: '8px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'monospace',
          pointerEvents: 'none',
        }}
      >
        {Math.round(zoomState.scale * 100)}%
      </div>
    </div>
  );
}
