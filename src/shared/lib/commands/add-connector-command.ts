/**
 * AddConnectorCommand
 *
 * Command for adding a connector to the canvas.
 * Supports undo by removing the added connector.
 */

import type { Command } from '../command-system';
import type { Connector } from '@/entities/connector';

/**
 * Command to add a connector to the canvas.
 *
 * @example
 * ```typescript
 * const command = new AddConnectorCommand(
 *   newConnector,
 *   (connector) => canvasStore.addConnector(connector),
 *   (id) => canvasStore.deleteConnector(id)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class AddConnectorCommand implements Command {
  public readonly description: string;

  /**
   * Creates a new AddConnectorCommand.
   *
   * @param connector - The connector to add
   * @param addConnectorFn - Function to add the connector to the store
   * @param deleteConnectorFn - Function to delete the connector (for undo)
   */
  constructor(
    private readonly connector: Connector,
    private readonly addConnectorFn: (connector: Connector) => void,
    private readonly deleteConnectorFn: (id: string) => void
  ) {
    this.description = `Add ${connector.connectorType} connector`;
  }

  execute(): void {
    this.addConnectorFn(this.connector);
  }

  undo(): void {
    this.deleteConnectorFn(this.connector.id);
  }
}
