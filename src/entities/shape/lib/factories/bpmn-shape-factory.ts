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
 * @returns A new task shape entity
 */
export function createTask(
  x: number,
  y: number,
  options: CreateTaskOptions = {}
): TaskShape {
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

  return {
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
 * @returns A new start event shape entity
 */
export function createStartEvent(
  x: number,
  y: number,
  options: CreateStartEventOptions = {}
): StartEventShape {
  const {
    diameter = 40,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, diameter, diameter, { reference });

  return {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.StartEvent,
    position,
    dimensions: { width: diameter, height: diameter },
    fillColor,
    strokeColor,
    strokeWidth,
  };
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
 * @returns A new end event shape entity
 */
export function createEndEvent(
  x: number,
  y: number,
  options: CreateEndEventOptions = {}
): EndEventShape {
  const {
    diameter = 40,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, diameter, diameter, { reference });

  return {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.EndEvent,
    position,
    dimensions: { width: diameter, height: diameter },
    fillColor,
    strokeColor,
    strokeWidth,
  };
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
 * @returns A new gateway shape entity
 */
export function createGateway(
  x: number,
  y: number,
  options: CreateGatewayOptions = {}
): GatewayShape {
  const {
    size = 50,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, size, size, { reference });

  return {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.Gateway,
    position,
    dimensions: { width: size, height: size },
    fillColor,
    strokeColor,
    strokeWidth,
  };
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
 * @returns A new pool shape entity
 */
export function createPool(
  x: number,
  y: number,
  options: CreatePoolOptions = {}
): PoolShape {
  const {
    width = 600,
    height = 200,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  const position = calculatePosition(x, y, width, height, { reference });

  return {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.Pool,
    position,
    dimensions: { width, height },
    fillColor,
    strokeColor,
    strokeWidth,
  };
}
