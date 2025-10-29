/**
 * Next.js API Route for editing generated designs using Amazon Bedrock
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

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

const EDIT_SYSTEM_PROMPT = `You are a UI component editor for design prototyping. You will be given a single HTML element (a component) and instructions to modify it. Edit ONLY this component based on the instructions. Return the complete modified component with no explanations, markdown formatting, or commentary.

Important:
- You are editing a SINGLE component/element, not a full page
- Use ONLY vanilla HTML, CSS, and JavaScript
- Do NOT use React, Vue, Angular, or any framework
- Do NOT use any component libraries
- Do NOT include any import or require statements
- Do NOT include script tags for external libraries
- Preserve the element's root tag unless specifically instructed to change it
- Apply the requested changes while maintaining the component's integrity
- Return ONLY the modified HTML element with everything inside it
- Do NOT wrap in markdown code blocks
- Do NOT add any explanatory text
- The generated code should be pure HTML that can be inserted directly into the DOM`;

export interface EditDesignRequest {
  elementCode: string;
  editPrompt: string;
  elementIdentifier: string;
}

export interface EditDesignResponse {
  code?: string;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EditDesignRequest = await request.json();
    const { elementCode, editPrompt, elementIdentifier } = body;

    if (!elementCode || typeof elementCode !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Element code is required',
        } satisfies EditDesignResponse,
        { status: 400 }
      );
    }

    if (!editPrompt || typeof editPrompt !== 'string' || editPrompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Edit prompt is required and must be a non-empty string',
        } satisfies EditDesignResponse,
        { status: 400 }
      );
    }

    // Prepare the request for Qwen model using messages format
    const userPrompt = `Edit the following HTML component. Element: ${elementIdentifier}

Component code:
${elementCode}

Instructions: ${editPrompt}

Return the complete modified component:`;

    const bedrockRequest = {
      messages: [
        {
          role: 'system',
          content: EDIT_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: userPrompt,
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

    // Log the response structure for debugging
    console.log('Bedrock edit response structure:', JSON.stringify(responseBody, null, 2));

    // Extract generated code from response
    const generatedCode =
      responseBody.choices?.[0]?.message?.content ||
      responseBody.content?.[0]?.text ||
      responseBody.output?.text ||
      responseBody.text ||
      '';

    if (!generatedCode) {
      console.error('Failed to extract code from edit response:', responseBody);
      return NextResponse.json(
        {
          success: false,
          error: 'No code generated from the model. Check server logs for details.',
        } satisfies EditDesignResponse,
        { status: 500 }
      );
    }

    // Clean up the generated code (remove any markdown artifacts if present)
    let cleanedCode = generatedCode.trim();

    // Remove markdown code blocks if they somehow got included
    cleanedCode = cleanedCode.replace(/^```(?:html|jsx?|tsx?|javascript|typescript)?\n?/gm, '');
    cleanedCode = cleanedCode.replace(/\n?```$/gm, '');

    return NextResponse.json({
      success: true,
      code: cleanedCode,
    } satisfies EditDesignResponse);
  } catch (error) {
    console.error('Error editing design:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: `Failed to edit design: ${errorMessage}`,
      } satisfies EditDesignResponse,
      { status: 500 }
    );
  }
}
