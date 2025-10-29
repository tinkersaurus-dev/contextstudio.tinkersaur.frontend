import { DiagramEntity, DiagramEntityType, Position, Dimensions } from '@/entities/diagram-entity';

/**
 * Base shape types - the primary category of a shape
 */
export type BaseShapeType =
  | 'rectangle'
  | 'task'
  | 'event'
  | 'gateway'
  | 'pool';

/**
 * Task subtypes (BPMN standard)
 */
export type TaskSubType =
  | 'user'
  | 'service'
  | 'script'
  | 'manual'
  | 'business-rule'
  | 'send'
  | 'receive';

/**
 * Event subtypes (BPMN standard)
 */
export type EventSubType =
  | 'start'
  | 'end'
  | 'intermediate'
  | 'timer'
  | 'message'
  | 'error'
  | 'conditional'
  | 'signal'
  | 'escalation'
  | 'compensation'
  | 'cancel'
  | 'link';

/**
 * Gateway subtypes (BPMN standard)
 */
export type GatewaySubType =
  | 'exclusive'
  | 'inclusive'
  | 'parallel'
  | 'event-based'
  | 'complex';

/**
 * @deprecated Use BaseShapeType with subType instead
 * Kept for backward compatibility during migration
 */
export enum ShapeType {
  Rectangle = 'rectangle',
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
  /** Primary shape category (event, task, gateway, etc.) */
  shapeType: BaseShapeType;
  /** Optional shape variant within the category */
  subType?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  textColor?: string;
}

export interface RectangleShape extends BaseShape {
  shapeType: 'rectangle';
}

/**
 * BPMN Task shape (rounded rectangle)
 */
export interface TaskShape extends BaseShape {
  shapeType: 'task';
  subType?: TaskSubType;
  /** Corner radius for rounded corners */
  cornerRadius?: number;
}

/**
 * BPMN Event shape (circle or double circle)
 * Replaces StartEventShape and EndEventShape
 */
export interface EventShape extends BaseShape {
  shapeType: 'event';
  subType: EventSubType;
}

/**
 * BPMN Gateway shape (diamond/rhombus)
 */
export interface GatewayShape extends BaseShape {
  shapeType: 'gateway';
  subType?: GatewaySubType;
}

/**
 * BPMN Pool shape (large rectangle for process grouping)
 */
export interface PoolShape extends BaseShape {
  shapeType: 'pool';
}

/**
 * @deprecated Use EventShape with subType: 'start' instead
 */
export interface StartEventShape extends BaseShape {
  shapeType: 'event';
  subType: 'start';
}

/**
 * @deprecated Use EventShape with subType: 'end' instead
 */
export interface EndEventShape extends BaseShape {
  shapeType: 'event';
  subType: 'end';
}

export type Shape =
  | RectangleShape
  | TaskShape
  | EventShape
  | GatewayShape
  | PoolShape;

// Re-export common types for convenience
export type { Position, Dimensions };

/**
 * Type guards for specific shape types
 */
export function isTaskShape(shape: Shape): shape is TaskShape {
  return shape.shapeType === 'task';
}

export function isEventShape(shape: Shape): shape is EventShape {
  return shape.shapeType === 'event';
}

export function isGatewayShape(shape: Shape): shape is GatewayShape {
  return shape.shapeType === 'gateway';
}

export function isRectangleShape(shape: Shape): shape is RectangleShape {
  return shape.shapeType === 'rectangle';
}

export function isPoolShape(shape: Shape): shape is PoolShape {
  return shape.shapeType === 'pool';
}

/**
 * Get composite key for shape type and subtype
 * Used for registry lookups and rendering
 */
export function getShapeKey(shape: BaseShape): string {
  return shape.subType ? `${shape.shapeType}:${shape.subType}` : shape.shapeType;
}

/**
 * Backward compatibility: Convert legacy ShapeType enum to new type/subType
 */
export function migrateLegacyShapeType(legacyType: ShapeType): { shapeType: BaseShapeType; subType?: string } {
  switch (legacyType) {
    case ShapeType.StartEvent:
      return { shapeType: 'event', subType: 'start' };
    case ShapeType.EndEvent:
      return { shapeType: 'event', subType: 'end' };
    case ShapeType.Task:
      return { shapeType: 'task' };
    case ShapeType.Gateway:
      return { shapeType: 'gateway' };
    case ShapeType.Pool:
      return { shapeType: 'pool' };
    case ShapeType.Rectangle:
      return { shapeType: 'rectangle' };
    default:
      return { shapeType: 'rectangle' };
  }
}
