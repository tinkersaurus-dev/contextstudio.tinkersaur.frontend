/**
 * Document Editor Component
 *
 * A markdown-based document editor with live preview and line numbers.
 * Supports split view, edit-only, and preview-only modes.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Flex } from '@chakra-ui/react';
import { IconButton, ButtonGroup } from '@/shared/ui';
import { LuEye, LuPencil, LuColumns2 } from 'react-icons/lu';
import type { DocumentEditorProps, DocumentViewMode } from '../model/types';

/**
 * Calculate line numbers for the editor
 */
function getLineNumbers(content: string): number[] {
  const lines = content.split('\n');
  return Array.from({ length: lines.length }, (_, i) => i + 1);
}

/**
 * Document Editor Component
 */
export function DocumentEditor({
  initialContent = '',
  onContentChange,
  onSave,
  height = '100%',
}: DocumentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Use local state instead of global store
  const [content, setContentState] = useState(initialContent);
  const [viewMode, setViewMode] = useState<DocumentViewMode>('split');

  // Update content when initialContent prop changes
  useEffect(() => {
    setContentState(initialContent);
  }, [initialContent]);

  // Sync scroll between line numbers and textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContentState(newContent);
    onContentChange?.(newContent);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault();
      onSave?.(content);
    }

    // Tab inserts spaces instead of moving focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      handleContentChange(newContent);

      // Restore cursor position after React updates
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const lineNumbers = getLineNumbers(content);
  const showEditor = viewMode === 'edit' || viewMode === 'split';
  const showPreview = viewMode === 'preview' || viewMode === 'split';

  return (
    <Flex direction="column" height={height} width="100%">
      {/* Toolbar */}
      <Flex
        px={4}
        py={2}
        borderBottom="1px solid"
        borderColor="gray.200"
        justifyContent="space-between"
        alignItems="center"
        bg="gray.50"
      >
        <Box fontSize="sm" fontWeight="medium" color="gray.700">
          Markdown Editor
        </Box>
        <ButtonGroup size="sm" variant="outline">
          <IconButton
            aria-label="Edit mode"
            onClick={() => setViewMode('edit')}
            colorPalette={viewMode === 'edit' ? 'blue' : 'gray'}
          >
            <LuPencil />
          </IconButton>
          <IconButton
            aria-label="Split mode"
            onClick={() => setViewMode('split')}
            colorPalette={viewMode === 'split' ? 'blue' : 'gray'}
          >
            <LuColumns2 />
          </IconButton>
          <IconButton
            aria-label="Preview mode"
            onClick={() => setViewMode('preview')}
            colorPalette={viewMode === 'preview' ? 'blue' : 'gray'}
          >
            <LuEye />
          </IconButton>
        </ButtonGroup>
      </Flex>

      {/* Editor and Preview */}
      <Flex flex={1} overflow="hidden">
        {/* Editor Panel */}
        {showEditor && (
          <Flex
            flex={showPreview ? 1 : 2}
            borderRight={showPreview ? '1px solid' : 'none'}
            borderColor="gray.200"
            overflow="hidden"
          >
            {/* Line Numbers */}
            <Box
              ref={lineNumbersRef}
              width="50px"
              bg="gray.100"
              borderRight="1px solid"
              borderColor="gray.300"
              overflowY="hidden"
              overflowX="hidden"
              fontFamily="monospace"
              fontSize="sm"
              lineHeight="1.5"
              color="gray.600"
              textAlign="right"
              pr={2}
              pt={3}
              userSelect="none"
              css={{
                '&::-webkit-scrollbar': {
                  display: 'none',
                },
                scrollbarWidth: 'none',
              }}
            >
              {lineNumbers.map((num) => (
                <Box key={num} height="1.5em">
                  {num}
                </Box>
              ))}
            </Box>

            {/* Editor Textarea */}
            <Box flex={1} position="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                placeholder="Start writing your markdown here..."
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '12px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  backgroundColor: 'white',
                  color: 'var(--chakra-colors-brand-950)',
                }}
              />
            </Box>
          </Flex>
        )}

        {/* Preview Panel */}
        {showPreview && (
          <Box
            flex={showEditor ? 1 : 2}
            overflow="auto"
            px={6}
            py={4}
            bg="white"
          >
            <Box
              className="markdown-preview"
              css={{
                '& h1': {
                  fontSize: '2em',
                  fontWeight: 'bold',
                  marginBottom: '0.5em',
                  marginTop: '0.5em',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.25em',
                },
                '& h2': {
                  fontSize: '1.5em',
                  fontWeight: 'bold',
                  marginBottom: '0.5em',
                  marginTop: '1em',
                  borderBottom: '1px solid #e5e7eb',
                  paddingBottom: '0.25em',
                },
                '& h3': {
                  fontSize: '1.25em',
                  fontWeight: 'bold',
                  marginBottom: '0.5em',
                  marginTop: '1em',
                },
                '& h4, & h5, & h6': {
                  fontSize: '1em',
                  fontWeight: 'bold',
                  marginBottom: '0.5em',
                  marginTop: '1em',
                },
                '& p': {
                  marginBottom: '1em',
                  lineHeight: '1.6',
                },
                '& ul, & ol': {
                  marginBottom: '1em',
                  paddingLeft: '2em',
                },
                '& li': {
                  marginBottom: '0.25em',
                },
                '& code': {
                  backgroundColor: '#f3f4f6',
                  padding: '0.2em 0.4em',
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                  fontSize: '0.9em',
                },
                '& pre': {
                  backgroundColor: '#f3f4f6',
                  padding: '1em',
                  borderRadius: '6px',
                  overflow: 'auto',
                  marginBottom: '1em',
                },
                '& pre code': {
                  backgroundColor: 'transparent',
                  padding: 0,
                },
                '& blockquote': {
                  borderLeft: '4px solid #e5e7eb',
                  paddingLeft: '1em',
                  marginLeft: 0,
                  marginBottom: '1em',
                  color: '#6b7280',
                },
                '& table': {
                  borderCollapse: 'collapse',
                  width: '100%',
                  marginBottom: '1em',
                },
                '& th, & td': {
                  border: '1px solid #e5e7eb',
                  padding: '0.5em',
                  textAlign: 'left',
                },
                '& th': {
                  backgroundColor: '#f3f4f6',
                  fontWeight: 'bold',
                },
                '& a': {
                  color: '#2563eb',
                  textDecoration: 'underline',
                },
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                },
                '& hr': {
                  border: 'none',
                  borderTop: '1px solid #e5e7eb',
                  margin: '2em 0',
                },
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*No content to preview*'}
              </ReactMarkdown>
            </Box>
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
