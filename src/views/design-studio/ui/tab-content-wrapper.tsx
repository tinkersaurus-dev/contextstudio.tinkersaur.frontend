/**
 * Tab Content Wrapper
 *
 * Wrapper component that loads the appropriate content (diagram or document)
 * and handles auto-save functionality.
 */

"use client";

import { useCallback, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { DiagramCanvas } from "@/widgets/diagram-canvas";
import { DocumentEditor } from "@/widgets/document-editor";
import { useContentStore } from "@/widgets/design-sidebar/model/content-store";
import { AUTO_SAVE_DEBOUNCE_MS } from "@/shared/config/workspace-config";
import type { Shape } from "@/entities/shape";
import type { Connector } from "@/entities/connector";

interface TabContentWrapperProps {
  type: 'diagram' | 'document';
  contentId: string;
}

/**
 * Debounce utility function
 */
function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return function executedFunction(...args: TArgs) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Diagram Content Wrapper (props-based, matches DocumentContentWrapper pattern)
 */
function DiagramContentWrapper({ contentId }: { contentId: string }) {
  const getDiagram = useContentStore((state) => state.getDiagram);
  const updateDiagram = useContentStore((state) => state.updateDiagram);

  const diagram = getDiagram(contentId);

  // Auto-save debounced function
  const debouncedSave = useRef(
    debounce((id: string, snapshot: { shapes: Shape[]; connectors: Connector[] }) => {
      updateDiagram(id, {
        shapes: snapshot.shapes,
        connectors: snapshot.connectors,
      });
    }, AUTO_SAVE_DEBOUNCE_MS)
  ).current;

  const handleDiagramChange = useCallback((snapshot: { shapes: Shape[]; connectors: Connector[] }) => {
    debouncedSave(contentId, snapshot);
  }, [contentId, debouncedSave]);

  if (!diagram) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
        <p>Diagram not found</p>
      </Box>
    );
  }

  return (
    <Box height="100%" width="100%">
      <DiagramCanvas
        diagramId={diagram.id}
        initialShapes={diagram.shapes}
        initialConnectors={diagram.connectors}
        diagramType={diagram.diagramType}
        onDiagramChange={handleDiagramChange}
      />
    </Box>
  );
}

/**
 * Document Content Wrapper
 */
function DocumentContentWrapper({ contentId }: { contentId: string }) {
  const getDocument = useContentStore((state) => state.getDocument);
  const updateDocument = useContentStore((state) => state.updateDocument);

  const document = getDocument(contentId);

  // Auto-save debounced function
  const debouncedSave = useRef(
    debounce((id: string, content: string) => {
      updateDocument(id, { content });
    }, AUTO_SAVE_DEBOUNCE_MS)
  ).current;

  const handleContentChange = useCallback((content: string) => {
    debouncedSave(contentId, content);
  }, [contentId, debouncedSave]);

  if (!document) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
        <p>Document not found</p>
      </Box>
    );
  }

  return (
    <Box height="100%" width="100%">
      <DocumentEditor
        initialContent={document.content}
        onContentChange={handleContentChange}
        height="100%"
      />
    </Box>
  );
}

/**
 * Tab Content Wrapper - Main Component
 */
export function TabContentWrapper({ type, contentId }: TabContentWrapperProps) {
  if (type === 'diagram') {
    return <DiagramContentWrapper contentId={contentId} />;
  } else if (type === 'document') {
    return <DocumentContentWrapper contentId={contentId} />;
  }

  return null;
}
