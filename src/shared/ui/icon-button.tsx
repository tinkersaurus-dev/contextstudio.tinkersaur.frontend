import { IconButton as ChakraIconButton, type IconButtonProps as ChakraIconButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * Wrapped IconButton component from Chakra UI.
 * This wrapper allows you to customize the icon button behavior and styling
 * in one central location for use across the entire application.
 *
 * @example
 * ```tsx
 * import { LuSearch } from "react-icons/lu";
 *
 * <IconButton aria-label="Search">
 *   <LuSearch />
 * </IconButton>
 * <IconButton size="xs" variant="ghost">
 *   <LuSearch />
 * </IconButton>
 * ```
 */
export type IconButtonProps = ChakraIconButtonProps;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ size = "2xs", ...props }, ref) {
    return <ChakraIconButton ref={ref} borderRadius="0px" size={size} {...props} />;
  }
);
