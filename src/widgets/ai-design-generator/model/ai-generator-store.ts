/**
 * Zustand store for AI Design Generator state management
 */

import { create } from 'zustand';

export interface AIGeneratorState {
  // State
  prompt: string;
  generatedCode: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPrompt: (prompt: string) => void;
  setGeneratedCode: (code: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  prompt: '',
  generatedCode: null,
  isLoading: false,
  error: null,
};

export const useAIGeneratorStore = create<AIGeneratorState>((set) => ({
  ...initialState,

  setPrompt: (prompt: string) => set({ prompt }),

  setGeneratedCode: (code: string) => set({ generatedCode: code, error: null }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  reset: () => set(initialState),
}));
