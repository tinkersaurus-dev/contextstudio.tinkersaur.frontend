/**
 * BPMN Shape Factory
 *
 * Factory functions for creating BPMN (Business Process Model and Notation) shapes.
 * These shapes are used for process modeling and workflow diagrams.
 */

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
import { Result } from '@/shared/lib/core/result';
import {
  createShapeBase,
  rectangularDimensions,
  circularDimensions,
  squareDimensions,
} from './base-shape-factory-utils';

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
  const { width, height } = rectangularDimensions(options.width, options.height);
  const { cornerRadius = 8, subType } = options;

  return createShapeBase<TaskShape>({
    x,
    y,
    width,
    height,
    shapeType: 'task',
    options,
    shapeSpecificProps: {
      cornerRadius,
      subType,
    },
  });
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
  const { diameter } = circularDimensions(options.diameter);
  const { subType } = options;

  return createShapeBase<EventShape>({
    x,
    y,
    diameter,
    shapeType: 'event',
    options,
    shapeSpecificProps: {
      subType,
    },
  });
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
  const { size } = squareDimensions(options.size);
  const { subType } = options;

  return createShapeBase<GatewayShape>({
    x,
    y,
    size,
    shapeType: 'gateway',
    options,
    shapeSpecificProps: {
      subType,
    },
  });
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
  // Pools have larger default dimensions
  const width = options.width ?? 600;
  const height = options.height ?? 200;

  return createShapeBase<PoolShape>({
    x,
    y,
    width,
    height,
    shapeType: 'pool',
    options,
    shapeSpecificProps: {},
  });
}
