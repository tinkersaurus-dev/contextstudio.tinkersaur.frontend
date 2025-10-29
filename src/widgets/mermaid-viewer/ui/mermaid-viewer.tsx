'use client';

import React, { useCallback } from 'react';
import { Box, Textarea, IconButton, HStack, Text } from '@chakra-ui/react';
import { LuChevronDown, LuCopy, LuCheck } from 'react-icons/lu';
import { Collapsible } from '@/shared/ui';
import { useMermaidViewerStore } from '../model/mermaid-viewer-store';
import { useMermaidSync } from '../hooks/use-mermaid-sync';
import {
  MERMAID_VIEWER_POSITION,
  MERMAID_VIEWER_SIZE,
  MERMAID_TEXTAREA_CONFIG,
} from '../config/mermaid-viewer-config';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { DiagramType } from '@/shared/types/content-data';

export interface MermaidViewerProps {
  /** Current shapes in the diagram */
  shapes: Shape[];
  /** Current connectors in the diagram */
  connectors: Connector[];
  /** Type of diagram */
  diagramType: DiagramType;
}

/**
 * Mermaid Viewer Component
 *
 * A collapsible panel positioned in the top-right corner of the canvas
 * that displays the Mermaid syntax for the current diagram.
 */
export const MermaidViewer = React.memo(function MermaidViewer({
  shapes,
  connectors,
  diagramType,
}: MermaidViewerProps) {
  const { isOpen, mermaidSyntax, errorMessage, toggleOpen } = useMermaidViewerStore();
  const [copied, setCopied] = React.useState(false);

  // Keep Mermaid syntax in sync with diagram changes
  useMermaidSync({
    shapes,
    connectors,
    diagramType,
    enabled: true,
  });

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

  return (
    <Box
      position="absolute"
      top={`${MERMAID_VIEWER_POSITION.top}px`}
      right={`${MERMAID_VIEWER_POSITION.right}px`}
      zIndex={MERMAID_VIEWER_POSITION.zIndex}
      width={`${MERMAID_VIEWER_SIZE.width}px`}
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
                <LuChevronDown />
              </Collapsible.Indicator>
              <Text fontWeight="medium" fontSize="sm">
                Mermaid Syntax
              </Text>
            </HStack>
          </Collapsible.Trigger>

          {isOpen && (
            <IconButton
              aria-label="Copy to clipboard"
              size="xs"
              variant="ghost"
              onClick={handleCopy}
              disabled={!mermaidSyntax || !!errorMessage}
            >
              {copied ? <LuCheck /> : <LuCopy />}
            </IconButton>
          )}
        </HStack>

        <Collapsible.Content>
          <Box padding="4">
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
                <Text>No diagram to export</Text>
              </Box>
            )}
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  );
});
