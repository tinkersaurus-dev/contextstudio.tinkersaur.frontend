import { create } from 'zustand';
import { Shape } from '@/entities/shape';
import { DiagramEntity } from '@/entities/diagram-entity';

interface CanvasState {
  shapes: Shape[];
  selectedEntityIds: Set<string>;
  draggingEntityIds: Set<string>;

  // Shape actions
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;

  // Selection actions
  setSelectedEntities: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectEntitiesInBox: (x1: number, y1: number, x2: number, y2: number) => void;
  getSelectedEntities: () => DiagramEntity[];
  isSelected: (id: string) => boolean;

  // Drag actions
  setDraggingEntities: (ids: string[]) => void;
  clearDraggingEntities: () => void;

  // Hit detection
  getEntityAtPoint: (x: number, y: number) => DiagramEntity | null;
  getAllEntities: () => DiagramEntity[];
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  shapes: [],
  selectedEntityIds: new Set<string>(),
  draggingEntityIds: new Set<string>(),

  // Shape actions
  addShape: (shape) => set((state) => ({
    shapes: [...state.shapes, shape],
  })),

  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map((shape) =>
      shape.id === id ? { ...shape, ...updates } : shape
    ),
  })),

  deleteShape: (id) => set((state) => {
    const newSelectedIds = new Set(state.selectedEntityIds);
    newSelectedIds.delete(id);
    const newDraggingIds = new Set(state.draggingEntityIds);
    newDraggingIds.delete(id);

    return {
      shapes: state.shapes.filter((shape) => shape.id !== id),
      selectedEntityIds: newSelectedIds,
      draggingEntityIds: newDraggingIds,
    };
  }),

  // Selection actions
  setSelectedEntities: (ids) => set({
    selectedEntityIds: new Set(ids),
  }),

  addToSelection: (id) => set((state) => {
    const newSelectedIds = new Set(state.selectedEntityIds);
    newSelectedIds.add(id);
    return { selectedEntityIds: newSelectedIds };
  }),

  removeFromSelection: (id) => set((state) => {
    const newSelectedIds = new Set(state.selectedEntityIds);
    newSelectedIds.delete(id);
    return { selectedEntityIds: newSelectedIds };
  }),

  toggleSelection: (id) => set((state) => {
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

  selectEntitiesInBox: (x1, y1, x2, y2) => {
    const entities = get().getAllEntities();
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    const selectedIds = entities
      .filter((entity) => {
        const { position, dimensions } = entity;
        // Check if entity intersects with selection box
        return !(
          position.x + dimensions.width < minX ||
          position.x > maxX ||
          position.y + dimensions.height < minY ||
          position.y > maxY
        );
      })
      .map((entity) => entity.id);

    set({ selectedEntityIds: new Set(selectedIds) });
  },

  getSelectedEntities: () => {
    const { shapes, selectedEntityIds } = get();
    const allEntities = shapes as DiagramEntity[];
    return allEntities.filter((entity) => selectedEntityIds.has(entity.id));
  },

  isSelected: (id) => {
    return get().selectedEntityIds.has(id);
  },

  // Drag actions
  setDraggingEntities: (ids) => set({
    draggingEntityIds: new Set(ids),
  }),

  clearDraggingEntities: () => set({
    draggingEntityIds: new Set<string>(),
  }),

  // Hit detection
  getEntityAtPoint: (x, y) => {
    const entities = get().getAllEntities();
    // Iterate in reverse to check topmost entities first
    for (let i = entities.length - 1; i >= 0; i--) {
      const entity = entities[i];
      const { position, dimensions } = entity;

      if (
        x >= position.x &&
        x <= position.x + dimensions.width &&
        y >= position.y &&
        y <= position.y + dimensions.height
      ) {
        return entity;
      }
    }
    return null;
  },

  getAllEntities: () => {
    const { shapes } = get();
    // Currently only shapes, but will include other entity types in the future
    return shapes as DiagramEntity[];
  },
}));
