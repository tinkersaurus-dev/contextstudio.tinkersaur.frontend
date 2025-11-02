/**
 * Base Shape Factory Utilities
 *
 * Shared utilities to reduce duplication across shape factory functions.
 * Centralizes common patterns like ID generation, position calculation,
 * text configuration, and validation.
 */

import { DiagramEntityType } from '@/entities/diagram-entity';
import { generateShapeId } from '@/shared/lib/core/id-generator';
import { calculatePosition } from '@/shared/lib/geometry';
import { getDefaultTextConfig } from '@/shared/lib/rendering';
import { validateShape } from '@/shared/lib/entities';
import { Result, ok, err } from '@/shared/lib/core/result';
import { STROKE_WIDTHS } from '@/shared/config/canvas-config';
import type { BaseCreateShapeOptions } from './base-factory-types';
import type { BaseShape } from '../../model/types';

/**
 * Configuration for creating a base shape
 */
export interface CreateShapeBaseConfig<T extends BaseShape> {
  /** X coordinate */
  x: number;
  /** Y coordinate */
  y: number;
  /** Width of the shape (for rectangular shapes) */
  width?: number;
  /** Height of the shape (for rectangular shapes) */
  height?: number;
  /** Size (for square shapes) */
  size?: number;
  /** Diameter (for circular shapes) */
  diameter?: number;
  /** Shape type identifier */
  shapeType: string;
  /** User-provided options */
  options: BaseCreateShapeOptions;
  /** Additional shape-specific properties */
  shapeSpecificProps: Partial<T>;
}

/**
 * Create a base shape with all common properties and validations
 *
 * This utility function eliminates duplication across shape factories by:
 * - Generating unique IDs
 * - Calculating positions based on reference points
 * - Setting up text configuration
 * - Applying color and stroke properties
 * - Validating the created shape
 * - Wrapping the result in Result<T>
 *
 * @param config - Configuration for creating the shape
 * @returns A Result containing the new shape or an error message
 *
 * @example
 * ```typescript
 * const result = createShapeBase<RectangleShape>({
 *   x: 100,
 *   y: 100,
 *   width: 120,
 *   height: 80,
 *   shapeType: 'rectangle',
 *   options: { fillColor: '#fff' },
 *   shapeSpecificProps: {},
 * });
 * ```
 */
export function createShapeBase<T extends BaseShape>(
  config: CreateShapeBaseConfig<T>
): Result<T> {
  const {
    x,
    y,
    width,
    height,
    size,
    diameter,
    shapeType,
    options,
    shapeSpecificProps,
  } = config;

  // Extract common options with defaults
  const {
    fillColor,
    strokeColor,
    strokeWidth = STROKE_WIDTHS.shape,
    textColor,
    reference = 'center',
  } = options;

  // Determine actual dimensions based on shape type
  let actualWidth: number;
  let actualHeight: number;

  if (diameter !== undefined) {
    // Circular shapes
    actualWidth = actualHeight = diameter;
  } else if (size !== undefined) {
    // Square shapes
    actualWidth = actualHeight = size;
  } else {
    // Rectangular shapes
    actualWidth = width ?? 120;
    actualHeight = height ?? 80;
  }

  // Calculate position using utility function
  const position = calculatePosition(x, y, actualWidth, actualHeight, { reference });

  // Get default text configuration for this shape type
  const textConfig = getDefaultTextConfig(shapeType);

  // Build the complete shape object
  const shape = {
    id: generateShapeId(),
    type: DiagramEntityType.Shape,
    shapeType,
    position,
    dimensions: {
      width: actualWidth,
      height: actualHeight,
    },
    fillColor,
    strokeColor,
    strokeWidth,
    textColor,
    text: '',
    textWrap: true,
    maxLines: textConfig.maxLines,
    textTruncation: 'ellipsis' as const,
    textPlacement: textConfig.placement,
    lineHeight: textConfig.lineHeight,
    // Merge in shape-specific properties
    ...shapeSpecificProps,
  } as T;

  // Validate the created shape (cast to any to bypass the type check)
  // The shape is structurally correct, but TypeScript can't guarantee it at compile time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const validationResult = validateShape(shape as any);
  if (!validationResult.valid) {
    return err(
      `${shapeType} shape validation failed: ${validationResult.errors.join(', ')}`
    );
  }

  return ok(shape);
}

/**
 * Helper to create rectangular shape dimensions config
 */
export function rectangularDimensions(width?: number, height?: number) {
  return { width: width ?? 120, height: height ?? 80 };
}

/**
 * Helper to create circular shape dimensions config
 */
export function circularDimensions(diameter?: number) {
  return { diameter: diameter ?? 40 };
}

/**
 * Helper to create square shape dimensions config
 */
export function squareDimensions(size?: number) {
  return { size: size ?? 40 };
}
