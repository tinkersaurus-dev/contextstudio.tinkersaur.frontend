import { DiagramCanvas } from '@/widgets/diagram-canvas';

export function CanvasPageView() {
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <DiagramCanvas />
    </div>
  );
}
