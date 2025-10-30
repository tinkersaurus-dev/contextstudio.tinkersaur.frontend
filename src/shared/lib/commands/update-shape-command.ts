/**
 * UpdateShapeCommand
 *
 * Command for updating shape properties (including position, dimensions, styling).
 * Stores both before and after states to enable undo/redo.
 */

import type { Command } from './command-system';
import type { Shape } from '@/entities/shape';

/**
 * Command to update a shape's properties.
 *
 * This command stores the complete before/after state of the shape
 * to enable proper undo/redo. For position-only changes, consider
 * using MoveShapeCommand for better performance.
 *
 * @example
 * ```typescript
 * const command = new UpdateShapeCommand(
 *   'shape-123',
 *   originalShape,
 *   { fillColor: '#ff0000', strokeWidth: 3 },
 *   (id, updates) => canvasStore.updateShape(id, updates)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class UpdateShapeCommand implements Command {
  public readonly description: string;

  private readonly beforeState: Partial<Shape>;
  private readonly afterState: Partial<Shape>;

  /**
   * Creates a new UpdateShapeCommand.
   *
   * @param shapeId - ID of the shape to update
   * @param beforeShape - Complete shape state before the update
   * @param updates - Properties to update
   * @param updateShapeFn - Function to update the shape in the store
   */
  constructor(
    private readonly shapeId: string,
    beforeShape: Shape,
    updates: Partial<Shape>,
    private readonly updateShapeFn: (id: string, updates: Partial<Shape>) => void
  ) {
    // Store only the properties that are being changed
    this.beforeState = {};
    this.afterState = updates;

    // Extract before values for each updated property
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(beforeShape, key)) {
        const typedKey = key as keyof Shape;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.beforeState as Record<string, any>)[typedKey] = beforeShape[typedKey];
      }
    }

    this.description = `Update ${beforeShape.shapeType}`;
  }

  execute(): void {
    this.updateShapeFn(this.shapeId, this.afterState);
  }

  undo(): void {
    this.updateShapeFn(this.shapeId, this.beforeState);
  }
}
