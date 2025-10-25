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
import { getOppositeAnchor } from '@/shared/lib/connection-points';
import { calculateShapeCenterForAnchorPosition } from '@/shared/lib/shape-positioning';
import { createOrthogonalConnector } from '@/entities/connector';

/**
 * Toolset Popover Component
 *
 * Renders a context menu-style popover with tools from the BPMN toolset.
 * Opens on right-click at the cursor position.
 */
export function ToolsetPopover() {
  const { isOpen, screenPosition, worldPosition, pendingConnector, close } =
    useToolsetPopoverStore();
  const { addShape, addConnector } = useCanvasStore();
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

    let shape;

    // If there's a pending connector, create the shape positioned so the
    // appropriate anchor is at the world position, then create the connector
    if (pendingConnector) {
      // Calculate the opposite anchor (where the connector should attach)
      const targetAnchor = getOppositeAnchor(pendingConnector.sourceAnchor);

      // Get shape dimensions from tool config
      const shapeDimensions = {
        width: tool.shapeConfig.width || 120,
        height: tool.shapeConfig.height || 80,
      };

      // Calculate the center position so the target anchor is at worldPosition
      const centerPosition = calculateShapeCenterForAnchorPosition(
        worldPosition,
        shapeDimensions,
        targetAnchor
      );

      // Create shape at the calculated center position
      shape = createShapeFromTool(tool, centerPosition.x, centerPosition.y);

      // Add shape to canvas first
      addShape(shape);

      // Create connector from source to the new shape
      const connectorResult = createOrthogonalConnector(
        {
          shapeId: pendingConnector.sourceShapeId,
          anchor: pendingConnector.sourceAnchor,
        },
        {
          shapeId: shape.id,
          anchor: targetAnchor,
        }
      );

      if (connectorResult.ok) {
        addConnector(connectorResult.value);
      } else {
        console.error('Failed to create connector:', connectorResult.error);
      }
    } else {
      // Normal shape creation without connector
      shape = createShapeFromTool(tool, worldPosition.x, worldPosition.y);
      addShape(shape);
    }

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
            width="fit-content"
            bg="panel.bg"
            style={{
              position: 'fixed',
              left: screenPosition?.x ?? 0,
              top: screenPosition?.y ?? 0,
            }}
          >
            <PopoverBody p={2} onContextMenu={(e) => e.preventDefault()}>
              <Grid
                gridAutoFlow="column"
                gridTemplateRows="repeat(5, 1fr)"
                gap={1}
              >
                {bpmnToolset.tools.map((tool) => {
                  if (!isSimpleTool(tool)) return null;

                  const Icon = tool.icon;

                  return (
                    <Tooltip key={tool.id} content={tool.name} positioning={{ placement: 'right' }}>
                      <IconButton
                        aria-label={tool.name}
                        onClick={() => handleToolSelect(tool)}
                        variant="ghost"
                        size="xs"
                        width="24px"
                        height="24px"
                        minWidth="24px"
                        minHeight="24px"
                        padding={0}
                        color='white'
                        _hover={{
                          bg: 'white',
                          color: 'brand.900',
                        }}
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
