/**
 * Mermaid Exporter Infrastructure
 *
 * Provides interfaces and types for exporting diagrams to Mermaid syntax.
 * Each diagram type (BPMN, Sequence, DataFlow) will have its own exporter implementation.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { Result } from '@/shared/lib/core/result';

/**
 * Result of a Mermaid export operation
 */
export interface MermaidExportResult {
  /** The generated Mermaid syntax */
  syntax: string;
  /** Metadata about the export */
  metadata?: {
    /** Diagram type (e.g., 'flowchart', 'sequenceDiagram') */
    diagramType: string;
    /** Number of nodes/shapes exported */
    nodeCount: number;
    /** Number of connections/edges exported */
    edgeCount: number;
    /** Timestamp of export */
    exportedAt: Date;
  };
}

/**
 * Base interface for Mermaid exporters
 * Each diagram type implements this interface to provide Mermaid syntax generation
 */
export interface MermaidExporter {
  /**
   * Export shapes and connectors to Mermaid syntax
   * @param shapes - Array of shapes to export
   * @param connectors - Array of connectors to export
   * @returns Result containing Mermaid syntax or error
   */
  export(shapes: Shape[], connectors: Connector[]): Result<MermaidExportResult>;

  /**
   * Get the diagram type identifier for Mermaid (e.g., 'flowchart', 'sequenceDiagram')
   */
  getDiagramType(): string;

  /**
   * Validate that shapes and connectors can be exported
   * @param shapes - Array of shapes to validate
   * @param connectors - Array of connectors to validate
   * @returns Result indicating validation success or errors
   */
  validate(shapes: Shape[], connectors: Connector[]): Result<void>;
}

/**
 * Options for Mermaid export
 */
export interface MermaidExportOptions {
  /** Include comments in the output */
  includeComments?: boolean;
  /** Flowchart direction (for flowchart diagrams) */
  direction?: 'TB' | 'TD' | 'BT' | 'RL' | 'LR';
  /** Indentation spaces */
  indent?: number;
  /** Include metadata as comments */
  includeMetadata?: boolean;
}
