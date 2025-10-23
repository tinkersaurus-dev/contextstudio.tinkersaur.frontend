'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/app/theme";

/**
 * Application-wide provider component that wraps Chakra UI's provider
 * with our custom theme system and color mode support.
 *
 * This component should be used in the root layout to provide
 * theme context to all components in the application.
 *
 * The ChakraProvider automatically includes color mode support
 * when used with the system configuration.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );
}
