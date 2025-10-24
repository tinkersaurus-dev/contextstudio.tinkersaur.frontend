import { ActionBar as ChakraActionBar, Portal } from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * Wrapped ActionBar components from Chakra UI.
 * These wrappers allow you to customize the action bar behavior and styling
 * in one central location for use across the entire application.
 *
 * @example
 * ```tsx
 * <ActionBarRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
 *   <ActionBarContent>
 *     <ActionBarSelectionTrigger>Settings</ActionBarSelectionTrigger>
 *     <ActionBarSeparator />
 *     <Button>Apply</Button>
 *   </ActionBarContent>
 * </ActionBarRoot>
 * ```
 */

// Root component
export type ActionBarRootProps = ChakraActionBar.RootProps;

export const ActionBarRoot = (props: ActionBarRootProps) => {
  return <ChakraActionBar.Root {...props} />;
};

// Positioner component
export type ActionBarPositionerProps = ChakraActionBar.PositionerProps;

export const ActionBarPositioner = forwardRef<HTMLDivElement, ActionBarPositionerProps>(
  function ActionBarPositioner(props, ref) {
    return <ChakraActionBar.Positioner ref={ref} {...props} />;
  }
);

// Content component with Portal wrapper
export interface ActionBarContentProps extends ChakraActionBar.ContentProps {
  portalled?: boolean;
}

export const ActionBarContent = forwardRef<HTMLDivElement, ActionBarContentProps>(
  function ActionBarContent(props, ref) {
    const { children, portalled = true, ...rest } = props;

    const content = (
      <ActionBarPositioner>
        <ChakraActionBar.Content ref={ref} {...rest} backgroundColor="panel.bg" borderRadius="2px">
          {children}
        </ChakraActionBar.Content>
      </ActionBarPositioner>
    );

    if (portalled) {
      return <Portal>{content}</Portal>;
    }

    return content;
  }
);

// SelectionTrigger component
export type ActionBarSelectionTriggerProps = ChakraActionBar.SelectionTriggerProps;

export const ActionBarSelectionTrigger = (props: ActionBarSelectionTriggerProps) => {
  return <ChakraActionBar.SelectionTrigger {...props} />;
};

// Separator component
export type ActionBarSeparatorProps = ChakraActionBar.SeparatorProps;

export const ActionBarSeparator = forwardRef<HTMLHRElement, ActionBarSeparatorProps>(
  function ActionBarSeparator(props, ref) {
    return <ChakraActionBar.Separator ref={ref} {...props} />;
  }
);

// CloseTrigger component
export type ActionBarCloseTriggerProps = ChakraActionBar.CloseTriggerProps;

export const ActionBarCloseTrigger = forwardRef<HTMLButtonElement, ActionBarCloseTriggerProps>(
  function ActionBarCloseTrigger(props, ref) {
    return <ChakraActionBar.CloseTrigger ref={ref} {...props} />;
  }
);

// Export namespace for compound component pattern
export const ActionBar = {
  Root: ActionBarRoot,
  Positioner: ActionBarPositioner,
  Content: ActionBarContent,
  SelectionTrigger: ActionBarSelectionTrigger,
  Separator: ActionBarSeparator,
  CloseTrigger: ActionBarCloseTrigger,
};
