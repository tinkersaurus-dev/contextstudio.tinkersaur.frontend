'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { TextEditOverlayProps } from '../model/types';

/**
 * TextEditOverlay Component
 *
 * A reusable text editing overlay for diagram entities.
 * Positions an input element over the entity being edited with proper
 * coordinate transformation and zoom scaling.
 *
 * @example
 * ```tsx
 * <TextEditOverlay
 *   entity={editingShape}
 *   transform={canvasTransform}
 *   onCommit={(id, text) => updateEntityText(id, text)}
 *   onCancel={() => setEditingEntity(null)}
 * />
 * ```
 */
export const TextEditOverlay = React.memo(function TextEditOverlay({
  entity,
  transform,
  onCommit,
  onCancel,
  style,
}: TextEditOverlayProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus and select text when editing starts
  useEffect(() => {
    if (entity && inputRef.current) {
      // Small delay to ensure the input is rendered and to prevent immediate blur
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [entity]);

  // Memoize handlers to prevent re-renders
  const handleCommit = useCallback((text: string) => {
    if (entity) {
      onCommit(entity.id, text);
    }
  }, [entity, onCommit]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    handleCommit(e.target.value);
  }, [handleCommit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Enter without shift commits the text
      e.preventDefault();
      handleCommit(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
    // Shift+Enter allows new lines in the textarea
  }, [handleCommit, onCancel]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLTextAreaElement>) => {
    // Prevent event from bubbling to canvas handlers
    e.stopPropagation();
  }, []);

  // Don't render if no entity is being edited
  if (!entity) {
    return null;
  }

  // Calculate screen position for text input overlay
  const centerX = entity.position.x + entity.dimensions.width / 2;
  const centerY = entity.position.y + entity.dimensions.height / 2;
  const screenPos = transform.worldToScreen(centerX, centerY);

  // Calculate rows based on maxLines property (default to 3)
  const maxLines = entity.maxLines || 3;

  const defaultStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${screenPos.x}px`,
    top: `${screenPos.y}px`,
    transform: 'translate(-50%, -50%)',
    minWidth: `${entity.dimensions.width * transform.scale}px`,
    width: `${entity.dimensions.width * transform.scale}px`,
    fontSize: `${(entity.fontSize || 14) * transform.scale}px`,
    textAlign: 'center',
    border: '1px solid #0066cc',
    outline: 'none',
    background: 'white',
    padding: '4px 8px',
    zIndex: 1000,
    resize: 'none',
    overflow: 'hidden',
    fontFamily: '"Nunito Sans Variable", "Nunito Sans", sans-serif',
    lineHeight: entity.lineHeight || 1.2,
    ...style, // Allow custom style overrides
  };

  return (
    <textarea
      ref={inputRef}
      rows={maxLines}
      defaultValue={entity.text || ''}
      style={defaultStyle}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    />
  );
});
