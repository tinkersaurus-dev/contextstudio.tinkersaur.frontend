'use client';

/**
 * Canvas Rendering Hook
 *
 * Manages the canvas rendering effect that updates whenever relevant state changes.
 * Handles window resize events and ensures the canvas is redrawn appropriately.
 */

import { useEffect, useState } from 'react';
import { renderCanvas } from '../lib/canvas-renderer';
import { ensureFontsLoaded } from '@/shared/lib/rendering';
import type { CanvasTransform } from '@/shared/lib/rendering';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { SelectionBox } from '../lib/selection-box-renderer';
import type { AnchorPosition } from '@/entities/connector';

export interface UseCanvasRenderingOptions {
  /** Canvas element to render to */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Current canvas transform (pan/zoom) */
  transform: CanvasTransform;
  /** All shapes to render */
  shapes: Shape[];
  /** All connectors to render */
  connectors: Connector[];
  /** Set of currently selected entity IDs */
  selectedEntityIds: Set<string>;
  /** Selection box state (null if not selecting) */
  selectionBox: SelectionBox | null;
  /** IDs of shapes that should show connection points */
  hoveredShapeIds: string[];
  /** Specific connection point being hovered */
  hoveredConnectionPoint: {
    shapeId: string;
    anchor: AnchorPosition;
  } | null;
  /** Whether user is currently dragging a connector */
  isDraggingConnector: boolean;
  /** Whether the drag has moved enough to be considered a real drag */
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
  /** Current theme ID (for triggering re-render on theme change) */
  currentThemeId: string;
}

/**
 * Custom hook to manage canvas rendering
 *
 * Sets up an effect that:
 * - Ensures fonts are loaded before rendering
 * - Renders the canvas whenever relevant state changes
 * - Handles window resize events to trigger re-renders
 * - Cleans up resize listener on unmount
 *
 * @param options - Rendering configuration options
 */
export function useCanvasRendering(options: UseCanvasRenderingOptions): void {
  const {
    canvasRef,
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
    currentThemeId,
  } = options;

  const [fontsLoaded, setFontsLoaded] = useState(false);

  // Ensure fonts are loaded on mount
  useEffect(() => {
    ensureFontsLoaded().then(() => {
      setFontsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Don't render until fonts are loaded
    if (!fontsLoaded) {
      return;
    }

    const render = () => {
      try {
        // Show connection points for hovered shapes or when dragging
        const shapesToShowPoints = isDraggingConnector
          ? shapes
          : shapes.filter((s) => hoveredShapeIds.includes(s.id));

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
      } catch (error) {
        console.error('[useCanvasRendering] Render error:', error);
      }
    };

    // Initial render - use requestAnimationFrame to ensure layout is complete
    requestAnimationFrame(() => {
      render();
    });

    window.addEventListener('resize', render);

    return () => {
      window.removeEventListener('resize', render);
    };
  }, [
    canvasRef,
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
    fontsLoaded,
    currentThemeId,
  ]);
}
