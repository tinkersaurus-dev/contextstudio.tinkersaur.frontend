/**
 * BPMN Shape Factory
 *
 * Factory functions for creating BPMN (Business Process Model and Notation) shapes.
 * These shapes are used for process modeling and workflow diagrams.
 */

import { CANVAS_COLORS, STROKE_WIDTHS } from '@/shared/config/canvas-config';
import { generateShapeId } from '@/shared/lib/core/id-generator';
import { calculatePosition } from '@/shared/lib/geometry';
import { DiagramEntityType } from '@/entities/diagram-entity';
import type {
  TaskShape,
  EventShape,
  StartEventShape,
  EndEventShape,
  GatewayShape,
  PoolShape,
  TaskSubType,
  EventSubType,
  GatewaySubType,
} from '../../model/types';
import type {
  RectangularShapeOptions,
  CircularShapeOptions,
  SquareShapeOptions,
} from './base-factory-types';
import { Result, ok, err } from '@/shared/lib/core/result';
import { validateShape } from '@/shared/lib/entities';
import { getDefaultTextConfig } from '@/shared/lib/rendering';

// ============================================================================
// BPMN Task Shape
// ============================================================================

/**
 * Options for creating a BPMN Task shape
 */
export interface CreateTaskOptions extends RectangularShapeOptions {
  /** Corner radius for rounded rectangle */
  cornerRadius?: number;
  /** Task subtype (user, service, script, etc.) */
  subType?: TaskSubType;
}

/**
 * Create a BPMN Task shape (rounded rectangle)
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Optional configuration for the task
 * @returns A Result containing the new task shape or an error message
 */
export function createTask(
  x: number,
  y: number,
  options: CreateTaskOptions = {}
): Result<TaskShape> {
  const {
    width = 120,
    height = 80,
    cornerRadius = 8,
    subType,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    textColor,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, width, height, { reference });

  // Get default text configuration for this shape type
  const textConfig = getDefaultTextConfig('task');

  const shape: TaskShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: 'task',
    subType,
    position,
    dimensions: { width, height },
    cornerRadius,
    fillColor,
    strokeColor,
    strokeWidth,
    textColor,
    text: '',
    textWrap: true,
    maxLines: textConfig.maxLines,
    textTruncation: 'ellipsis',
    textPlacement: textConfig.placement,
    lineHeight: textConfig.lineHeight,
  };

  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`Task shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}

// ============================================================================
// BPMN Event Shapes
// ============================================================================

/**
 * Options for creating a BPMN Event shape
 */
export interface CreateEventOptions extends CircularShapeOptions {
  /** Event subtype (start, end, timer, message, etc.) */
  subType: EventSubType;
}

/**
 * Create a BPMN Event shape (circle or double circle)
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Configuration for the event (must include subType)
 * @returns A Result containing the new event shape or an error message
 */
export function createEvent(
  x: number,
  y: number,
  options: CreateEventOptions
): Result<EventShape> {
  const {
    diameter = 40,
    subType,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    textColor,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, diameter, diameter, { reference });

  // Get default text configuration for this shape type
  const textConfig = getDefaultTextConfig('event');

  const shape: EventShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: 'event',
    subType,
    position,
    dimensions: { width: diameter, height: diameter },
    fillColor,
    strokeColor,
    strokeWidth,
    textColor,
    text: '',
    textWrap: true,
    maxLines: textConfig.maxLines,
    textTruncation: 'ellipsis',
    textPlacement: textConfig.placement,
    lineHeight: textConfig.lineHeight,
  };

  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`Event shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}

/**
 * Options for creating a BPMN Start Event shape
 */
export type CreateStartEventOptions = CircularShapeOptions;

/**
 * @deprecated Use createEvent with subType: 'start' instead
 * Create a BPMN Start Event shape (circle)
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Optional configuration for the start event
 * @returns A Result containing the new start event shape or an error message
 */
export function createStartEvent(
  x: number,
  y: number,
  options: CreateStartEventOptions = {}
): Result<StartEventShape> {
  return createEvent(x, y, { ...options, subType: 'start' }) as Result<StartEventShape>;
}

/**
 * Options for creating a BPMN End Event shape
 */
export type CreateEndEventOptions = CircularShapeOptions;

/**
 * @deprecated Use createEvent with subType: 'end' instead
 * Create a BPMN End Event shape (double circle)
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Optional configuration for the end event
 * @returns A Result containing the new end event shape or an error message
 */
export function createEndEvent(
  x: number,
  y: number,
  options: CreateEndEventOptions = {}
): Result<EndEventShape> {
  return createEvent(x, y, { ...options, subType: 'end' }) as Result<EndEventShape>;
}

// ============================================================================
// BPMN Gateway Shape
// ============================================================================

/**
 * Options for creating a BPMN Gateway shape
 */
export interface CreateGatewayOptions extends SquareShapeOptions {
  /** Gateway subtype (exclusive, inclusive, parallel, etc.) */
  subType?: GatewaySubType;
}

/**
 * Create a BPMN Gateway shape (diamond)
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Optional configuration for the gateway
 * @returns A Result containing the new gateway shape or an error message
 */
export function createGateway(
  x: number,
  y: number,
  options: CreateGatewayOptions = {}
): Result<GatewayShape> {
  const {
    size = 40,
    subType,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    textColor,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, size, size, { reference });

  // Get default text configuration for this shape type
  const textConfig = getDefaultTextConfig('gateway');

  const shape: GatewayShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: 'gateway',
    subType,
    position,
    dimensions: { width: size, height: size },
    fillColor,
    strokeColor,
    strokeWidth,
    textColor,
    text: '',
    textWrap: true,
    maxLines: textConfig.maxLines,
    textTruncation: 'ellipsis',
    textPlacement: textConfig.placement,
    lineHeight: textConfig.lineHeight,
  };

  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`Gateway shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}

// ============================================================================
// BPMN Pool Shape
// ============================================================================

/**
 * Options for creating a BPMN Pool shape
 */
export type CreatePoolOptions = RectangularShapeOptions;

/**
 * Create a BPMN Pool shape (large rectangle for process grouping)
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param options - Optional configuration for the pool
 * @returns A Result containing the new pool shape or an error message
 */
export function createPool(
  x: number,
  y: number,
  options: CreatePoolOptions = {}
): Result<PoolShape> {
  const {
    width = 600,
    height = 200,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    textColor,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, width, height, { reference });

  // Get default text configuration for this shape type
  const textConfig = getDefaultTextConfig('pool');

  const shape: PoolShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: 'pool',
    position,
    dimensions: { width, height },
    fillColor,
    strokeColor,
    strokeWidth,
    textColor,
    text: '',
    textWrap: true,
    maxLines: textConfig.maxLines,
    textTruncation: 'ellipsis',
    textPlacement: textConfig.placement,
    lineHeight: textConfig.lineHeight,
  };

  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`Pool shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}
