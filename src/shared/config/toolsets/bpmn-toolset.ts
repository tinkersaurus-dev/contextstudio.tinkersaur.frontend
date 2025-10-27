/**
 * BPMN Toolset Configuration
 *
 * Defines the BPMN (Business Process Model and Notation) toolset
 * with basic shapes for process modeling.
 *
 * Colors are loaded from the active theme system.
 */

import { LuSquare, LuCircle, LuCircleDot, LuDiamond, LuRectangleHorizontal } from 'react-icons/lu';
import { ToolType, type Toolset } from '@/entities/tool';
import { ShapeType } from '@/entities/shape/model/types';
import { activeTheme } from '@/app/theme';

/**
 * BPMN Toolset
 *
 * Contains essential BPMN shapes for creating business process diagrams:
 * - Task: A unit of work within a process
 * - Start Event: The beginning of a process
 * - End Event: The conclusion of a process
 * - Gateway: A decision point in the process flow
 * - Pool: A container for grouping related processes
 */
export const bpmnToolset: Toolset = {
  id: 'bpmn',
  name: 'BPMN',
  description: 'Business Process Model and Notation shapes',
  tools: [
    {
      id: 'bpmn-task',
      name: 'Task',
      description: 'A unit of work within a process',
      icon: LuSquare,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 120,
        height: 80,
        fillColor: activeTheme.diagrams.bpmn.task.fill,
        strokeColor: activeTheme.diagrams.bpmn.task.stroke,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 8,
        },
      },
    },
    {
      id: 'bpmn-start-event',
      name: 'Start Event',
      description: 'The beginning of a process',
      icon: LuCircle,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.StartEvent,
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
      },
    },
    {
      id: 'bpmn-end-event',
      name: 'End Event',
      description: 'The conclusion of a process',
      icon: LuCircleDot,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.EndEvent,
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
      },
    },
    {
      id: 'bpmn-gateway',
      name: 'Gateway',
      description: 'A decision point in the process flow',
      icon: LuDiamond,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Gateway,
        width: 50,
        height: 50,
        fillColor: activeTheme.diagrams.bpmn.gateway.fill,
        strokeColor: activeTheme.diagrams.bpmn.gateway.stroke,
        strokeWidth: 0.5,
      },
    },
    {
      id: 'bpmn-pool',
      name: 'Pool',
      description: 'A container for grouping related processes',
      icon: LuRectangleHorizontal,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Pool,
        width: 600,
        height: 200,
        fillColor: activeTheme.diagrams.bpmn.pool.fill,
        strokeColor: activeTheme.diagrams.bpmn.pool.stroke,
        strokeWidth: 0.5,
      },
    },
  ],
};
