'use client';

import { useState } from 'react';
import { LuGrid2X2, LuFocus } from 'react-icons/lu';
import { MdGrid3X3, MdGridGoldenratio } from 'react-icons/md';
import { CiNoWaitingSign } from 'react-icons/ci';
import { IconButton, ButtonGroup, ActionBar, Tooltip } from '@/shared/ui';
import { useCanvasStore } from '@/widgets/diagram-canvas/model/canvas-store';

/**
 * Canvas control buttons that trigger action bars for various settings.
 * Positioned at the bottom center of the canvas.
 */
export function CanvasControls() {
  const [backgroundSettingsOpen, setBackgroundSettingsOpen] = useState(false);
  const [interactionsSettingsOpen, setInteractionsSettingsOpen] = useState(false);
  const { snapMode, setSnapMode } = useCanvasStore();

  const handleBackgroundClick = () => {
    setBackgroundSettingsOpen(true);
    setInteractionsSettingsOpen(false);
  };

  const handleInteractionsClick = () => {
    setInteractionsSettingsOpen(true);
    setBackgroundSettingsOpen(false);
  };

  return (
    <>
      {/* Button Group - hidden when action bar is open */}
      {!backgroundSettingsOpen && !interactionsSettingsOpen && (
        <ButtonGroup
          attached
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
          }}
        >
          <IconButton
            aria-label="Background Settings"
            size="xs"
            variant="ghost"
            onClick={handleBackgroundClick}
          >
            <LuGrid2X2 />
          </IconButton>
          <IconButton
            aria-label="Interactions Settings"
            size="xs"
            variant="ghost"
            onClick={handleInteractionsClick}
          >
            <LuFocus />
          </IconButton>
        </ButtonGroup>
      )}

      {/* Background Settings Action Bar */}
      <ActionBar.Root
        open={backgroundSettingsOpen}
        onOpenChange={(e) => setBackgroundSettingsOpen(e.open)}
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
        open={interactionsSettingsOpen}
        onOpenChange={(e) => setInteractionsSettingsOpen(e.open)}
        closeOnInteractOutside={true}
        
      >
        <ActionBar.Content backgroundColor="panel.bg">
          
          <ButtonGroup attached size="xs">
            <Tooltip content="Snap to Minor Grid">
              <IconButton
                aria-label="Snap to Minor Grid"
                variant={snapMode === 'minor' ? 'subtle' : 'solid'}
                onClick={() => setSnapMode('minor')}
              >
                <MdGrid3X3 />
              </IconButton>
            </Tooltip>
            <Tooltip content="Snap to Major Grid">
              <IconButton
                aria-label="Snap to Major Grid"
                variant={snapMode === 'major' ? 'subtle' : 'solid'}
                onClick={() => setSnapMode('major')}
              >
                <MdGridGoldenratio />
              </IconButton>
            </Tooltip>
            <Tooltip content="No Grid Snapping">
              <IconButton
                aria-label="No Grid Snapping"
                variant={snapMode === 'none' ? 'subtle' : 'solid'}
                onClick={() => setSnapMode('none')}
              >
                <CiNoWaitingSign />
              </IconButton>
            </Tooltip>
          </ButtonGroup>
          <ActionBar.Separator />
        </ActionBar.Content>
      </ActionBar.Root>
    </>
  );
}
