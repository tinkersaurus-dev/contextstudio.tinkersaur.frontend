/**
 * ImportDiagramCommand
 *
 * Command for importing a diagram (replacing or appending shapes and connectors).
 * Supports undo by restoring the previous diagram state.
 */

import type { Command } from './command-system';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

/**
 * Options for import mode
 */
export type ImportMode = 'replace' | 'append';

/**
 * Diagram state snapshot
 */
interface DiagramSnapshot {
  shapes: Shape[];
  connectors: Connector[];
}

/**
 * Command to import shapes and connectors into the diagram.
 * Supports two modes:
 * - 'replace': Clears existing diagram and imports new content
 * - 'append': Adds imported content to existing diagram
 *
 * @example
 * ```typescript
 * const command = new ImportDiagramCommand(
 *   importedShapes,
 *   importedConnectors,
 *   'replace',
 *   () => canvasStore.getDiagramSnapshot(),
 *   (shapes, connectors) => canvasStore.setDiagram(shapes, connectors)
 * );
 * commandHistory.execute(command);
 * ```
 */
export class ImportDiagramCommand implements Command {
  public readonly description: string;
  private previousSnapshot: DiagramSnapshot | null = null;

  /**
   * Creates a new ImportDiagramCommand.
   *
   * @param importedShapes - Shapes to import
   * @param importedConnectors - Connectors to import
   * @param mode - Import mode ('replace' or 'append')
   * @param getSnapshotFn - Function to get current diagram state
   * @param setDiagramFn - Function to set diagram state (for undo)
   * @param addShapesFn - Function to add shapes (for append mode)
   * @param addConnectorsFn - Function to add connectors (for append mode)
   */
  constructor(
    private readonly importedShapes: Shape[],
    private readonly importedConnectors: Connector[],
    private readonly mode: ImportMode,
    private readonly getSnapshotFn: () => DiagramSnapshot,
    private readonly setDiagramFn: (shapes: Shape[], connectors: Connector[]) => void,
    private readonly addShapesFn?: (shapes: Shape[]) => void,
    private readonly addConnectorsFn?: (connectors: Connector[]) => void
  ) {
    this.description = mode === 'replace'
      ? `Import diagram (${importedShapes.length} shapes, ${importedConnectors.length} connectors)`
      : `Append to diagram (${importedShapes.length} shapes, ${importedConnectors.length} connectors)`;
  }

  execute(): void {
    // Save current state for undo
    this.previousSnapshot = this.getSnapshotFn();

    if (this.mode === 'replace') {
      // Replace: Set diagram to imported content only
      this.setDiagramFn(this.importedShapes, this.importedConnectors);
    } else {
      // Append: Add imported content to existing diagram
      if (this.addShapesFn && this.addConnectorsFn) {
        this.addShapesFn(this.importedShapes);
        this.addConnectorsFn(this.importedConnectors);
      } else {
        // Fallback: Use setDiagram with merged content
        const current = this.getSnapshotFn();
        this.setDiagramFn(
          [...current.shapes, ...this.importedShapes],
          [...current.connectors, ...this.importedConnectors]
        );
      }
    }
  }

  undo(): void {
    // Restore previous state
    if (this.previousSnapshot) {
      this.setDiagramFn(this.previousSnapshot.shapes, this.previousSnapshot.connectors);
    }
  }
}
