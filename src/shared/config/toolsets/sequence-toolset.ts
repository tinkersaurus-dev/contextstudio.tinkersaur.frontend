/**
 * Sequence Diagram Toolset Configuration
 *
 * Defines the toolset for sequence diagrams showing interactions
 * between entities over time.
 *
 * Shapes use theme colors dynamically - no colors are set at initialization.
 */

import { LuUser, LuBox, LuArrowRight, LuRectangleVertical } from 'react-icons/lu';
import { ToolType, type Toolset } from '@/entities/tool';
import { ShapeType } from '@/entities/shape/model/types';

/**
 * Sequence Diagram Toolset
 *
 * Contains shapes for creating sequence diagrams:
 * - Actor: A participant in the sequence (person or system)
 * - Lifeline: The timeline for an actor
 * - Activation: A period when an object is active
 * - Note: Annotations for the sequence
 */
export const sequenceToolset: Toolset = {
  id: 'sequence',
  name: 'Sequence',
  description: 'Sequence diagram shapes for interaction modeling',
  tools: [
    {
      id: 'seq-actor',
      name: 'Actor',
      description: 'A participant in the sequence',
      icon: LuUser,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 80,
        height: 80,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 40,
        },
      },
    },
    {
      id: 'seq-lifeline',
      name: 'Lifeline',
      description: 'Timeline for an actor',
      icon: LuRectangleVertical,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 80,
        height: 100,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 4,
        },
      },
    },
    {
      id: 'seq-activation',
      name: 'Activation',
      description: 'Period when an object is active',
      icon: LuBox,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 20,
        height: 60,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 2,
        },
      },
    },
    {
      id: 'seq-note',
      name: 'Note',
      description: 'Annotation for the sequence',
      icon: LuArrowRight,
      type: ToolType.Simple,
      shapeConfig: {
        shapeType: ShapeType.Task,
        width: 120,
        height: 60,
        strokeWidth: 0.5,
        properties: {
          cornerRadius: 4,
        },
      },
    },
  ],
};
