/**
 * BPMN Mermaid Exporter
 *
 * Converts BPMN diagrams (shapes and connectors) to Mermaid flowchart syntax.
 * Maps BPMN elements to Mermaid flowchart nodes and edges.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import { isEventShape, isTaskShape, isGatewayShape } from '@/entities/shape/model/types';
import type { MermaidExporter, MermaidExportResult, MermaidExportOptions } from '../mermaid-exporter';
import { ok, err, type Result } from '@/shared/lib/core/result';

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
    // Empty diagrams are valid - they just export the diagram type declaration

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

      // Add metadata comments if enabled
      if (this.options.includeComments) {
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
   * Export a single shape as a Mermaid node with metadata
   *
   * Mermaid syntax: id[Text] for rectangle, id((Text)) for circle, id{Text} for diamond
   * With metadata: id@{ shape: circle, label: "Text", shapeType: event, subType: start }
   * The ID must be used in connections, the text is what displays in the shape
   */
  private exportShape(shape: Shape, idMap: Map<string, string>): string | null {
    const nodeId = idMap.get(shape.id) || this.sanitizeId(shape.id);
    const nodeText = this.sanitizeText(shape.text || '');
    const nodeSyntax = this.getNodeShapeSyntax(shape, idMap);

    // If metadata is enabled, add shape metadata
    if (this.options.includeMetadata) {
      const metadata = this.buildMetadata(shape, nodeText);
      return `${nodeId}@${metadata}`;
    }

    return nodeSyntax;
  }

  /**
   * Build metadata object for a shape
   */
  private buildMetadata(shape: Shape, label: string): string {
    const shapeType = shape.shapeType;
    const subType = shape.subType;

    // Determine the Mermaid shape syntax type
    let mermaidShape = 'rectangle';
    if (isEventShape(shape)) {
      mermaidShape = subType === 'end' ? 'doublecircle' : 'circle';
    } else if (isTaskShape(shape)) {
      mermaidShape = 'rectangle';
    } else if (isGatewayShape(shape)) {
      mermaidShape = 'diamond';
    } else if (shapeType === 'pool') {
      mermaidShape = 'subgraph';
    }

    const metadata: Record<string, string> = {
      shape: mermaidShape,
      label: label || this.getDefaultLabel(shape),
      shapeType,
    };

    if (subType) {
      metadata.subType = subType;
    }

    // Convert to compact JSON format for mermaid
    const entries = Object.entries(metadata)
      .map(([key, value]) => `${key}: "${value}"`)
      .join(', ');

    return `{ ${entries} }`;
  }

  /**
   * Get default label for a shape based on its type/subType
   */
  private getDefaultLabel(shape: Shape): string {
    if (isEventShape(shape)) {
      switch (shape.subType) {
        case 'start': return 'Start';
        case 'end': return 'End';
        case 'intermediate': return 'Intermediate';
        default: return 'Event';
      }
    } else if (isTaskShape(shape)) {
      return shape.subType ? `${shape.subType} Task` : 'Task';
    } else if (isGatewayShape(shape)) {
      return shape.subType ? `${shape.subType} Gateway` : 'Gateway';
    } else if (shape.shapeType === 'pool') {
      return 'Pool';
    }
    return 'Process';
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
   * With metadata support if enabled
   */
  private getNodeShapeSyntax(shape: Shape, idMap: Map<string, string>): string {
    const nodeId = idMap.get(shape.id) || this.sanitizeId(shape.id);
    const nodeText = this.sanitizeText(shape.text || '');

    // If metadata is enabled, use metadata format
    if (this.options.includeMetadata) {
      const metadata = this.buildMetadata(shape, nodeText);
      return `${nodeId}@${metadata}`;
    }

    // Otherwise, use traditional Mermaid syntax
    const shapeType = shape.shapeType;

    if (isEventShape(shape)) {
      // Events: circle or double circle
      if (shape.subType === 'end') {
        return `${nodeId}((("${nodeText || 'End'}")))`;
      }
      return `${nodeId}(("${nodeText || 'Start'}"))`;
    } else if (isTaskShape(shape)) {
      // Tasks: rounded rectangle
      return `${nodeId}("${nodeText || 'Task'}")`;
    } else if (isGatewayShape(shape)) {
      // Gateways: diamond
      return `${nodeId}{"${nodeText || 'Decision'}"}`;
    } else if (shapeType === 'pool') {
      // Pools can't be inline, return as regular ID
      return nodeId;
    } else if (shapeType === 'rectangle') {
      // Rectangles: square brackets
      return `${nodeId}["${nodeText || 'Process'}"]`;
    }

    // Default fallback
    return `${nodeId}["${nodeText || 'Unknown'}"]`;
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
