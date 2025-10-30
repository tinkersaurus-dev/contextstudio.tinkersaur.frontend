/**
 * AI Diagram Prompt Widget
 *
 * Export public API for the AI diagram prompt widget
 * Note: UI components (AiDiagramPrompt, AiDiagramPromptCollapsible) have been deprecated
 * in favor of CanvasTextControls which provides a less obtrusive popover UI.
 */

export { useGenerateMermaid } from './lib/api-client';
export { usePromptStore } from './model/prompt-store';
