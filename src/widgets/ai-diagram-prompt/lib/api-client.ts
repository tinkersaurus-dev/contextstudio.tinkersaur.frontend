/**
 * AI Diagram Prompt API Client Hook
 *
 * React hook for generating Mermaid diagrams from natural language prompts
 */

import { useCallback } from 'react';
import { generateMermaid, MermaidGeneratorAPIError } from '@/shared/api/mermaid-generator-api';
import { usePromptStore } from '../model/prompt-store';

/**
 * Hook return type
 */
interface UseGenerateMermaidReturn {
  /** Function to trigger Mermaid generation */
  generate: () => Promise<string | null>;
  /** Whether a generation request is in progress */
  isLoading: boolean;
  /** Error message if generation failed */
  error: string | null;
}

/**
 * Hook for generating Mermaid diagrams from prompts
 *
 * @param diagramType - Type of diagram to generate (default: 'bpmn')
 * @returns Object with generate function, loading state, and error
 */
export function useGenerateMermaid(diagramType: string = 'bpmn'): UseGenerateMermaidReturn {
  const prompt = usePromptStore((state) => state.prompt);
  const isLoading = usePromptStore((state) => state.isLoading);
  const error = usePromptStore((state) => state.error);
  const setLoading = usePromptStore((state) => state.setLoading);
  const setError = usePromptStore((state) => state.setError);
  const setGeneratedMermaid = usePromptStore((state) => state.setGeneratedMermaid);

  /**
   * Generate Mermaid diagram from current prompt
   */
  const generate = useCallback(async (): Promise<string | null> => {
    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      setError('Please enter a description for your diagram');
      return null;
    }

    // Clear previous errors
    setError(null);
    setLoading(true);

    try {
      // Call API to generate Mermaid
      const mermaidSyntax = await generateMermaid(prompt, diagramType);

      // Store generated Mermaid
      setGeneratedMermaid(mermaidSyntax);
      setLoading(false);

      return mermaidSyntax;
    } catch (err) {
      // Handle errors
      const errorMessage =
        err instanceof MermaidGeneratorAPIError
          ? err.message
          : 'Failed to generate diagram. Please try again.';

      setError(errorMessage);
      setLoading(false);
      setGeneratedMermaid(null);

      return null;
    }
  }, [prompt, diagramType, setLoading, setError, setGeneratedMermaid]);

  return {
    generate,
    isLoading,
    error,
  };
}
