/**
 * Next.js API Route for generating Mermaid diagrams using Amazon Bedrock
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

/**
 * BPMN-specific system prompt for Mermaid generation
 */
const BPMN_SYSTEM_PROMPT = `You are a BPMN diagram generator. Generate Mermaid flowchart syntax based on user descriptions.

Available BPMN Shapes:
- Tasks (rectangles): Use syntax like ["Task Name"] or ("Task Name") for rounded rectangles
- Start Events (circles): Use syntax like (("Start"))
- End Events (double circles): Use syntax like ((("End")))
- Intermediate Events (circles): Use syntax like (("Event Name"))
- Gateways (diamonds): Use syntax like {"Decision Point"}
- Connections: Use --> for solid flow lines, -.-> for dotted lines
- Branch labels: Use -->|Label| for labeled connections (e.g., C -->|Yes| D)

Important Rules:
1. Start with: flowchart LR (left-to-right) or flowchart TB (top-to-bottom)
2. Use simple Mermaid syntax WITHOUT metadata
3. Each node must have a unique ID (A, B, C, etc.)
4. Use descriptive labels that reflect the process
5. For branching/decision points, connect the gateway to multiple paths, do not add empty shapes that do not connect.
6. Keep the diagram clear and logical

Example - Simple Linear Process:
flowchart LR
A(("Start")) --> B["Process Order"]
B["Process Order"] --> C{"Payment Valid?"}
C{"Payment Valid?"} --> D["Ship Product"]
C{"Payment Valid?"} --> E["Cancel Order"]
D["Ship Product"] --> F((("Order Complete")))
E["Cancel Order"] --> G((("Order Cancelled")))

Example - Process with Branching:
flowchart LR
A(("Start")) --> B["Associate Requests Laptop"]
B["Associate Requests Laptop"] --> C{"Request Approved?"}
C{"Request Approved?"} --> D["Assign Laptop to Associate"]
C{"Request Approved?"} --> F((("Request Rejected")))
D["Assign Laptop to Associate"] --> E((("Laptop Assigned")))

Return ONLY the Mermaid flowchart syntax. Do NOT include:
- Markdown code blocks
- Explanations or commentary
- Metadata or configuration
- Any text outside the Mermaid syntax`;

/**
 * Get system prompt based on diagram type
 */
function getSystemPrompt(diagramType: string): string {
  // For now, we only support BPMN
  // Future: Add other diagram types (Sequence, DataFlow, etc.)
  if (diagramType === 'bpmn') {
    return BPMN_SYSTEM_PROMPT;
  }

  // Default to BPMN for now
  return BPMN_SYSTEM_PROMPT;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, diagramType = 'bpmn' } = body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required and must be a non-empty string',
        },
        { status: 400 }
      );
    }

    if (typeof diagramType !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Diagram type must be a string',
        },
        { status: 400 }
      );
    }

    // Get appropriate system prompt
    const systemPrompt = getSystemPrompt(diagramType);

    // Prepare the request for Qwen model using messages format
    const bedrockRequest = {
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Generate a BPMN diagram for: ${prompt}`,
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
    console.log('Bedrock response structure:', JSON.stringify(responseBody, null, 2));

    // Extract generated Mermaid code from response
    const generatedMermaid =
      responseBody.choices?.[0]?.message?.content ||
      responseBody.content?.[0]?.text ||
      responseBody.output?.text ||
      responseBody.text ||
      '';

    if (!generatedMermaid) {
      console.error('Failed to extract Mermaid from response:', responseBody);
      return NextResponse.json(
        {
          success: false,
          error: 'No Mermaid diagram generated from the model. Check server logs for details.',
        },
        { status: 500 }
      );
    }

    // Clean up the generated code (remove any markdown artifacts if present)
    let cleanedMermaid = generatedMermaid.trim();

    // Remove markdown code blocks if they somehow got included
    cleanedMermaid = cleanedMermaid.replace(/^```(?:mermaid)?\n?/gm, '');
    cleanedMermaid = cleanedMermaid.replace(/\n?```$/gm, '');

    // Validate that it starts with 'flowchart'
    if (!cleanedMermaid.startsWith('flowchart')) {
      console.error('Generated content does not start with "flowchart":', cleanedMermaid);
      return NextResponse.json(
        {
          success: false,
          error: 'Generated diagram is not in valid Mermaid flowchart format',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mermaid: cleanedMermaid,
    });
  } catch (error) {
    console.error('Error generating Mermaid diagram:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: `Failed to generate Mermaid diagram: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
