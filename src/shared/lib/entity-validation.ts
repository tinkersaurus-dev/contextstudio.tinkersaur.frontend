/**
 * Entity Validation
 *
 * Provides validation functions for diagram entities (shapes and connectors)
 * using the Result type pattern for consistent error handling.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { Position, Dimensions } from '@/entities/diagram-entity';
import { ValidationResult, valid, invalid, combineValidations } from './result';

/**
 * Validate a position object
 *
 * @param position - Position to validate
 * @returns Validation result
 */
export function validatePosition(position: Position): ValidationResult {
  const errors: string[] = [];

  if (typeof position.x !== 'number' || !isFinite(position.x)) {
    errors.push('Position x must be a finite number');
  }

  if (typeof position.y !== 'number' || !isFinite(position.y)) {
    errors.push('Position y must be a finite number');
  }

  return errors.length > 0 ? invalid(...errors) : valid();
}

/**
 * Validate dimensions object
 *
 * @param dimensions - Dimensions to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateDimensions(
  dimensions: Dimensions,
  options: { allowZero?: boolean; allowNegative?: boolean } = {}
): ValidationResult {
  const { allowZero = false, allowNegative = false } = options;
  const errors: string[] = [];

  if (typeof dimensions.width !== 'number' || !isFinite(dimensions.width)) {
    errors.push('Dimension width must be a finite number');
  } else if (!allowNegative && dimensions.width < 0) {
    errors.push('Dimension width cannot be negative');
  } else if (!allowZero && dimensions.width === 0) {
    errors.push('Dimension width cannot be zero');
  }

  if (typeof dimensions.height !== 'number' || !isFinite(dimensions.height)) {
    errors.push('Dimension height must be a finite number');
  } else if (!allowNegative && dimensions.height < 0) {
    errors.push('Dimension height cannot be negative');
  } else if (!allowZero && dimensions.height === 0) {
    errors.push('Dimension height cannot be zero');
  }

  return errors.length > 0 ? invalid(...errors) : valid();
}

/**
 * Validate a color string
 *
 * @param color - Color string to validate
 * @returns Validation result
 */
