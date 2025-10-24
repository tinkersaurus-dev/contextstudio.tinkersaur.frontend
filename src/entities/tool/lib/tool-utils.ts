/**
 * Tool Utilities
 *
 * Helper functions for working with tools and creating shapes from tool configurations.
 */

import type { Tool, SimpleTool } from '../model/types';
import { ShapeType, type Shape } from '@/entities/shape/model/types';
import {
  createRectangle,
  createTask,
  createStartEvent,
  createEndEvent,
  createGateway,
  createPool,
} from '@/entities/shape/lib/shape-factory';

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
    width,
    height,
    fillColor,
    strokeColor,
    strokeWidth,
    properties = {},
  } = shapeConfig;

  // Create shape based on type
  switch (shapeType) {
    case ShapeType.Rectangle:
      return createRectangle(x, y, {
        width,
        height,
        fillColor,
        strokeColor,
        strokeWidth,
        centered: true,
      });

    case ShapeType.Task:
      return createTask(x, y, {
        width,
        height,
        cornerRadius: properties.cornerRadius as number | undefined,
        fillColor,
        strokeColor,
        strokeWidth,
        centered: true,
      });

    case ShapeType.StartEvent:
      return createStartEvent(x, y, {
        diameter: width,
        fillColor,
        strokeColor,
        strokeWidth,
        centered: true,
      });

    case ShapeType.EndEvent:
      return createEndEvent(x, y, {
        diameter: width,
        fillColor,
        strokeColor,
        strokeWidth,
        centered: true,
      });

    case ShapeType.Gateway:
      return createGateway(x, y, {
        size: width,
        fillColor,
        strokeColor,
        strokeWidth,
        centered: true,
      });

    case ShapeType.Pool:
      return createPool(x, y, {
        width,
        height,
        fillColor,
        strokeColor,
        strokeWidth,
        centered: true,
      });

    default:
      // Fallback to rectangle if unknown type
      console.warn(`Unknown shape type: ${shapeType}, falling back to rectangle`);
      return createRectangle(x, y, {
        width: width || 120,
        height: height || 80,
        fillColor,
        strokeColor,
        strokeWidth,
        centered: true,
      });
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
