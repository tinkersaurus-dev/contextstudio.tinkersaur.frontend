/**
 * API client wrapper for the AI Design Generator widget
 */

import { generateDesign, DesignGeneratorAPIError } from '@/shared/api/design-generator-api';
import { useAIGeneratorStore } from '../model/ai-generator-store';

/**
 * Hook-based API client that integrates with the store
 */
export function useGenerateDesign() {
  const { setLoading, setGeneratedCode, setError } = useAIGeneratorStore();

  const generate = async (prompt: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateDesign(prompt);

      if (response.success && response.code) {
        setGeneratedCode(response.code);
      } else {
        setError(response.error || 'Failed to generate design');
      }
    } catch (error) {
      if (error instanceof DesignGeneratorAPIError) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return { generate };
}
