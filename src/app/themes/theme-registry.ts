import type { ThemeConfig, ThemeRegistry } from "./types";
import { defaultTheme } from "./default.theme";
import { lightTheme } from "./light.theme";
import { darkTheme } from "./dark.theme";
import { forestTheme } from "./forest.theme";

/**
 * Theme registry
 *
 * Central registry of all available themes in the application.
 * Add new themes here to make them available for selection.
 */
const themes: ThemeRegistry = {
  light: lightTheme,
  dark: darkTheme,
  default: defaultTheme,
  forest: forestTheme,
  // Add more themes here as they are created
  // Example:
  // purple: purpleTheme,
  // ocean: oceanTheme,
};

/**
 * Default theme ID to use when no theme is specified
 */
const DEFAULT_THEME_ID = "default";

/**
 * Get a theme by ID
 *
 * @param themeId - The ID of the theme to retrieve
 * @returns The theme configuration, or the default theme if not found
 */
export function getTheme(themeId?: string): ThemeConfig {
  const id = themeId || DEFAULT_THEME_ID;
  const theme = themes[id];

  if (!theme) {
    console.warn(
      `Theme "${id}" not found. Falling back to default theme.`
    );
    return themes[DEFAULT_THEME_ID];
  }

  return theme;
}

/**
 * Get all available themes
 *
 * @returns Array of all theme configurations
 */
export function getAllThemes(): ThemeConfig[] {
  return Object.values(themes);
}

/**
 * Get all theme IDs
 *
 * @returns Array of theme IDs
 */
export function getThemeIds(): string[] {
  return Object.keys(themes);
}

/**
 * Check if a theme exists
 *
 * @param themeId - The ID to check
 * @returns True if the theme exists
 */
export function hasTheme(themeId: string): boolean {
  return themeId in themes;
}

/**
 * Register a new theme
 *
 * @param theme - The theme configuration to register
 */
export function registerTheme(theme: ThemeConfig): void {
  if (themes[theme.id]) {
    console.warn(
      `Theme "${theme.id}" is already registered. It will be overwritten.`
    );
  }
  themes[theme.id] = theme;
}

/**
 * Get the current active theme
 *
 * Checks in order:
 * 1. localStorage (client-side only)
 * 2. Environment variable (NEXT_PUBLIC_THEME_ID)
 * 3. Default theme
 *
 * @returns The currently active theme configuration
 */
export function getActiveTheme(): ThemeConfig {
  let themeId: string;

  // Check localStorage first (client-side only)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("app-theme-id");
    if (stored) {
      themeId = stored;
      return getTheme(themeId);
    }
  }

  // Fall back to environment variable or default
  themeId = process.env.NEXT_PUBLIC_THEME_ID || DEFAULT_THEME_ID;
  return getTheme(themeId);
}
