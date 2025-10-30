'use client';

import React, { useCallback } from 'react';
import { VStack, IconButton, Box, Textarea, Button, Text, HStack } from '@chakra-ui/react';
import { LuFileCode, LuCopy, LuCheck, LuDownload } from 'react-icons/lu';
import { RiChat4Line } from "react-icons/ri";
import { PopoverRoot, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody } from '@/shared/ui';
import { useMermaidViewerStore } from '@/widgets/mermaid-viewer/model/mermaid-viewer-store';
import { useMermaidSync } from '@/widgets/mermaid-viewer/hooks/use-mermaid-sync';
import { usePromptStore } from '@/widgets/ai-diagram-prompt/model/prompt-store';
import { useGenerateMermaid } from '@/widgets/ai-diagram-prompt/lib/api-client';
import { MermaidImportDialog } from '@/widgets/mermaid-viewer/ui/mermaid-import-dialog';
import { MERMAID_TEXTAREA_CONFIG, MERMAID_VIEWER_SIZE } from '@/widgets/mermaid-viewer/config/mermaid-viewer-config';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { DiagramType } from '@/shared/types/content-data';

export interface CanvasTextControlsProps {
  /** Current shapes in the diagram */
  shapes: Shape[];
  /** Current connectors in the diagram */
  connectors: Connector[];
  /** Type of diagram */
  diagramType: DiagramType;
  /** Callback for importing diagram */
  onImport: (shapes: Shape[], connectors: Connector[], mode: 'replace' | 'append') => void;
  /** Callback when Mermaid is generated and ready to import */
  onMermaidGenerated: (mermaid: string) => void;
}

/**
 * Canvas Text Controls Component
 *
 * A vertical stack of icon buttons positioned in the top-right corner
 * that open popovers for Mermaid syntax viewing and AI diagram generation.
 */
