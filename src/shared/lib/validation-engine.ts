/**
 * ValidationEngine - Centralized validation system with fluent builder pattern
 *
 * This module provides a composable, type-safe validation framework that
 * separates validation logic from error handling and logging.
 */

import type { Shape } from '@/entities/shape';
import type { Connector, AnchorPosition } from '@/entities/connector';

/**
 * Result of a validation operation
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

/**
 * Context object for validation rules that need external data
 */
export type ValidationContext<T = unknown> = T;

/**
 * A validation rule that can be applied to an entity
 */
export interface ValidationRule<TEntity, TContext = unknown> {
  /**
   * Name of the rule for debugging
   */
  name: string;

  /**
   * Execute the validation rule
   * @param entity The entity to validate
   * @param context Optional context for cross-entity validation
   * @returns ValidationResult with success or error messages
   */
  validate(
    entity: TEntity,
    context?: ValidationContext<TContext>
  ): ValidationResult;
}

/**
 * Fluent builder for constructing validation chains
 */
export class ValidationBuilder<TEntity, TContext = unknown> {
  private entity: TEntity;
  private context?: ValidationContext<TContext>;
  private _rules: ValidationRule<TEntity, TContext>[] = [];

  constructor(entity: TEntity) {
    this.entity = entity;
  }

  /**
   * Add validation context for cross-entity validation
   */
  withContext(context: ValidationContext<TContext>): this {
    this.context = context;
    return this;
  }

  /**
   * Add a validation rule to the chain
   */
  rule(rule: ValidationRule<TEntity, TContext>): this {
    this._rules.push(rule);
    return this;
  }

  /**
   * Add multiple validation rules at once
   */
  rules(...rulesToAdd: ValidationRule<TEntity, TContext>[]): this {
    this._rules.push(...rulesToAdd);
    return this;
  }

  /**
   * Execute all validation rules and return combined result
   */
  execute(): ValidationResult {
    const errors: string[] = [];

    for (const rule of this._rules) {
      const result = rule.validate(this.entity, this.context);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }

    return errors.length === 0 ? { valid: true } : { valid: false, errors };
  }
}

/**
 * Main validation engine - entry point for all validation operations
 */
export class ValidationEngine {
  /**
   * Start building a validation chain for an entity
   */
  static for<TEntity, TContext = unknown>(
    entity: TEntity
  ): ValidationBuilder<TEntity, TContext> {
    return new ValidationBuilder<TEntity, TContext>(entity);
  }

  /**
   * Validate a single entity with a single rule
   */
  static validate<TEntity, TContext = unknown>(
    entity: TEntity,
    rule: ValidationRule<TEntity, TContext>,
    context?: ValidationContext<TContext>
  ): ValidationResult {
    return rule.validate(entity, context);
  }

  /**
   * Validate multiple entities with the same rule
   */
  static validateMany<TEntity, TContext = unknown>(
    entities: TEntity[],
    rule: ValidationRule<TEntity, TContext>,
    context?: ValidationContext<TContext>
  ): ValidationResult {
    const errors: string[] = [];

    for (let i = 0; i < entities.length; i++) {
      const result = rule.validate(entities[i], context);
      if (!result.valid) {
        const prefixedErrors = result.errors.map(
          (err) => `Entity ${i}: ${err}`
        );
        errors.push(...prefixedErrors);
      }
    }

    return errors.length === 0 ? { valid: true } : { valid: false, errors };
  }

  /**
   * Combine multiple validation results into one
   */
  static combine(...results: ValidationResult[]): ValidationResult {
    const errors: string[] = [];

    for (const result of results) {
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }

    return errors.length === 0 ? { valid: true } : { valid: false, errors };
  }
}

/**
 * Helper to create a successful validation result
 */
export const valid = (): ValidationResult => ({ valid: true });

/**
 * Helper to create a failed validation result
 */
export const invalid = (...errors: string[]): ValidationResult => ({
  valid: false,
  errors,
});

/**
 * Helper to combine multiple validation results
 */
export const combineValidations = (
  ...results: ValidationResult[]
): ValidationResult => {
  return ValidationEngine.combine(...results);
};

// =============================================================================
// VALIDATION RULES
// =============================================================================

