/**
 * Document Editor Widget
 *
 * A markdown-based document editor with live preview and line numbers.
 *
 * @example
 * ```tsx
 * import { DocumentEditor } from '@/widgets/document-editor';
 *
 * function MyComponent() {
 *   return (
 *     <DocumentEditor
 *       initialContent="# Hello World"
 *       onContentChange={(content) => console.log(content)}
 *       onSave={(content) => saveDocument(content)}
 *     />
 *   );
 * }
 * ```
 */

export { DocumentEditor } from './ui/document-editor';
export { useDocumentEditorStore } from './model/document-store';
export type { DocumentEditorProps, DocumentViewMode, DocumentEditorState } from './model/types';
