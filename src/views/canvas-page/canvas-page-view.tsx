import { DiagramCanvas } from '@/widgets/diagram-canvas';
import { HEADER_HEIGHT } from '@/shared/config/canvas-config';

export function CanvasPageView() {
  return (
    <div style={{ width: '100vw', height: `calc(100vh - ${HEADER_HEIGHT}px)`, margin: 0, padding: 0 }}>
      <DiagramCanvas />
    </div>
  );
}
