import { Badge as ChakraBadge, type BadgeProps as ChakraBadgeProps } from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * Wrapped Badge component from Chakra UI.
 * This wrapper allows you to customize the badge behavior and styling
 * in one central location for use across the entire application.
 *
 * @example
 * ```tsx
 * <Badge>Default</Badge>
 * <Badge colorPalette="green">Success</Badge>
 * <Badge variant="outline">Outlined</Badge>
 * ```
 */
export type BadgeProps = ChakraBadgeProps;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(props, ref) {
    return <ChakraBadge ref={ref} {...props} />;
  }
);
