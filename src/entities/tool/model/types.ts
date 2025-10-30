import type { IconType } from 'react-icons';
import type { Shape } from '@/entities/shape/model/types';

/**
 * Tool types that can be included in toolsets
 */
export enum ToolType {
  /**
   * Simple declarative tools that create a single shape
   * Configuration-driven with no custom interaction logic
   */
  Simple = 'simple',

  /**
   * Complex tools with custom interaction code
   * For future use: tools that require multi-step interactions,
   * custom drawing logic, or stateful behavior
   */
  Complex = 'complex',
}

/**
 * Base configuration for all tools
 */
export interface BaseTool {
  /** Unique identifier for the tool */
  id: string;

  /** Display name for the tool */
  name: string;

  /** Description of what the tool does */
  description?: string;

  /** Icon component from react-icons */
  icon: IconType;

  /** Type of tool (simple or complex) */
  type: ToolType;
}

/**
 * Configuration for creating a shape
 */
export interface ShapeConfig {
  /** Type of shape to create (e.g., 'task', 'event', 'gateway') */
  shapeType: string;

  /** Optional shape subtype (e.g., 'start', 'end' for events; 'user', 'service' for tasks) */
  subType?: string;

  /** Default width of the shape */
  width?: number;

  /** Default height of the shape */
  height?: number;

  /** Fill color */
  fillColor?: string;

  /** Stroke color */
  strokeColor?: string;

  /** Stroke width */
  strokeWidth?: number;

  /** Text color for shape labels */
  textColor?: string;

  /** Additional shape-specific properties */
  properties?: Record<string, unknown>;
}

/**
 * Simple tool that creates a shape from declarative configuration
 */
export interface SimpleTool extends BaseTool {
  type: ToolType.Simple;

  /** Configuration for the shape this tool creates */
  shapeConfig: ShapeConfig;
}

/**
 * Complex tool with custom interaction logic
 * For future use when implementing tools that need custom behavior
 */
export interface ComplexTool extends BaseTool {
  type: ToolType.Complex;

  /** Custom function to create and configure the shape */
  createShape: (x: number, y: number) => Shape;

  /** Optional custom interaction handler */
  onInteraction?: (event: MouseEvent, canvas: HTMLCanvasElement) => void;
}

/**
 * Union type of all tool types
 */
export type Tool = SimpleTool | ComplexTool;

/**
 * A named collection of related tools
 */
export interface Toolset {
  /** Unique identifier for the toolset */
  id: string;

  /** Display name for the toolset */
  name: string;

  /** Description of the toolset */
  description?: string;

  /** Tools included in this toolset */
  tools: Tool[];
}
