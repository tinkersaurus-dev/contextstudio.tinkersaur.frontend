import { ButtonGroup as ChakraButtonGroup } from "@chakra-ui/react";
import type { ButtonGroupProps as ChakraButtonGroupProps } from "@chakra-ui/react";
import { forwardRef } from "react";

/**
 * Wrapped ButtonGroup component from Chakra UI.
 * This wrapper allows you to customize the button group behavior and styling
 * in one central location for use across the entire application.
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button>Button 1</Button>
 *   <Button>Button 2</Button>
 * </ButtonGroup>
 * <ButtonGroup attached>
 *   <Button>Button 1</Button>
 *   <Button>Button 2</Button>
 * </ButtonGroup>
 * ```
 */
export type ButtonGroupProps = ChakraButtonGroupProps;

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroup(props, ref) {
    return <ChakraButtonGroup ref={ref} {...props} />;
  }
);
