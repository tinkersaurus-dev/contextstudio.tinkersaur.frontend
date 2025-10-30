'use client';

import { useLayoutEffect } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/app/theme";
import { getActiveTheme } from "@/app/themes/theme-registry";
import { injectThemeCSSVars } from "@/app/themes/theme-css-vars";

/**
 * Application-wide provider component that wraps Chakra UI's provider
 * with our custom theme system.
 *
 * This component should be used in the root layout to provide
 * theme context to all components in the application.
 *
 * Theme switching is handled by the ThemeProvider in the layout.
 * Initial CSS variables are injected before first paint to prevent FOUC.
 */
export function Provider({ children }: { children: React.ReactNode }) {
  // Inject initial theme CSS variables before first paint
  // This prevents Flash of Unstyled Content (FOUC)
  useLayoutEffect(() => {
    const initialTheme = getActiveTheme();
    injectThemeCSSVars(initialTheme);
  }, []);

  return (
    <ChakraProvider value={system}>
      {children}
    </ChakraProvider>
  );
}
