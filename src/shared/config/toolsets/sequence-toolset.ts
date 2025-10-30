/**
 * Sequence Diagram Toolset Configuration
 *
 * Defines the toolset for sequence diagrams showing interactions
 * between entities over time.
 *
 * Colors are loaded from the active theme system.
 */

import { LuUser, LuBox, LuArrowRight, LuRectangleVertical } from 'react-icons/lu';
import { ToolType, type Toolset } from '@/entities/tool';
import { ShapeType } from '@/entities/shape/model/types';
import { activeTheme } from '@/app/theme';

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
        fillColor: activeTheme.diagrams.sequence.actor.fill,
        strokeColor: activeTheme.diagrams.sequence.actor.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
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
        fillColor: activeTheme.diagrams.sequence.lifeline.fill,
        strokeColor: activeTheme.diagrams.sequence.lifeline.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
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
        fillColor: activeTheme.diagrams.sequence.activation.fill,
        strokeColor: activeTheme.diagrams.sequence.activation.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
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
        fillColor: activeTheme.diagrams.sequence.note.fill,
        strokeColor: activeTheme.diagrams.sequence.note.stroke,
        strokeWidth: 0.5,
        textColor: activeTheme.canvas.shapes.text,
        properties: {
          cornerRadius: 4,
        },
      },
    },
  ],
};
