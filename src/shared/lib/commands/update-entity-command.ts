/**
 * UpdateEntityCommand
 *
 * Generic command for updating a diagram entity on the canvas.
 * Supports undo by restoring previous values.
 */

import type { Command } from '../command-system';
import type { DiagramEntity } from '@/entities/diagram-entity';

/**
 * Generic command to update an entity on the canvas.
 *
 * @example
 * ```typescript
 * const command = new UpdateEntityCommand(
 *   entityId,
 *   currentEntity,
 *   { position: { x: 100, y: 100 } },
 *   (id, updates) => canvasStore.updateEntity(id, updates)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class UpdateEntityCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new UpdateEntityCommand.
   *
   * @param id - The entity ID
   * @param previousEntity - The entity's state before update
   * @param updates - The updates to apply
   * @param updateEntityFn - Function to update the entity in the store
   */
  constructor(
    private readonly id: string,
    private readonly previousEntity: DiagramEntity,
    private readonly updates: Partial<DiagramEntity>,
    private readonly updateEntityFn: (id: string, updates: Partial<DiagramEntity>) => void
  ) {
    this.description = `Update ${previousEntity.type}`;
  }

  execute(): void {
    this.updateEntityFn(this.id, this.updates);
  }

  undo(): void {
    // Restore all changed properties to their previous values
    const undoUpdates: Record<string, unknown> = {};
    for (const key in this.updates) {
      if (key in this.previousEntity) {
        // Safely copy the property from previousEntity to undoUpdates
        undoUpdates[key] = (this.previousEntity as unknown as Record<string, unknown>)[key];
      }
    }
    this.updateEntityFn(this.id, undoUpdates as Partial<DiagramEntity>);
  }
}
