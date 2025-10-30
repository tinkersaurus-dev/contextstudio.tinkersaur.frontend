/**
 * MoveEntitiesCommand
 *
 * Command for moving multiple shapes together (e.g., dragging a selection).
 * This groups individual move commands into a single undo/redo operation.
 *
 * Note: Connectors are automatically updated when shapes move, so we only
 * need to track shape movements.
 */

import type { Command } from './command-system';
import { CompositeCommand } from './composite-command';
import { MoveShapeCommand } from './move-shape-command';
import type { Point } from '../rendering';
import type { Shape } from '@/entities/shape';

/**
 * Represents a shape move operation (before and after positions).
 */
export interface ShapeMove {
  /** The shape being moved */
  shape: Shape;
  /** Original position */
  fromPosition: Point;
  /** New position */
  toPosition: Point;
}

/**
 * Command to move multiple shapes together.
 *
 * This command is optimized for drag operations where multiple selected
 * shapes are moved as a group. All moves are executed/undone atomically.
 *
 * @example
 * ```typescript
 * const moves: ShapeMove[] = selectedShapes.map(shape => ({
 *   shape,
 *   fromPosition: shape.position,
 *   toPosition: { x: shape.position.x + deltaX, y: shape.position.y + deltaY }
 * }));
 *
 * const command = new MoveEntitiesCommand(
 *   moves,
 *   (id, updates) => canvasStore.updateShape(id, updates)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class MoveEntitiesCommand implements Command {
  private readonly compositeCommand: CompositeCommand;
  public readonly description: string;

  /**
   * Creates a new MoveEntitiesCommand.
   *
   * @param moves - Array of shape moves to perform
   * @param updateShapeFn - Function to update shape positions
   */
  constructor(
    moves: ShapeMove[],
    updateShapeFn: (id: string, updates: Partial<Shape>) => void
  ) {
    const commands: Command[] = moves.map(
      (move) =>
        new MoveShapeCommand(
          move.shape.id,
          move.fromPosition,
          move.toPosition,
          updateShapeFn,
          move.shape.shapeType
        )
    );

    this.description =
      moves.length === 1
        ? `Move ${moves[0].shape.shapeType}`
        : `Move ${moves.length} shapes`;

    this.compositeCommand = new CompositeCommand(commands, this.description);
  }

  execute(): void {
    this.compositeCommand.execute();
  }

  undo(): void {
    this.compositeCommand.undo();
  }

  /**
   * Get the number of shapes being moved.
   *
   * @returns Number of move commands
   */
  getShapeCount(): number {
    return this.compositeCommand.getCommandCount();
  }
}
