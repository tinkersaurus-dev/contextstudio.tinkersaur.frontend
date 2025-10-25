'use client';

import { useRef, useEffect } from 'react';
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
export function TextEditOverlay({
  entity,
  transform,
  onCommit,
  onCancel,
  style,
}: TextEditOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Don't render if no entity is being edited
  if (!entity) {
    return null;
  }

  // Calculate screen position for text input overlay
  const centerX = entity.position.x + entity.dimensions.width / 2;
  const centerY = entity.position.y + entity.dimensions.height / 2;
  const screenPos = transform.worldToScreen(centerX, centerY);

  const defaultStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${screenPos.x}px`,
    top: `${screenPos.y}px`,
    transform: 'translate(-50%, -50%)',
    minWidth: `${entity.dimensions.width * transform.scale}px`,
    minHeight: '20px',
    fontSize: `${(entity.fontSize || 14) * transform.scale}px`,
    textAlign: 'center',
    border: '1px solid #0066cc',
    outline: 'none',
    background: 'white',
    padding: '2px 4px',
    zIndex: 1000,
    ...style, // Allow custom style overrides
  };

  const handleCommit = (text: string) => {
    onCommit(entity.id, text);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    handleCommit(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    // Prevent event from bubbling to canvas handlers
    e.stopPropagation();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      defaultValue={entity.text || ''}
      style={defaultStyle}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    />
  );
}
