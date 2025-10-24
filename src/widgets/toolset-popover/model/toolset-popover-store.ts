/**
 * Toolset Popover Store
 *
 * State management for the toolset popover widget.
 * Manages popover visibility and position.
 */

import { create } from 'zustand';

interface ToolsetPopoverState {
  /** Whether the popover is open */
  isOpen: boolean;

  /** Screen coordinates for popover positioning */
  screenPosition: { x: number; y: number } | null;

  /** World coordinates for shape creation */
  worldPosition: { x: number; y: number } | null;

  /** Open the popover at specific screen and world positions */
  open: (screenX: number, screenY: number, worldX: number, worldY: number) => void;

  /** Close the popover */
  close: () => void;

  /** Toggle the popover at specific positions */
  toggle: (screenX: number, screenY: number, worldX: number, worldY: number) => void;
}

/**
 * Toolset popover store
 */
export const useToolsetPopoverStore = create<ToolsetPopoverState>((set, get) => ({
  isOpen: false,
  screenPosition: null,
  worldPosition: null,

  open: (screenX: number, screenY: number, worldX: number, worldY: number) => {
    set({
      isOpen: true,
      screenPosition: { x: screenX, y: screenY },
      worldPosition: { x: worldX, y: worldY },
    });
  },

  close: () => {
    set({ isOpen: false, screenPosition: null, worldPosition: null });
  },

  toggle: (screenX: number, screenY: number, worldX: number, worldY: number) => {
    const { isOpen } = get();
    if (isOpen) {
      set({ isOpen: false, screenPosition: null, worldPosition: null });
    } else {
      set({
        isOpen: true,
        screenPosition: { x: screenX, y: screenY },
        worldPosition: { x: worldX, y: worldY },
      });
    }
  },
}));
