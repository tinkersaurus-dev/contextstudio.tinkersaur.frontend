/**
 * Diagram Entity Types
 *
 * Defines the base abstraction for all interactive elements on the canvas.
 * This includes shapes, connectors, annotations, and other future entity types.
 */

export enum DiagramEntityType {
  Shape = 'shape',
  Connector = 'connector',
  // Future entity types:
  // Annotation = 'annotation',
  // Group = 'group',
}

export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Base interface for all diagram entities
 */
export interface DiagramEntity {
  id: string;
  type: DiagramEntityType;
  position: Position;
  dimensions: Dimensions;
}

/**
 * Type guard to check if an object is a DiagramEntity
 */
export function isDiagramEntity(obj: unknown): obj is DiagramEntity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'type' in obj &&
    'position' in obj &&
    'dimensions' in obj
  );
}