export const CanvasTextControls = React.memo(function CanvasTextControls({
  shapes,
  connectors,
  diagramType,
  onImport,
  onMermaidGenerated,
}: CanvasTextControlsProps) {
  const { mermaidSyntax, errorMessage, openImportDialog } = useMermaidViewerStore();
  const [copied, setCopied] = React.useState(false);

  // Keep Mermaid syntax in sync with diagram changes
  useMermaidSync({
    shapes,
    connectors,
    diagramType,
    enabled: true,
  });

  // AI Prompt state
  const prompt = usePromptStore((state) => state.prompt);
  const setPrompt = usePromptStore((state) => state.setPrompt);
  const { generate, isLoading, error } = useGenerateMermaid(diagramType);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(mermaidSyntax);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, [mermaidSyntax]);

  // Handle AI generate
  const handleGenerate = useCallback(async () => {
    const mermaid = await generate();
    if (mermaid) {
      onMermaidGenerated(mermaid);
      setPrompt('');
    }
  }, [generate, onMermaidGenerated, setPrompt]);

  // Handle prompt text change
  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value);
    },
    [setPrompt]
  );

  // Handle Enter key (Ctrl+Enter or Cmd+Enter to generate)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  return (
    <>
      <VStack
        gap="2"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
        }}
      >
        {/* Mermaid Syntax Viewer Popover */}
        <PopoverRoot positioning={{ placement: 'bottom-end' }}>
          <PopoverTrigger asChild>
            <IconButton
              aria-label="View Mermaid Syntax"
              size="xs"
              variant="ghost"
            >
              <LuFileCode />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent width="600px">
            <PopoverHeader>
              <HStack justify="space-between" width="100%">
                <Text fontWeight="bold" fontSize="sm">
                  Mermaid Syntax
                </Text>
                <HStack gap="1">
                  <IconButton
                    aria-label="Import from Mermaid"
                    size="xs"
                    variant="ghost"
                    onClick={openImportDialog}
                    title="Import Mermaid diagram"
                  >
                    <LuDownload />
                  </IconButton>
                  <IconButton
                    aria-label="Copy to clipboard"
                    size="xs"
                    variant="ghost"
                    onClick={handleCopy}
                    disabled={!mermaidSyntax || !!errorMessage}
                    title="Copy Mermaid syntax"
                  >
                    {copied ? <LuCheck /> : <LuCopy />}
                  </IconButton>
                </HStack>
              </HStack>
            </PopoverHeader>
            <PopoverBody>
              {errorMessage ? (
                <Box
                  padding="3"
                  backgroundColor="red.50"
                  borderWidth="1px"
                  borderColor="red.200"
                  borderRadius="md"
                  color="red.700"
                  fontSize="sm"
                  _dark={{
                    backgroundColor: 'red.900',
                    borderColor: 'red.700',
                    color: 'red.200',
                  }}
                >
                  <Text fontWeight="medium" marginBottom="1">
                    Error generating Mermaid syntax:
                  </Text>
                  <Text>{errorMessage}</Text>
                </Box>
              ) : mermaidSyntax ? (
                <Textarea
                  value={mermaidSyntax}
                  readOnly
                  rows={MERMAID_TEXTAREA_CONFIG.rows}
                  fontFamily={MERMAID_TEXTAREA_CONFIG.fontFamily}
                  fontSize={MERMAID_TEXTAREA_CONFIG.fontSize}
                  lineHeight={MERMAID_TEXTAREA_CONFIG.lineHeight}
                  resize="vertical"
                  maxHeight={`${MERMAID_VIEWER_SIZE.maxHeight}px`}
                  minHeight={`${MERMAID_VIEWER_SIZE.minHeight}px`}
                  backgroundColor="gray.50"
                  _dark={{ backgroundColor: 'gray.900' }}
                  borderRadius="md"
                  padding="3"
                />
              ) : (
                <Box
                  padding="3"
                  backgroundColor="gray.50"
                  borderRadius="md"
                  color="gray.500"
                  fontSize="sm"
                  textAlign="center"
                  _dark={{
                    backgroundColor: 'gray.900',
                    color: 'gray.400',
                  }}
                >
                  <Text>Mermaid syntax will generate when you add shapes</Text>
                </Box>
              )}
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>

        {/* AI Diagram Generation Popover */}
        <PopoverRoot positioning={{ placement: 'bottom-end' }}>
          <PopoverTrigger asChild>
            <IconButton
              aria-label="Generate with AI"
              size="xs"
              variant="ghost"
            >
              <RiChat4Line />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent width="400px">
            <PopoverHeader>
              <Text fontWeight="bold" fontSize="sm">
                Describe Your Process
              </Text>
            </PopoverHeader>
            <PopoverBody>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Describe the diagram you want to create:
              </Text>
              <Textarea
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}
                placeholder="Example: Create an order approval process with payment validation and shipping"
                rows={4}
                disabled={isLoading}
                fontFamily="system-ui"
                fontSize="14px"
                lineHeight="1.5"
                resize="vertical"
                backgroundColor="gray.50"
                _dark={{ backgroundColor: 'gray.900' }}
                borderRadius="md"
                padding="3"
                mb={2}
              />
              <Text fontSize="xs" color="gray.500" mb={3}>
                Tip: Press Ctrl+Enter (or Cmd+Enter) to generate
              </Text>

              {error && (
                <Box
                  padding="3"
                  backgroundColor="red.50"
                  borderWidth="1px"
                  borderColor="red.200"
                  borderRadius="md"
                  color="red.700"
                  fontSize="sm"
                  mb={3}
                  _dark={{
                    backgroundColor: 'red.900',
                    borderColor: 'red.700',
                    color: 'red.200',
                  }}
                >
                  <Text fontWeight="medium" marginBottom="1">
                    Error:
                  </Text>
                  <Text>{error}</Text>
                </Box>
              )}

              <Button
                colorPalette="secondary.500"
                onClick={handleGenerate}
                loading={isLoading}
                disabled={!prompt.trim() || isLoading}
                width="100%"
              >
                {isLoading ? 'Generating...' : 'Generate Diagram'}
              </Button>
            </PopoverBody>
          </PopoverContent>
        </PopoverRoot>
      </VStack>

      {/* Mermaid Import Dialog */}
      <MermaidImportDialog diagramType={diagramType} onImport={onImport} />
    </>
  );
});
