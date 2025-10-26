/**
 * Tab Content Wrapper
 *
 * Wrapper component that loads the appropriate content (diagram or document)
 * and handles auto-save functionality.
 */

"use client";

import { useEffect, useCallback, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { DiagramCanvas } from "@/widgets/diagram-canvas";
import { DocumentEditor } from "@/widgets/document-editor";
import { useContentStore } from "@/widgets/design-sidebar/model/content-store";
import { CanvasStoreProvider, useCanvasStore } from "@/widgets/diagram-canvas/model/canvas-store-provider";
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
 * Inner Diagram Content (has access to canvas store via context)
 */
function DiagramContentInner({ contentId }: { contentId: string }) {
  const updateDiagram = useContentStore((state) => state.updateDiagram);
  const getDiagramSnapshot = useCanvasStore((state) => state.getDiagramSnapshot);
  const shapes = useCanvasStore((state) => state.shapes);
  const connectors = useCanvasStore((state) => state.connectors);
  const getDiagram = useContentStore((state) => state.getDiagram);

  // Get the diagram to access its type (for rendering)
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

  // Auto-save when shapes or connectors change
  useEffect(() => {
    // Auto-save whenever shapes or connectors change
    if (shapes.length > 0 || connectors.length > 0) {
      const snapshot = getDiagramSnapshot();
      debouncedSave(contentId, snapshot);
    }
  }, [shapes, connectors, contentId, debouncedSave, getDiagramSnapshot]);

  if (!diagram) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
        <p>Diagram not found</p>
      </Box>
    );
  }

  return (
    <Box height="100%" width="100%">
      <DiagramCanvas diagramType={diagram.diagramType} />
    </Box>
  );
}

/**
 * Diagram Content Wrapper (creates store and provides it)
 */
function DiagramContentWrapper({ contentId }: { contentId: string }) {
  const getDiagram = useContentStore((state) => state.getDiagram);
  const diagram = getDiagram(contentId);

  console.log(`[DiagramContentWrapper] Rendering wrapper for diagram ${contentId}, found: ${!!diagram}`);

  if (!diagram) {
    return (
      <Box height="100%" display="flex" alignItems="center" justifyContent="center">
        <p>Diagram not found</p>
      </Box>
    );
  }

  return (
    <CanvasStoreProvider diagram={diagram}>
      <DiagramContentInner contentId={contentId} />
    </CanvasStoreProvider>
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
