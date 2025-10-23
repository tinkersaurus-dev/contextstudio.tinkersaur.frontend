"use client";

import { Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * Wrapped Menu components from Chakra UI.
 * These wrappers allow you to customize menu behavior and styling
 * in one central location for use across the entire application.
 */

// ========== Menu Root ==========

export interface MenuRootProps extends ChakraMenu.RootProps {
  /**
   * The color palette of the menu
   * @default "gray"
   */
  colorPalette?: "gray" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "cyan" | "purple" | "pink";

  /**
   * The variant of the menu
   * @default "subtle"
   */
  variant?: "subtle" | "solid";

  /**
   * The size of the menu
   * @default "sm"
   */
  size?: "sm" | "md";
}

export function MenuRoot(props: MenuRootProps) {
  return <ChakraMenu.Root {...props} />;
}

// ========== Menu Trigger ==========

export interface MenuTriggerProps extends ChakraMenu.TriggerProps {
  /**
   * Render the trigger as a child element
   */
  asChild?: boolean;
}

export const MenuTrigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function MenuTrigger(props, ref) {
    return <ChakraMenu.Trigger ref={ref} {...props} />;
  }
);

// ========== Menu Content ==========

export interface MenuContentProps extends ChakraMenu.ContentProps {
  /**
   * Whether to render the menu in a portal
   * @default true
   */
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement | null>;
}

export const MenuContent = forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(props, ref) {
    const { portalled = true, portalRef, ...rest } = props;
    return (
      <Portal disabled={!portalled} container={portalRef}>
        <ChakraMenu.Positioner>
          <ChakraMenu.Content ref={ref} {...rest} />
        </ChakraMenu.Positioner>
      </Portal>
    );
  }
);

// ========== Menu Item ==========

export interface MenuItemProps extends ChakraMenu.ItemProps {
  /**
   * The unique value of the menu item option
   */
  value: string;

  /**
   * Whether the menu should be closed when the option is selected
   */
  closeOnSelect?: boolean;

  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean;

  /**
   * Function called when the item is selected
   */
  onSelect?: () => void;
}

export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem(props, ref) {
    return <ChakraMenu.Item ref={ref} {...props} />;
  }
);

// ========== Menu Item Text ==========

export const MenuItemText = ChakraMenu.ItemText;

// ========== Menu Item Command ==========

export const MenuItemCommand = ChakraMenu.ItemCommand;

// ========== Menu Separator ==========

export const MenuSeparator = ChakraMenu.Separator;

// ========== Menu Item Group ==========

export interface MenuItemGroupProps extends ChakraMenu.ItemGroupProps {
  /**
   * The title of the group
   */
  title?: string;
}

export const MenuItemGroup = forwardRef<HTMLDivElement, MenuItemGroupProps>(
  function MenuItemGroup(props, ref) {
    const { title, children, ...rest } = props;
    return (
      <ChakraMenu.ItemGroup ref={ref} {...rest}>
        {title && (
          <ChakraMenu.ItemGroupLabel userSelect="none">
            {title}
          </ChakraMenu.ItemGroupLabel>
        )}
        {children}
      </ChakraMenu.ItemGroup>
    );
  }
);

// ========== Menu Exports ==========

/**
 * Menu component for displaying a list of actions or options.
 *
 * @example
 * ```tsx
 * <MenuRoot>
 *   <MenuTrigger asChild>
 *     <Button>Open Menu</Button>
 *   </MenuTrigger>
 *   <MenuContent>
 *     <MenuItem value="item-1" onSelect={() => console.log('Item 1')}>
 *       Item 1
 *     </MenuItem>
 *     <MenuItem value="item-2">Item 2</MenuItem>
 *     <MenuSeparator />
 *     <MenuItem value="item-3">Item 3</MenuItem>
 *   </MenuContent>
 * </MenuRoot>
 * ```
 */
export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  ItemText: MenuItemText,
  ItemCommand: MenuItemCommand,
  Separator: MenuSeparator,
  ItemGroup: MenuItemGroup,
};
