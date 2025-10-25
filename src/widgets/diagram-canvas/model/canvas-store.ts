import { create } from 'zustand';
import { Shape } from '@/entities/shape';
import { Connector } from '@/entities/connector';
import { DiagramEntity } from '@/entities/diagram-entity';
import { updateConnectorForShapeMove } from '@/entities/connector';
import type { SnapMode } from '@/shared/lib/grid-system';
import { EntitySystem } from '@/shared/lib/entity-system';
import { createError, logError, ErrorSeverity } from '@/shared/lib/result';
import { createShapeMap } from '@/shared/lib/map-utils';

interface CanvasState {
  // Store all shapes and connectors (DiagramEntities)
  shapes: Shape[];
  connectors: Connector[];
  selectedEntityIds: Set<string>;
  draggingEntityIds: Set<string>;
  snapMode: SnapMode;

  // Connector creation mode
  isConnectorMode: boolean;
  connectorSourceShapeId: string | null;

  // Shape actions
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;

  // Connector actions
  addConnector: (connector: Connector) => void;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  deleteConnector: (id: string) => void;
  getAllConnectorsForShape: (shapeId: string) => Connector[];
  updateConnectorsForShapeMove: (shapeId: string) => void;

  // Selection actions
  setSelectedEntities: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  selectEntitiesInBox: (x1: number, y1: number, x2: number, y2: number) => void;
  getAllSelectedEntities: () => DiagramEntity[];
  isSelected: (id: string) => boolean;

  // Drag actions
  setDraggingEntities: (ids: string[]) => void;
  clearDraggingEntities: () => void;

  // Snap actions
  setSnapMode: (mode: SnapMode) => void;

  // Connector mode actions
  setConnectorMode: (enabled: boolean) => void;
  setConnectorSource: (shapeId: string | null) => void;
  resetConnectorCreation: () => void;

  // Hit detection
  findEntityAtPoint: (x: number, y: number) => DiagramEntity | null;
  getAllEntities: () => DiagramEntity[];
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  shapes: [],
  connectors: [],
  selectedEntityIds: new Set<string>(),
  draggingEntityIds: new Set<string>(),
  snapMode: 'none',
  isConnectorMode: false,
  connectorSourceShapeId: null,

  // Shape actions
  addShape: (shape) => {
    // Validate shape before adding using EntitySystem
    const validationResult = EntitySystem.validate(shape);
    if (!validationResult.valid) {
      const error = createError(
        `Cannot add invalid shape: ${validationResult.errors.join(', ')}`,
        ErrorSeverity.Error,
        {
          code: 'INVALID_SHAPE',
          context: { shapeId: shape.id, shapeType: shape.shapeType },
        }
      );
      logError(error);
      return; // Don't add invalid shape
    }

    set((state) => ({
      shapes: [...state.shapes, shape],
    }));
  },

  updateShape: (id, updates) => {
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    }));

    // If position changed, update connected connectors
    if (updates.position) {
      get().updateConnectorsForShapeMove(id);
    }
  },

  deleteShape: (id) => set((state) => {
    const newSelectedIds = new Set(state.selectedEntityIds);
    newSelectedIds.delete(id);
    const newDraggingIds = new Set(state.draggingEntityIds);
    newDraggingIds.delete(id);

    // Also delete any connectors attached to this shape
    const remainingConnectors = state.connectors.filter(
      (connector) =>
        connector.source.shapeId !== id && connector.target.shapeId !== id
    );

    // Remove deleted connectors from selection
    const deletedConnectorIds = state.connectors
      .filter(
        (connector) =>
          connector.source.shapeId === id || connector.target.shapeId === id
      )
      .map((c) => c.id);

    deletedConnectorIds.forEach((connectorId) => newSelectedIds.delete(connectorId));

    return {
      shapes: state.shapes.filter((shape) => shape.id !== id),
      connectors: remainingConnectors,
      selectedEntityIds: newSelectedIds,
      draggingEntityIds: newDraggingIds,
    };
  }),

  // Connector actions
  addConnector: (connector) => {
    // Validate connector before adding using EntitySystem
    const { shapes } = get();
    const shapesMap = createShapeMap(shapes);
    const validationResult = EntitySystem.validate(connector, { shapes: shapesMap });

    if (!validationResult.valid) {
      const error = createError(
        `Cannot add invalid connector: ${validationResult.errors.join(', ')}`,
        ErrorSeverity.Error,
        {
          code: 'INVALID_CONNECTOR',
          context: {
            connectorId: connector.id,
            connectorType: connector.connectorType,
            sourceShapeId: connector.source.shapeId,
            targetShapeId: connector.target.shapeId,
          },
        }
      );
      logError(error);
      return; // Don't add invalid connector
    }

    set((state) => ({
      connectors: [...state.connectors, connector],
    }));
  },

  updateConnector: (id, updates) => set((state) => ({
    connectors: state.connectors.map((connector) =>
      connector.id === id ? { ...connector, ...updates } : connector
    ),
  })),

  deleteConnector: (id) => set((state) => {
    const newSelectedIds = new Set(state.selectedEntityIds);
    newSelectedIds.delete(id);
    const newDraggingIds = new Set(state.draggingEntityIds);
    newDraggingIds.delete(id);

    return {
      connectors: state.connectors.filter((connector) => connector.id !== id),
      selectedEntityIds: newSelectedIds,
      draggingEntityIds: newDraggingIds,
    };
  }),

  getAllConnectorsForShape: (shapeId) => {
    const { connectors } = get();
    return connectors.filter(
      (connector) =>
        connector.source.shapeId === shapeId || connector.target.shapeId === shapeId
    );
  },

  updateConnectorsForShapeMove: (shapeId) => {
    const { connectors, shapes } = get();
    const shapesMap = createShapeMap(shapes);

    // Find all connectors attached to this shape
    const affectedConnectors = connectors.filter(
      (connector) =>
        connector.source.shapeId === shapeId || connector.target.shapeId === shapeId
    );

    // Update each affected connector's bounding box
    affectedConnectors.forEach((connector) => {
      const updates = updateConnectorForShapeMove(connector, shapesMap);
      if (updates) {
        get().updateConnector(connector.id, updates);
      }
    });
  },

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
    const { shapes } = get();
    const entities = get().getAllEntities();
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

  getAllSelectedEntities: () => {
    const { shapes, connectors, selectedEntityIds } = get();
    const allEntities = [...shapes, ...connectors];
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

  // Snap actions
  setSnapMode: (mode) => set({ snapMode: mode }),

  // Connector mode actions
  setConnectorMode: (enabled) => set({
    isConnectorMode: enabled,
    connectorSourceShapeId: enabled ? null : get().connectorSourceShapeId,
  }),

  setConnectorSource: (shapeId) => set({
    connectorSourceShapeId: shapeId,
  }),

  resetConnectorCreation: () => set({
    isConnectorMode: false,
    connectorSourceShapeId: null,
  }),

  // Hit detection
  findEntityAtPoint: (x, y) => {
    const { shapes } = get();
    const entities = get().getAllEntities();
    const shapesMap = createShapeMap(shapes);
    return EntitySystem.findEntityAtPoint(entities, x, y, { shapes: shapesMap });
  },

  getAllEntities: () => {
    const { shapes, connectors } = get();
    // Return all entities: shapes and connectors
    return [...shapes, ...connectors];
  },
}));
