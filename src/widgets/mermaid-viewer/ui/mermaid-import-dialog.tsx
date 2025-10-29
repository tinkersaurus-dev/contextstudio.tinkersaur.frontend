'use client';

import React, { useState, useCallback } from 'react';
import {
  Box,
  Textarea,
  Button,
  Text,
  HStack,
  VStack,
  Dialog,
} from '@chakra-ui/react';
import { useMermaidViewerStore } from '../model/mermaid-viewer-store';
import { getMermaidImporter } from '@/shared/lib/mermaid/mermaid-parser-registry';
import type { DiagramType } from '@/shared/types/content-data';
import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

export interface MermaidImportDialogProps {
  /** Type of diagram to import */
  diagramType: DiagramType;
  /** Callback when import is successful */
  onImport: (shapes: Shape[], connectors: Connector[], mode: 'replace' | 'append') => void;
}

/**
 * Mermaid Import Dialog Component
 *
 * Dialog for importing Mermaid syntax into a diagram.
 * Supports both replace and append modes.
 */
export const MermaidImportDialog = React.memo(function MermaidImportDialog({
  diagramType,
  onImport,
}: MermaidImportDialogProps) {
  const {
    isImportDialogOpen,
    closeImportDialog,
    importErrorMessage,
    setImportError,
  } = useMermaidViewerStore();

  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Handle text change
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setImportText(e.target.value);
    setValidationMessage(null);
    setImportError(null);
  }, [setImportError]);

  // Handle mode change
  const handleModeChange = useCallback((mode: 'replace' | 'append') => {
    setImportMode(mode);
  }, []);

  // Validate Mermaid syntax
  const handleValidate = useCallback(async () => {
    if (!importText.trim()) {
      setValidationMessage('Please enter Mermaid syntax to validate');
      return;
    }

    setIsValidating(true);
    setValidationMessage(null);
    setImportError(null);

    try {
      const importerResult = getMermaidImporter(diagramType);
      if (!importerResult.ok) {
        setValidationMessage(`Error: ${importerResult.error}`);
        return;
      }

      const importer = importerResult.value;
      const validationResult = importer.validate(importText);

      if (validationResult.ok) {
        setValidationMessage('✓ Syntax is valid');
      } else {
        setValidationMessage(`✗ ${validationResult.error}`);
      }
    } catch (error) {
      setValidationMessage(
        `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsValidating(false);
    }
  }, [importText, diagramType, setImportError]);

  // Handle import
  const handleImport = useCallback(async () => {
    if (!importText.trim()) {
      setImportError('Please enter Mermaid syntax to import');
      return;
    }

    try {
      const importerResult = getMermaidImporter(diagramType);
      if (!importerResult.ok) {
        setImportError(importerResult.error);
        return;
      }

      const importer = importerResult.value;
      const importResult = importer.import(importText);

      if (!importResult.ok) {
        setImportError(importResult.error);
        return;
      }

      // Successfully imported - call the onImport callback
      onImport(importResult.value.shapes, importResult.value.connectors, importMode);

      // Close dialog and reset state
      setImportText('');
      setValidationMessage(null);
      setImportError(null);
      closeImportDialog();
    } catch (error) {
      setImportError(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }, [importText, diagramType, importMode, onImport, closeImportDialog, setImportError]);

  // Handle close
  const handleClose = useCallback(() => {
    setImportText('');
    setValidationMessage(null);
    setImportError(null);
    closeImportDialog();
  }, [closeImportDialog, setImportError]);

  return (
    <Dialog.Root
      open={isImportDialogOpen}
      onOpenChange={(e) => {
        if (!e.open) {
          handleClose();
        }
      }}
      size="lg"
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Import Mermaid Diagram</Dialog.Title>
          </Dialog.Header>

          <Dialog.Body>
            <VStack gap="4" align="stretch">
              {/* Instructions */}
              <Box>
                <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
                  Paste your Mermaid flowchart syntax below. Supports both standard Mermaid
                  notation and metadata-enhanced format.
                </Text>
              </Box>

              {/* Import Mode Selection */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" marginBottom="2">
                  Import Mode:
                </Text>
                <HStack gap="2">
                  <Button
                    size="sm"
                    variant={importMode === 'replace' ? 'solid' : 'outline'}
                    onClick={() => handleModeChange('replace')}
                    colorPalette="blue"
                  >
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant={importMode === 'append' ? 'solid' : 'outline'}
                    onClick={() => handleModeChange('append')}
                    colorPalette="blue"
                  >
                    Append
                  </Button>
                </HStack>
                <Text fontSize="xs" color="gray.500" marginTop="1">
                  {importMode === 'replace'
                    ? 'Replace: Clear existing diagram and import'
                    : 'Append: Add imported content to existing diagram'}
                </Text>
              </Box>

              {/* Textarea for Mermaid syntax */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" marginBottom="2">
                  Mermaid Syntax:
                </Text>
                <Textarea
                  value={importText}
                  onChange={handleTextChange}
                  placeholder="flowchart LR&#10;A[Start] --> B[Process]&#10;B --> C[End]"
                  rows={12}
                  fontFamily="mono"
                  fontSize="sm"
                  resize="vertical"
                />
              </Box>

              {/* Validation message */}
              {validationMessage && (
                <Box
                  padding="3"
                  backgroundColor={
                    validationMessage.startsWith('✓') ? 'green.50' : 'orange.50'
                  }
                  borderWidth="1px"
                  borderColor={
                    validationMessage.startsWith('✓') ? 'green.200' : 'orange.200'
                  }
                  borderRadius="md"
                  _dark={{
                    backgroundColor: validationMessage.startsWith('✓')
                      ? 'green.900'
                      : 'orange.900',
                    borderColor: validationMessage.startsWith('✓')
                      ? 'green.700'
                      : 'orange.700',
                  }}
                >
                  <Text
                    fontSize="sm"
                    color={validationMessage.startsWith('✓') ? 'green.700' : 'orange.700'}
                    _dark={{
                      color: validationMessage.startsWith('✓') ? 'green.200' : 'orange.200',
                    }}
                  >
                    {validationMessage}
                  </Text>
                </Box>
              )}

              {/* Error message */}
              {importErrorMessage && (
                <Box
                  padding="3"
                  backgroundColor="red.50"
                  borderWidth="1px"
                  borderColor="red.200"
                  borderRadius="md"
                  _dark={{
                    backgroundColor: 'red.900',
                    borderColor: 'red.700',
                  }}
                >
                  <Text
                    fontSize="sm"
                    color="red.700"
                    _dark={{ color: 'red.200' }}
                  >
                    {importErrorMessage}
                  </Text>
                </Box>
              )}
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack gap="3" justify="flex-end">
              <Dialog.CloseTrigger asChild>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </Dialog.CloseTrigger>
              <Button
                variant="outline"
                onClick={handleValidate}
                loading={isValidating}
                disabled={!importText.trim()}
              >
                Validate
              </Button>
              <Button
                colorPalette="blue"
                onClick={handleImport}
                disabled={!importText.trim()}
              >
                Import
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
});
