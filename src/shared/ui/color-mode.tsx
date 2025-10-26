"use client";

import { ThemeProvider, useTheme } from "next-themes";

/**
 * Color mode provider component that wraps next-themes ThemeProvider.
 * This is required for Chakra UI v3 color mode support.
 *
 * @see https://www.chakra-ui.com/docs/theming/color-mode
 */
export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

/**
 * Hook to access and control the current color mode.
 * Returns the current theme and a function to toggle between light/dark modes.
 *
 * @example
 * ```tsx
 * const { colorMode, toggleColorMode } = useColorMode();
 * ```
 */
export function useColorMode() {
  const { theme, setTheme } = useTheme();

  return {
    colorMode: theme as "light" | "dark" | undefined,
    setColorMode: setTheme,
    toggleColorMode: () => {
      setTheme(theme === "light" ? "dark" : "light");
    },
  };
}

/**
 * Hook to get a value based on the current color mode.
 * Returns the light value in light mode, and dark value in dark mode.
 *
 * @param light - Value to return in light mode
 * @param dark - Value to return in dark mode
 * @returns The appropriate value based on current color mode
 *
 * @example
 * ```tsx
 * const bg = useColorModeValue('white', 'gray.800');
 * ```
 */
export function useColorModeValue<T>(light: T, dark: T): T {
  const { theme } = useTheme();
  return theme === "light" ? light : dark;
}
