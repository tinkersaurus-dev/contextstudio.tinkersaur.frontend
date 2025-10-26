/**
 * Toolset Popover Widget
 *
 * Displays a popover with tool options when the user right-clicks on the canvas.
 * Tools are displayed as icon buttons in a grid layout.
 */

'use client';

import { Grid } from '@chakra-ui/react';
import {
  PopoverRoot,
  PopoverContent,
  PopoverBody,
  IconButton,
  Tooltip,
} from '@/shared/ui';
import { useToolsetPopoverStore } from '../model/toolset-popover-store';
import { useCanvasStore } from '@/widgets/diagram-canvas/model/canvas-store-provider';
import { getToolsetForDiagramType } from '@/shared/config/toolsets';
import { createShapeFromTool, isSimpleTool } from '@/entities/tool/lib';
import type { SimpleTool } from '@/entities/tool';
import { getOppositeAnchor } from '@/shared/lib/connection-points';
import { calculateShapeCenterForAnchorPosition } from '@/shared/lib/shape-positioning';
import { createOrthogonalConnector } from '@/entities/connector';
import type { DiagramType } from '@/shared/types/content-data';

export interface ToolsetPopoverProps {
  /** The diagram type to determine which toolset to display */
  diagramType: DiagramType;
}

/**
 * Toolset Popover Component
 *
 * Renders a context menu-style popover with tools based on the diagram type.
 * Opens on right-click at the cursor position.
 */
export function ToolsetPopover({ diagramType }: ToolsetPopoverProps) {
  const { isOpen, screenPosition, worldPosition, pendingConnector, close } =
    useToolsetPopoverStore();
  const addShape = useCanvasStore((state) => state.addShape);
  const addConnector = useCanvasStore((state) => state.addConnector);

  // Get the appropriate toolset based on diagram type
  const toolset = getToolsetForDiagramType(diagramType);

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
      <PopoverRoot
        open={isOpen}
        onOpenChange={(details) => {
          if (!details.open) {
            close();
          }
        }}
        closeOnInteractOutside
        closeOnEscape
      >
        {isOpen && screenPosition && (
          <PopoverContent
            portalled
            onContextMenu={(e) => e.preventDefault()}
            width="fit-content"
            bg="panel.bg"
            style={{
              position: 'fixed',
              left: `${screenPosition.x}px`,
              top: `${screenPosition.y}px`,
              zIndex: 1000,
            }}
          >
            <PopoverBody p={2} onContextMenu={(e) => e.preventDefault()}>
              <Grid
                gridAutoFlow="column"
                gridTemplateRows="repeat(5, 1fr)"
                gap={1}
              >
                {toolset.tools.map((tool) => {
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
