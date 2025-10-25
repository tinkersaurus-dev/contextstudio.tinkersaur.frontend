/**
 * DeleteShapeCommand
 *
 * Command for deleting a shape from the canvas.
 * Handles cascade deletion of attached connectors.
 * Supports undo by restoring the shape and all deleted connectors.
 */

import type { Command } from '../command-system';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

/**
 * Command to delete a shape and its attached connectors.
 *
 * This command captures the state of all affected entities before deletion
 * to enable perfect restoration on undo.
 *
 * @example
 * ```typescript
 * const command = new DeleteShapeCommand(
 *   shapeToDelete,
 *   attachedConnectors,
 *   (id) => canvasStore.deleteShape(id),
 *   (shape) => canvasStore.addShape(shape),
 *   (connector) => canvasStore.addConnector(connector)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class DeleteShapeCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new DeleteShapeCommand.
   *
   * @param shape - The shape to delete
   * @param connectors - Connectors that will be cascade-deleted (attached to this shape)
   * @param deleteShapeFn - Function to delete the shape from the store
   * @param addShapeFn - Function to add the shape back (for undo)
   * @param addConnectorFn - Function to add connectors back (for undo)
   */
  constructor(
    private readonly shape: Shape,
    private readonly connectors: Connector[],
    private readonly deleteShapeFn: (id: string) => void,
    private readonly addShapeFn: (shape: Shape) => void,
    private readonly addConnectorFn: (connector: Connector) => void
  ) {
    this.description = `Delete ${shape.shapeType}`;
  }

  execute(): void {
    // Delete the shape (this will cascade-delete connectors automatically)
    this.deleteShapeFn(this.shape.id);
  }

  undo(): void {
    // Restore the shape first
    this.addShapeFn(this.shape);

    // Then restore all cascade-deleted connectors
    this.connectors.forEach((connector) => {
      this.addConnectorFn(connector);
    });
  }
}