/**
 * Rule: Validates entity ID
 */
export const entityIdRule: ValidationRule<{ id: string }> = {
  name: 'entityId',
  validate: (entity) => {
    if (!entity.id || typeof entity.id !== 'string') {
      return invalid('Entity ID is required and must be a string');
    }
    if (entity.id.trim().length === 0) {
      return invalid('Entity ID cannot be empty');
    }
    return valid();
  },
};

/**
 * Rule: Validates anchor position
 */
export const anchorRule: ValidationRule<{ anchor: AnchorPosition }> = {
  name: 'anchor',
  validate: (entity) => {
    const validAnchors: AnchorPosition[] = [
      'n',
      's',
      'e',
      'w',
      'ne',
      'nw',
      'se',
      'sw',
      'center',
    ];

    if (!validAnchors.includes(entity.anchor)) {
      return invalid(
        `Invalid anchor: ${entity.anchor}. Must be one of: ${validAnchors.join(', ')}`
      );
    }

    return valid();
  },
};

/**
 * Rule: Validates position (x, y coordinates)
 */
export const positionRule: ValidationRule<{ position: { x: number; y: number } }> =
  {
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

      return errors.length === 0 ? valid() : invalid(...errors);
    },
  };

/**
 * Rule: Validates dimensions (width, height)
 */
export const dimensionsRule: ValidationRule<
  { dimensions: { width: number; height: number } },
  { allowZero?: boolean; allowNegative?: boolean }
> = {
  name: 'dimensions',
  validate: (entity, context) => {
    const errors: string[] = [];
    const { width, height } = entity.dimensions;
    const allowZero = context?.allowZero ?? false;
    const allowNegative = context?.allowNegative ?? false;

    // Check width
    if (typeof width !== 'number' || !Number.isFinite(width)) {
      errors.push('Width must be a finite number');
    } else {
      if (!allowNegative && width < 0) {
        errors.push('Width cannot be negative');
      }
      if (!allowZero && width === 0) {
        errors.push('Width cannot be zero');
      }
    }

    // Check height
    if (typeof height !== 'number' || !Number.isFinite(height)) {
      errors.push('Height must be a finite number');
    } else {
      if (!allowNegative && height < 0) {
        errors.push('Height cannot be negative');
      }
      if (!allowZero && height === 0) {
        errors.push('Height cannot be zero');
      }
    }

    return errors.length === 0 ? valid() : invalid(...errors);
  },
};

/**
 * Rule: Validates color format
 */
export const colorRule: ValidationRule<{ color: string }> = {
  name: 'color',
  validate: (entity) => {
    const color = entity.color;

    if (!color || typeof color !== 'string') {
      return invalid('Color must be a non-empty string');
    }

    // Check for valid color formats
    const hexPattern = /^#([0-9A-Fa-f]{3}){1,2}$/;
    const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
    const namedColors = ['transparent', 'currentColor'];

    const isValidHex = hexPattern.test(color);
    const isValidRgb = rgbPattern.test(color);
    const isNamedColor = namedColors.includes(color);

    if (!isValidHex && !isValidRgb && !isNamedColor) {
      return invalid(
        `Invalid color format: ${color}. Expected hex (#RGB or #RRGGBB), rgb/rgba, or named color`
      );
    }

    return valid();
  },
};

/**
 * Rule: Validates stroke width
 */
export const strokeWidthRule: ValidationRule<{ strokeWidth: number }> = {
  name: 'strokeWidth',
  validate: (entity) => {
    const { strokeWidth } = entity;

    if (typeof strokeWidth !== 'number' || !Number.isFinite(strokeWidth)) {
      return invalid('Stroke width must be a finite number');
    }

    if (strokeWidth < 0 || strokeWidth > 100) {
      return invalid('Stroke width must be between 0 and 100');
    }

    return valid();
  },
};

/**
 * Rule: Validates connection point structure
 */
