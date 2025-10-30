/**
 * AI Diagram Prompt Widget
 *
 * Export public API for the AI diagram prompt widget
 */

export { AiDiagramPrompt } from './ui/ai-diagram-prompt';
export type { AiDiagramPromptProps } from './ui/ai-diagram-prompt';
export { AiDiagramPromptCollapsible } from './ui/ai-diagram-prompt-collapsible';
export type { AiDiagramPromptCollapsibleProps } from './ui/ai-diagram-prompt-collapsible';
export { useGenerateMermaid } from './lib/api-client';
export { usePromptStore } from './model/prompt-store';
