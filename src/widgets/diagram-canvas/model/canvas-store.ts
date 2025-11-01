/**
 * Canvas Store (Refactored)
 *
 * Main store for the diagram canvas that composes specialized stores:
 * - SelectionStore: Selection and drag state management
 * - ShapeManagementStore: Shape CRUD operations
 * - ConnectorManagementStore: Connector CRUD operations
 *
 * This store handles:
 * - Diagram identification and snapshot management
 * - Command history (undo/redo)
 * - Bulk operations across multiple entity types
 * - Import/export operations
 * - Entity queries and utilities
 */

import { create } from 'zustand';
import { Shape } from '@/entities/shape';
import { Connector } from '@/entities/connector';
import { DiagramEntity } from '@/entities/diagram-entity';
import type { SnapMode } from '@/shared/lib/rendering';
import { EntitySystem } from '@/shared/lib/entities';
import { createShapeMap } from '@/shared/lib/core/map-utils';
import { CommandHistory, type Command } from '@/shared/lib/commands';
import type { Diagram } from '@/shared/types/content-data';
import {
  DeleteEntitiesCommand,
  ImportDiagramCommand,
  type ImportMode,
} from '@/shared/lib/commands';

// Import store slices
import { createSelectionSlice, type SelectionState } from './selection-store';
import { createShapeManagementSlice, type ShapeManagementState } from './shape-management-store';
import { createConnectorManagementSlice, type ConnectorManagementState } from './connector-management-store';

/**
 * Core canvas state (combines all slices)
 */
interface CanvasState extends SelectionState, ShapeManagementState, ConnectorManagementState {
  // Diagram identification
  diagramId: string | null;

  // Snap mode
  snapMode: SnapMode;

  // Command history for undo/redo
  commandHistory: CommandHistory;

  // Diagram snapshot
  getDiagramSnapshot: () => { shapes: Shape[]; connectors: Connector[] };
  setDiagram: (shapes: Shape[], connectors: Connector[]) => void;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  executeCommand: (command: Command) => void;

  // Bulk operations
  deleteSelectedEntities: () => void;

  // Import/Export operations
  importDiagram: (shapes: Shape[], connectors: Connector[], mode?: 'replace' | 'append') => void;

  // Snap actions
  setSnapMode: (mode: SnapMode) => void;

  // Hit detection
  findEntityAtPoint: (x: number, y: number) => DiagramEntity | null;
  getAllEntities: () => DiagramEntity[];

  // Initialization
  initialize: (diagram: Diagram) => void;
}

/**
 * Create a new canvas store instance for a specific diagram.
 * This factory pattern ensures each diagram has isolated state.
 *
 * @param diagramId - The unique identifier for this diagram
 * @returns A Zustand store instance for canvas state management
 */
export function createCanvasStore(diagramId: string) {
  return create<CanvasState>((set, get) => {
    // Initialize command history
    const commandHistory = new CommandHistory({ maxHistorySize: 50 });

    // Helper functions for store composition
    const getShapes = () => get().shapes;
    const getConnectors = () => get().connectors;
    const executeCommand = (command: Command) => get().commandHistory.execute(command);
    const getAllConnectorsForShape = (shapeId: string) => get().getAllConnectorsForShape(shapeId);
    const updateConnectorsForShapeMove = (shapeId: string) => get().updateConnectorsForShapeMove(shapeId);

    // Create store slices with empty initial data
    const selectionSlice = createSelectionSlice(getShapes, getConnectors)(set, get);
    const shapeSlice = createShapeManagementSlice(
      [], // Empty shapes initially
      executeCommand,
      getAllConnectorsForShape,
      updateConnectorsForShapeMove
    )(set, get);
    const connectorSlice = createConnectorManagementSlice(
      [], // Empty connectors initially
      executeCommand,
      getShapes
    )(set, get);

    return {
      // Core state
      diagramId,
      commandHistory,
      snapMode: 'none' as SnapMode,

      // Compose all slices
      ...selectionSlice,
      ...shapeSlice,
      ...connectorSlice,

      // Override deleteShape to handle connector cleanup properly
      deleteShape: (id: string) => {
        const shape = get().shapes.find((s) => s.id === id);
        if (!shape) {
          // If shape not found, just return (already deleted)
          return;
        }

        const connectors = get().getAllConnectorsForShape(id);
        // Use dynamic import to avoid circular dependency
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { DeleteShapeCommand } = require('@/shared/lib/commands');
        const command = new DeleteShapeCommand(
          shape,
          connectors,
          get()._internalDeleteShape,
          get()._internalAddShape,
          get()._internalAddConnector
        );
        get().executeCommand(command);
      },

      // Override _internalDeleteShape to handle selection and connector cleanup
      _internalDeleteShape: (id: string) => {
        set((state) => {
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
        });
      },

      // Override _internalDeleteConnector to handle selection cleanup
      _internalDeleteConnector: (id: string) => {
        set((state) => {
          const newSelectedIds = new Set(state.selectedEntityIds);
          newSelectedIds.delete(id);
          const newDraggingIds = new Set(state.draggingEntityIds);
          newDraggingIds.delete(id);

          return {
            connectors: state.connectors.filter((connector) => connector.id !== id),
            selectedEntityIds: newSelectedIds,
            draggingEntityIds: newDraggingIds,
          };
        });
      },

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

      // Snap actions
      setSnapMode: (mode) => set({ snapMode: mode }),

      // Hit detection
      findEntityAtPoint: (x, y) => {
        const shapes = get().shapes;
        const entities = get().getAllEntities();
        const shapesMap = createShapeMap(shapes);
        return EntitySystem.findEntityAtPoint(entities, x, y, { shapes: shapesMap });
      },

      getAllEntities: () => {
        const shapes = get().shapes;
        const connectors = get().connectors;
        // Return all entities: shapes and connectors
        return [...shapes, ...connectors];
      },

      // ============================================================================
      // DIAGRAM SNAPSHOT
      // ============================================================================

      // Get current diagram state as a snapshot
      getDiagramSnapshot: () => {
        const shapes = get().shapes;
        const connectors = get().connectors;
        return {
          shapes: [...shapes],
          connectors: [...connectors],
        };
      },

      // Set diagram state (used for import and undo/redo)
      setDiagram: (shapes, connectors) => {
        set({ shapes: [...shapes], connectors: [...connectors] });
      },

      // Import diagram from Mermaid
      importDiagram: (shapes, connectors, mode = 'replace') => {
        const command = new ImportDiagramCommand(
          shapes,
          connectors,
          mode as ImportMode,
          get().getDiagramSnapshot,
          get().setDiagram,
          // For append mode, provide functions to add shapes and connectors
          (shapesToAdd) => {
            shapesToAdd.forEach(shape => get()._internalAddShape(shape));
          },
          (connectorsToAdd) => {
            connectorsToAdd.forEach(connector => get()._internalAddConnector(connector));
          }
        );
        get().executeCommand(command);
      },

      // Initialize store with diagram data
      // This is separate from creation to allow proper React dependency management
      initialize: (diagram: Diagram) => {
        set({
          shapes: [...diagram.shapes],
          connectors: [...diagram.connectors],
        });
      },
    };
  });
}

/**
 * Type for the canvas store returned by createCanvasStore
 */
export type CanvasStore = ReturnType<typeof createCanvasStore>;
