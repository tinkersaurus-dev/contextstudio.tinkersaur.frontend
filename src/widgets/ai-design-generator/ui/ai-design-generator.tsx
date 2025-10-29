'use client';

/**
 * AI Design Generator Widget
 * Allows designers to input prompts and generate HTML/CSS/JS prototypes using AI
 */

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Textarea,
  VStack,
  HStack,
  Text,
  Spinner,
  Portal,
} from '@chakra-ui/react';
import { useAIGeneratorStore } from '../model/ai-generator-store';
import { useGenerateDesign } from '../lib/api-client';

export function AIDesignGenerator() {
  const { generatedCode, isLoading, error, setPrompt, setGeneratedCode } = useAIGeneratorStore();
  const { generate } = useGenerateDesign();
  const [localPrompt, setLocalPrompt] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element: HTMLElement | null;
  } | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);

  const handleSubmit = () => {
    if (localPrompt.trim()) {
      setPrompt(localPrompt);
      generate(localPrompt);
    }
  };

  // Handle right-click on preview
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;

    // Only show context menu if we're inside the preview
    if (previewRef.current?.contains(target)) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        element: target,
      });
    }
  };

  // Close context menu when clicking elsewhere
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // Handle edit action from context menu
  const handleEditElement = () => {
    if (contextMenu?.element) {
      setSelectedElement(contextMenu.element);
      setShowEditDialog(true);
      setContextMenu(null);
    }
  };

  // Get element identifier (id, class, or tag name)
  const getElementIdentifier = (element: HTMLElement): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter((c) => c.trim());
      if (classes.length > 0) return `.${classes[0]}`;
    }
    return element.tagName.toLowerCase();
  };

  // Handle edit submission
  const handleEditSubmit = async () => {
    if (!editPrompt.trim() || !selectedElement) return;

    const elementIdentifier = getElementIdentifier(selectedElement);

    // Extract only the selected element's HTML (not the entire design)
    const elementCode = selectedElement.outerHTML;

    // Call edit API with only the element's code and edit instructions
    try {
      setShowEditDialog(false);
      setEditPrompt('');

      const response = await fetch('/api/edit-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          elementCode: elementCode,
          editPrompt: editPrompt,
          elementIdentifier: elementIdentifier,
        }),
      });

      const data = await response.json();
      if (data.success && data.code) {
        // Replace the element in the DOM with the edited version
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = data.code;
        const newElement = tempContainer.firstElementChild;

        if (newElement && selectedElement.parentNode) {
          selectedElement.parentNode.replaceChild(newElement, selectedElement);

          // Execute any inline scripts in the new element
          const scripts = newElement.querySelectorAll('script');
          scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode?.replaceChild(newScript, oldScript);
          });

          // Update the store with the complete updated HTML
          if (previewRef.current) {
            setGeneratedCode(previewRef.current.innerHTML);
          }
        }
      }
    } catch (err) {
      console.error('Edit failed:', err);
    }
  };

  // Render generated HTML directly into the preview container
  useEffect(() => {
    if (generatedCode && previewRef.current) {
      try {
        // Clear previous content
        previewRef.current.innerHTML = '';

        // Insert the generated HTML
        previewRef.current.innerHTML = generatedCode;

        // Execute any inline scripts
        const scripts = previewRef.current.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        // Add right-click listener
        previewRef.current.addEventListener('contextmenu', handleContextMenu);
      } catch (err) {
        console.error('Error rendering generated HTML:', err);
        if (previewRef.current) {
          previewRef.current.innerHTML = `
            <div style="padding: 32px; text-align: center; color: #e53e3e;">
              Failed to render generated design. Check console for details.
            </div>
          `;
        }
      }
    }

    return () => {
      if (previewRef.current) {
        previewRef.current.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, [generatedCode]);

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      document.addEventListener('click', handleCloseContextMenu);
      return () => document.removeEventListener('click', handleCloseContextMenu);
    }
  }, [contextMenu]);

  return (
    <Box w="full" h="full" display="flex" flexDirection="column" gap={4} p={6}>
      {/* Input Section */}
      <VStack align="stretch" gap={4} flex="0 0 auto">
        <Text fontSize="2xl" fontWeight="bold">
          AI Design Generator
        </Text>
        <Text color="gray.600">
          Describe the UI design you want to prototype, and AI will generate pure HTML/CSS/JS for you.
        </Text>

        <Textarea
          placeholder="E.g., Create a modern pricing card with three tiers, featuring a gradient background and hover effects..."
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          size="lg"
          minH="120px"
          disabled={isLoading}
        />

        <HStack>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            disabled={isLoading || !localPrompt.trim()}
            size="lg"
          >
            {isLoading ? 'Generating...' : 'Generate Design'}
          </Button>
          {isLoading && <Spinner size="sm" />}
        </HStack>
      </VStack>

      {/* Preview Section */}
      <Box
        flex="1"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        overflow="auto"
        bg="gray.50"
      >
        {isLoading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="full"
            flexDirection="column"
            gap={4}
          >
            <Spinner size="xl" />
            <Text>Generating your component...</Text>
          </Box>
        )}

        {error && !isLoading && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="full"
            p={8}
          >
            <VStack gap={2}>
              <Text fontSize="lg" fontWeight="bold" color="red.500">
                Error
              </Text>
              <Text color="red.600">{error}</Text>
            </VStack>
          </Box>
        )}

        {generatedCode && !isLoading && !error && (
          <Box p={6}>
            <div ref={previewRef} />
          </Box>
        )}

        {!generatedCode && !isLoading && !error && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            h="full"
          >
            <Text color="gray.500">
              Your generated design will appear here
            </Text>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      {contextMenu && (
        <Portal>
          <Box
            position="fixed"
            left={`${contextMenu.x}px`}
            top={`${contextMenu.y}px`}
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            boxShadow="lg"
            py={1}
            zIndex={9999}
            minW="150px"
          >
            <Box
              px={3}
              py={2}
              cursor="pointer"
              _hover={{ bg: 'gray.100' }}
              onClick={handleEditElement}
            >
              <Text fontSize="sm">Edit with prompt...</Text>
            </Box>
          </Box>
        </Portal>
      )}

      {/* Edit Dialog */}
      {showEditDialog && selectedElement && (
        <Portal>
          <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={10000}
            onClick={() => {
              setShowEditDialog(false);
              setEditPrompt('');
            }}
          >
            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="xl"
              p={6}
              maxW="500px"
              w="90%"
              onClick={(e) => e.stopPropagation()}
            >
              <VStack align="stretch" gap={4}>
                <Text fontSize="xl" fontWeight="bold">
                  Edit Element
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Element: <strong>{getElementIdentifier(selectedElement)}</strong>
                </Text>
                <Textarea
                  placeholder="E.g., Change the background color to blue, make the text larger..."
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  size="md"
                  minH="100px"
                  autoFocus
                />
                <HStack justify="flex-end" gap={2}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowEditDialog(false);
                      setEditPrompt('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleEditSubmit}
                    disabled={!editPrompt.trim()}
                  >
                    Apply Edit
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </Box>
        </Portal>
      )}
    </Box>
  );
}
