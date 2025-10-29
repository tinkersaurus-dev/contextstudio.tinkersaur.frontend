/**
 * Mermaid Sync Hook
 *
 * React hook to synchronize diagram state with Mermaid syntax generation.
 * Updates Mermaid syntax whenever shapes or connectors change.
 */

import { useEffect, useRef, useCallback } from 'react';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { DiagramType } from '@/shared/types/content-data';
import { getMermaidExporter } from '@/shared/lib/mermaid/mermaid-parser-registry';
import { useMermaidViewerStore } from '../model/mermaid-viewer-store';
import { MERMAID_UPDATE_DEBOUNCE_MS } from '../config/mermaid-viewer-config';

interface UseMermaidSyncProps {
  /** Current shapes in the diagram */
  shapes: Shape[];
  /** Current connectors in the diagram */
  connectors: Connector[];
  /** Type of diagram (determines which exporter to use) */
  diagramType: DiagramType;
  /** Whether to enable automatic syncing */
  enabled?: boolean;
}

/**
 * Hook to keep Mermaid syntax in sync with diagram changes
 */
export function useMermaidSync({
  shapes,
  connectors,
  diagramType,
  enabled = true,
}: UseMermaidSyncProps) {
  const { setSyntax, setError } = useMermaidViewerStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoized function to generate Mermaid syntax
  const generateMermaid = useCallback(() => {
    if (!enabled) {
      return;
    }

    // Get the appropriate exporter for this diagram type
    const exporterResult = getMermaidExporter(diagramType);

    if (!exporterResult.ok) {
      setError(exporterResult.error);
      return;
    }

    const exporter = exporterResult.value;

    // Export the diagram to Mermaid syntax
    const exportResult = exporter.export(shapes, connectors);

    if (!exportResult.ok) {
      setError(exportResult.error);
      return;
    }

    // Update the store with the generated syntax
    setSyntax(exportResult.value.syntax);
  }, [shapes, connectors, diagramType, enabled, setSyntax, setError]);

  // Debounced effect to regenerate Mermaid syntax on changes
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      generateMermaid();
    }, MERMAID_UPDATE_DEBOUNCE_MS);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [shapes, connectors, diagramType, enabled, generateMermaid]);

  // Return the manual generate function in case it's needed
  return {
    generateMermaid,
  };
}
