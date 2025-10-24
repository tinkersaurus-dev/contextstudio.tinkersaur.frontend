/**
 * Canvas Controls State Hook
 *
 * Manages the state for canvas control panels (action bars).
 * Ensures only one panel is open at a time.
 */

import { useState, useCallback } from 'react';

export type ControlPanel = 'background' | 'interactions' | null;

export interface CanvasControlsState {
  /** Currently open control panel */
  activePanel: ControlPanel;
  /** Open the background settings panel */
  openBackgroundPanel: () => void;
  /** Open the interactions settings panel */
  openInteractionsPanel: () => void;
  /** Close all panels */
  closeAllPanels: () => void;
  /** Check if background panel is open */
  isBackgroundOpen: boolean;
  /** Check if interactions panel is open */
  isInteractionsOpen: boolean;
  /** Check if any panel is open */
  isAnyPanelOpen: boolean;
}

/**
 * Custom hook to manage canvas controls state
 *
 * @returns Canvas controls state and actions
 *
 * @example
 * const {
 *   isBackgroundOpen,
 *   isInteractionsOpen,
 *   openBackgroundPanel,
 *   openInteractionsPanel,
 *   closeAllPanels
 * } = useCanvasControlsState();
 */
export function useCanvasControlsState(): CanvasControlsState {
  const [activePanel, setActivePanel] = useState<ControlPanel>(null);

  const openBackgroundPanel = useCallback(() => {
    setActivePanel('background');
  }, []);

  const openInteractionsPanel = useCallback(() => {
    setActivePanel('interactions');
  }, []);

  const closeAllPanels = useCallback(() => {
    setActivePanel(null);
  }, []);

  return {
    activePanel,
    openBackgroundPanel,
    openInteractionsPanel,
    closeAllPanels,
    isBackgroundOpen: activePanel === 'background',
    isInteractionsOpen: activePanel === 'interactions',
    isAnyPanelOpen: activePanel !== null,
  };
}
