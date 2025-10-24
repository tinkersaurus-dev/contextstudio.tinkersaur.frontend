/**
 * Popover Component Wrapper
 *
 * Wrapped Popover components from Chakra UI.
 * This wrapper allows customization of popover behavior and styling
 * in one central location for use across the entire application.
 */

import {
  Popover as ChakraPopover,
  Portal,
  type PopoverRootProps,
} from '@chakra-ui/react';
import { forwardRef } from 'react';

// Re-export Popover sub-components with type safety
export const PopoverRoot = ChakraPopover.Root;
export const PopoverTrigger = ChakraPopover.Trigger;
export const PopoverAnchor = ChakraPopover.Anchor;
export const PopoverPositioner = ChakraPopover.Positioner;
export const PopoverArrow = ChakraPopover.Arrow;
export const PopoverArrowTip = ChakraPopover.ArrowTip;
export const PopoverBody = ChakraPopover.Body;
export const PopoverHeader = ChakraPopover.Header;
export const PopoverFooter = ChakraPopover.Footer;
export const PopoverTitle = ChakraPopover.Title;
export const PopoverDescription = ChakraPopover.Description;
export const PopoverCloseTrigger = ChakraPopover.CloseTrigger;

/**
 * Popover Content Props
 */
export interface PopoverContentProps extends ChakraPopover.ContentProps {
  /** Whether to render in a portal (default: true) */
  portalled?: boolean;
  /** Portal container ref */
  portalRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Popover Content Component
 *
 * @example
 * ```tsx
 * <PopoverRoot>
 *   <PopoverTrigger asChild>
 *     <Button>Open</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     <PopoverArrow />
 *     <PopoverBody>Content here</PopoverBody>
 *   </PopoverContent>
 * </PopoverRoot>
 * ```
 */
export const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(props, ref) {
    const { portalled = true, portalRef, ...rest } = props;

    const content = (
      <ChakraPopover.Positioner>
        <ChakraPopover.Content ref={ref} {...rest} />
      </ChakraPopover.Positioner>
    );

    if (portalled) {
      return <Portal container={portalRef}>{content}</Portal>;
    }

    return content;
  }
);

/**
 * Re-export types
 */
export type { PopoverRootProps };
