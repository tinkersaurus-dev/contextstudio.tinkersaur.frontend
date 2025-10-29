/**
 * Mermaid Viewer Store
 *
 * Zustand store for managing Mermaid viewer state (collapsed/expanded, syntax text).
 */

import { create } from 'zustand';

interface MermaidViewerState {
  /** Whether the Mermaid viewer is currently expanded */
  isOpen: boolean;

  /** Current Mermaid syntax text */
  mermaidSyntax: string;

  /** Error message if Mermaid generation failed */
  errorMessage: string | null;

  /** Whether the import dialog is open */
  isImportDialogOpen: boolean;

  /** Error message for import operations */
  importErrorMessage: string | null;

  /** Toggle the open/closed state */
  toggleOpen: () => void;

  /** Set the open state explicitly */
  setOpen: (isOpen: boolean) => void;

  /** Update the Mermaid syntax text */
  setSyntax: (syntax: string) => void;

  /** Set an error message */
  setError: (error: string | null) => void;

  /** Clear the current syntax and error */
  clear: () => void;

  /** Open the import dialog */
  openImportDialog: () => void;

  /** Close the import dialog */
  closeImportDialog: () => void;

  /** Set an import error message */
  setImportError: (error: string | null) => void;
}

/**
 * Global store for Mermaid viewer state
 * This is a singleton store used across all diagram canvases
 */
export const useMermaidViewerStore = create<MermaidViewerState>((set) => ({
  isOpen: false,
  mermaidSyntax: '',
  errorMessage: null,
  isImportDialogOpen: false,
  importErrorMessage: null,

  toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

  setOpen: (isOpen) => set({ isOpen }),

  setSyntax: (syntax) => set({ mermaidSyntax: syntax, errorMessage: null }),

  setError: (error) => set({ errorMessage: error }),

  clear: () => set({ mermaidSyntax: '', errorMessage: null }),

  openImportDialog: () => set({ isImportDialogOpen: true, importErrorMessage: null }),

  closeImportDialog: () => set({ isImportDialogOpen: false, importErrorMessage: null }),

  setImportError: (error) => set({ importErrorMessage: error }),
}));
