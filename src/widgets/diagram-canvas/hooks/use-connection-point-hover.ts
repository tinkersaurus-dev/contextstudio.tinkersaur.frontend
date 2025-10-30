'use client';

/**
 * Connection Point Hover Hook
 *
 * Manages hover detection for connection points.
 * Detects when the mouse is near shapes or hovering over specific connection points.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AnchorPosition } from '@/entities/connector';
import type { Shape } from '@/entities/shape';
import { CanvasTransform } from '@/shared/lib/canvas-transform';
import { ConnectionPointEngine } from '@/shared/lib/connection-point-engine';
import { SHAPE_PROXIMITY_CONFIG } from '@/shared/config/canvas-config';

/**
 * Hover state for connection points
 */
export interface ConnectionPointHoverState {
  /** IDs of shapes that should show connection points (nearby shapes) */
  hoveredShapeIds: string[];
  /** Specific connection point being hovered */
  hoveredConnectionPoint: {
    shapeId: string;
    anchor: AnchorPosition;
  } | null;
}

/**
 * Options for the connection point hover hook
 */
export interface UseConnectionPointHoverOptions {
  /** Canvas ref to get bounding rect */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Current canvas transform */
  transform: CanvasTransform;
  /** All shapes on the canvas */
  shapes: Shape[];
  /** Proximity distance for showing connection points */
  proximityDistance?: number;
}

/**
 * Hook to manage connection point hover detection
 *
 * Handles mouse movement to:
 * - Detect when mouse is near shapes (to show connection points)
 * - Detect when mouse is over a specific connection point (to highlight it)
 *
 * @param options - Configuration options
 * @returns Hover state and mouse move handler
 *
 * @example
 * const { hoverState, handleMouseMove } = useConnectionPointHover({
 *   canvasRef,
 *   transform,
 *   shapes
 * });
 */
export function useConnectionPointHover(
  options: UseConnectionPointHoverOptions
): {
  hoverState: ConnectionPointHoverState;
  handleMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  setHoveredConnectionPoint: (point: { shapeId: string; anchor: AnchorPosition } | null) => void;
  setHoveredShapeIds: (ids: string[]) => void;
} {
  const { canvasRef, transform, shapes, proximityDistance = SHAPE_PROXIMITY_CONFIG.defaultDistance } = options;

  // Hover state
  const [hoveredShapeIds, setHoveredShapeIds] = useState<string[]>([]);
  const [hoveredConnectionPoint, setHoveredConnectionPoint] = useState<{
    shapeId: string;
    anchor: AnchorPosition;
  } | null>(null);

  // Use refs to always have access to current values without recreating handlers
  const transformRef = useRef(transform);
  const engineRef = useRef(new ConnectionPointEngine(shapes, { proximityDistance }));

  // Update refs after render
  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  // Update engine when shapes change
  useEffect(() => {
    engineRef.current.updateShapes(shapes);
  }, [shapes]);

  // Update engine config when proximityDistance changes
  useEffect(() => {
    engineRef.current.updateConfig({ proximityDistance });
  }, [proximityDistance]);

  /**
   * Handle mouse move for connection point hover detection
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;

      const worldPos = transformRef.current.screenToWorld(screenX, screenY);

      // Check if hovering near any shapes
      const nearbyShapes = engineRef.current.getNearbyShapes(worldPos.x, worldPos.y);

      if (nearbyShapes.length > 0) {
        setHoveredShapeIds(nearbyShapes.map((s) => s.id));

        // Check if hovering over a specific connection point
        const connectionPoint = engineRef.current.findConnectionPoint(
          worldPos.x,
          worldPos.y,
          transformRef.current.scale
        );

        setHoveredConnectionPoint(
          connectionPoint
            ? {
                shapeId: connectionPoint.shapeId,
                anchor: connectionPoint.anchor,
              }
            : null
        );
      } else {
        setHoveredShapeIds([]);
        setHoveredConnectionPoint(null);
      }
    },
    [canvasRef]
  );

  const hoverState: ConnectionPointHoverState = {
    hoveredShapeIds,
    hoveredConnectionPoint,
  };

  return {
    hoverState,
    handleMouseMove,
    setHoveredConnectionPoint,
    setHoveredShapeIds,
  };
}
