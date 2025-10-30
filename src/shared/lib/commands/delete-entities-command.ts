/**
 * DeleteEntitiesCommand
 *
 * Command for deleting multiple entities (shapes and connectors) at once.
 * This is typically used when the user presses Delete with multiple entities selected.
 *
 * This command handles:
 * - Deleting multiple shapes (each with cascade connector deletion)
 * - Deleting standalone connectors (not attached to deleted shapes)
 * - Proper restoration order on undo
 */

import type { Command } from './command-system';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

/**
 * Command to delete multiple entities at once.
 *
 * This command automatically separates shapes and connectors, ensuring
 * that shapes are deleted first (which cascade-deletes their connectors),
 * then standalone connectors are deleted.
 *
 * @example
 * ```typescript
 * const command = new DeleteEntitiesCommand(
 *   selectedShapes,
 *   selectedConnectors,
 *   (id) => canvasStore.getAllConnectorsForShape(id),
 *   (id) => canvasStore.deleteShape(id),
 *   (shape) => canvasStore.addShape(shape),
 *   (id) => canvasStore.deleteConnector(id),
 *   (connector) => canvasStore.addConnector(connector)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class DeleteEntitiesCommand implements Command {
  private readonly shapes: Shape[];
  private readonly allCascadeConnectors: Connector[];
  private readonly standaloneConnectors: Connector[];
  private readonly deleteShapeFn: (id: string) => void;
  private readonly addShapeFn: (shape: Shape) => void;
  private readonly deleteConnectorFn: (id: string) => void;
  private readonly addConnectorFn: (connector: Connector) => void;
  public readonly description: string;

  /**
   * Creates a new DeleteEntitiesCommand.
   *
   * @param shapes - Shapes to delete
   * @param connectors - Connectors to delete
   * @param getConnectorsForShapeFn - Function to get connectors attached to a shape
   * @param deleteShapeFn - Function to delete a shape
   * @param addShapeFn - Function to add a shape (for undo)
   * @param deleteConnectorFn - Function to delete a connector
   * @param addConnectorFn - Function to add a connector (for undo)
   */
  constructor(
    shapes: Shape[],
    connectors: Connector[],
    getConnectorsForShapeFn: (shapeId: string) => Connector[],
    deleteShapeFn: (id: string) => void,
    addShapeFn: (shape: Shape) => void,
    deleteConnectorFn: (id: string) => void,
    addConnectorFn: (connector: Connector) => void
  ) {
    this.shapes = shapes;
    this.deleteShapeFn = deleteShapeFn;
    this.addShapeFn = addShapeFn;
    this.deleteConnectorFn = deleteConnectorFn;
    this.addConnectorFn = addConnectorFn;

    // Collect all connectors that will be cascade-deleted when shapes are removed
    const deletedShapeIds = new Set(shapes.map((s) => s.id));
    const cascadeConnectorMap = new Map<string, Connector>();

    for (const shape of shapes) {
      const attachedConnectors = getConnectorsForShapeFn(shape.id);
      for (const connector of attachedConnectors) {
        // Only add each connector once (avoid duplicates when both endpoints are being deleted)
        if (!cascadeConnectorMap.has(connector.id)) {
          cascadeConnectorMap.set(connector.id, connector);
        }
      }
    }

    this.allCascadeConnectors = Array.from(cascadeConnectorMap.values());

    // Separate standalone connectors (not attached to any deleted shapes)
    this.standaloneConnectors = connectors.filter(
      (connector) =>
        !deletedShapeIds.has(connector.source.shapeId) &&
        !deletedShapeIds.has(connector.target.shapeId)
    );

    // Create description
    const totalCount = shapes.length + this.standaloneConnectors.length;
    this.description =
      totalCount === 1
        ? 'Delete entity'
        : `Delete ${totalCount} entities`;
  }

  execute(): void {
    // Delete all shapes (this will cascade-delete their connectors automatically)
    for (const shape of this.shapes) {
      this.deleteShapeFn(shape.id);
    }

    // Delete standalone connectors (not attached to deleted shapes)
    for (const connector of this.standaloneConnectors) {
      this.deleteConnectorFn(connector.id);
    }
  }

  undo(): void {
    // Critical: Restore shapes FIRST, then connectors
    // This ensures connector validation passes (both endpoints exist)

    // Step 1: Restore all shapes
    for (const shape of this.shapes) {
      this.addShapeFn(shape);
    }

    // Step 2: Restore all cascade-deleted connectors
    // (connectors that were attached to the deleted shapes)
    for (const connector of this.allCascadeConnectors) {
      this.addConnectorFn(connector);
    }

    // Step 3: Restore standalone connectors
    for (const connector of this.standaloneConnectors) {
      this.addConnectorFn(connector);
    }
  }

  /**
   * Get the number of entities being deleted.
   *
   * @returns Number of shapes and standalone connectors
   */
  getEntityCount(): number {
    return this.shapes.length + this.standaloneConnectors.length;
  }
}
