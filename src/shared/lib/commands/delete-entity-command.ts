/**
 * DeleteEntityCommand
 *
 * Generic command for deleting a diagram entity from the canvas.
 * Supports undo by re-adding the deleted entity.
 */

import type { Command } from './command-system';
import type { DiagramEntity } from '@/entities/diagram-entity';
import { DiagramEntityType } from '@/entities/diagram-entity';
import type { Connector } from '@/entities/connector';

/**
 * Generic command to delete an entity from the canvas.
 * For shapes, also handles cascade deletion of attached connectors.
 *
 * @example
 * ```typescript
 * const command = new DeleteEntityCommand(
 *   entity,
 *   [],
 *   (id) => canvasStore.deleteEntity(id),
 *   (entity) => canvasStore.addEntity(entity)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class DeleteEntityCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new DeleteEntityCommand.
   *
   * @param entity - The entity to delete
   * @param attachedConnectors - Connectors attached to this entity (for shapes)
   * @param deleteEntityFn - Function to delete the entity from the store
   * @param addEntityFn - Function to add the entity back (for undo)
   */
  constructor(
    private readonly entity: DiagramEntity,
    private readonly attachedConnectors: Connector[],
    private readonly deleteEntityFn: (id: string) => void,
    private readonly addEntityFn: (entity: DiagramEntity) => void
  ) {
    this.description = `Delete ${entity.type}`;
  }

  execute(): void {
    this.deleteEntityFn(this.entity.id);
    // Note: Connector deletion is handled by the store's cascade logic
  }

  undo(): void {
    // Re-add the entity
    this.addEntityFn(this.entity);

    // If this was a shape, re-add attached connectors
    if (this.entity.type === DiagramEntityType.Shape) {
      this.attachedConnectors.forEach((connector) => {
        this.addEntityFn(connector);
      });
    }
  }
}
