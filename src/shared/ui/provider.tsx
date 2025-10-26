'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/app/theme";
import { ColorModeProvider } from "./color-mode";

/**
 * Application-wide provider component that wraps Chakra UI's provider
 * with our custom theme system and color mode support.
 *
 * This component should be used in the root layout to provide
 * theme context to all components in the application.
 *
 * The ColorModeProvider (using next-themes) enables theme switching
 * and persistence across page reloads.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>
        {children}
      </ChakraProvider>
    </ColorModeProvider>
  );
}
