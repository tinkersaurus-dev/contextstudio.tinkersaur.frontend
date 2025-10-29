/**
 * BPMN Mermaid Exporter
 *
 * Converts BPMN diagrams (shapes and connectors) to Mermaid flowchart syntax.
 * Maps BPMN elements to Mermaid flowchart nodes and edges.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import { ShapeType } from '@/entities/shape/model/types';
import type { MermaidExporter, MermaidExportResult, MermaidExportOptions } from '../mermaid-exporter';
import { ok, err, type Result } from '@/shared/lib/result';

/**
 * BPMN Mermaid Exporter Implementation
 */
export class BpmnMermaidExporter implements MermaidExporter {
  private options: Required<MermaidExportOptions>;

  constructor(options: MermaidExportOptions = {}) {
    this.options = {
      includeComments: options.includeComments ?? true,
      direction: options.direction ?? 'LR',
      indent: options.indent ?? 2,
      includeMetadata: options.includeMetadata ?? false,
    };
  }

  getDiagramType(): string {
    return 'flowchart';
  }

  validate(shapes: Shape[], connectors: Connector[]): Result<void> {
    // Check for empty diagram
    if (shapes.length === 0) {
      return err('Cannot export empty diagram');
    }

    // Validate all connectors reference existing shapes
    const shapeIds = new Set(shapes.map(s => s.id));
    const invalidConnectors = connectors.filter(
      c => !shapeIds.has(c.source.shapeId) || !shapeIds.has(c.target.shapeId)
    );

    if (invalidConnectors.length > 0) {
      return err(`Found ${invalidConnectors.length} connector(s) with invalid shape references`);
    }

    return ok(undefined);
  }

