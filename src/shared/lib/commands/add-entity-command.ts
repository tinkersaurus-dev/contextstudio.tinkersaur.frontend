/**
 * AddEntityCommand
 *
 * Generic command for adding any diagram entity to the canvas.
 * Supports undo by removing the added entity.
 */

import type { Command } from '../command-system';
import type { DiagramEntity } from '@/entities/diagram-entity';

/**
 * Generic command to add an entity to the canvas.
 *
 * @example
 * ```typescript
 * const command = new AddEntityCommand(
 *   newEntity,
 *   (entity) => canvasStore.addEntity(entity),
 *   (id) => canvasStore.deleteEntity(id)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class AddEntityCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new AddEntityCommand.
   *
   * @param entity - The entity to add
   * @param addEntityFn - Function to add the entity to the store
   * @param deleteEntityFn - Function to delete the entity (for undo)
   */
  constructor(
    private readonly entity: DiagramEntity,
    private readonly addEntityFn: (entity: DiagramEntity) => void,
    private readonly deleteEntityFn: (id: string) => void
  ) {
    this.description = `Add ${entity.type}`;
  }

  execute(): void {
    this.addEntityFn(this.entity);
  }

  undo(): void {
    this.deleteEntityFn(this.entity.id);
  }
}
