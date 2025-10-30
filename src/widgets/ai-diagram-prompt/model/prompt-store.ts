/**
 * AI Diagram Prompt Store
 *
 * Manages state for the AI-powered diagram generation prompt feature
 */

import { create } from 'zustand';

/**
 * State interface for the prompt store
 */
interface PromptState {
  /** Current prompt text */
  prompt: string;
  /** Whether a generation request is in progress */
  isLoading: boolean;
  /** Error message if generation failed */
  error: string | null;
  /** Generated Mermaid syntax (before importing to canvas) */
  generatedMermaid: string | null;
}

/**
 * Actions interface for the prompt store
 */
interface PromptActions {
  /** Set the prompt text */
  setPrompt: (prompt: string) => void;
  /** Set loading state */
  setLoading: (isLoading: boolean) => void;
  /** Set error message */
  setError: (error: string | null) => void;
  /** Set generated Mermaid syntax */
  setGeneratedMermaid: (mermaid: string | null) => void;
  /** Clear all state (reset to initial) */
  clear: () => void;
}

/**
 * Initial state
 */
const initialState: PromptState = {
  prompt: '',
  isLoading: false,
  error: null,
  generatedMermaid: null,
};

/**
 * Zustand store for AI diagram prompt
 */
export const usePromptStore = create<PromptState & PromptActions>((set) => ({
  // Initial state
  ...initialState,

  // Actions
  setPrompt: (prompt) => set({ prompt }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setGeneratedMermaid: (generatedMermaid) => set({ generatedMermaid }),

  clear: () => set(initialState),
}));
