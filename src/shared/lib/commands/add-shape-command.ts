/**
 * AddShapeCommand
 *
 * Command for adding a shape to the canvas.
 * Supports undo by removing the added shape.
 */

import type { Command } from '../command-system';
import type { Shape } from '@/entities/shape';

/**
 * Command to add a shape to the canvas.
 *
 * @example
 * ```typescript
 * const command = new AddShapeCommand(
 *   newShape,
 *   (shape) => canvasStore.addShape(shape),
 *   (id) => canvasStore.deleteShape(id)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class AddShapeCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new AddShapeCommand.
   *
   * @param shape - The shape to add
   * @param addShapeFn - Function to add the shape to the store
   * @param deleteShapeFn - Function to delete the shape (for undo)
   */
  constructor(
    private readonly shape: Shape,
    private readonly addShapeFn: (shape: Shape) => void,
    private readonly deleteShapeFn: (id: string) => void
  ) {
    this.description = `Add ${shape.shapeType}`;
  }

  execute(): void {
    this.addShapeFn(this.shape);
  }

  undo(): void {
    this.deleteShapeFn(this.shape.id);
  }
}
