'use client';

/**
 * Keyboard Interaction Hook
 *
 * Provides keyboard event handling for the canvas using React's synthetic event system.
 * Replaces the imperative keyboard-input.ts setup with a declarative React hook.
 *
 * This hook provides:
 * - Undo/Redo (Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z, Ctrl + Y)
 * - Delete (Delete/Backspace keys)
 * - Platform-aware shortcuts (Mac: Cmd, Windows/Linux: Ctrl)
 * - Input field detection (prevents shortcuts in text inputs)
 *
 * Uses React synthetic events instead of global window listeners for:
 * - Automatic tab isolation (only active tab receives events)
 * - Better testability with React Testing Library
 * - Consistent with React's declarative paradigm
 * - Type safety with React.KeyboardEvent
 */

import { useCallback } from 'react';
import type { KeyboardInteractionCallbacks } from '../lib/keyboard-input-types';

/**
 * Options for the keyboard interaction hook
 */
export interface UseKeyboardInteractionOptions {
  /** Callbacks for keyboard actions */
  callbacks: KeyboardInteractionCallbacks;
}

/**
 * Keyboard interaction handlers returned by the hook
 */
export interface KeyboardInteractionHandlers {
  /** Handle keyboard events */
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

/**
 * Check if the event target is an input field
 * @param event - Keyboard event
 * @returns true if the target is an input/textarea element
 */
function isInputField(event: React.KeyboardEvent): boolean {
  const target = event.target as HTMLElement;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
}

/**
 * Check if the platform is Mac
 * @returns true if running on macOS
 */
function isMacPlatform(): boolean {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

/**
 * Custom hook to manage keyboard interactions using React's synthetic event system
 *
 * Replaces the imperative keyboard-input.ts module with a declarative hook pattern.
 * All event handlers use React.KeyboardEvent instead of native DOM events.
 *
 * @param options - Configuration options
 * @returns Keyboard interaction handlers
 *
 * @example
 * const handlers = useKeyboardInteraction({
 *   callbacks: {
 *     getAllSelectedEntities,
 *     deleteSelectedEntities,
 *     undo,
 *     redo,
 *     canUndo,
 *     canRedo,
 *   }
 * });
 *
 * return (
 *   <div
 *     tabIndex={0}
 *     onKeyDown={handlers.handleKeyDown}
 *     style={{ outline: 'none' }}
 *   >
 *     <canvas ... />
 *   </div>
 * );
 */
export function useKeyboardInteraction(
  options: UseKeyboardInteractionOptions
): KeyboardInteractionHandlers {
  const { callbacks } = options;

  /**
   * Handle keyboard events
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Don't handle keyboard shortcuts if user is typing in an input/textarea
      if (isInputField(event)) {
        return;
      }

      // Check for platform-specific modifier key
      const isMac = isMacPlatform();
      const modifierKey = isMac ? event.metaKey : event.ctrlKey;

      // Handle Undo: Ctrl+Z / Cmd+Z (without Shift)
      if (modifierKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (callbacks.canUndo()) {
          callbacks.undo();
        }
        return;
      }

      // Handle Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y (Windows)
      if (
        (modifierKey && event.shiftKey && event.key.toLowerCase() === 'z') ||
        (!isMac && event.ctrlKey && event.key.toLowerCase() === 'y')
      ) {
        event.preventDefault();
        if (callbacks.canRedo()) {
          callbacks.redo();
        }
        return;
      }

      // Handle Delete or Backspace key
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Prevent default behavior (e.g., browser back navigation on Backspace)
        event.preventDefault();

        // Only delete if there are selected entities
        const selectedEntities = callbacks.getAllSelectedEntities();
        if (selectedEntities.length > 0) {
          callbacks.deleteSelectedEntities();
        }
        return;
      }
    },
    [callbacks]
  );

  return {
    handleKeyDown,
  };
}