export function validateColor(color: string): ValidationResult {
  if (typeof color !== 'string') {
    return invalid('Color must be a string');
  }

  // Basic validation - could be more sophisticated
  // Accepts hex colors, rgb/rgba, named colors, etc.
  if (color.length === 0) {
    return invalid('Color cannot be empty');
  }

  // Check for common color formats
  const isHex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
  const isRgb = /^rgba?\(/.test(color);
  const isNamedColor = color.length > 0 && /^[a-z]+$/i.test(color);

  if (!isHex && !isRgb && !isNamedColor) {
    return invalid('Color must be a valid hex, rgb/rgba, or named color');
  }

  return valid();
}

/**
 * Validate stroke width
 *
 * @param width - Stroke width to validate
 * @returns Validation result
 */
export function validateStrokeWidth(width: number): ValidationResult {
  if (typeof width !== 'number' || !isFinite(width)) {
    return invalid('Stroke width must be a finite number');
  }

  if (width < 0) {
    return invalid('Stroke width cannot be negative');
  }

  if (width > 100) {
    return invalid('Stroke width cannot exceed 100');
  }

  return valid();
}

/**
 * Validate a shape entity
 *
 * @param shape - Shape to validate
 * @returns Validation result with detailed error messages
 *
 * @example
 * ```typescript
 * const result = validateShape(shape);
 * if (!result.valid) {
 *   console.error('Shape validation failed:', result.errors);
 * }
 * ```
 */
export function validateShape(shape: Shape): ValidationResult {
  const results: ValidationResult[] = [];

  // Validate ID
  if (!shape.id || typeof shape.id !== 'string' || shape.id.trim().length === 0) {
    results.push(invalid('Shape must have a non-empty ID'));
  }

  // Validate position
  results.push(validatePosition(shape.position));

  // Validate dimensions (shapes must have positive dimensions)
  results.push(validateDimensions(shape.dimensions, { allowZero: false, allowNegative: false }));

  // Validate colors if provided
  if (shape.fillColor !== undefined) {
    const colorResult = validateColor(shape.fillColor);
    if (!colorResult.valid) {
      results.push(invalid(`Fill color invalid: ${colorResult.errors.join(', ')}`));
    }
  }

  if (shape.strokeColor !== undefined) {
    const colorResult = validateColor(shape.strokeColor);
    if (!colorResult.valid) {
      results.push(invalid(`Stroke color invalid: ${colorResult.errors.join(', ')}`));
    }
  }

  // Validate stroke width if provided
  if (shape.strokeWidth !== undefined) {
    const widthResult = validateStrokeWidth(shape.strokeWidth);
    if (!widthResult.valid) {
      results.push(invalid(`Stroke width invalid: ${widthResult.errors.join(', ')}`));
    }
  }

  return combineValidations(results);
}

/**
 * Validate a connector entity
 *
 * @param connector - Connector to validate
 * @param shapes - Optional map of shapes to validate connector endpoints
 * @returns Validation result with detailed error messages
 *
 * @example
 * ```typescript
 * const result = validateConnector(connector, shapesMap);
 * if (!result.valid) {
 *   console.error('Connector validation failed:', result.errors);
 * }
 * ```
 */
export function validateConnector(
  connector: Connector,
  shapes?: Map<string, Shape>
): ValidationResult {
  const results: ValidationResult[] = [];

  // Validate ID
  if (!connector.id || typeof connector.id !== 'string' || connector.id.trim().length === 0) {
    results.push(invalid('Connector must have a non-empty ID'));
  }

  // Validate source connection point
  if (!connector.source) {
    results.push(invalid('Connector must have a source connection point'));
  } else {
    if (!connector.source.shapeId || typeof connector.source.shapeId !== 'string') {
      results.push(invalid('Source connection point must have a valid shape ID'));
    }
    if (!connector.source.anchor || typeof connector.source.anchor !== 'string') {
      results.push(invalid('Source connection point must have a valid anchor'));
    }

    // Validate source shape exists if shapes map provided
    if (shapes && !shapes.has(connector.source.shapeId)) {
      results.push(invalid(`Source shape ${connector.source.shapeId} not found`));
    }
  }

  // Validate target connection point
  if (!connector.target) {
    results.push(invalid('Connector must have a target connection point'));
  } else {
    if (!connector.target.shapeId || typeof connector.target.shapeId !== 'string') {
      results.push(invalid('Target connection point must have a valid shape ID'));
    }
    if (!connector.target.anchor || typeof connector.target.anchor !== 'string') {
      results.push(invalid('Target connection point must have a valid anchor'));
    }

    // Validate target shape exists if shapes map provided
    if (shapes && !shapes.has(connector.target.shapeId)) {
      results.push(invalid(`Target shape ${connector.target.shapeId} not found`));
    }
  }

  // Validate colors if provided
  if (connector.strokeColor !== undefined) {
    const colorResult = validateColor(connector.strokeColor);
    if (!colorResult.valid) {
      results.push(invalid(`Stroke color invalid: ${colorResult.errors.join(', ')}`));
    }
  }

  // Validate stroke width if provided
  if (connector.strokeWidth !== undefined) {
    const widthResult = validateStrokeWidth(connector.strokeWidth);
    if (!widthResult.valid) {
      results.push(invalid(`Stroke width invalid: ${widthResult.errors.join(', ')}`));
    }
  }

  // Validate position and dimensions
  results.push(validatePosition(connector.position));
  results.push(
    validateDimensions(connector.dimensions, { allowZero: true, allowNegative: false })
  );

  return combineValidations(results);
}

/**
 * Options for entity validation
 */
export interface EntityValidationOptions {
  /** Whether to check if connector endpoints reference existing shapes */
  validateConnectorEndpoints?: boolean;
  /** Map of shapes for connector endpoint validation */
  shapes?: Map<string, Shape>;
}

/**
 * Validate any diagram entity (shape or connector)
 *
 * @param entity - Entity to validate
 * @param options - Validation options
 * @returns Validation result
 *
 * @example
 * ```typescript
 * const result = validateEntity(entity, { validateConnectorEndpoints: true, shapes: shapesMap });
 * if (!result.valid) {
 *   console.error('Entity validation failed:', result.errors);
 * }
 * ```
 */
export function validateEntity(
  entity: Shape | Connector,
  options: EntityValidationOptions = {}
): ValidationResult {
  // Check if it's a connector by checking for source/target properties
  const isConnector = 'source' in entity && 'target' in entity;

  if (isConnector) {
    const shapes = options.validateConnectorEndpoints ? options.shapes : undefined;
    return validateConnector(entity as Connector, shapes);
  } else {
    return validateShape(entity as Shape);
  }
}
