'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/app/theme";

/**
 * Application-wide provider component that wraps Chakra UI's provider
 * with our custom theme system.
 *
 * This component should be used in the root layout to provide
 * theme context to all components in the application.
 *
 * Theme switching is handled by the ThemeProvider in the layout.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );
}
