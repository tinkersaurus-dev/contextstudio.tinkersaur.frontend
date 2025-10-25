/**
 * DeleteConnectorCommand
 *
 * Command for deleting a connector from the canvas.
 * Supports undo by restoring the connector.
 */

import type { Command } from '../command-system';
import type { Connector } from '@/entities/connector';

/**
 * Command to delete a connector.
 *
 * This command captures the connector state before deletion
 * to enable restoration on undo.
 *
 * @example
 * ```typescript
 * const command = new DeleteConnectorCommand(
 *   connectorToDelete,
 *   (id) => canvasStore.deleteConnector(id),
 *   (connector) => canvasStore.addConnector(connector)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class DeleteConnectorCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new DeleteConnectorCommand.
   *
   * @param connector - The connector to delete
   * @param deleteConnectorFn - Function to delete the connector from the store
   * @param addConnectorFn - Function to add the connector back (for undo)
   */
  constructor(
    private readonly connector: Connector,
    private readonly deleteConnectorFn: (id: string) => void,
    private readonly addConnectorFn: (connector: Connector) => void
  ) {
    this.description = `Delete ${connector.connectorType} connector`;
  }

  execute(): void {
    this.deleteConnectorFn(this.connector.id);
  }

  undo(): void {
    this.addConnectorFn(this.connector);
  }
}
