/**
 * Selection Store
 *
 * Manages entity selection and drag state for the diagram canvas.
 * Handles selection operations, box selection, and drag state tracking.
 *
 * This store is part of the canvas store composition pattern and focuses
 * solely on selection-related state and operations.
 */

import { DiagramEntity } from '@/entities/diagram-entity';
import { EntitySystem } from '@/shared/lib/entities';
import { createShapeMap } from '@/shared/lib/core/map-utils';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

/**
 * Selection store state interface
 */
export interface SelectionState {
  // Selection state
  selectedEntityIds: Set<string>;
  draggingEntityIds: Set<string>;

  // Selection actions
  setSelectedEntities: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectEntitiesInBox: (x1: number, y1: number, x2: number, y2: number) => void;

  // Selection queries
  isSelected: (id: string) => boolean;
  getAllSelectedEntities: () => DiagramEntity[];

  // Drag state actions
  setDraggingEntities: (ids: string[]) => void;
  clearDraggingEntities: () => void;
}

/**
 * Create selection store slice
 *
 * This function creates the selection-related state and methods
 * that will be composed into the main canvas store.
 *
 * @param getShapes - Function to get current shapes array
 * @param getConnectors - Function to get current connectors array
 */
export function createSelectionSlice(
  getShapes: () => Shape[],
  getConnectors: () => Connector[]
) {
  return (set: (fn: Partial<SelectionState> | ((state: SelectionState) => Partial<SelectionState>)) => void, get: () => SelectionState): SelectionState => ({
    // Initial state
    selectedEntityIds: new Set<string>(),
    draggingEntityIds: new Set<string>(),

    // Selection actions
    setSelectedEntities: (ids: string[]) => set({
      selectedEntityIds: new Set(ids),
    }),

    addToSelection: (id: string) => set((state: SelectionState) => {
      const newSelectedIds = new Set(state.selectedEntityIds);
      newSelectedIds.add(id);
      return { selectedEntityIds: newSelectedIds };
    }),

    removeFromSelection: (id: string) => set((state: SelectionState) => {
      const newSelectedIds = new Set(state.selectedEntityIds);
      newSelectedIds.delete(id);
      return { selectedEntityIds: newSelectedIds };
    }),

    toggleSelection: (id: string) => set((state: SelectionState) => {
      const newSelectedIds = new Set(state.selectedEntityIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return { selectedEntityIds: newSelectedIds };
    }),

    clearSelection: () => set({
      selectedEntityIds: new Set<string>(),
    }),

    selectEntitiesInBox: (x1: number, y1: number, x2: number, y2: number) => {
      const shapes = getShapes();
      const connectors = getConnectors();
      const entities: DiagramEntity[] = [...shapes, ...connectors];
      const shapesMap = createShapeMap(shapes);

      // Calculate selection box bounds
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      const boxBounds = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      };

      // Use EntitySystem to find entities in box
      const selectedEntities = EntitySystem.findEntitiesInBox(
        entities,
        boxBounds,
        { shapes: shapesMap }
      );

      set({ selectedEntityIds: new Set(selectedEntities.map(e => e.id)) });
    },

    // Selection queries
    isSelected: (id: string) => {
      return get().selectedEntityIds.has(id);
    },

    getAllSelectedEntities: () => {
      const shapes = getShapes();
      const connectors = getConnectors();
      const selectedEntityIds = get().selectedEntityIds;
      const allEntities: DiagramEntity[] = [...shapes, ...connectors];
      return allEntities.filter((entity) => selectedEntityIds.has(entity.id));
    },

    // Drag state actions
    setDraggingEntities: (ids: string[]) => set({
      draggingEntityIds: new Set(ids),
    }),

    clearDraggingEntities: () => set({
      draggingEntityIds: new Set<string>(),
    }),
  });
}
