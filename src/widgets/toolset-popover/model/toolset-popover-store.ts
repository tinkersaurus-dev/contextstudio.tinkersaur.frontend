/**
 * Toolset Popover Store
 *
 * State management for the toolset popover widget.
 * Manages popover visibility and position.
 *
 * IMPORTANT: This store uses a factory pattern to create isolated instances
 * for each DiagramCanvas. This ensures that multiple canvases (e.g., in tabs)
 * don't share popover state and interfere with each other.
 */

import { create } from 'zustand';
import type { AnchorPosition } from '@/entities/connector/model/types';

interface ToolsetPopoverState {
  /** Whether the popover is open */
  isOpen: boolean;

  /** Screen coordinates for popover positioning */
  screenPosition: { x: number; y: number } | null;

  /** World coordinates for shape creation */
  worldPosition: { x: number; y: number } | null;

  /** Pending connector creation (when dragging from a connection point) */
  pendingConnector: {
    sourceShapeId: string;
    sourceAnchor: AnchorPosition;
  } | null;

  /** Open the popover at specific screen and world positions */
  open: (
    screenX: number,
    screenY: number,
    worldX: number,
    worldY: number,
    pendingConnector?: { sourceShapeId: string; sourceAnchor: AnchorPosition } | null
  ) => void;

  /** Close the popover */
  close: () => void;

  /** Toggle the popover at specific positions */
  toggle: (screenX: number, screenY: number, worldX: number, worldY: number) => void;
}

/**
 * Create a new toolset popover store instance.
 * This factory pattern ensures each DiagramCanvas has its own isolated popover state.
 *
 * @returns A new popover store instance
 */
export function createToolsetPopoverStore() {
  return create<ToolsetPopoverState>((set, get) => ({
    isOpen: false,
    screenPosition: null,
    worldPosition: null,
    pendingConnector: null,

    open: (
      screenX: number,
      screenY: number,
      worldX: number,
      worldY: number,
      pendingConnector: { sourceShapeId: string; sourceAnchor: AnchorPosition } | null = null
    ) => {
      set({
        isOpen: true,
        screenPosition: { x: screenX, y: screenY },
        worldPosition: { x: worldX, y: worldY },
        pendingConnector,
      });
    },

    close: () => {
      set({ isOpen: false, screenPosition: null, worldPosition: null, pendingConnector: null });
    },

    toggle: (screenX: number, screenY: number, worldX: number, worldY: number) => {
      const { isOpen } = get();
      if (isOpen) {
        set({ isOpen: false, screenPosition: null, worldPosition: null, pendingConnector: null });
      } else {
        set({
          isOpen: true,
          screenPosition: { x: screenX, y: screenY },
          worldPosition: { x: worldX, y: worldY },
          pendingConnector: null,
        });
      }
    },
  }));
}

/**
 * Type for the toolset popover store returned by createToolsetPopoverStore
 */
export type ToolsetPopoverStore = ReturnType<typeof createToolsetPopoverStore>;
