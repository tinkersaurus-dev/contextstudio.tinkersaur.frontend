/**
 * Document Editor Type Definitions
 *
 * Types for the markdown-based document editor widget.
 */

/**
 * View modes for the document editor
 */
export type DocumentViewMode = 'edit' | 'preview' | 'split';

/**
 * Document editor state
 */
export interface DocumentEditorState {
  /** Current markdown content */
  content: string;

  /** Current view mode */
  viewMode: DocumentViewMode;

  /** Whether the document has unsaved changes */
  isDirty: boolean;
}

/**
 * Props for the DocumentEditor component
 */
export interface DocumentEditorProps {
  /** Initial content to display */
  initialContent?: string;

  /** Callback when content changes */
  onContentChange?: (content: string) => void;

  /** Callback when save is requested */
  onSave?: (content: string) => void;

  /** Optional custom height */
  height?: string;
}
