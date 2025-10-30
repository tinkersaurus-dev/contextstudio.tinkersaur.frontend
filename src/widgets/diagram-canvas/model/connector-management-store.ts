/**
 * Connector Management Store
 *
 * Manages connector CRUD operations, validation, and connector creation workflow.
 * Handles both public (command-wrapped) and internal operations, plus auto-update
 * of connector anchors when shapes move.
 *
 * This store is part of the canvas store composition pattern and focuses
 * solely on connector-related state and operations.
 */

import { Connector } from '@/entities/connector';
import { updateConnectorForShapeMove } from '@/entities/connector';
import { updateConnectorAnchors } from '@/entities/connector/lib/connector-auto-update';
import { EntitySystem } from '@/shared/lib/entity-system';
import { createShapeMap } from '@/shared/lib/map-utils';
import { createError, logError, ErrorSeverity } from '@/shared/lib/result';
import {
  AddConnectorCommand,
  DeleteConnectorCommand,
  UpdateConnectorCommand,
} from '@/shared/lib/commands';
import type { Command } from '@/shared/lib/command-system';
import type { Shape } from '@/entities/shape';

/**
 * Connector management store state interface
 */
export interface ConnectorManagementState {
  // Connector state
  connectors: Connector[];

  // Connector creation mode
  isConnectorMode: boolean;
  connectorSourceShapeId: string | null;

  // Public connector actions (wrapped with commands for undo/redo)
  addConnector: (connector: Connector) => void;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  deleteConnector: (id: string) => void;

  // Internal connector actions (called by commands, no command wrapping)
  _internalAddConnector: (connector: Connector) => void;
  _internalUpdateConnector: (id: string, updates: Partial<Connector>) => void;
  _internalDeleteConnector: (id: string) => void;

  // Connector queries and auto-update
  getAllConnectorsForShape: (shapeId: string) => Connector[];
  updateConnectorsForShapeMove: (shapeId: string) => void;

  // Connector mode actions
  setConnectorMode: (enabled: boolean) => void;
  setConnectorSource: (shapeId: string | null) => void;
  resetConnectorCreation: () => void;
}

/**
 * Create connector management store slice
 *
 * This function creates the connector-related state and methods
 * that will be composed into the main canvas store.
 *
 * @param initialConnectors - Initial connectors array
 * @param executeCommand - Function to execute a command (from command history)
 * @param getShapes - Function to get current shapes array
 */
export function createConnectorManagementSlice(
  initialConnectors: Connector[],
  executeCommand: (command: Command) => void,
  getShapes: () => Shape[]
) {
  return (set: any, get: any): ConnectorManagementState => ({
    // Initial state
    connectors: [...initialConnectors],
    isConnectorMode: false,
    connectorSourceShapeId: null,

    // Internal connector actions (called by commands, no command wrapping)
    _internalAddConnector: (connector: Connector) => {
      // Validate connector before adding using EntitySystem
      const shapes = getShapes();
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

      set((state: ConnectorManagementState) => ({
        connectors: [...state.connectors, connector],
      }));
    },

    _internalUpdateConnector: (id: string, updates: Partial<Connector>) => {
      // Validate the updated connector before applying changes
      const currentConnector = get().connectors.find((c: Connector) => c.id === id);
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
      const shapes = getShapes();
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

      set((state: ConnectorManagementState) => ({
        connectors: state.connectors.map((connector) =>
          connector.id === id ? updatedConnector : connector
        ),
      }));
    },

    _internalDeleteConnector: (id: string) => {
      set((state: ConnectorManagementState) => ({
        connectors: state.connectors.filter((connector) => connector.id !== id),
      }));
    },

    // Public connector actions (wrapped with commands for undo/redo)
    addConnector: (connector: Connector) => {
      const command = new AddConnectorCommand(
        connector,
        get()._internalAddConnector,
        get()._internalDeleteConnector
      );
      executeCommand(command);
    },

    updateConnector: (id: string, updates: Partial<Connector>) => {
      const currentConnector = get().connectors.find((c: Connector) => c.id === id);
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
      executeCommand(command);
    },

    deleteConnector: (id: string) => {
      const connector = get().connectors.find((c: Connector) => c.id === id);
      if (!connector) {
        // If connector not found, just return (already deleted)
        return;
      }

      const command = new DeleteConnectorCommand(
        connector,
        get()._internalDeleteConnector,
        get()._internalAddConnector
      );
      executeCommand(command);
    },

    // Connector queries and auto-update
    getAllConnectorsForShape: (shapeId: string) => {
      const connectors = get().connectors;
      return connectors.filter(
        (connector: Connector) =>
          connector.source.shapeId === shapeId || connector.target.shapeId === shapeId
      );
    },

    updateConnectorsForShapeMove: (shapeId: string) => {
      const connectors = get().connectors;
      const shapes = getShapes();
      const shapesMap = createShapeMap(shapes);

      // Find all connectors attached to this shape
      const affectedConnectors = connectors.filter(
        (connector: Connector) =>
          connector.source.shapeId === shapeId || connector.target.shapeId === shapeId
      );

      // Update each affected connector's bounding box and anchors (if auto-update enabled)
      // Use internal method to avoid creating separate undo commands
      // (connector updates are part of the shape move command)
      affectedConnectors.forEach((connector: Connector) => {
        let updates = updateConnectorForShapeMove(connector, shapesMap);

        // If auto-update is enabled, recalculate optimal connection points
        if (connector.autoUpdate !== false && updates) {
          const updatedAnchors = updateConnectorAnchors(connector, shapesMap);
          if (updatedAnchors) {
            updates = {
              ...updates,
              source: updatedAnchors.source,
              target: updatedAnchors.target,
            };
          }
        }

        if (updates) {
          get()._internalUpdateConnector(connector.id, updates);
        }
      });
    },

    // Connector mode actions
    setConnectorMode: (enabled: boolean) => set((state: ConnectorManagementState) => ({
      isConnectorMode: enabled,
      connectorSourceShapeId: enabled ? null : state.connectorSourceShapeId,
    })),

    setConnectorSource: (shapeId: string | null) => set({
      connectorSourceShapeId: shapeId,
    }),

    resetConnectorCreation: () => set({
      isConnectorMode: false,
      connectorSourceShapeId: null,
    }),
  });
}