export const connectionPointRule: ValidationRule<{
  shapeId: string;
  anchor: AnchorPosition;
}> = {
  name: 'connectionPoint',
  validate: (point) => {
    return ValidationEngine.for(point)
      .rule({
        name: 'shapeId',
        validate: (p) => {
          if (!p.shapeId || typeof p.shapeId !== 'string') {
            return invalid('Connection point shapeId is required and must be a string');
          }
          if (p.shapeId.trim().length === 0) {
            return invalid('Connection point shapeId cannot be empty');
          }
          return valid();
        },
      })
      .rule(anchorRule)
      .execute();
  },
};

/**
 * Rule: Validates connector endpoints exist in shapes map
 */
export const connectorEndpointsExistRule: ValidationRule<
  Connector,
  { shapes: Map<string, Shape> }
> = {
  name: 'connectorEndpointsExist',
  validate: (connector, context) => {
    if (!context?.shapes) {
      return invalid('Shapes map context is required for endpoint validation');
    }

    const errors: string[] = [];
    const { source, target } = connector;

    if (!context.shapes.has(source.shapeId)) {
      errors.push(`Source shape with ID ${source.shapeId} does not exist`);
    }

    if (!context.shapes.has(target.shapeId)) {
      errors.push(`Target shape with ID ${target.shapeId} does not exist`);
    }

    return errors.length === 0 ? valid() : invalid(...errors);
  },
};

/**
 * Composite Rule: Validates complete shape entity
 */
export const shapeRule: ValidationRule<Shape> = {
  name: 'shape',
  validate: (shape) => {
    const builder = ValidationEngine.for(shape)
      .rule(entityIdRule)
      .rule(positionRule)
      .rule(dimensionsRule);

    // Validate optional fillColor
    if (shape.fillColor !== undefined) {
      builder.rule({
        name: 'shapeFillColor',
        validate: (s) => {
          return ValidationEngine.validate({ color: s.fillColor! }, colorRule);
        },
      });
    }

    // Validate optional strokeColor
    if (shape.strokeColor !== undefined) {
      builder.rule({
        name: 'shapeStrokeColor',
        validate: (s) => {
          return ValidationEngine.validate({ color: s.strokeColor! }, colorRule);
        },
      });
    }

    // Validate optional strokeWidth
    if (shape.strokeWidth !== undefined) {
      builder.rule({
        name: 'shapeStrokeWidth',
        validate: (s) => {
          return ValidationEngine.validate({ strokeWidth: s.strokeWidth! }, strokeWidthRule);
        },
      });
    }

    return builder.execute();
  },
};

/**
 * Composite Rule: Validates complete connector entity
 */
export const connectorRule: ValidationRule<
  Connector,
  { shapes?: Map<string, Shape> }
> = {
  name: 'connector',
  validate: (connector, context) => {
    const builder = ValidationEngine.for(connector)
      .rule(entityIdRule)
      .rule({
        name: 'connectorSource',
        validate: (c) => connectionPointRule.validate(c.source),
      })
      .rule({
        name: 'connectorTarget',
        validate: (c) => connectionPointRule.validate(c.target),
      });

    // Validate optional strokeColor
    if (connector.strokeColor !== undefined) {
      builder.rule({
        name: 'connectorStrokeColor',
        validate: (c) => colorRule.validate({ color: c.strokeColor! }),
      });
    }

    // Validate optional strokeWidth
    if (connector.strokeWidth !== undefined) {
      builder.rule({
        name: 'connectorStrokeWidth',
        validate: (c) => {
          return ValidationEngine.validate({ strokeWidth: c.strokeWidth! }, strokeWidthRule);
        },
      });
    }

    // Add endpoint existence validation if shapes map is provided
    if (context?.shapes) {
      builder.withContext(context).rule(connectorEndpointsExistRule);
    }

    return builder.execute();
  },
};

/**
 * Rule: Validates generic diagram entity (shape or connector)
 */
export const entityRule: ValidationRule<
  Shape | Connector,
  { shapes?: Map<string, Shape> }
> = {
  name: 'entity',
  validate: (entity, context) => {
    // Type discrimination based on entity structure
    if ('source' in entity && 'target' in entity) {
      return connectorRule.validate(entity as Connector, context);
    } else if ('shapeType' in entity) {
      return shapeRule.validate(entity as Shape);
    } else {
      return invalid('Unknown entity type: must be Shape or Connector');
    }
  },
};
