/**
 * Basic Shape Factory
 *
 * Factory functions for creating basic geometric shapes like rectangles.
 * These are fundamental shapes used across all diagram types.
 */

import {
  CANVAS_COLORS,
  STROKE_WIDTHS,
} from '@/shared/config/canvas-config';
import { generateShapeId } from '@/shared/lib/id-generator';
import { calculatePosition } from '@/shared/lib/shape-position-utils';
import { DiagramEntityType } from '@/entities/diagram-entity';
import { ShapeType } from '../../model/types';
import type { RectangleShape } from '../../model/types';
import type { RectangularShapeOptions } from './base-factory-types';
import { Result, ok, err } from '@/shared/lib/result';
import { validateShape } from '@/shared/lib/entity-validation';

// ============================================================================
// Rectangle Shape
// ============================================================================

/**
 * Options for creating a rectangle
 */
export type CreateRectangleOptions = RectangularShapeOptions;

/**
 * Create a rectangle shape at the specified position
 *
 * @param x - X coordinate (top-left corner or center, depending on options)
 * @param y - Y coordinate (top-left corner or center, depending on options)
 * @param options - Optional configuration for the rectangle
 * @returns A Result containing the new rectangle shape or an error message
 *
 * @example
 * // Create a default rectangle centered at (100, 100)
 * const result = createRectangle(100, 100);
 * if (result.ok) {
 *   const rect = result.value;
 * }
 *
 * @example
 * // Create a custom-sized rectangle with specific colors
 * const result = createRectangle(100, 100, {
 *   width: 200,
 *   height: 150,
 *   fillColor: '#ff0000',
 *   strokeColor: '#000000',
 *   reference: 'top-left' // Position is top-left corner
 * });
 */
export function createRectangle(
  x: number,
  y: number,
  options: CreateRectangleOptions = {}
): Result<RectangleShape> {
  const {
    width = 120,
    height = 80,
    fillColor = CANVAS_COLORS.defaultShapeFill,
    strokeColor = CANVAS_COLORS.defaultShapeStroke,
    strokeWidth = STROKE_WIDTHS.shape,
    reference = 'center',
  } = options;

  // Calculate position using utility function
  const position = calculatePosition(x, y, width, height, { reference });

  const shape: RectangleShape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType: ShapeType.Rectangle,
    position,
    dimensions: {
      width,
      height,
    },
    fillColor,
    strokeColor,
    strokeWidth,
  };

  // Validate the created shape
  const validationResult = validateShape(shape);
  if (!validationResult.valid) {
    return err(`Rectangle validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(shape);
}

/**
 * Create a rectangle at a point (convenience function that always centers)
 *
 * @param x - X coordinate of center
 * @param y - Y coordinate of center
 * @returns A Result containing the new rectangle shape or an error message
 *
 * @example
 * const result = createRectangleAtPoint(100, 100);
 */
export function createRectangleAtPoint(x: number, y: number): Result<RectangleShape> {
  return createRectangle(x, y, { reference: 'center' });
}

// ============================================================================
// Shape Utilities
// ============================================================================

/**
 * Clone a shape with optional property overrides
 *
 * @param shape - Shape to clone
 * @param overrides - Properties to override in the cloned shape
 * @returns A Result containing the new shape with a new ID and overridden properties
 *
 * @example
 * const original = createRectangle(100, 100);
 * const result = cloneShape(original.value, { position: { x: 200, y: 200 } });
 */
export function cloneShape<T extends RectangleShape>(
  shape: T,
  overrides: Partial<T> = {}
): Result<T> {
  const cloned = {
    ...shape,
    ...overrides,
    id: generateShapeId(), // Always generate a new ID
  };

  // Validate the cloned shape
  const validationResult = validateShape(cloned);
  if (!validationResult.valid) {
    return err(`Cloned shape validation failed: ${validationResult.errors.join(', ')}`);
  }

  return ok(cloned);
}

/**
 * Create multiple rectangles in a grid pattern
 *
 * @param startX - Starting X coordinate
 * @param startY - Starting Y coordinate
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @param spacingX - Horizontal spacing between shapes
 * @param spacingY - Vertical spacing between shapes
 * @param options - Optional configuration for rectangles
 * @returns Result containing array of rectangle shapes or an error message
 *
 * @example
 * const result = createRectangleGrid(0, 0, 3, 3, 120, 120);
 * if (result.ok) {
 *   const grid = result.value; // Creates a 3x3 grid of rectangles
 * }
 */
export function createRectangleGrid(
  startX: number,
  startY: number,
  rows: number,
  cols: number,
  spacingX: number,
  spacingY: number,
  options: CreateRectangleOptions = {}
): Result<RectangleShape[]> {
  const shapes: RectangleShape[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;
      const result = createRectangle(x, y, { ...options, reference: 'top-left' });

      if (!result.ok) {
        return err(`Grid creation failed at row ${row}, col ${col}: ${result.error}`);
      }

      shapes.push(result.value);
    }
  }

  return ok(shapes);
}
