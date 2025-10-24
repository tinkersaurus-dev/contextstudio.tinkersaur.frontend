/**
 * Toolset Popover Widget
 *
 * Displays a popover with tool options when the user right-clicks on the canvas.
 * Tools are displayed as icon buttons in a grid layout.
 */

'use client';

import { useRef, useEffect } from 'react';
import { Grid } from '@chakra-ui/react';
import {
  PopoverRoot,
  PopoverContent,
  PopoverBody,
  IconButton,
  Tooltip,
} from '@/shared/ui';
import { useToolsetPopoverStore } from '../model/toolset-popover-store';
import { useCanvasStore } from '@/widgets/diagram-canvas/model/canvas-store';
import { bpmnToolset } from '@/shared/config/toolsets/bpmn-toolset';
import { createShapeFromTool, isSimpleTool } from '@/entities/tool/lib';
import type { SimpleTool } from '@/entities/tool';

/**
 * Toolset Popover Component
 *
 * Renders a context menu-style popover with tools from the BPMN toolset.
 * Opens on right-click at the cursor position.
 */
export function ToolsetPopover() {
  const { isOpen, screenPosition, worldPosition, close } = useToolsetPopoverStore();
  const { addShape } = useCanvasStore();
  const anchorRef = useRef<HTMLDivElement>(null);

  // Update anchor position when screen position changes
  useEffect(() => {
    if (screenPosition && anchorRef.current) {
      anchorRef.current.style.left = `${screenPosition.x}px`;
      anchorRef.current.style.top = `${screenPosition.y}px`;
    }
  }, [screenPosition]);

  /**
   * Handle tool selection
   */
  const handleToolSelect = (tool: SimpleTool) => {
    if (!worldPosition) return;

    // Create shape from tool configuration at world coordinates
    const shape = createShapeFromTool(tool, worldPosition.x, worldPosition.y);

    // Add shape to canvas
    addShape(shape);

    // Close popover
    close();
  };

  return (
    <>
      {/* Invisible anchor element positioned at cursor */}
      <div
        ref={anchorRef}
        style={{
          position: 'fixed',
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      />

      <PopoverRoot
        open={isOpen}
        onOpenChange={(details) => {
          if (!details.open) {
            close();
          }
        }}
        positioning={{
          placement: 'bottom-start',
          offset: { mainAxis: 4, crossAxis: 0 },
        }}
        closeOnInteractOutside
        closeOnEscape
      >
        {/* Use the anchor div as the trigger */}
        {anchorRef.current && (
          <PopoverContent
            portalled
            onContextMenu={(e) => e.preventDefault()}
            style={{
              position: 'fixed',
              left: screenPosition?.x ?? 0,
              top: screenPosition?.y ?? 0,
            }}
          >
            <PopoverBody p={2} onContextMenu={(e) => e.preventDefault()}>
              <Grid
                gridTemplateColumns="repeat(3, 1fr)"
                gap={1}
              >
                {bpmnToolset.tools.map((tool) => {
                  if (!isSimpleTool(tool)) return null;

                  const Icon = tool.icon;

                  return (
                    <Tooltip key={tool.id} content={tool.name}>
                      <IconButton
                        aria-label={tool.name}
                        onClick={() => handleToolSelect(tool)}
                        variant="ghost"
                        size="sm"
                      >
                        <Icon />
                      </IconButton>
                    </Tooltip>
                  );
                })}
              </Grid>
            </PopoverBody>
          </PopoverContent>
        )}
      </PopoverRoot>
    </>
  );
}
