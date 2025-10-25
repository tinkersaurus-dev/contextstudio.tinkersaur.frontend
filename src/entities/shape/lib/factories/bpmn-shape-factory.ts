/**
 * BPMN Shape Factory
 *
 * Factory functions for creating BPMN (Business Process Model and Notation) shapes.
 * These shapes are used for process modeling and workflow diagrams.
 */

import { CANVAS_COLORS, STROKE_WIDTHS } from '@/shared/config/canvas-config';
import { generateShapeId } from '@/shared/lib/id-generator';
import { calculatePosition } from '@/shared/lib/shape-position-utils';
import { DiagramEntityType } from '@/entities/diagram-entity';
import { ShapeType } from '../../model/types';
import type {
  TaskShape,
  StartEventShape,
  EndEventShape,
  GatewayShape,
  PoolShape,
} from '../../model/types';
import type {
  RectangularShapeOptions,
  CircularShapeOptions,
  SquareShapeOptions,
} from './base-factory-types';
import { Result, ok, err } from '@/shared/lib/result';
import { validateShape } from '@/shared/lib/entity-validation';

// ============================================================================
// BPMN Task Shape
// ============================================================================

/**
 * Options for creating a BPMN Task shape
 */
export interface CreateTaskOptions extends RectangularShapeOptions {
  /** Corner radius for rounded rectangle */
  cornerRadius?: number;
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
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, width, height, { reference });

  const shape: TaskShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.Task,
    position,
    dimensions: { width, height },
    cornerRadius,
    fillColor,
    strokeColor,
    strokeWidth,
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
 * Options for creating a BPMN Start Event shape
 */
export type CreateStartEventOptions = CircularShapeOptions;

/**
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
  const {
    diameter = 40,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, diameter, diameter, { reference });

  const shape: StartEventShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.StartEvent,
    position,
    dimensions: { width: diameter, height: diameter },
    fillColor,
    strokeColor,
    strokeWidth,
  };

  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`Start event shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}

/**
 * Options for creating a BPMN End Event shape
 */
export type CreateEndEventOptions = CircularShapeOptions;

/**
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
  const {
    diameter = 40,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, diameter, diameter, { reference });

  const shape: EndEventShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.EndEvent,
    position,
    dimensions: { width: diameter, height: diameter },
    fillColor,
    strokeColor,
    strokeWidth,
  };

  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`End event shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}

// ============================================================================
// BPMN Gateway Shape
// ============================================================================

/**
 * Options for creating a BPMN Gateway shape
 */
export type CreateGatewayOptions = SquareShapeOptions;

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
    size = 50,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, size, size, { reference });

  const shape: GatewayShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.Gateway,
    position,
    dimensions: { width: size, height: size },
    fillColor,
    strokeColor,
    strokeWidth,
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
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, width, height, { reference });

  const shape: PoolShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.Pool,
    position,
    dimensions: { width, height },
    fillColor,
    strokeColor,
    strokeWidth,
  };

  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`Pool shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}
