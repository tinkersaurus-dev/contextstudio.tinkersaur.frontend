/**
 * Text Edit Overlay Types
 *
 * Types for the text editing overlay component used across diagram entities.
 */

import type { CanvasTransform } from '@/shared/lib/canvas-transform';

/**
 * Entity being edited
 */
export interface EditableEntity {
  id: string;
  text?: string;
  fontSize?: number;
  textColor?: string;
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
}

/**
 * Props for TextEditOverlay component
 */
export interface TextEditOverlayProps {
  /** Entity being edited (null if not editing) */
  entity: EditableEntity | null;
  /** Canvas transform for positioning */
  transform: CanvasTransform;
  /** Callback when text is committed */
  onCommit: (entityId: string, text: string) => void;
  /** Callback when editing is cancelled */
  onCancel: () => void;
  /** Optional custom styling */
  style?: React.CSSProperties;
}
