import { create } from 'zustand';
import { Shape } from '@/entities/shape';
import { Connector } from '@/entities/connector';
import { DiagramEntity } from '@/entities/diagram-entity';
import { updateConnectorForShapeMove } from '@/entities/connector';
import type { SnapMode } from '@/shared/lib/grid-system';
import { EntitySystem } from '@/shared/lib/entity-system';
import { createError, logError, ErrorSeverity } from '@/shared/lib/result';
import { createShapeMap } from '@/shared/lib/map-utils';
import { CommandHistory, type Command } from '@/shared/lib/command-system';
import {
  AddShapeCommand,
  DeleteShapeCommand,
  UpdateShapeCommand,
  AddConnectorCommand,
  DeleteConnectorCommand,
  UpdateConnectorCommand,
  DeleteEntitiesCommand,
  MoveEntitiesCommand,
  type ShapeMove,
} from '@/shared/lib/commands';

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

  // Command history for undo/redo
  commandHistory: CommandHistory;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  executeCommand: (command: Command) => void;

  // Shape actions (now use commands internally)
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;

  // Connector actions (now use commands internally)
  addConnector: (connector: Connector) => void;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  deleteConnector: (id: string) => void;
  getAllConnectorsForShape: (shapeId: string) => Connector[];
  updateConnectorsForShapeMove: (shapeId: string) => void;

  // Bulk operations
  deleteSelectedEntities: () => void;

  // Move operations (for drag-and-drop with single undo command)
  updateShapePositionInternal: (id: string, x: number, y: number) => void;
  finalizeShapeMove: (moves: Array<{
    shapeId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>) => void;

  // Internal methods (called by commands, not wrapped with command execution)
  _internalAddShape: (shape: Shape) => void;
  _internalUpdateShape: (id: string, updates: Partial<Shape>) => void;
  _internalDeleteShape: (id: string) => void;
  _internalAddConnector: (connector: Connector) => void;
  _internalUpdateConnector: (id: string, updates: Partial<Connector>) => void;
  _internalDeleteConnector: (id: string) => void;

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
  commandHistory: new CommandHistory({ maxHistorySize: 50 }),

  // Undo/Redo actions
  undo: () => {
    get().commandHistory.undo();
  },

  redo: () => {
    get().commandHistory.redo();
  },

  canUndo: () => {
    return get().commandHistory.canUndo();
  },

  canRedo: () => {
    return get().commandHistory.canRedo();
  },

  executeCommand: (command) => {
    get().commandHistory.execute(command);
  },

  // Internal shape actions (called by commands, no command wrapping)
  _internalAddShape: (shape) => {
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

  _internalUpdateShape: (id, updates) => {
    // Validate the updated shape before applying changes
    const currentShape = get().shapes.find((s) => s.id === id);
    if (!currentShape) {
      const error = createError(
        `Cannot update shape: shape with id ${id} not found`,
        ErrorSeverity.Error,
        { code: 'SHAPE_NOT_FOUND', context: { shapeId: id } }
      );
      logError(error);
      return;
    }

    const updatedShape = { ...currentShape, ...updates };
    const validationResult = EntitySystem.validate(updatedShape);

    if (!validationResult.valid) {
      const error = createError(
        `Cannot update shape: validation failed - ${validationResult.errors.join(', ')}`,
        ErrorSeverity.Error,
        {
          code: 'INVALID_SHAPE_UPDATE',
          context: {
            shapeId: id,
            updates,
          },
        }
      );
      logError(error);
      return; // Don't apply invalid update
    }

    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? updatedShape : shape
      ),
    }));

    // If position changed, update connected connectors
    if (updates.position) {
      get().updateConnectorsForShapeMove(id);
    }
  },

  _internalDeleteShape: (id) => set((state) => {
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

  // Internal connector actions (called by commands, no command wrapping)
  _internalAddConnector: (connector) => {
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

  _internalUpdateConnector: (id, updates) => {
    // Validate the updated connector before applying changes
    const currentConnector = get().connectors.find((c) => c.id === id);
    if (!currentConnector) {
      const error = createError(
        `Cannot update connector: connector with id ${id} not found`,
        ErrorSeverity.Error,
        { code: 'CONNECTOR_NOT_FOUND', context: { connectorId: id } }
      );
      logError(error);
      return;
    }

    const updatedConnector = { ...currentConnector, ...updates };
    const { shapes } = get();
    const shapesMap = createShapeMap(shapes);
    const validationResult = EntitySystem.validate(updatedConnector, { shapes: shapesMap });

    if (!validationResult.valid) {
      const error = createError(
        `Cannot update connector: validation failed - ${validationResult.errors.join(', ')}`,
        ErrorSeverity.Error,
        {
          code: 'INVALID_CONNECTOR_UPDATE',
          context: {
            connectorId: id,
            updates,
          },
        }
      );
      logError(error);
      return; // Don't apply invalid update
    }

    set((state) => ({
      connectors: state.connectors.map((connector) =>
        connector.id === id ? updatedConnector : connector
      ),
    }));
  },

  _internalDeleteConnector: (id) => set((state) => {
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

  // Public shape actions (wrapped with commands for undo/redo)
  addShape: (shape) => {
    const command = new AddShapeCommand(
      shape,
      get()._internalAddShape,
      get()._internalDeleteShape
    );
    get().executeCommand(command);
  },

  updateShape: (id, updates) => {
    const currentShape = get().shapes.find((s) => s.id === id);
    if (!currentShape) {
      // If shape not found, log error and don't create command
      const error = createError(
        `Cannot update shape: shape with id ${id} not found`,
        ErrorSeverity.Error,
        { code: 'SHAPE_NOT_FOUND', context: { shapeId: id } }
      );
      logError(error);
      return;
    }

    const command = new UpdateShapeCommand(
      id,
      currentShape,
      updates,
      get()._internalUpdateShape
    );
    get().executeCommand(command);
  },

  deleteShape: (id) => {
    const shape = get().shapes.find((s) => s.id === id);
    if (!shape) {
      // If shape not found, just return (already deleted)
      return;
    }

    const connectors = get().getAllConnectorsForShape(id);
    const command = new DeleteShapeCommand(
      shape,
      connectors,
      get()._internalDeleteShape,
      get()._internalAddShape,
      get()._internalAddConnector
    );
    get().executeCommand(command);
  },

  // Public connector actions (wrapped with commands for undo/redo)
  addConnector: (connector) => {
    const command = new AddConnectorCommand(
      connector,
      get()._internalAddConnector,
      get()._internalDeleteConnector
    );
    get().executeCommand(command);
  },

  updateConnector: (id, updates) => {
    const currentConnector = get().connectors.find((c) => c.id === id);
    if (!currentConnector) {
      // If connector not found, log error and don't create command
      const error = createError(
        `Cannot update connector: connector with id ${id} not found`,
        ErrorSeverity.Error,
        { code: 'CONNECTOR_NOT_FOUND', context: { connectorId: id } }
      );
      logError(error);
      return;
    }

    const command = new UpdateConnectorCommand(
      id,
      currentConnector,
      updates,
      get()._internalUpdateConnector
    );
    get().executeCommand(command);
  },

  deleteConnector: (id) => {
    const connector = get().connectors.find((c) => c.id === id);
    if (!connector) {
      // If connector not found, just return (already deleted)
      return;
    }

    const command = new DeleteConnectorCommand(
      connector,
      get()._internalDeleteConnector,
      get()._internalAddConnector
    );
    get().executeCommand(command);
  },

  // Bulk delete operation (e.g., from Delete key)
  deleteSelectedEntities: () => {
    const selectedEntities = get().getAllSelectedEntities();
    if (selectedEntities.length === 0) {
      return; // Nothing to delete
    }

    // Separate shapes and connectors
    const shapes = selectedEntities.filter((e) => e.type === 'shape') as Shape[];
    const connectors = selectedEntities.filter((e) => e.type === 'connector') as Connector[];

    const command = new DeleteEntitiesCommand(
      shapes,
      connectors,
      get().getAllConnectorsForShape,
      get()._internalDeleteShape,
      get()._internalAddShape,
      get()._internalDeleteConnector,
      get()._internalAddConnector
    );
    get().executeCommand(command);
  },

  // Move operations for drag-and-drop
  updateShapePositionInternal: (id, x, y) => {
    // Use internal update to avoid creating commands during drag
    // This is called many times per second during mouse drag
    get()._internalUpdateShape(id, { position: { x, y } });
  },

  finalizeShapeMove: (moves) => {
    if (moves.length === 0) {
      return; // No moves to finalize
    }

    // Get shape information for each move
    const shapeMoves: ShapeMove[] = [];
    for (const move of moves) {
      const shape = get().shapes.find((s) => s.id === move.shapeId);
      if (!shape) {
        continue; // Shape not found, skip
      }

      shapeMoves.push({
        shape,
        fromPosition: { x: move.fromX, y: move.fromY },
        toPosition: { x: move.toX, y: move.toY },
      });
    }

    if (shapeMoves.length === 0) {
      return; // No valid moves
    }

    // Create a single composite move command for all moved shapes
    const command = new MoveEntitiesCommand(
      shapeMoves,
      get()._internalUpdateShape
    );
    get().executeCommand(command);
  },

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
    // Use internal method to avoid creating separate undo commands
    // (connector updates are part of the shape move command)
    affectedConnectors.forEach((connector) => {
      const updates = updateConnectorForShapeMove(connector, shapesMap);
      if (updates) {
        get()._internalUpdateConnector(connector.id, updates);
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
