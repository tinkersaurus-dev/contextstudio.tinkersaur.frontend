/**
 * Document Editor Store
 *
 * Zustand store for managing document editor state.
 */

import { create } from 'zustand';
import type { DocumentViewMode } from './types';

interface DocumentEditorStore {
  /** Current markdown content */
  content: string;

  /** Current view mode */
  viewMode: DocumentViewMode;

  /** Whether the document has unsaved changes */
  isDirty: boolean;

  /** Set the document content */
  setContent: (content: string) => void;

  /** Set the view mode */
  setViewMode: (mode: DocumentViewMode) => void;

  /** Mark the document as saved */
  markAsSaved: () => void;

  /** Reset the store to initial state */
  reset: (initialContent?: string) => void;
}

export const useDocumentEditorStore = create<DocumentEditorStore>((set) => ({
  content: '',
  viewMode: 'split',
  isDirty: false,

  setContent: (content) =>
    set({
      content,
      isDirty: true,
    }),

  setViewMode: (mode) =>
    set({
      viewMode: mode,
    }),

  markAsSaved: () =>
    set({
      isDirty: false,
    }),

  reset: (initialContent = '') =>
    set({
      content: initialContent,
      viewMode: 'split',
      isDirty: false,
    }),
}));
