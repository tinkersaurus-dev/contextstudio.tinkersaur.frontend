export { DiagramCanvas } from './ui/diagram-canvas';

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
