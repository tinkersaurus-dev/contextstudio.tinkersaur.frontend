/**
 * Entity Validation
 *
 * Provides validation functions for diagram entities (shapes and connectors)
 * using the ValidationEngine for consistent, reusable validation rules.
 *
 * This module serves as a bridge between the ValidationEngine and the rest
 * of the codebase, providing convenient validation functions with the same
 * API as before but powered by the ValidationEngine internally.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { Position, Dimensions } from '@/entities/diagram-entity';
import {
  ValidationEngine,
  type ValidationResult,
  shapeRule,
  connectorRule,
  entityRule,
} from '../core/validation-engine';

// Re-export ValidationResult and helpers for convenience
export type { ValidationResult };
export { valid, invalid, combineValidations } from '../core/validation-engine';

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
  return ValidationEngine.validate(shape, shapeRule);
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
  return ValidationEngine.for(connector)
    .withContext({ shapes })
    .rule(connectorRule)
    .execute();
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
  const shapes = options.validateConnectorEndpoints ? options.shapes : undefined;
  return ValidationEngine.for(entity)
    .withContext({ shapes })
    .rule(entityRule)
    .execute();
}

/**
 * Validate a position object
 *
 * @param position - Position to validate
 * @returns Validation result
 */
export function validatePosition(position: Position): ValidationResult {
  return ValidationEngine.validate({ position }, {
    name: 'position',
    validate: (entity) => {
      const errors: string[] = [];

      if (
        typeof entity.position.x !== 'number' ||
        !Number.isFinite(entity.position.x)
      ) {
        errors.push('Position x must be a finite number');
      }

      if (
        typeof entity.position.y !== 'number' ||
        !Number.isFinite(entity.position.y)
      ) {
        errors.push('Position y must be a finite number');
      }

      return errors.length === 0
        ? { valid: true }
        : { valid: false, errors };
    },
  });
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
  return ValidationEngine.validate(
    { dimensions },
    {
      name: 'dimensions',
      validate: (entity, context) => {
        const errors: string[] = [];
        const { width, height } = entity.dimensions;
        const allowZero = context?.allowZero ?? options.allowZero ?? false;
        const allowNegative = context?.allowNegative ?? options.allowNegative ?? false;

        // Check width
        if (typeof width !== 'number' || !Number.isFinite(width)) {
          errors.push('Dimension width must be a finite number');
        } else {
          if (!allowNegative && width < 0) {
            errors.push('Dimension width cannot be negative');
          }
          if (!allowZero && width === 0) {
            errors.push('Dimension width cannot be zero');
          }
        }

        // Check height
        if (typeof height !== 'number' || !Number.isFinite(height)) {
          errors.push('Dimension height must be a finite number');
        } else {
          if (!allowNegative && height < 0) {
            errors.push('Dimension height cannot be negative');
          }
          if (!allowZero && height === 0) {
            errors.push('Dimension height cannot be zero');
          }
        }

        return errors.length === 0
          ? { valid: true }
          : { valid: false, errors };
      },
    },
    options
  );
}

/**
 * Validate a color string
 *
 * @param color - Color string to validate
 * @returns Validation result
 */
export function validateColor(color: string): ValidationResult {
  return ValidationEngine.validate({ color }, {
    name: 'color',
    validate: (entity) => {
      const c = entity.color;

      if (!c || typeof c !== 'string') {
        return { valid: false, errors: ['Color must be a non-empty string'] };
      }

      // Check for valid color formats
      const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
      const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
      const namedColors = ['transparent', 'currentColor'];

      const isValidHex = hexPattern.test(c);
      const isValidRgb = rgbPattern.test(c);
      const isNamedColor = namedColors.includes(c) || /^[a-z]+$/i.test(c);

      if (!isValidHex && !isValidRgb && !isNamedColor) {
        return {
          valid: false,
          errors: [
            `Invalid color format: ${c}. Expected hex (#RGB or #RRGGBB), rgb/rgba, or named color`,
          ],
        };
      }

      return { valid: true };
    },
  });
}

/**
 * Validate stroke width
 *
 * @param width - Stroke width to validate
 * @returns Validation result
 */
export function validateStrokeWidth(width: number): ValidationResult {
  return ValidationEngine.validate({ strokeWidth: width }, {
    name: 'strokeWidth',
    validate: (entity) => {
      const w = entity.strokeWidth;

      if (typeof w !== 'number' || !Number.isFinite(w)) {
        return { valid: false, errors: ['Stroke width must be a finite number'] };
      }

      if (w < 0) {
        return { valid: false, errors: ['Stroke width cannot be negative'] };
      }

      if (w > 100) {
        return { valid: false, errors: ['Stroke width cannot exceed 100'] };
      }

      return { valid: true };
    },
  });
}

/**
 * Validate an anchor position value
 *
 * @param anchor - Anchor to validate
 * @returns Validation result
 */
export function validateAnchor(anchor: unknown): ValidationResult {
  return ValidationEngine.validate({ anchor }, {
    name: 'anchor',
    validate: (entity) => {
      const validAnchors = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'center'];

      if (typeof entity.anchor !== 'string') {
        return { valid: false, errors: ['Anchor must be a string'] };
      }

      if (!validAnchors.includes(entity.anchor)) {
        return {
          valid: false,
          errors: [
            `Anchor must be one of: ${validAnchors.join(', ')}. Got: ${entity.anchor}`,
          ],
        };
      }

      return { valid: true };
    },
  });
}