  export(shapes: Shape[], connectors: Connector[]): Result<MermaidExportResult> {
    // Validate before export
    const validationResult = this.validate(shapes, connectors);
    if (!validationResult.ok) {
      return validationResult;
    }

    try {
      const lines: string[] = [];

      // Add diagram type and direction
      lines.push(`flowchart ${this.options.direction}`);

      // Add metadata comment if enabled
      if (this.options.includeMetadata) {
        lines.push('');
        lines.push(`%% Generated: ${new Date().toISOString()}`);
        lines.push(`%% Shapes: ${shapes.length}, Connectors: ${connectors.length}`);
      }

      // Add blank line before content
      if (lines.length > 1) {
        lines.push('');
      }

      // Create a mapping from shape IDs to clean alphabetic identifiers (A, B, C, ...)
      const idMap = this.createAlphabeticIdMap(shapes);

      // Build a map of shapes by ID for quick lookup
      const shapeMap = new Map(shapes.map(s => [s.id, s]));

      // Track which shapes have been defined in connections
      const shapesInConnections = new Set<string>();

      // Export connectors - these define nodes inline
      const connectionLines: string[] = [];
      for (const connector of connectors) {
        const edgeDefinition = this.exportConnectorWithNodes(connector, shapeMap, idMap);
        if (edgeDefinition) {
          connectionLines.push(edgeDefinition);
          shapesInConnections.add(connector.source.shapeId);
          shapesInConnections.add(connector.target.shapeId);
        }
      }

      // Export standalone shapes (shapes without connections)
      for (const shape of shapes) {
        if (!shapesInConnections.has(shape.id)) {
          const nodeDefinition = this.exportShape(shape, idMap);
          if (nodeDefinition) {
            lines.push(nodeDefinition);
          }
        }
      }

      // Add connection lines
      lines.push(...connectionLines);

      const syntax = lines.join('\n');

      return ok({
        syntax,
        metadata: {
          diagramType: this.getDiagramType(),
          nodeCount: shapes.length,
          edgeCount: connectors.length,
          exportedAt: new Date(),
        },
      });
    } catch (error) {
      return err(`Failed to export BPMN diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a mapping from shape IDs to clean alphabetic identifiers
   * A, B, C, ..., Z, AA, AB, etc.
   */
  private createAlphabeticIdMap(shapes: Shape[]): Map<string, string> {
    const idMap = new Map<string, string>();

    shapes.forEach((shape, index) => {
      const alphaId = this.indexToAlpha(index);
      idMap.set(shape.id, alphaId);
    });

    return idMap;
  }

  /**
   * Convert a numeric index to alphabetic identifier
   * 0 -> A, 1 -> B, ..., 25 -> Z, 26 -> AA, 27 -> AB, etc.
   */
  private indexToAlpha(index: number): string {
    let result = '';
    let num = index;

    do {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26) - 1;
    } while (num >= 0);

    return result;
  }

  /**
   * Export a single shape as a Mermaid node
   *
   * Mermaid syntax: id[Text] for rectangle, id((Text)) for circle, id{Text} for diamond
   * The ID must be used in connections, the text is what displays in the shape
   */
  private exportShape(shape: Shape, idMap: Map<string, string>): string | null {
    const nodeId = idMap.get(shape.id) || this.sanitizeId(shape.id);
    const nodeText = this.sanitizeText(shape.text || '');

    switch (shape.shapeType) {
      case ShapeType.StartEvent:
        // Circle: id((Text))
        return `${nodeId}(("${nodeText || 'Start'}"))`;

      case ShapeType.EndEvent:
        // Double circle: id(((Text)))
        return `${nodeId}((("${nodeText || 'End'}")))`;

      case ShapeType.Task:
        // Rounded rectangle: id(Text)
        return `${nodeId}("${nodeText || 'Task'}")`;

      case ShapeType.Gateway:
        // Diamond/Rhombus: id{Text}
        return `${nodeId}{"${nodeText || 'Decision'}"}`;

      case ShapeType.Pool:
        // Pools are represented as subgraphs in Mermaid
        return `subgraph ${nodeId}["${nodeText || 'Pool'}"]\nend`;

      case ShapeType.Rectangle:
        // Rectangle: id[Text]
        return `${nodeId}["${nodeText || 'Process'}"]`;

      default:
        // Fallback for unknown shape types - use rectangle
        return `${nodeId}["${nodeText || 'Unknown'}"]`;
    }
  }

  /**
   * Export a connector with inline node definitions
   *
   * In Mermaid, you can define nodes inline with connections:
   * sourceId[Source Text] --> targetId[Target Text]
   */
  private exportConnectorWithNodes(connector: Connector, shapeMap: Map<string, Shape>, idMap: Map<string, string>): string | null {
    const sourceShape = shapeMap.get(connector.source.shapeId);
    const targetShape = shapeMap.get(connector.target.shapeId);

    if (!sourceShape || !targetShape) {
      return null;
    }

    // Get the node definitions (just the shape brackets, not as separate lines)
    const sourceNodeDef = this.getNodeShapeSyntax(sourceShape, idMap);
    const targetNodeDef = this.getNodeShapeSyntax(targetShape, idMap);

    // Determine arrow style based on connector type
    let arrow = '-->';
    if (connector.connectorType === 'curved') {
      arrow = '-.->'; // Dotted line for curved connectors
    }

    // Format: sourceId[SourceText] --> targetId[TargetText]
    return `${sourceNodeDef} ${arrow} ${targetNodeDef}`;
  }

  /**
   * Get the node shape syntax for inline definition
   * Returns the full node syntax: id[Text] or id((Text)) etc.
   */
  private getNodeShapeSyntax(shape: Shape, idMap: Map<string, string>): string {
    const nodeId = idMap.get(shape.id) || this.sanitizeId(shape.id);
    const nodeText = this.sanitizeText(shape.text || '');

    switch (shape.shapeType) {
      case ShapeType.StartEvent:
        return `${nodeId}(("${nodeText || 'Start'}"))`;

      case ShapeType.EndEvent:
        return `${nodeId}((("${nodeText || 'End'}")))`;

      case ShapeType.Task:
        return `${nodeId}("${nodeText || 'Task'}")`;

      case ShapeType.Gateway:
        return `${nodeId}{"${nodeText || 'Decision'}"}`;

      case ShapeType.Pool:
        // Pools can't be inline, return as regular ID
        return nodeId;

      case ShapeType.Rectangle:
        return `${nodeId}["${nodeText || 'Process'}"]`;

      default:
        return `${nodeId}["${nodeText || 'Unknown'}"]`;
    }
  }

  /**
   * Sanitize ID for Mermaid (remove special characters, ensure valid identifier)
   */
  private sanitizeId(id: string): string {
    // Replace hyphens and other special chars with underscores
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  /**
   * Sanitize text for Mermaid (escape quotes and special characters)
   */
  private sanitizeText(text: string): string {
    // Escape quotes and handle newlines
    return text
      .replace(/"/g, '#quot;')
      .replace(/\n/g, '<br/>')
      .trim();
  }

  /**
   * Generate indentation string
   */
  private indent(): string {
    return ' '.repeat(this.options.indent);
  }
}

/**
 * Factory function to create a BPMN Mermaid exporter
 */
export function createBpmnMermaidExporter(options?: MermaidExportOptions): BpmnMermaidExporter {
  return new BpmnMermaidExporter(options);
}
