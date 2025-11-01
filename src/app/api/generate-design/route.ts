/**
 * Next.js API Route for generating React components using Amazon Bedrock
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import type {
  GenerateDesignRequest,
  GenerateDesignResponse,
} from '@/shared/api/design-generator-api';

// Initialize Bedrock client with Bearer Token authentication
const bearerToken = process.env.AWS_BEARER_TOKEN_BEDROCK;

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(bearerToken
    ? {
        // Use Bearer Token if available
        credentials: async () => ({
          accessKeyId: '',
          secretAccessKey: '',
          sessionToken: bearerToken,
        }),
      }
    : {
        // Fall back to standard AWS credentials
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      }),
});

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'qwen.qwen3-coder-30b-a3b-v1:0';

const SYSTEM_PROMPT = `You are a UI prototype code generator for rapid design prototyping. Generate ONLY valid HTML/CSS/JavaScript code with inline styles and interactions. This is for visual prototyping - do NOT use any UI libraries, frameworks, or attempt to import anything. Include content, styles, and interactions as requested. Return ONLY the code with no explanations, markdown formatting, or commentary.

Important:
- Use ONLY vanilla HTML, CSS, and JavaScript
- Do NOT use React, Vue, Angular, or any framework
- Do NOT use Chakra UI, Material UI, Bootstrap, or any component library
- Do NOT include any import or require statements
- Do NOT include script tags for external libraries
- Include realistic content and data
- Use inline styles or <style> tags for CSS
- Add appropriate styling and interactions using vanilla JavaScript
- Return ONLY a single HTML element (like a <div>) with everything inside it
- Do NOT wrap in markdown code blocks
- Do NOT add any explanatory text
- The generated code should be pure HTML that can be inserted directly into the DOM`;

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDesignRequest = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required and must be a non-empty string',
        } satisfies GenerateDesignResponse,
        { status: 400 }
      );
    }

    // Prepare the request for Qwen model using messages format
    const bedrockRequest = {
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Generate a React component for: ${prompt}`,
        },
      ],
      max_tokens: 4096,
      temperature: 0.7,
      top_p: 0.9,
    };

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(bedrockRequest),
    });

    // Call Bedrock
    const response = await client.send(command);

    // Parse the response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Extract generated code from response
    // Messages API format returns choices with message content
    const generatedCode =
      responseBody.choices?.[0]?.message?.content ||
      responseBody.content?.[0]?.text ||
      responseBody.output?.text ||
      responseBody.text ||
      '';

    if (!generatedCode) {
      console.error('Failed to extract code from response:', responseBody);
      return NextResponse.json(
        {
          success: false,
          error: 'No code generated from the model. Check server logs for details.',
        } satisfies GenerateDesignResponse,
        { status: 500 }
      );
    }

    // Clean up the generated code (remove any markdown artifacts if present)
    let cleanedCode = generatedCode.trim();

    // Remove markdown code blocks if they somehow got included
    cleanedCode = cleanedCode.replace(/^```(?:jsx?|tsx?|javascript|typescript)?\n?/gm, '');
    cleanedCode = cleanedCode.replace(/\n?```$/gm, '');

    return NextResponse.json({
      success: true,
      code: cleanedCode,
    } satisfies GenerateDesignResponse);
  } catch (error) {
    console.error('Error generating design:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate design: ${errorMessage}`,
      } satisfies GenerateDesignResponse,
      { status: 500 }
    );
  }
}
