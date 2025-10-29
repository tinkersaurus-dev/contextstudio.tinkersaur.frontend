/**
 * API client for AI Design Generator
 */

export interface GenerateDesignRequest {
  prompt: string;
}

export interface GenerateDesignResponse {
  code?: string;
  success: boolean;
  error?: string;
}

export class DesignGeneratorAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DesignGeneratorAPIError';
  }
}

/**
 * Calls the internal API to generate a React component from a design prompt
 */
export async function generateDesign(
  prompt: string
): Promise<GenerateDesignResponse> {
  try {
    const response = await fetch('/api/generate-design', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt } satisfies GenerateDesignRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new DesignGeneratorAPIError(
        errorData.error || `API request failed with status ${response.status}`,
        response.status
      );
    }

    const data: GenerateDesignResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof DesignGeneratorAPIError) {
      throw error;
    }
    throw new DesignGeneratorAPIError(
      'Failed to generate design',
      undefined,
      error
    );
  }
}
