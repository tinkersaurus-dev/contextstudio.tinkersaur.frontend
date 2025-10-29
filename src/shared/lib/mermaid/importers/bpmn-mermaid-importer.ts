/**
 * BPMN Mermaid Importer
 *
 * Converts Mermaid flowchart syntax to BPMN diagrams (shapes and connectors).
 * Supports both standard Mermaid notation and metadata-enhanced format.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { TaskSubType, EventSubType, GatewaySubType } from '@/entities/shape/model/types';
import { createTask, createEvent, createGateway, createPool } from '@/entities/shape/lib/factories/bpmn-shape-factory';
import { createOrthogonalConnector, createCurvedConnector } from '@/entities/connector';
import type { MermaidImporter, MermaidImportResult, MermaidImportOptions } from '../mermaid-importer';
import { ok, err, type Result } from '@/shared/lib/result';

/**
 * Parsed node information
 */
interface ParsedNode {
  id: string; // Mermaid ID (e.g., "A", "B", "C")
  label: string;
  shape: string; // Mermaid shape syntax (e.g., "circle", "rectangle", "diamond")
  shapeType?: string; // BPMN shape type from metadata
  subType?: string; // BPMN subtype from metadata
}

/**
 * Parsed connection information
 */
interface ParsedConnection {
  sourceId: string; // Mermaid ID
  targetId: string; // Mermaid ID
  type: string; // Connection type (e.g., "-->", "-.->")
}

/**
 * BPMN Mermaid Importer Implementation
 */
export class BpmnMermaidImporter implements MermaidImporter {
  private options: Required<MermaidImportOptions>;

  constructor(options: MermaidImportOptions = {}) {
    this.options = {
      startX: options.startX ?? 100,
      startY: options.startY ?? 100,
      horizontalSpacing: options.horizontalSpacing ?? 180,
      verticalSpacing: options.verticalSpacing ?? 120,
      parseMetadata: options.parseMetadata ?? true,
    };
  }

  getDiagramType(): string {
    return 'flowchart';
  }

  validate(syntax: string): Result<void> {
    // Basic validation
    if (!syntax || syntax.trim().length === 0) {
      return err('Empty Mermaid syntax');
    }

    const lines = syntax.trim().split('\n');
    const firstLine = lines[0].trim();

    // Check for flowchart declaration
    if (!firstLine.startsWith('flowchart')) {
      return err('Not a flowchart diagram (must start with "flowchart")');
    }

    return ok(undefined);
  }

