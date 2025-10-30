/**
 * Mermaid Parser Registry
 *
 * Central registry for mapping diagram types to their corresponding Mermaid exporters and importers.
 * Provides factory functions to get the appropriate exporter/importer for a diagram type.
 */

import { DiagramType } from '@/shared/types/content-data';
import type { MermaidExporter, MermaidExportOptions } from './mermaid-exporter';
import type { MermaidImporter, MermaidImportOptions } from './mermaid-importer';
import { createBpmnMermaidExporter } from './exporters/bpmn-mermaid-exporter';
import { createBpmnMermaidImporter } from './importers/bpmn-mermaid-importer';
import { ok, err, type Result } from '@/shared/lib/core/result';

/**
 * Registry mapping diagram types to their exporter factory functions
 */
const exporterRegistry: Record<DiagramType, (options?: MermaidExportOptions) => MermaidExporter> = {
  [DiagramType.BPMN]: createBpmnMermaidExporter,
  // TODO: Implement Sequence and DataFlow exporters
  [DiagramType.Sequence]: () => {
    throw new Error('Sequence diagram Mermaid export not yet implemented');
  },
  [DiagramType.DataFlow]: () => {
    throw new Error('DataFlow diagram Mermaid export not yet implemented');
  },
};

/**
 * Get the appropriate Mermaid exporter for a diagram type
 * @param diagramType - The type of diagram to export
 * @param options - Optional configuration for the exporter
 * @returns Result containing the exporter or an error
 */
export function getMermaidExporter(
  diagramType: DiagramType,
  options?: MermaidExportOptions
): Result<MermaidExporter> {
  try {
    const exporterFactory = exporterRegistry[diagramType];

    if (!exporterFactory) {
      return err(`No Mermaid exporter registered for diagram type: ${diagramType}`);
    }

    const exporter = exporterFactory(options);
    return ok(exporter);
  } catch (error) {
    return err(`Failed to create Mermaid exporter: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a Mermaid exporter is available for a diagram type
 * @param diagramType - The type of diagram to check
 * @returns True if an exporter is available and functional
 */
export function hasMermaidExporter(diagramType: DiagramType): boolean {
  try {
    const exporterFactory = exporterRegistry[diagramType];
    if (!exporterFactory) {
      return false;
    }

    // Try to create the exporter to verify it's functional
    exporterFactory();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of diagram types that support Mermaid export
 * @returns Array of supported diagram types
 */
export function getSupportedDiagramTypes(): DiagramType[] {
  return Object.keys(exporterRegistry)
    .filter(type => hasMermaidExporter(type as DiagramType))
    .map(type => type as DiagramType);
}

/**
 * Registry mapping diagram types to their importer factory functions
 */
const importerRegistry: Record<DiagramType, (options?: MermaidImportOptions) => MermaidImporter> = {
  [DiagramType.BPMN]: createBpmnMermaidImporter,
  // TODO: Implement Sequence and DataFlow importers
  [DiagramType.Sequence]: () => {
    throw new Error('Sequence diagram Mermaid import not yet implemented');
  },
  [DiagramType.DataFlow]: () => {
    throw new Error('DataFlow diagram Mermaid import not yet implemented');
  },
};

/**
 * Get the appropriate Mermaid importer for a diagram type
 * @param diagramType - The type of diagram to import
 * @param options - Optional configuration for the importer
 * @returns Result containing the importer or an error
 */
export function getMermaidImporter(
  diagramType: DiagramType,
  options?: MermaidImportOptions
): Result<MermaidImporter> {
  try {
    const importerFactory = importerRegistry[diagramType];

    if (!importerFactory) {
      return err(`No Mermaid importer registered for diagram type: ${diagramType}`);
    }

    const importer = importerFactory(options);
    return ok(importer);
  } catch (error) {
    return err(`Failed to create Mermaid importer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a Mermaid importer is available for a diagram type
 * @param diagramType - The type of diagram to check
 * @returns True if an importer is available and functional
 */
export function hasMermaidImporter(diagramType: DiagramType): boolean {
  try {
    const importerFactory = importerRegistry[diagramType];
    if (!importerFactory) {
      return false;
    }

    // Try to create the importer to verify it's functional
    importerFactory();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of diagram types that support Mermaid import
 * @returns Array of supported diagram types
 */
export function getSupportedImportDiagramTypes(): DiagramType[] {
  return Object.keys(importerRegistry)
    .filter(type => hasMermaidImporter(type as DiagramType))
    .map(type => type as DiagramType);
}
