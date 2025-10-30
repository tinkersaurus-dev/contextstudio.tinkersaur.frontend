/**
 * Mermaid Viewer Widget
 *
 * Exports Mermaid viewer utilities (store, hooks, dialog)
 * Note: The main MermaidViewer collapsible component has been deprecated
 * in favor of CanvasTextControls which provides a less obtrusive popover UI.
 */

export { useMermaidViewerStore } from './model/mermaid-viewer-store';
export { useMermaidSync } from './hooks/use-mermaid-sync';
export { MermaidImportDialog } from './ui/mermaid-import-dialog';
