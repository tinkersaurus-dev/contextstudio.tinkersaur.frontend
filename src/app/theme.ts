import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Custom theme configuration for the application.
 *
 * This file integrates our custom theme system with Chakra UI's theming.
 * Theme colors are provided via CSS custom properties (CSS variables) that
 * are injected at runtime by the ThemeProvider.
 *
 * This approach allows dynamic theme switching without page reloads.
 *
 * To change the active theme:
 * - Use the ThemeSelector component in the header
 * - Or call setTheme() from the useTheme() hook
 *
 * To create a new theme:
 * 1. Create a new theme file in src/app/themes/ (e.g., green.theme.ts)
 * 2. Register it in theme-registry.ts
 * 3. Theme will be available for selection automatically
 */

/**
 * Convert our theme configuration to Chakra UI config format
 *
 * All color values reference CSS custom properties (--theme-*) that are
 * injected dynamically by the ThemeProvider. This allows instant theme
 * switching without page reloads.
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
        // Primary color palette
        primary: {
          50: { value: "var(--theme-primary-50)" },
          100: { value: "var(--theme-primary-100)" },
          200: { value: "var(--theme-primary-200)" },
          300: { value: "var(--theme-primary-300)" },
          400: { value: "var(--theme-primary-400)" },
          500: { value: "var(--theme-primary-500)" },
          600: { value: "var(--theme-primary-600)" },
          700: { value: "var(--theme-primary-700)" },
          800: { value: "var(--theme-primary-800)" },
          900: { value: "var(--theme-primary-900)" },
          950: { value: "var(--theme-primary-950)" },
        },

        // Secondary color palette
        secondary: {
          50: { value: "var(--theme-secondary-50)" },
          100: { value: "var(--theme-secondary-100)" },
          200: { value: "var(--theme-secondary-200)" },
          300: { value: "var(--theme-secondary-300)" },
          400: { value: "var(--theme-secondary-400)" },
          500: { value: "var(--theme-secondary-500)" },
          600: { value: "var(--theme-secondary-600)" },
          700: { value: "var(--theme-secondary-700)" },
          800: { value: "var(--theme-secondary-800)" },
          900: { value: "var(--theme-secondary-900)" },
          950: { value: "var(--theme-secondary-950)" },
        },

        // Tertiary color palette
        tertiary: {
          50: { value: "var(--theme-tertiary-50)" },
          100: { value: "var(--theme-tertiary-100)" },
          200: { value: "var(--theme-tertiary-200)" },
          300: { value: "var(--theme-tertiary-300)" },
          400: { value: "var(--theme-tertiary-400)" },
          500: { value: "var(--theme-tertiary-500)" },
          600: { value: "var(--theme-tertiary-600)" },
          700: { value: "var(--theme-tertiary-700)" },
          800: { value: "var(--theme-tertiary-800)" },
          900: { value: "var(--theme-tertiary-900)" },
          950: { value: "var(--theme-tertiary-950)" },
        },

        // Neutral/gray palette
        neutral: {
          50: { value: "var(--theme-neutral-50)" },
          100: { value: "var(--theme-neutral-100)" },
          200: { value: "var(--theme-neutral-200)" },
          300: { value: "var(--theme-neutral-300)" },
          400: { value: "var(--theme-neutral-400)" },
          500: { value: "var(--theme-neutral-500)" },
          600: { value: "var(--theme-neutral-600)" },
          700: { value: "var(--theme-neutral-700)" },
          800: { value: "var(--theme-neutral-800)" },
          900: { value: "var(--theme-neutral-900)" },
          950: { value: "var(--theme-neutral-950)" },
        },

        // Status color palettes
        info: {
          50: { value: "var(--theme-info-50)" },
          100: { value: "var(--theme-info-100)" },
          200: { value: "var(--theme-info-200)" },
          300: { value: "var(--theme-info-300)" },
          400: { value: "var(--theme-info-400)" },
          500: { value: "var(--theme-info-500)" },
          600: { value: "var(--theme-info-600)" },
          700: { value: "var(--theme-info-700)" },
          800: { value: "var(--theme-info-800)" },
          900: { value: "var(--theme-info-900)" },
          950: { value: "var(--theme-info-950)" },
        },

        success: {
          50: { value: "var(--theme-success-50)" },
          100: { value: "var(--theme-success-100)" },
          200: { value: "var(--theme-success-200)" },
          300: { value: "var(--theme-success-300)" },
          400: { value: "var(--theme-success-400)" },
          500: { value: "var(--theme-success-500)" },
          600: { value: "var(--theme-success-600)" },
          700: { value: "var(--theme-success-700)" },
          800: { value: "var(--theme-success-800)" },
          900: { value: "var(--theme-success-900)" },
          950: { value: "var(--theme-success-950)" },
        },

        warning: {
          50: { value: "var(--theme-warning-50)" },
          100: { value: "var(--theme-warning-100)" },
          200: { value: "var(--theme-warning-200)" },
          300: { value: "var(--theme-warning-300)" },
          400: { value: "var(--theme-warning-400)" },
          500: { value: "var(--theme-warning-500)" },
          600: { value: "var(--theme-warning-600)" },
          700: { value: "var(--theme-warning-700)" },
          800: { value: "var(--theme-warning-800)" },
          900: { value: "var(--theme-warning-900)" },
          950: { value: "var(--theme-warning-950)" },
        },

        danger: {
          50: { value: "var(--theme-danger-50)" },
          100: { value: "var(--theme-danger-100)" },
          200: { value: "var(--theme-danger-200)" },
          300: { value: "var(--theme-danger-300)" },
          400: { value: "var(--theme-danger-400)" },
          500: { value: "var(--theme-danger-500)" },
          600: { value: "var(--theme-danger-600)" },
          700: { value: "var(--theme-danger-700)" },
          800: { value: "var(--theme-danger-800)" },
          900: { value: "var(--theme-danger-900)" },
          950: { value: "var(--theme-danger-950)" },
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
        "header.bg": { value: "var(--theme-ui-header-bg)" },
        "header.title": { value: "var(--theme-ui-header-title)" },
        "header.nav": { value: "var(--theme-ui-header-nav)" },
        "header.nav.hover": { value: "var(--theme-ui-header-nav-hover)" },

        // Panel colors
        "panel.bg": { value: "var(--theme-ui-panel-bg)" },
        "panel.text": { value: "var(--theme-ui-panel-text)" },

        // Sidebar colors
        "sidebar.bg": { value: "var(--theme-ui-sidebar-bg)" },
        "sidebar.toolbar": { value: "var(--theme-ui-sidebar-toolbar)" },
        "sidebar.text": { value: "var(--theme-ui-sidebar-text)" },
        "sidebar.borderMain": { value: "var(--theme-ui-sidebar-border-main)" },
        "sidebar.borderInternal": { value: "var(--theme-ui-sidebar-border-internal)" },
        "sidebar.hoverBg": { value: "var(--theme-ui-sidebar-hover-bg)" },
        "sidebar.hoverText": { value: "var(--theme-ui-sidebar-hover-text)" },
        "sidebar.hoverButton": { value: "var(--theme-ui-sidebar-hover-button)" },

        // Tabs colors
        "tabs.bg": { value: "var(--theme-ui-tabs-bg)" },
        "tabs.border": { value: "var(--theme-ui-tabs-border)" },
        "tabs.activeBg": { value: "var(--theme-ui-tabs-active-bg)" },
        "tabs.activeText": { value: "var(--theme-ui-tabs-active-text)" },
        "tabs.inactiveBg": { value: "var(--theme-ui-tabs-inactive-bg)" },
        "tabs.inactiveText": { value: "var(--theme-ui-tabs-inactive-text)" },
        "tabs.hoverBg": { value: "var(--theme-ui-tabs-hover-bg)" },
        "tabs.hoverText": { value: "var(--theme-ui-tabs-hover-text)" },

        // Editor colors
        "editor.bg": { value: "var(--theme-ui-editor-bg)" },
        "editor.text": { value: "var(--theme-ui-editor-text)" },
        "editor.lineNumbers": { value: "var(--theme-ui-editor-line-numbers)" },
        "editor.lineNumbersText": { value: "var(--theme-ui-editor-line-numbers-text)" },
        "editor.lineNumbersBorder": { value: "var(--theme-ui-editor-line-numbers-border)" },
        "editor.inputBorder": { value: "var(--theme-ui-editor-input-border)" },
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
