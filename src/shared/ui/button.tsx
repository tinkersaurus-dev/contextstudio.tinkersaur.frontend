import { Button as ChakraButton, type ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * Wrapped Button component from Chakra UI.
 * This wrapper allows you to customize the button behavior and styling
 * in one central location for use across the entire application.
 *
 * @example
 * ```tsx
 * <Button>Click me</Button>
 * <Button colorPalette="blue" variant="outline">Outlined</Button>
 * <Button size="sm" loading>Loading...</Button>
 * ```
 */
export type ButtonProps = ChakraButtonProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    return <ChakraButton ref={ref} {...props} />;
  }
);
