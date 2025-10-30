import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { getActiveTheme } from "./themes";

/**
 * Custom theme configuration for the application.
 *
 * This file integrates our custom theme system with Chakra UI's theming.
 * The active theme is loaded from the theme registry and converted to
 * Chakra UI's configuration format.
 *
 * Supports both light and dark modes through semantic tokens.
 *
 * To change the active theme:
 * - Set NEXT_PUBLIC_THEME_ID environment variable, or
 * - Modify the getActiveTheme() function in theme-registry.ts
 *
 * To create a new theme:
 * 1. Create a new theme file in src/app/themes/ (e.g., green.theme.ts)
 * 2. Register it in theme-registry.ts
 * 3. Set NEXT_PUBLIC_THEME_ID to use it
 */

// Get the active theme from the registry
const activeTheme = getActiveTheme();

/**
 * Convert our theme configuration to Chakra UI config format
 */
const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: '"Nunito Sans Variable", var(--font-nunito-sans), system-ui, sans-serif' },
        heading: { value: '"Nunito Sans Variable", var(--font-nunito-sans), system-ui, sans-serif' },
        mono: { value: "var(--font-geist-mono), monospace" },
      },
      colors: {
        // Primary color palette (renamed from "brand")
        primary: {
          50: { value: activeTheme.primary[50] },
          100: { value: activeTheme.primary[100] },
          200: { value: activeTheme.primary[200] },
          300: { value: activeTheme.primary[300] },
          400: { value: activeTheme.primary[400] },
          500: { value: activeTheme.primary[500] },
          600: { value: activeTheme.primary[600] },
          700: { value: activeTheme.primary[700] },
          800: { value: activeTheme.primary[800] },
          900: { value: activeTheme.primary[900] },
          950: { value: activeTheme.primary[950] },
        },

        // Secondary color palette
        secondary: {
          50: { value: activeTheme.secondary[50] },
          100: { value: activeTheme.secondary[100] },
          200: { value: activeTheme.secondary[200] },
          300: { value: activeTheme.secondary[300] },
          400: { value: activeTheme.secondary[400] },
          500: { value: activeTheme.secondary[500] },
          600: { value: activeTheme.secondary[600] },
          700: { value: activeTheme.secondary[700] },
          800: { value: activeTheme.secondary[800] },
          900: { value: activeTheme.secondary[900] },
          950: { value: activeTheme.secondary[950] },
        },

        // Tertiary color palette
        tertiary: {
          50: { value: activeTheme.tertiary[50] },
          100: { value: activeTheme.tertiary[100] },
          200: { value: activeTheme.tertiary[200] },
          300: { value: activeTheme.tertiary[300] },
          400: { value: activeTheme.tertiary[400] },
          500: { value: activeTheme.tertiary[500] },
          600: { value: activeTheme.tertiary[600] },
          700: { value: activeTheme.tertiary[700] },
          800: { value: activeTheme.tertiary[800] },
          900: { value: activeTheme.tertiary[900] },
          950: { value: activeTheme.tertiary[950] },
        },

        // Neutral/gray palette
        neutral: {
          50: { value: activeTheme.neutral[50] },
          100: { value: activeTheme.neutral[100] },
          200: { value: activeTheme.neutral[200] },
          300: { value: activeTheme.neutral[300] },
          400: { value: activeTheme.neutral[400] },
          500: { value: activeTheme.neutral[500] },
          600: { value: activeTheme.neutral[600] },
          700: { value: activeTheme.neutral[700] },
          800: { value: activeTheme.neutral[800] },
          900: { value: activeTheme.neutral[900] },
          950: { value: activeTheme.neutral[950] },
        },

        // Status color palettes
        info: {
          50: { value: activeTheme.status.info[50] },
          100: { value: activeTheme.status.info[100] },
          200: { value: activeTheme.status.info[200] },
          300: { value: activeTheme.status.info[300] },
          400: { value: activeTheme.status.info[400] },
          500: { value: activeTheme.status.info[500] },
          600: { value: activeTheme.status.info[600] },
          700: { value: activeTheme.status.info[700] },
          800: { value: activeTheme.status.info[800] },
          900: { value: activeTheme.status.info[900] },
          950: { value: activeTheme.status.info[950] },
        },

        success: {
          50: { value: activeTheme.status.success[50] },
          100: { value: activeTheme.status.success[100] },
          200: { value: activeTheme.status.success[200] },
          300: { value: activeTheme.status.success[300] },
          400: { value: activeTheme.status.success[400] },
          500: { value: activeTheme.status.success[500] },
          600: { value: activeTheme.status.success[600] },
          700: { value: activeTheme.status.success[700] },
          800: { value: activeTheme.status.success[800] },
          900: { value: activeTheme.status.success[900] },
          950: { value: activeTheme.status.success[950] },
        },

        warning: {
          50: { value: activeTheme.status.warning[50] },
          100: { value: activeTheme.status.warning[100] },
          200: { value: activeTheme.status.warning[200] },
          300: { value: activeTheme.status.warning[300] },
          400: { value: activeTheme.status.warning[400] },
          500: { value: activeTheme.status.warning[500] },
          600: { value: activeTheme.status.warning[600] },
          700: { value: activeTheme.status.warning[700] },
          800: { value: activeTheme.status.warning[800] },
          900: { value: activeTheme.status.warning[900] },
          950: { value: activeTheme.status.warning[950] },
        },

        danger: {
          50: { value: activeTheme.status.danger[50] },
          100: { value: activeTheme.status.danger[100] },
          200: { value: activeTheme.status.danger[200] },
          300: { value: activeTheme.status.danger[300] },
          400: { value: activeTheme.status.danger[400] },
          500: { value: activeTheme.status.danger[500] },
          600: { value: activeTheme.status.danger[600] },
          700: { value: activeTheme.status.danger[700] },
          800: { value: activeTheme.status.danger[800] },
          900: { value: activeTheme.status.danger[900] },
          950: { value: activeTheme.status.danger[950] },
        },
      },
    },
    semanticTokens: {
      colors: {
        // Primary semantic tokens that adapt to light/dark mode
        primary: {
          solid: { value: "{colors.primary.500}" },
          contrast: { value: "{colors.primary.100}" },
          fg: {
            value: {
              _light: "{colors.primary.700}",
              _dark: "{colors.primary.300}",
            },
          },
          muted: { value: "{colors.primary.100}" },
          subtle: { value: "{colors.primary.200}" },
          emphasized: { value: "{colors.primary.300}" },
          focusRing: { value: "{colors.primary.500}" },
        },

        // Header-specific colors
        "header.bg": { value: activeTheme.ui.header.bg },
        "header.title": { value: activeTheme.ui.header.title },
        "header.nav": { value: activeTheme.ui.header.nav },
        "header.nav.hover": { value: activeTheme.ui.header.navHover },

        // Panel colors
        "panel.bg": { value: activeTheme.ui.panel.bg },
        "panel.text": { value: activeTheme.ui.panel.text },

        // Sidebar colors
        "sidebar.bg": { value: activeTheme.ui.sidebar.bg },
        "sidebar.toolbar": { value: activeTheme.ui.sidebar.toolbar },
        "sidebar.text": { value: activeTheme.ui.sidebar.text },
        "sidebar.borderMain": { value: activeTheme.ui.sidebar.borderMain },
        "sidebar.borderInternal": { value: activeTheme.ui.sidebar.borderInternal },
        "sidebar.hoverBg": { value: activeTheme.ui.sidebar.hoverBg },
        "sidebar.hoverText": { value: activeTheme.ui.sidebar.hoverText },
        "sidebar.hoverButton": { value: activeTheme.ui.sidebar.hoverButton },

        // Tabs colors
        "tabs.bg": { value: activeTheme.ui.tabs.bg },
        "tabs.border": { value: activeTheme.ui.tabs.border },
        "tabs.activeBg": { value: activeTheme.ui.tabs.activeBg },
        "tabs.activeText": { value: activeTheme.ui.tabs.activeText },
        "tabs.inactiveBg": { value: activeTheme.ui.tabs.inactiveBg },
        "tabs.inactiveText": { value: activeTheme.ui.tabs.inactiveText },
        "tabs.hoverBg": { value: activeTheme.ui.tabs.hoverBg },
        "tabs.hoverText": { value: activeTheme.ui.tabs.hoverText },

        // Editor colors
        "editor.bg": { value: activeTheme.ui.editor.bg },
        "editor.text": { value: activeTheme.ui.editor.text },
        "editor.lineNumbers": { value: activeTheme.ui.editor.lineNumbers },
        "editor.lineNumbersText": { value: activeTheme.ui.editor.lineNumbersText },
        "editor.lineNumbersBorder": { value: activeTheme.ui.editor.lineNumbersBorder },
        "editor.inputBorder": { value: activeTheme.ui.editor.inputBorder },
      },
    },
    // Customize text styles
    textStyles: {
      // Add custom text styles here if needed
    },
    // Customize layer styles (container styles)
    layerStyles: {
      // Add custom layer styles here if needed
    },
  },
  // Global CSS
  globalCss: {
    // Add global styles here if needed
  },
});

export const system = createSystem(config, defaultConfig);

/**
 * Export the active theme for use in non-Chakra contexts
 * (canvas rendering, custom components, etc.)
 */
export { activeTheme };
