/**
 * BPMN Toolset Configuration
 *
 * Defines the BPMN (Business Process Model and Notation) toolset
 * with basic shapes for process modeling.
 *
 * Colors are loaded from the active theme system.
 */

import {
  // Task icons
  LuUser,
  LuCog,
  LuCode,
  // Event icons
  LuPlay,
  LuSquare,
  LuTimer,
  LuCircleAlert,
  LuArrowUp,
  LuArrowDown,
  // Gateway icons
  LuGitBranch,
  LuGitMerge,
  LuColumns2,
} from 'react-icons/lu';
import { ToolType, type Toolset } from '@/entities/tool';
import { activeTheme } from '@/app/theme';

/**
 * BPMN Toolset
 *
 * Contains BPMN shapes organized by category:
 * Row 1 - Tasks: User, Service, Script
 * Row 2 - Events: Start, End, Timer, Error, Throwing, Catching
 * Row 3 - Gateways: Exclusive, Inclusive, Parallel
 */
export const bpmnToolset: Toolset = {
  id: 'bpmn',
  name: 'BPMN',
  description: 'Business Process Model and Notation shapes',
  tools: [
    // ============================================================================
    // Row 1: Tasks
    // ============================================================================
    {
      id: 'bpmn-user-task',
      name: 'User Task',
      description: 'A task performed by a human user',
      icon: LuUser,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'task',
        subType: 'user',
        width: 120,
        height: 80,
        fillColor: activeTheme.diagrams.bpmn.task.fill,
        strokeColor: activeTheme.diagrams.bpmn.task.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
        properties: {
          cornerRadius: 8,
        },
      },
    },
    {
      id: 'bpmn-service-task',
      name: 'Service Task',
      description: 'An automated system service or API call',
      icon: LuCog,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'task',
        subType: 'service',
        width: 120,
        height: 80,
        fillColor: activeTheme.diagrams.bpmn.task.fill,
        strokeColor: activeTheme.diagrams.bpmn.task.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
        properties: {
          cornerRadius: 8,
        },
      },
    },
    {
      id: 'bpmn-script-task',
      name: 'Script Task',
      description: 'A task that executes a script or code',
      icon: LuCode,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'task',
        subType: 'script',
        width: 120,
        height: 80,
        fillColor: activeTheme.diagrams.bpmn.task.fill,
        strokeColor: activeTheme.diagrams.bpmn.task.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
        properties: {
          cornerRadius: 8,
        },
      },
    },

    // ============================================================================
    // Row 2: Events
    // ============================================================================
    {
      id: 'bpmn-start-event',
      name: 'Start Event',
      description: 'The beginning of a process',
      icon: LuPlay,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'event',
        subType: 'start',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
    {
      id: 'bpmn-end-event',
      name: 'End Event',
      description: 'The conclusion of a process',
      icon: LuSquare,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'event',
        subType: 'end',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
    {
      id: 'bpmn-timer-event',
      name: 'Timer Event',
      description: 'An event triggered by time or schedule',
      icon: LuTimer,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'event',
        subType: 'timer',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
    {
      id: 'bpmn-error-event',
      name: 'Error Event',
      description: 'An event representing an error or exception',
      icon: LuCircleAlert,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'event',
        subType: 'error',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
    {
      id: 'bpmn-throwing-event',
      name: 'Throwing Event',
      description: 'An intermediate event that throws/sends a signal',
      icon: LuArrowUp,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'event',
        subType: 'intermediate',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
    {
      id: 'bpmn-catching-event',
      name: 'Catching Event',
      description: 'An intermediate event that catches/receives a signal',
      icon: LuArrowDown,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'event',
        subType: 'intermediate',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.event.fill,
        strokeColor: activeTheme.diagrams.bpmn.event.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },

    // ============================================================================
    // Row 3: Gateways
    // ============================================================================
    {
      id: 'bpmn-exclusive-gateway',
      name: 'Exclusive Gateway',
      description: 'A decision point with exactly one outgoing path',
      icon: LuGitBranch,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'gateway',
        subType: 'exclusive',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.gateway.fill,
        strokeColor: activeTheme.diagrams.bpmn.gateway.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
    {
      id: 'bpmn-inclusive-gateway',
      name: 'Inclusive Gateway',
      description: 'A decision point with one or more outgoing paths',
      icon: LuGitMerge,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'gateway',
        subType: 'inclusive',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.gateway.fill,
        strokeColor: activeTheme.diagrams.bpmn.gateway.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
    {
      id: 'bpmn-parallel-gateway',
      name: 'Parallel Gateway',
      description: 'A fork/join point for concurrent execution',
      icon: LuColumns2,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: 'gateway',
        subType: 'parallel',
        width: 40,
        height: 40,
        fillColor: activeTheme.diagrams.bpmn.gateway.fill,
        strokeColor: activeTheme.diagrams.bpmn.gateway.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
      },
    },
  ],
};
