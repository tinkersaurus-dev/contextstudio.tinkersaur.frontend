/**
 * Mermaid Importer Infrastructure
 *
 * Provides interfaces and types for importing Mermaid syntax into diagrams.
 * Each diagram type (BPMN, Sequence, DataFlow) will have its own importer implementation.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { Result } from '@/shared/lib/result';

/**
 * Result of a Mermaid import operation
 */
export interface MermaidImportResult {
  /** The imported shapes */
  shapes: Shape[];
  /** The imported connectors */
  connectors: Connector[];
  /** Metadata about the import */
  metadata?: {
    /** Diagram type that was imported (e.g., 'flowchart', 'sequenceDiagram') */
    diagramType: string;
    /** Number of nodes/shapes imported */
    nodeCount: number;
    /** Number of connections/edges imported */
    edgeCount: number;
    /** Timestamp of import */
    importedAt: Date;
    /** Whether metadata was present in the source */
    hadMetadata: boolean;
  };
}

/**
 * Base interface for Mermaid importers
 * Each diagram type implements this interface to provide Mermaid syntax parsing
 */
export interface MermaidImporter {
  /**
   * Import Mermaid syntax to shapes and connectors
   * @param syntax - Mermaid syntax string to import
   * @returns Result containing shapes and connectors or error
   */
  import(syntax: string): Result<MermaidImportResult>;

  /**
   * Get the diagram type identifier for Mermaid (e.g., 'flowchart', 'sequenceDiagram')
   */
  getDiagramType(): string;

  /**
   * Validate that Mermaid syntax can be imported
   * @param syntax - Mermaid syntax string to validate
   * @returns Result indicating validation success or errors
   */
  validate(syntax: string): Result<void>;
}

/**
 * Options for Mermaid import
 */
export interface MermaidImportOptions {
  /** Starting X position for auto-layout */
  startX?: number;
  /** Starting Y position for auto-layout */
  startY?: number;
  /** Horizontal spacing between nodes */
  horizontalSpacing?: number;
  /** Vertical spacing between nodes */
  verticalSpacing?: number;
  /** Whether to attempt to parse metadata */
  parseMetadata?: boolean;
}
