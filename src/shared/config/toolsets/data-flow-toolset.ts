/**
 * Data Flow Diagram Toolset Configuration
 *
 * Defines the toolset for data flow diagrams showing how data
 * moves through a system.
 *
 * Colors are loaded from the active theme system.
 */

import { LuCircle, LuSquare, LuDatabase, LuArrowRight } from 'react-icons/lu';
import { ToolType, type Toolset } from '@/entities/tool';
import { ShapeType } from '@/entities/shape/model/types';
import { activeTheme } from '@/app/theme';

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
        fillColor: activeTheme.diagrams.dataFlow.process.fill,
        strokeColor: activeTheme.diagrams.dataFlow.process.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
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
        fillColor: activeTheme.diagrams.dataFlow.dataStore.fill,
        strokeColor: activeTheme.diagrams.dataFlow.dataStore.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
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
        fillColor: activeTheme.diagrams.dataFlow.entity.fill,
        strokeColor: activeTheme.diagrams.dataFlow.entity.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
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
        fillColor: activeTheme.diagrams.dataFlow.subprocess.fill,
        strokeColor: activeTheme.diagrams.dataFlow.subprocess.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
        properties: {
          cornerRadius: 8,
        },
      },
    },
  ],
};
