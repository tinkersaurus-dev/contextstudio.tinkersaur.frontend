'use client';

import React, { useCallback } from 'react';
import { LuGrid2X2, LuFocus } from 'react-icons/lu';
import { IconButton, ButtonGroup, PopoverRoot, PopoverTrigger, PopoverContent, PopoverBody, Tooltip } from '@/shared/ui';
import { CANVAS_CONTROLS_POSITION } from '@/shared/config/canvas-config';
import { SNAP_MODE_OPTIONS } from '../config/snap-mode-config';
import { useCanvasControlsState } from '../hooks/use-canvas-controls-state';
import type { SnapMode } from '@/shared/lib/rendering';

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
    openBackgroundPanel,
    openInteractionsPanel,
    closeAllPanels,
  } = useCanvasControlsState();

  // Memoize handlers to prevent child re-renders
  const handleBackgroundOpenChange = useCallback((e: { open: boolean }) => {
    if (e.open) {
      openBackgroundPanel();
    } else {
      closeAllPanels();
    }
  }, [openBackgroundPanel, closeAllPanels]);

  const handleInteractionsOpenChange = useCallback((e: { open: boolean }) => {
    if (e.open) {
      openInteractionsPanel();
    } else {
      closeAllPanels();
    }
  }, [openInteractionsPanel, closeAllPanels]);

  const handleSnapModeChange = useCallback((mode: SnapMode) => {
    setSnapMode(mode);
  }, [setSnapMode]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: `${CANVAS_CONTROLS_POSITION.bottom}px`,
        left: CANVAS_CONTROLS_POSITION.horizontalCenter,
        transform: 'translateX(-50%)',
        zIndex: 5,
      }}
    >
      {/* Background Settings Popover */}
      <PopoverRoot
        open={isBackgroundOpen}
        onOpenChange={handleBackgroundOpenChange}
        closeOnInteractOutside={true}
      >
        <PopoverTrigger asChild>
          <IconButton
            aria-label="Background Settings"
            size="xs"
            variant="ghost"
          >
            <LuGrid2X2 />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>
            {/* Add background settings controls here */}
            Background settings coming soon
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>

      {/* Interactions Settings Popover */}
      <PopoverRoot
        open={isInteractionsOpen}
        onOpenChange={handleInteractionsOpenChange}
        closeOnInteractOutside={true}
      >
        <PopoverTrigger asChild>
          <IconButton
            aria-label="Interactions Settings"
            size="xs"
            variant="ghost"
          >
            <LuFocus />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody>
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
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>
    </div>
  );
});
