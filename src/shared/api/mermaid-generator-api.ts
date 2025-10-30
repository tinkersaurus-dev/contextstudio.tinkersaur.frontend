/**
 * Mermaid Generator API Client
 *
 * Provides type-safe interface for generating Mermaid diagrams via LLM
 */

/**
 * Request payload for Mermaid generation
 */
export interface GenerateMermaidRequest {
  /** User's natural language description of the diagram */
  prompt: string;
  /** Type of diagram to generate (e.g., 'bpmn', 'sequence', 'dataflow') */
  diagramType: string;
}

/**
 * Response from Mermaid generation API
 */
export interface GenerateMermaidResponse {
  /** Whether the generation was successful */
  success: boolean;
  /** Generated Mermaid syntax (if successful) */
  mermaid?: string;
  /** Error message (if failed) */
  error?: string;
}

/**
 * Custom error class for Mermaid generation API errors
 */
export class MermaidGeneratorAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'MermaidGeneratorAPIError';
  }
}

/**
 * Generate a Mermaid diagram from a natural language prompt
 *
 * @param prompt - Natural language description of the diagram
 * @param diagramType - Type of diagram to generate (default: 'bpmn')
 * @returns Promise resolving to the generated Mermaid syntax
 * @throws {MermaidGeneratorAPIError} If the API request fails
 */
export async function generateMermaid(
  prompt: string,
  diagramType: string = 'bpmn'
): Promise<string> {
  try {
    const requestBody: GenerateMermaidRequest = {
      prompt,
      diagramType,
    };

    const response = await fetch('/api/generate-mermaid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data: GenerateMermaidResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new MermaidGeneratorAPIError(
        data.error || 'Failed to generate Mermaid diagram',
        response.status
      );
    }

    if (!data.mermaid) {
      throw new MermaidGeneratorAPIError(
        'No Mermaid syntax returned from API',
        response.status
      );
    }

    return data.mermaid;
  } catch (error) {
    // Re-throw our custom errors as-is
    if (error instanceof MermaidGeneratorAPIError) {
      throw error;
    }

    // Wrap other errors (network errors, JSON parsing errors, etc.)
    throw new MermaidGeneratorAPIError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      undefined,
      error
    );
  }
}
