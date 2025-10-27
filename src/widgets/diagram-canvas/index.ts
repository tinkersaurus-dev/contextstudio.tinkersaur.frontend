// Export main component
export { DiagramCanvas } from './ui/diagram-canvas';
export type { DiagramCanvasProps } from './ui/diagram-canvas';

// Export hooks for potential reuse in other canvas-based components
export { useConnectionPointInteraction } from './hooks/use-connection-point-interaction';
export { useCanvasRendering } from './hooks/use-canvas-rendering';

// Export hook types
export type {
  ConnectionPointState,
  ConnectionPointInteractionHandlers,
  UseConnectionPointInteractionOptions,
} from './hooks/use-connection-point-interaction';
export type { UseCanvasRenderingOptions } from './hooks/use-canvas-rendering';

// Note: CanvasStoreProvider and canvas-store-cache have been removed.
// DiagramCanvas now uses internal store management via props (like DocumentEditor).
