'use client';

import React, { useCallback } from 'react';
import { LuGrid2X2, LuFocus } from 'react-icons/lu';
import { IconButton, ButtonGroup, ActionBar, Tooltip } from '@/shared/ui';
import { CANVAS_CONTROLS_POSITION } from '@/shared/config/canvas-config';
import { SNAP_MODE_OPTIONS } from '../config/snap-mode-config';
import { useCanvasControlsState } from '../hooks/use-canvas-controls-state';
import type { SnapMode } from '@/shared/lib/grid-system';

export interface CanvasControlsProps {
  snapMode: SnapMode;
  setSnapMode: (mode: SnapMode) => void;
}

/**
 * Canvas control buttons that trigger action bars for various settings.
 * Positioned at the bottom center of the canvas.
 */
export const CanvasControls = React.memo(function CanvasControls({ snapMode, setSnapMode }: CanvasControlsProps) {
  const {
    isBackgroundOpen,
    isInteractionsOpen,
    isAnyPanelOpen,
    openBackgroundPanel,
    openInteractionsPanel,
    closeAllPanels,
  } = useCanvasControlsState();

  // Memoize handlers to prevent child re-renders
  const handleBackgroundOpenChange = useCallback((e: { open: boolean }) => {
    if (!e.open) {
      closeAllPanels();
    }
  }, [closeAllPanels]);

  const handleInteractionsOpenChange = useCallback((e: { open: boolean }) => {
    if (!e.open) {
      closeAllPanels();
    }
  }, [closeAllPanels]);

  const handleSnapModeChange = useCallback((mode: SnapMode) => {
    setSnapMode(mode);
  }, [setSnapMode]);

  return (
    <>
      {/* Button Group - hidden when action bar is open */}
      {!isAnyPanelOpen && (
        <ButtonGroup
          attached
          style={{
            position: 'absolute',
            bottom: `${CANVAS_CONTROLS_POSITION.bottom}px`,
            left: CANVAS_CONTROLS_POSITION.horizontalCenter,
            transform: 'translateX(-50%)',
            zIndex: 5,
          }}
        >
          <IconButton
            aria-label="Background Settings"
            size="xs"
            variant="ghost"
            onClick={openBackgroundPanel}
          >
            <LuGrid2X2 />
          </IconButton>
          <IconButton
            aria-label="Interactions Settings"
            size="xs"
            variant="ghost"
            onClick={openInteractionsPanel}
          >
            <LuFocus />
          </IconButton>
        </ButtonGroup>
      )}

      {/* Background Settings Action Bar */}
      <ActionBar.Root
        open={isBackgroundOpen}
        onOpenChange={handleBackgroundOpenChange}
        closeOnInteractOutside={true}
      >
        <ActionBar.Content backgroundColor="panel.bg">
          <ActionBar.SelectionTrigger>
            Background
          </ActionBar.SelectionTrigger>
          <ActionBar.Separator />
          {/* Add background settings controls here */}
        </ActionBar.Content>
      </ActionBar.Root>

      {/* Interactions Settings Action Bar */}
      <ActionBar.Root
        open={isInteractionsOpen}
        onOpenChange={handleInteractionsOpenChange}
        closeOnInteractOutside={true}

      >
        <ActionBar.Content backgroundColor="panel.bg">

          <ButtonGroup attached size="xs">
            {SNAP_MODE_OPTIONS.map(({ mode, label, tooltip, Icon }) => (
              <Tooltip key={mode} content={tooltip}>
                <IconButton
                  aria-label={label}
                  variant={snapMode === mode ? 'subtle' : 'solid'}
                  onClick={() => handleSnapModeChange(mode)}
                >
                  <Icon />
                </IconButton>
              </Tooltip>
            ))}
          </ButtonGroup>
          <ActionBar.Separator />
        </ActionBar.Content>
      </ActionBar.Root>
    </>
  );
});
