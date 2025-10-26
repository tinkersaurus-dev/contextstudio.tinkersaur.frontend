/**
 * Toolsets Configuration
 *
 * Central export point for all available toolsets.
 * Maps diagram types to their corresponding toolsets.
 */

import { DiagramType } from '@/shared/types/content-data';
import type { Toolset } from '@/entities/tool';

export { bpmnToolset } from './bpmn-toolset';
export { sequenceToolset } from './sequence-toolset';
export { dataFlowToolset } from './data-flow-toolset';

import { bpmnToolset } from './bpmn-toolset';
import { sequenceToolset } from './sequence-toolset';
import { dataFlowToolset } from './data-flow-toolset';

/**
 * Map of diagram types to their corresponding toolsets
 */
const toolsetRegistry: Record<DiagramType, Toolset> = {
  [DiagramType.BPMN]: bpmnToolset,
  [DiagramType.Sequence]: sequenceToolset,
  [DiagramType.DataFlow]: dataFlowToolset,
};

/**
 * Get the toolset for a specific diagram type
 *
 * @param diagramType - The type of diagram
 * @returns The corresponding toolset
 */
export function getToolsetForDiagramType(diagramType: DiagramType): Toolset {
  return toolsetRegistry[diagramType];
}

/**
 * All available toolsets
 */
export const ALL_TOOLSETS = [bpmnToolset, sequenceToolset, dataFlowToolset];
