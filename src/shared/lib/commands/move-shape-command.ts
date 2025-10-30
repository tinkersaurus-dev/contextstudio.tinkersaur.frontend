/**
 * MoveShapeCommand
 *
 * Optimized command for moving a shape (position-only changes).
 * More efficient than UpdateShapeCommand for drag operations.
 */

import type { Command } from './command-system';
import type { Point } from '../rendering';
import type { Shape } from '@/entities/shape';

/**
 * Command to move a shape to a new position.
 *
 * This is an optimized version of UpdateShapeCommand that only handles
 * position changes. It's more efficient for drag operations.
 *
 * @example
 * ```typescript
 * const command = new MoveShapeCommand(
 *   'shape-123',
 *   { x: 100, y: 100 },
 *   { x: 200, y: 150 },
 *   (id, updates) => canvasStore.updateShape(id, updates)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class MoveShapeCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new MoveShapeCommand.
   *
   * @param shapeId - ID of the shape to move
   * @param fromPosition - Original position
   * @param toPosition - New position
   * @param updateShapeFn - Function to update the shape in the store
   * @param shapeType - Optional shape type for better description
   */
  constructor(
    private readonly shapeId: string,
    private readonly fromPosition: Point,
    private readonly toPosition: Point,
    private readonly updateShapeFn: (id: string, updates: Partial<Shape>) => void,
    shapeType?: string
  ) {
    this.description = shapeType ? `Move ${shapeType}` : 'Move shape';
  }

  execute(): void {
    this.updateShapeFn(this.shapeId, { position: this.toPosition });
  }

  undo(): void {
    this.updateShapeFn(this.shapeId, { position: this.fromPosition });
  }
}
