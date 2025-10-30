/**
 * CompositeCommand
 *
 * A command that groups multiple commands together into a single undo/redo unit.
 * When executed, all child commands are executed in sequence.
 * When undone, all child commands are undone in reverse sequence.
 *
 * This is useful for operations that logically represent a single user action
 * but require multiple state changes (e.g., deleting multiple selected entities).
 */

import type { Command } from './command-system';

/**
 * Command that groups multiple commands into a single undo/redo operation.
 *
 * @example
 * ```typescript
 * const deleteCommands = selectedShapes.map(shape =>
 *   new DeleteShapeCommand(shape, connectors, deleteFn, addFn, addConnectorFn)
 * );
 * const compositeCommand = new CompositeCommand(
 *   deleteCommands,
 *   'Delete multiple shapes'
 * );
 * commandHistory.execute(compositeCommand);
 * // User can undo all deletions with a single undo
 * ```
 */
export class CompositeCommand implements Command {
  /**
   * Creates a new CompositeCommand.
   *
   * @param commands - Array of commands to group together
   * @param description - Description of the composite operation
   */
  constructor(
    private readonly commands: Command[],
    public readonly description: string = 'Composite operation'
  ) {}

  execute(): void {
    // Execute all commands in forward order
    for (const command of this.commands) {
      command.execute();
    }
  }

  undo(): void {
    // Undo all commands in reverse order
    // This ensures proper cleanup when commands depend on each other
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  /**
   * Get the number of child commands.
   *
   * @returns Number of commands in this composite
   */
  getCommandCount(): number {
    return this.commands.length;
  }

  /**
   * Check if this composite has any commands.
   *
   * @returns true if there are no child commands
   */
  isEmpty(): boolean {
    return this.commands.length === 0;
  }
}
