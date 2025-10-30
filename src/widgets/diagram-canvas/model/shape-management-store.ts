/**
 * Shape Management Store
 *
 * Manages shape CRUD operations, validation, and text editing for the diagram canvas.
 * Handles both public (command-wrapped) and internal operations.
 *
 * This store is part of the canvas store composition pattern and focuses
 * solely on shape-related state and operations.
 */

import { Shape } from '@/entities/shape';
import { EntitySystem } from '@/shared/lib/entity-system';
import { createError, logError, ErrorSeverity } from '@/shared/lib/result';
import {
  AddShapeCommand,
  DeleteShapeCommand,
  UpdateShapeCommand,
  MoveEntitiesCommand,
  type ShapeMove,
} from '@/shared/lib/commands';
import type { Command } from '@/shared/lib/command-system';

/**
 * Shape management store state interface
 */
export interface ShapeManagementState {
  // Shape state
  shapes: Shape[];

  // Text editing state
  editingShapeId: string | null;

  // Public shape actions (wrapped with commands for undo/redo)
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;

  // Internal shape actions (called by commands, no command wrapping)
  _internalAddShape: (shape: Shape) => void;
  _internalUpdateShape: (id: string, updates: Partial<Shape>) => void;
  _internalDeleteShape: (id: string) => void;

  // Move operations (for drag-and-drop with single undo command)
  updateShapePositionInternal: (id: string, x: number, y: number) => void;
  finalizeShapeMove: (moves: Array<{
    shapeId: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  }>) => void;

  // Text editing actions
  setEditingShape: (shapeId: string | null) => void;
  updateShapeText: (shapeId: string, text: string) => void;
}

/**
 * Create shape management store slice
 *
 * This function creates the shape-related state and methods
 * that will be composed into the main canvas store.
 *
 * @param initialShapes - Initial shapes array
 * @param executeCommand - Function to execute a command (from command history)
 * @param getAllConnectorsForShape - Function to get all connectors for a shape
 * @param updateConnectorsForShapeMove - Function to update connectors when a shape moves
 */
export function createShapeManagementSlice(
  initialShapes: Shape[],
  executeCommand: (command: Command) => void,
  getAllConnectorsForShape: (shapeId: string) => any[],
  updateConnectorsForShapeMove: (shapeId: string) => void
) {
  return (set: any, get: any): ShapeManagementState => ({
    // Initial state
    shapes: [...initialShapes],
    editingShapeId: null,

    // Internal shape actions (called by commands, no command wrapping)
    _internalAddShape: (shape: Shape) => {
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

      set((state: ShapeManagementState) => ({
        shapes: [...state.shapes, shape],
      }));
    },

    _internalUpdateShape: (id: string, updates: Partial<Shape>) => {
      // Validate the updated shape before applying changes
      const currentShape = get().shapes.find((s: Shape) => s.id === id);
      if (!currentShape) {
        const error = createError(
          `Cannot update shape: shape with id ${id} not found`,
          ErrorSeverity.Error,
          { code: 'SHAPE_NOT_FOUND', context: { shapeId: id } }
        );
        logError(error);
        return;
      }

      const updatedShape = { ...currentShape, ...updates } as Shape;
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

      set((state: ShapeManagementState) => ({
        shapes: state.shapes.map((shape) =>
          shape.id === id ? updatedShape : shape
        ),
      }));

      // If position changed, update connected connectors
      if (updates.position) {
        updateConnectorsForShapeMove(id);
      }
    },

    _internalDeleteShape: (id: string) => {
      set((state: ShapeManagementState) => ({
        shapes: state.shapes.filter((shape) => shape.id !== id),
      }));
    },

    // Public shape actions (wrapped with commands for undo/redo)
    addShape: (shape: Shape) => {
      const command = new AddShapeCommand(
        shape,
        get()._internalAddShape,
        get()._internalDeleteShape
      );
      executeCommand(command);
    },

    updateShape: (id: string, updates: Partial<Shape>) => {
      const currentShape = get().shapes.find((s: Shape) => s.id === id);
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
      executeCommand(command);
    },

    deleteShape: (id: string) => {
      const shape = get().shapes.find((s: Shape) => s.id === id);
      if (!shape) {
        // If shape not found, just return (already deleted)
        return;
      }

      const connectors = getAllConnectorsForShape(id);
      const command = new DeleteShapeCommand(
        shape,
        connectors,
        get()._internalDeleteShape,
        get()._internalAddShape,
        (connector: any) => {
          // This will be provided by the connector store
          // For now, we'll handle this in the composition layer
        }
      );
      executeCommand(command);
    },

    // Move operations for drag-and-drop
    updateShapePositionInternal: (id: string, x: number, y: number) => {
      // Use internal update to avoid creating commands during drag
      // This is called many times per second during mouse drag
      get()._internalUpdateShape(id, { position: { x, y } });
    },

    finalizeShapeMove: (moves: Array<{
      shapeId: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
    }>) => {
      if (moves.length === 0) {
        return; // No moves to finalize
      }

      // Get shape information for each move
      const shapeMoves: ShapeMove[] = [];
      for (const move of moves) {
        const shape = get().shapes.find((s: Shape) => s.id === move.shapeId);
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
      executeCommand(command);
    },

    // Text editing actions
    setEditingShape: (shapeId: string | null) => set({
      editingShapeId: shapeId,
    }),

    updateShapeText: (shapeId: string, text: string) => {
      const currentShape = get().shapes.find((s: Shape) => s.id === shapeId);
      if (!currentShape) {
        return;
      }

      // Update shape text using the command system for undo/redo
      get().updateShape(shapeId, { text });
    },
  });
}
