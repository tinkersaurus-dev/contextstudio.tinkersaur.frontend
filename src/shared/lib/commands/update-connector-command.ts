/**
 * UpdateConnectorCommand
 *
 * Command for updating connector properties (curvature, waypoints, styling).
 * Stores both before and after states to enable undo/redo.
 */

import type { Command } from '../command-system';
import type { Connector } from '@/entities/connector';

/**
 * Command to update a connector's properties.
 *
 * This command stores the complete before/after state of the connector
 * to enable proper undo/redo.
 *
 * @example
 * ```typescript
 * const command = new UpdateConnectorCommand(
 *   'connector-123',
 *   originalConnector,
 *   { strokeWidth: 3, strokeColor: '#ff0000' },
 *   (id, updates) => canvasStore.updateConnector(id, updates)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class UpdateConnectorCommand implements Command {
  public readonly description: string;

  private readonly beforeState: Partial<Connector>;
  private readonly afterState: Partial<Connector>;

  /**
   * Creates a new UpdateConnectorCommand.
   *
   * @param connectorId - ID of the connector to update
   * @param beforeConnector - Complete connector state before the update
   * @param updates - Properties to update
   * @param updateConnectorFn - Function to update the connector in the store
   */
  constructor(
    private readonly connectorId: string,
    beforeConnector: Connector,
    updates: Partial<Connector>,
    private readonly updateConnectorFn: (id: string, updates: Partial<Connector>) => void
  ) {
    // Store only the properties that are being changed
    this.beforeState = {};
    this.afterState = updates;

    // Extract before values for each updated property
    for (const key in updates) {
      if (Object.prototype.hasOwnProperty.call(beforeConnector, key)) {
        const typedKey = key as keyof Connector;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.beforeState as Record<string, any>)[typedKey] = beforeConnector[typedKey];
      }
    }

    this.description = `Update ${beforeConnector.connectorType} connector`;
  }

  execute(): void {
    this.updateConnectorFn(this.connectorId, this.afterState);
  }

  undo(): void {
    this.updateConnectorFn(this.connectorId, this.beforeState);
  }
}
