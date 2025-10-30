/**
 * Tool Utilities
 *
 * Helper functions for working with tools and creating shapes from tool configurations.
 */

import type { Tool, SimpleTool } from '../model/types';
import type { Shape } from '@/entities/shape/model/types';
import {
  createRectangle,
  createTask,
  createEvent,
  createGateway,
  createPool,
} from '@/entities/shape/lib/shape-factory';
import { unwrap } from '@/shared/lib/result';

/**
 * Create a shape from a simple tool configuration
 *
 * @param tool - The simple tool to create a shape from
 * @param x - X coordinate (world space)
 * @param y - Y coordinate (world space)
 * @returns A new shape entity
 */
export function createShapeFromTool(tool: SimpleTool, x: number, y: number): Shape {
  const { shapeConfig } = tool;
  const {
    shapeType,
    subType,
    width,
    height,
    fillColor,
    strokeColor,
    strokeWidth,
    textColor,
    properties = {},
  } = shapeConfig;

  // Create shape based on type
  // All factory functions now return Result<Shape>, so we unwrap them
  // If validation fails, unwrap will throw, which is appropriate for this use case
  // since invalid tool configurations should be caught during development
  switch (shapeType) {
    case 'rectangle':
      return unwrap(createRectangle(x, y, {
        width,
        height,
        fillColor,
        strokeColor,
        strokeWidth,
        textColor,
        reference: 'center',
      }));

    case 'task':
      return unwrap(createTask(x, y, {
        width,
        height,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subType: subType as any, // Cast to TaskSubType
        cornerRadius: properties.cornerRadius as number | undefined,
        fillColor,
        strokeColor,
        strokeWidth,
        textColor,
        reference: 'center',
      }));

    case 'event':
      // Event requires a subType
      if (!subType) {
        console.warn('Event shape created without subType, defaulting to "start"');
      }
      return unwrap(createEvent(x, y, {
        diameter: width,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subType: (subType || 'start') as any, // Cast to EventSubType
        fillColor,
        strokeColor,
        strokeWidth,
        textColor,
        reference: 'center',
      }));

    case 'gateway':
      return unwrap(createGateway(x, y, {
        size: width,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        subType: subType as any, // Cast to GatewaySubType
        fillColor,
        strokeColor,
        strokeWidth,
        textColor,
        reference: 'center',
      }));

    case 'pool':
      return unwrap(createPool(x, y, {
        width,
        height,
        fillColor,
        strokeColor,
        strokeWidth,
        textColor,
        reference: 'center',
      }));

    default:
      // Fallback to rectangle if unknown type
      console.warn(`Unknown shape type: ${shapeType}, falling back to rectangle`);
      return unwrap(createRectangle(x, y, {
        width: width || 120,
        height: height || 80,
        fillColor,
        strokeColor,
        strokeWidth,
        textColor,
        reference: 'center',
      }));
  }
}

/**
 * Check if a tool is a simple tool
 *
 * @param tool - Tool to check
 * @returns True if the tool is a simple tool
 */
export function isSimpleTool(tool: Tool): tool is SimpleTool {
  return tool.type === 'simple';
}
