/**
 * AI Diagram Prompt Component
 *
 * Floating UI that allows users to generate diagrams from natural language prompts
 */

'use client';

import { useState, useCallback } from 'react';
import { Box, Button, Textarea, Text } from '@chakra-ui/react';
import { LuSparkles, LuX } from 'react-icons/lu';
import { usePromptStore } from '../model/prompt-store';
import { useGenerateMermaid } from '../lib/api-client';
import { Popover } from '@chakra-ui/react';

export interface AiDiagramPromptProps {
  /** Type of diagram to generate */
  diagramType: string;
  /** Callback when Mermaid is generated and ready to import */
  onMermaidGenerated: (mermaid: string) => void;
}

/**
 * AI Diagram Prompt Component
 */
export function AiDiagramPrompt({ diagramType, onMermaidGenerated }: AiDiagramPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const prompt = usePromptStore((state) => state.prompt);
  const setPrompt = usePromptStore((state) => state.setPrompt);
  const clear = usePromptStore((state) => state.clear);

  const { generate, isLoading, error } = useGenerateMermaid(diagramType);

  /**
   * Handle generate button click
   */
  const handleGenerate = useCallback(async () => {
    const mermaid = await generate();
    if (mermaid) {
      // Call the callback with generated Mermaid
      onMermaidGenerated(mermaid);
      // Close the popover and clear state
      setIsOpen(false);
      clear();
    }
  }, [generate, onMermaidGenerated, clear]);

  /**
   * Handle popover close
   */
  const handleClose = useCallback(() => {
    setIsOpen(false);
    clear();
  }, [clear]);

  /**
   * Handle prompt text change
   */
  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setPrompt(e.target.value);
    },
    [setPrompt]
  );

  /**
   * Handle Enter key (Ctrl+Enter or Cmd+Enter to generate)
   */
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
    <Popover.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} positioning={{ placement: 'top' }}>
      <Box
        position="absolute"
        bottom={4}
        right={4}
        zIndex={1000}
      >
        <Popover.Trigger asChild>
          <Button
            size="lg"
            colorPalette="purple"
            onClick={() => setIsOpen(true)}
            boxShadow="lg"
          >
            <LuSparkles />
            Generate with AI
          </Button>
        </Popover.Trigger>
      </Box>

      <Popover.Content width="400px" p={4}>
        <Popover.Header>
          <Popover.Title fontSize="lg" fontWeight="semibold">
            Generate Diagram with AI
          </Popover.Title>
          <Popover.CloseTrigger asChild position="absolute" top={2} right={2}>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <LuX />
            </Button>
          </Popover.CloseTrigger>
        </Popover.Header>

        <Popover.Body>
          <Box mb={3}>
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
              autoFocus
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Tip: Press Ctrl+Enter (or Cmd+Enter) to generate
            </Text>
          </Box>

          {error && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              p={2}
              mb={3}
            >
              <Text fontSize="sm" color="red.700">
                {error}
              </Text>
            </Box>
          )}

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              colorPalette="purple"
              onClick={handleGenerate}
              loading={isLoading}
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Diagram'}
            </Button>
          </Box>
        </Popover.Body>
      </Popover.Content>
    </Popover.Root>
  );
}