  import(syntax: string): Result<MermaidImportResult> {
    // Validate before import
    const validationResult = this.validate(syntax);
    if (!validationResult.ok) {
      return validationResult;
    }

    try {
      const lines = syntax.trim().split('\n');

      // Parse the flowchart header
      const firstLine = lines[0].trim();
      const directionMatch = firstLine.match(/flowchart\s+(LR|RL|TB|TD|BT)/);
      const direction = directionMatch ? directionMatch[1] : 'LR';

      // Parse nodes and connections from remaining lines
      const { nodes, connections } = this.parseLines(lines.slice(1));

      if (nodes.size === 0) {
        return err('No nodes found in Mermaid syntax');
      }

      // Convert parsed nodes to shapes
      const { shapes, idMap } = this.createShapes(nodes, direction);

      // Convert parsed connections to connectors
      const connectors = this.createConnectors(connections, idMap);

      // Check if metadata was present
      const hadMetadata = this.detectMetadata(syntax);

      return ok({
        shapes,
        connectors,
        metadata: {
          diagramType: this.getDiagramType(),
          nodeCount: shapes.length,
          edgeCount: connectors.length,
          importedAt: new Date(),
          hadMetadata,
        },
      });
    } catch (error) {
      return err(`Failed to import BPMN diagram: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse lines to extract nodes and connections
   */
  private parseLines(lines: string[]): {
    nodes: Map<string, ParsedNode>;
    connections: ParsedConnection[];
  } {
    const nodes = new Map<string, ParsedNode>();
    const connections: ParsedConnection[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('%%')) {
        continue;
      }

      // Check if this is a connection line (contains --> or -.->)
      if (trimmedLine.includes('-->') || trimmedLine.includes('-.->')) {
        this.parseConnectionLine(trimmedLine, nodes, connections);
      } else {
        // Standalone node definition
        this.parseNodeLine(trimmedLine, nodes);
      }
    }

    return { nodes, connections };
  }

  /**
   * Parse a connection line (e.g., "A --> B" or "A[Text] --> B[Text]")
   */
  private parseConnectionLine(
    line: string,
    nodes: Map<string, ParsedNode>,
    connections: ParsedConnection[]
  ): void {
    // Determine connection type
    const connectionType = line.includes('-.->') ? 'dotted' : 'solid';
    const separator = line.includes('-.->') ? '-.->' : '-->';

    // Split by connection separator
    const parts = line.split(separator);
    if (parts.length !== 2) {
      return; // Invalid connection syntax
    }

    const sourcePart = parts[0].trim();
    const targetPart = parts[1].trim();

    // Parse source and target nodes
    const sourceNode = this.parseNodeDefinition(sourcePart);
    const targetNode = this.parseNodeDefinition(targetPart);

    if (sourceNode && targetNode) {
      // Add nodes to map if not already present
      if (!nodes.has(sourceNode.id)) {
        nodes.set(sourceNode.id, sourceNode);
      }
      if (!nodes.has(targetNode.id)) {
        nodes.set(targetNode.id, targetNode);
      }

      // Add connection
      connections.push({
        sourceId: sourceNode.id,
        targetId: targetNode.id,
        type: connectionType,
      });
    }
  }

  /**
   * Parse a standalone node line
   */
  private parseNodeLine(line: string, nodes: Map<string, ParsedNode>): void {
    const node = this.parseNodeDefinition(line);
    if (node && !nodes.has(node.id)) {
      nodes.set(node.id, node);
    }
  }

  /**
   * Parse a node definition (e.g., "A[Text]", "B((Text))", "C@{ metadata }")
   */
  private parseNodeDefinition(definition: string): ParsedNode | null {
    const trimmed = definition.trim();

    // Try to parse metadata format first: A@{ shape: "circle", label: "Text", ... }
    const metadataMatch = trimmed.match(/^([A-Z]+)@\s*\{\s*(.+?)\s*\}$/);
    if (metadataMatch) {
      return this.parseMetadataNode(metadataMatch[1], metadataMatch[2]);
    }

    // Try to parse standard format: A[Text], A((Text)), A{Text}, etc.
    return this.parseStandardNode(trimmed);
  }

  /**
   * Parse metadata format node: A@{ shape: "circle", label: "Text", shapeType: "event", subType: "start" }
   */
  private parseMetadataNode(id: string, metadataStr: string): ParsedNode | null {
    try {
      // Parse the metadata object
      const metadata: Record<string, string> = {};

      // Split by commas, but be careful with quoted strings
      const parts = metadataStr.match(/(\w+):\s*"([^"]*)"/g);
      if (!parts) {
        return null;
      }

      for (const part of parts) {
        const match = part.match(/(\w+):\s*"([^"]*)"/);
        if (match) {
          metadata[match[1]] = match[2];
        }
      }

      return {
        id,
        label: metadata.label || '',
        shape: metadata.shape || 'rectangle',
        shapeType: metadata.shapeType,
        subType: metadata.subType,
      };
    } catch {
      return null;
    }
  }

  /**
   * Parse standard Mermaid format node: A[Text], A((Text)), A{Text}, etc.
   */
  private parseStandardNode(definition: string): ParsedNode | null {
    // Match patterns: A[Text], A(Text), A((Text)), A{Text}, etc.
    // Start with most specific patterns first

    // Triple circle (end event): A((("Text")))
    let match = definition.match(/^([A-Z]+)\(\(\("([^"]*)"\)\)\)$/);
    if (match) {
      return {
        id: match[1],
        label: match[2],
        shape: 'doublecircle',
        shapeType: 'event',
        subType: 'end',
      };
    }

    // Double circle (start event): A(("Text"))
    match = definition.match(/^([A-Z]+)\(\("([^"]*)"\)\)$/);
    if (match) {
      return {
        id: match[1],
        label: match[2],
        shape: 'circle',
        shapeType: 'event',
        subType: 'start',
      };
    }

    // Rounded rectangle (task): A("Text")
    match = definition.match(/^([A-Z]+)\("([^"]*)"\)$/);
    if (match) {
      return {
        id: match[1],
        label: match[2],
        shape: 'rectangle',
        shapeType: 'task',
      };
    }

    // Diamond (gateway): A{"Text"}
    match = definition.match(/^([A-Z]+)\{"([^"]*)"\}$/);
    if (match) {
      return {
        id: match[1],
        label: match[2],
        shape: 'diamond',
        shapeType: 'gateway',
        subType: 'exclusive',
      };
    }

    // Square bracket (rectangle): A["Text"]
    match = definition.match(/^([A-Z]+)\["([^"]*)"\]$/);
    if (match) {
      return {
        id: match[1],
        label: match[2],
        shape: 'rectangle',
        shapeType: 'rectangle',
      };
    }

    // Just the ID without any shape definition
    match = definition.match(/^([A-Z]+)$/);
    if (match) {
      return {
        id: match[1],
        label: '',
        shape: 'rectangle',
        shapeType: 'rectangle',
      };
    }

    return null;
  }

  /**
   * Create shapes from parsed nodes
   */
  private createShapes(
    nodes: Map<string, ParsedNode>,
    direction: string
  ): { shapes: Shape[]; idMap: Map<string, string> } {
    const shapes: Shape[] = [];
    const idMap = new Map<string, string>(); // Map from Mermaid ID to Shape ID

    // Calculate layout positions based on direction
    const nodeArray = Array.from(nodes.values());
    const isHorizontal = direction === 'LR' || direction === 'RL';

    nodeArray.forEach((node, index) => {
      // Calculate position based on layout direction
      let x: number, y: number;

      if (isHorizontal) {
        // Horizontal layout (LR or RL)
        x = this.options.startX + (index * this.options.horizontalSpacing);
        y = this.options.startY;
      } else {
        // Vertical layout (TB, TD, or BT)
        x = this.options.startX;
        y = this.options.startY + (index * this.options.verticalSpacing);
      }

      // Create shape based on type
      const shape = this.createShape(node, x, y);
      if (shape) {
        shapes.push(shape);
        idMap.set(node.id, shape.id);
      }
    });

    return { shapes, idMap };
  }

  /**
   * Create a single shape from parsed node
   */
  private createShape(node: ParsedNode, x: number, y: number): Shape | null {
    const shapeType = node.shapeType || this.inferShapeType(node.shape);

    try {
      switch (shapeType) {
        case 'event': {
          const eventSubType = (node.subType as EventSubType) || this.inferEventSubType(node.shape);
          const result = createEvent(x, y, { subType: eventSubType });
          if (result.ok) {
            result.value.text = node.label;
            return result.value;
          }
          return null;
        }

        case 'task': {
          const taskSubType = node.subType as TaskSubType | undefined;
          const result = createTask(x, y, { subType: taskSubType });
          if (result.ok) {
            result.value.text = node.label;
            return result.value;
          }
          return null;
        }

        case 'gateway': {
          const gatewaySubType = (node.subType as GatewaySubType) || 'exclusive';
          const result = createGateway(x, y, { subType: gatewaySubType });
          if (result.ok) {
            result.value.text = node.label;
            return result.value;
          }
          return null;
        }

        case 'pool': {
          const result = createPool(x, y, {});
          if (result.ok) {
            result.value.text = node.label;
            return result.value;
          }
          return null;
        }

        default:
        case 'rectangle': {
          // For rectangle shapes without specific BPMN type, create a task
          const result = createTask(x, y, {});
          if (result.ok) {
            result.value.text = node.label;
            return result.value;
          }
          return null;
        }
      }
    } catch (error) {
      console.warn(`Failed to create shape for node ${node.id}:`, error);
      return null;
    }
  }

  /**
   * Infer BPMN shape type from Mermaid shape syntax
   */
  private inferShapeType(mermaidShape: string): string {
    switch (mermaidShape) {
      case 'circle':
      case 'doublecircle':
        return 'event';
      case 'diamond':
        return 'gateway';
      case 'rectangle':
      default:
        return 'task';
    }
  }

  /**
   * Infer event subtype from Mermaid shape syntax
   */
  private inferEventSubType(mermaidShape: string): EventSubType {
    if (mermaidShape === 'doublecircle') {
      return 'end';
    }
    return 'start';
  }

  /**
   * Create connectors from parsed connections
   */
  private createConnectors(
    connections: ParsedConnection[],
    idMap: Map<string, string>
  ): Connector[] {
    const connectors: Connector[] = [];

    for (const connection of connections) {
      const sourceShapeId = idMap.get(connection.sourceId);
      const targetShapeId = idMap.get(connection.targetId);

      if (sourceShapeId && targetShapeId) {
        // Create connection points with default anchors (east for source, west for target)
        const sourcePoint = { shapeId: sourceShapeId, anchor: 'e' as const };
        const targetPoint = { shapeId: targetShapeId, anchor: 'w' as const };

        // Choose connector type based on connection style
        const result = connection.type === 'dotted'
          ? createCurvedConnector(sourcePoint, targetPoint)
          : createOrthogonalConnector(sourcePoint, targetPoint);

        if (result.ok) {
          connectors.push(result.value);
        }
      }
    }

    return connectors;
  }

  /**
   * Detect if the syntax contains metadata
   */
  private detectMetadata(syntax: string): boolean {
    return syntax.includes('@{');
  }
}

/**
 * Factory function to create a BPMN Mermaid importer
 */
export function createBpmnMermaidImporter(options?: MermaidImportOptions): BpmnMermaidImporter {
  return new BpmnMermaidImporter(options);
}
