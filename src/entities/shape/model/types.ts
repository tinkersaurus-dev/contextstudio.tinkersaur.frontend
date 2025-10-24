import { DiagramEntity, DiagramEntityType, Position, Dimensions } from '@/entities/diagram-entity';

export enum ShapeType {
  Rectangle = 'rectangle',
  // BPMN Shape Types
  Task = 'task',
  StartEvent = 'start-event',
  EndEvent = 'end-event',
  Gateway = 'gateway',
  Pool = 'pool',
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

/**
 * BPMN Task shape (rounded rectangle)
 */
export interface TaskShape extends BaseShape {
  shapeType: ShapeType.Task;
  /** Corner radius for rounded corners */
  cornerRadius?: number;
}

/**
 * BPMN Start Event shape (circle)
 */
export interface StartEventShape extends BaseShape {
  shapeType: ShapeType.StartEvent;
}

/**
 * BPMN End Event shape (double circle)
 */
export interface EndEventShape extends BaseShape {
  shapeType: ShapeType.EndEvent;
}

/**
 * BPMN Gateway shape (diamond/rhombus)
 */
export interface GatewayShape extends BaseShape {
  shapeType: ShapeType.Gateway;
}

/**
 * BPMN Pool shape (large rectangle for process grouping)
 */
export interface PoolShape extends BaseShape {
  shapeType: ShapeType.Pool;
}

export type Shape =
  | RectangleShape
  | TaskShape
  | StartEventShape
  | EndEventShape
  | GatewayShape
  | PoolShape;

// Re-export common types for convenience
export type { Position, Dimensions };
