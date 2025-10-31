/**
 * Data Flow Diagram Toolset Configuration
 *
 * Defines the toolset for data flow diagrams showing how data
 * moves through a system.
 *
 * Shapes use theme colors dynamically - no colors are set at initialization.
 */

import { LuCircle, LuSquare, LuDatabase, LuArrowRight } from 'react-icons/lu';
import { ToolType, type Toolset } from '@/entities/tool';
import { ShapeType } from '@/entities/shape/model/types';

/**
 * Data Flow Diagram Toolset
 *
 * Contains shapes for creating data flow diagrams:
 * - Process: A transformation or operation on data
 * - Data Store: A repository of data
 * - External Entity: An outside source or destination of data
 * - Data Flow: Movement of data (represented as connector)
 */
export const dataFlowToolset: Toolset = {
  id: 'dataflow',
  name: 'Data Flow',
  description: 'Data flow diagram shapes for system modeling',
  tools: [
    {
      id: 'dfd-process',
      name: 'Process',
      description: 'A transformation or operation',
      icon: LuCircle,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.StartEvent,
        width: 100,
        height: 100,
        strokeWidth: 0.5,
      },
    },
    {
      id: 'dfd-datastore',
      name: 'Data Store',
      description: 'A repository of data',
      icon: LuDatabase,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 140,
        height: 60,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 4,
        },
      },
    },
    {
      id: 'dfd-external',
      name: 'External Entity',
      description: 'Outside source or destination',
      icon: LuSquare,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 100,
        height: 80,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 2,
        },
      },
    },
    {
      id: 'dfd-subprocess',
      name: 'Subprocess',
      description: 'A detailed process breakdown',
      icon: LuArrowRight,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 120,
        height: 80,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 8,
        },
      },
    },
  ],
};
