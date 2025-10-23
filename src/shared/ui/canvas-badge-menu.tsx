"use client";

import { Badge } from "./badge";
import { Menu } from "./menu";
import { ReactNode } from "react";

/**
 * Interface for menu items in the CanvasBadgeMenu
 */
export interface CanvasBadgeMenuItem {
  /**
   * Unique identifier for the menu item
   */
  id: string;

  /**
   * Label to display for the menu item
   */
  label: string;

  /**
   * Callback function when the menu item is selected
   */
  onSelect: () => void;

  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean;
}

/**
 * Props for the CanvasBadgeMenu component
 */
export interface CanvasBadgeMenuProps {
  /**
   * Content to display inside the badge trigger
   */
  badgeContent: ReactNode;

  /**
   * Array of menu items to display
   */
  menuItems: CanvasBadgeMenuItem[];

  /**
   * Color palette for the badge
   * @default "gray"
   */
  colorPalette?: "gray" | "red" | "orange" | "yellow" | "green" | "teal" | "blue" | "cyan" | "purple" | "pink";

  /**
   * Variant for the badge
   * @default "solid"
   */
  variant?: "solid" | "subtle" | "outline" | "surface" | "plain";

  /**
   * Size for the badge
   * @default "sm"
   */
  size?: "xs" | "sm" | "md" | "lg";

  /**
   * Additional CSS properties for positioning and styling
   */
  style?: React.CSSProperties;

  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * CanvasBadgeMenu component combines a Badge with a Menu to create
 * a clickable badge that opens a menu of actions.
 *
 * This is useful for canvas controls, indicators, and other UI elements
 * that need both display and interaction capabilities.
 *
 * @example
 * ```tsx
 * <CanvasBadgeMenu
 *   badgeContent="100%"
 *   menuItems={[
 *     {
 *       id: "reset",
 *       label: "Reset to 100%",
 *       onSelect: () => handleReset()
 *     }
 *   ]}
 *   colorPalette="gray"
 *   variant="solid"
 *   style={{ position: 'absolute', bottom: 16, right: 16 }}
 * />
 * ```
 */
export function CanvasBadgeMenu({
  badgeContent,
  menuItems,
  colorPalette = "gray",
  variant = "solid",
  size = "xs",
  style,
  className,
}: CanvasBadgeMenuProps) {
  return (
    <div style={style} className={className}>
      <Menu.Root>
        <Menu.Trigger asChild>
          <Badge
            colorPalette={colorPalette}
            variant={variant}
            size={size}
            cursor="pointer"
            userSelect="none"
            _hover={{ opacity: 0.8 }}
          >
            {badgeContent}
          </Badge>
        </Menu.Trigger>
        <Menu.Content>
          {menuItems.map((item) => (
            <Menu.Item
              key={item.id}
              value={item.id}
              onSelect={item.onSelect}
              disabled={item.disabled}
            >
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Root>
    </div>
  );
}
