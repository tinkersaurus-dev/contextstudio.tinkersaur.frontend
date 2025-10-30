/**
 * AI Diagram Prompt Collapsible Component
 *
 * A collapsible panel for generating diagrams from natural language prompts using AI
 */

'use client';

import React, { useCallback } from 'react';
import { Box, Textarea, Button, HStack, Text } from '@chakra-ui/react';
import { LuChevronDown } from 'react-icons/lu';
import { Collapsible } from '@/shared/ui';
import { usePromptStore } from '../model/prompt-store';
import { useGenerateMermaid } from '../lib/api-client';

export interface AiDiagramPromptCollapsibleProps {
  /** Type of diagram to generate */
  diagramType: string;
  /** Callback when Mermaid is generated and ready to import */
  onMermaidGenerated: (mermaid: string) => void;
  /** Top offset position (to stack below Mermaid viewer) */
  topOffset?: number;
}

/**
 * AI Diagram Prompt Collapsible Component
 */
export const AiDiagramPromptCollapsible = React.memo(function AiDiagramPromptCollapsible({
  diagramType,
  onMermaidGenerated,
  topOffset = 16,
}: AiDiagramPromptCollapsibleProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const prompt = usePromptStore((state) => state.prompt);
  const setPrompt = usePromptStore((state) => state.setPrompt);

  const { generate, isLoading, error } = useGenerateMermaid(diagramType);

  /**
   * Toggle panel open/close
   */
  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  /**
   * Handle generate button click
   */
  const handleGenerate = useCallback(async () => {
    const mermaid = await generate();
    if (mermaid) {
      // Call the callback with generated Mermaid
      onMermaidGenerated(mermaid);
      // Clear the prompt after successful generation
      setPrompt('');
    }
  }, [generate, onMermaidGenerated, setPrompt]);

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
    <Box
      position="absolute"
      top={`${topOffset}px`}
      right="16px"
      zIndex={10}
      width="400px"
      backgroundColor="panel.bg"
      borderWidth="1px"
      borderRadius="md"
      boxShadow="lg"
    >
      <Collapsible.Root open={isOpen}>
        <HStack
          paddingX="4"
          paddingY="3"
          borderBottomWidth={isOpen ? '1px' : '0'}
          justify="space-between"
        >
          <Collapsible.Trigger
            asChild
            onClick={toggleOpen}
            flex="1"
            cursor="pointer"
            _hover={{ backgroundColor: 'gray.50', _dark: { backgroundColor: 'gray.800' } }}
            paddingX="2"
            paddingY="1"
            borderRadius="sm"
            transition="background-color 0.2s"
          >
            <HStack gap="2">
              <Collapsible.Indicator
                transition="transform 0.2s"
                _open={{ transform: 'rotate(180deg)' }}
              >
                <Box color="panel.text">
                  <LuChevronDown />
                </Box>
              </Collapsible.Indicator>
              <Text fontWeight="bold" fontSize="sm" color="panel.text">
                Describe Your Process
              </Text>
            </HStack>
          </Collapsible.Trigger>
        </HStack>

        <Collapsible.Content>
          <Box padding="4">
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
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
});
