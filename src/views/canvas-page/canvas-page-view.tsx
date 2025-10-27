'use client';

import { DiagramCanvas } from '@/widgets/diagram-canvas';
import { HEADER_HEIGHT } from '@/shared/config/canvas-config';
import { DiagramType, createEmptyDiagram } from '@/shared/types/content-data';
import { useMemo } from 'react';

export function CanvasPageView() {
  // Create a temporary diagram for this standalone page
  const diagram = useMemo(() => createEmptyDiagram('temp-diagram', 'Canvas', DiagramType.BPMN), []);

  return (
    <div style={{ width: '100vw', height: `calc(100vh - ${HEADER_HEIGHT}px)`, margin: 0, padding: 0 }}>
      <DiagramCanvas
        diagramId={diagram.id}
        initialShapes={diagram.shapes}
        initialConnectors={diagram.connectors}
        diagramType={DiagramType.BPMN}
      />
    </div>
  );
}
