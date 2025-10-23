import { DiagramEntity, DiagramEntityType, Position, Dimensions } from '@/entities/diagram-entity';

export enum ShapeType {
  Rectangle = 'rectangle',
}

/**
 * Base interface for all shapes
 * Shapes are a type of DiagramEntity
 */
export interface BaseShape extends DiagramEntity {
  type: DiagramEntityType.Shape;
  shapeType: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface RectangleShape extends BaseShape {
  shapeType: ShapeType.Rectangle;
}

export type Shape = RectangleShape;

// Re-export common types for convenience
export type { Position, Dimensions };
