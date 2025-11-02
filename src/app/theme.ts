import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import {
  standardBluePalette,
  deuteranopiaAmberPalette,
  neutralGrayPalette,
  infoBluePalette,
  successGreenPalette,
  warningAmberPalette,
  dangerRedPalette,
} from "./themes/color-palettes";

/**
 * Custom theme configuration for the application.
 *
 * This theme system supports:
 * - Color modes: light and dark (via next-themes)
 * - Theme variants: standard and deuteranopia (colorblind-friendly)
 *
 * Total combinations: 4 (standard-light, standard-dark, deuteranopia-light, deuteranopia-dark)
 *
 * Theme variant is controlled via data-theme attribute on <html>:
 * - [data-theme="standard"] - Default blue-based theme
 * - [data-theme="deuteranopia"] - Amber-based colorblind-friendly theme
 *
 * Color mode is controlled via class on <html>:
 * - .light - Light mode
 * - .dark - Dark mode
 */

/**
 * Helper to convert color palette object to Chakra token format
 */
function paletteToTokens(palette: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(palette).map(([key, value]) => [key, { value }])
  );
}

const config = defineConfig({
  // Define custom conditions for theme variants
  conditions: {
    standard: '[data-theme="standard"] &',
    deuteranopia: '[data-theme="deuteranopia"] &',
  },

  theme: {
    tokens: {
      fonts: {
        body: { value: '"Nunito Sans Variable", var(--font-nunito-sans), system-ui, sans-serif' },
        heading: { value: '"Nunito Sans Variable", var(--font-nunito-sans), system-ui, sans-serif' },
        mono: { value: "var(--font-geist-mono), monospace" },
      },
      colors: {
        // Base color palettes
        brand: paletteToTokens(standardBluePalette),
        brandColorblind: paletteToTokens(deuteranopiaAmberPalette),
        neutral: paletteToTokens(neutralGrayPalette),
        info: paletteToTokens(infoBluePalette),
        success: paletteToTokens(successGreenPalette),
        warning: paletteToTokens(warningAmberPalette),
        danger: paletteToTokens(dangerRedPalette),
      },
    },

    semanticTokens: {
      colors: {
        // Primary brand color - adapts to both variant and color mode
        primary: {
          solid: {
            value: {
              base: "{colors.brand.500}",
              _dark: "{colors.brand.400}",
              deuteranopia: "{colors.brandColorblind.500}",
              _dark__deuteranopia: "{colors.brandColorblind.400}",
            },
          },
          contrast: {
            value: {
              base: "{colors.brand.100}",
              _dark: "{colors.brand.900}",
              deuteranopia: "{colors.brandColorblind.100}",
              _dark__deuteranopia: "{colors.brandColorblind.900}",
            },
          },
          fg: {
            value: {
              base: "{colors.brand.700}",
              _dark: "{colors.brand.300}",
              deuteranopia: "{colors.brandColorblind.700}",
              _dark__deuteranopia: "{colors.brandColorblind.300}",
            },
          },
          muted: { value: "{colors.brand.100}" },
          subtle: { value: "{colors.brand.200}" },
          emphasized: { value: "{colors.brand.300}" },
          focusRing: {
            value: {
              base: "{colors.brand.500}",
              _dark: "{colors.brand.400}",
              deuteranopia: "{colors.brandColorblind.500}",
              _dark__deuteranopia: "{colors.brandColorblind.400}",
            },
          },
        },

        // Canvas colors
        "canvas.background": {
          value: {
            base: "#f7f7f7",
            _dark: "#1a1a1a",
          },
        },
        "canvas.grid": {
          value: {
            base: "#CED8F7",
            _dark: "#374151",
          },
        },
        "canvas.selection.border": {
          value: {
            base: "#ff6b35",
            _dark: "#ff8c5a",
            deuteranopia: "{colors.brandColorblind.600}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },
        "canvas.selection.fill": {
          value: {
            base: "rgba(255, 107, 53, 0.1)",
            _dark: "rgba(255, 140, 90, 0.1)",
            deuteranopia: "rgba(217, 119, 6, 0.1)",
            _dark__deuteranopia: "rgba(251, 191, 36, 0.1)",
          },
        },
        "canvas.selectionBox.border": {
          value: {
            base: "{colors.info.500}",
            _dark: "{colors.info.400}",
          },
        },
        "canvas.selectionBox.fill": {
          value: {
            base: "rgba(59, 130, 246, 0.1)",
            _dark: "rgba(96, 165, 250, 0.1)",
          },
        },
        "canvas.shapes.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "canvas.shapes.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "canvas.shapes.text": {
          value: {
            base: "#000000",
            _dark: "#f5f5f5",
          },
        },
        "canvas.connectors.default": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "canvas.connectors.selected": {
          value: {
            base: "#ff6b35",
            _dark: "#ff8c5a",
            deuteranopia: "{colors.brandColorblind.600}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },
        "canvas.connectors.hover": {
          value: {
            base: "{colors.brand.500}",
            _dark: "{colors.brand.400}",
            deuteranopia: "{colors.brandColorblind.500}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },
        "canvas.connectionPoints.default": {
          value: {
            base: "{colors.brand.500}",
            _dark: "{colors.brand.400}",
            deuteranopia: "{colors.brandColorblind.500}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },
        "canvas.connectionPoints.hover": {
          value: {
            base: "#ff6b35",
            _dark: "#ff8c5a",
            deuteranopia: "{colors.brandColorblind.600}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },
        "canvas.connectionPoints.border": {
          value: {
            base: "#ffffff",
            _dark: "#1a1a1a",
          },
        },

        // Header colors
        "header.bg": {
          value: {
            base: "{colors.brand.900}",
            _dark: "{colors.brand.950}",
            deuteranopia: "{colors.brandColorblind.900}",
            _dark__deuteranopia: "{colors.brandColorblind.950}",
          },
        },
        "header.title": {
          value: {
            base: "{colors.brand.100}",
            _dark: "{colors.brand.100}",
            deuteranopia: "{colors.brandColorblind.100}",
            _dark__deuteranopia: "{colors.brandColorblind.100}",
          },
        },
        "header.nav": {
          value: {
            base: "{colors.brand.100}",
            _dark: "{colors.brand.100}",
            deuteranopia: "{colors.brandColorblind.100}",
            _dark__deuteranopia: "{colors.brandColorblind.100}",
          },
        },
        "header.nav.hover": {
          value: {
            base: "{colors.brand.50}",
            _dark: "{colors.brand.50}",
            deuteranopia: "{colors.brandColorblind.50}",
            _dark__deuteranopia: "{colors.brandColorblind.50}",
          },
        },

        // Panel colors
        "panel.bg": {
          value: {
            base: "{colors.brand.900}",
            _dark: "{colors.brand.950}",
            deuteranopia: "{colors.brandColorblind.900}",
            _dark__deuteranopia: "{colors.brandColorblind.950}",
          },
        },
        "panel.text": {
          value: {
            base: "{colors.brand.100}",
            _dark: "{colors.brand.100}",
            deuteranopia: "{colors.brandColorblind.100}",
            _dark__deuteranopia: "{colors.brandColorblind.100}",
          },
        },

        // Sidebar colors
        "sidebar.bg": {
          value: {
            base: "#ffffff",
            _dark: "#1f1f1f",
          },
        },
        "sidebar.toolbar": {
          value: {
            base: "{colors.brand.200}",
            _dark: "{colors.brand.800}",
            deuteranopia: "{colors.brandColorblind.200}",
            _dark__deuteranopia: "{colors.brandColorblind.800}",
          },
        },
        "sidebar.text": {
          value: {
            base: "{colors.brand.950}",
            _dark: "{colors.brand.50}",
            deuteranopia: "{colors.brandColorblind.950}",
            _dark__deuteranopia: "{colors.brandColorblind.50}",
          },
        },
        "sidebar.borderMain": {
          value: {
            base: "{colors.neutral.300}",
            _dark: "{colors.neutral.700}",
          },
        },
        "sidebar.borderInternal": {
          value: {
            base: "{colors.neutral.200}",
            _dark: "{colors.neutral.800}",
          },
        },
        "sidebar.hoverBg": {
          value: {
            base: "{colors.brand.50}",
            _dark: "{colors.brand.900}",
            deuteranopia: "{colors.brandColorblind.50}",
            _dark__deuteranopia: "{colors.brandColorblind.900}",
          },
        },
        "sidebar.hoverText": {
          value: {
            base: "{colors.brand.900}",
            _dark: "{colors.brand.50}",
            deuteranopia: "{colors.brandColorblind.900}",
            _dark__deuteranopia: "{colors.brandColorblind.50}",
          },
        },
        "sidebar.hoverButton": {
          value: {
            base: "{colors.brand.400}",
            _dark: "{colors.brand.400}",
            deuteranopia: "{colors.brandColorblind.400}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },

        // Tabs colors
        "tabs.bg": {
          value: {
            base: "{colors.neutral.50}",
            _dark: "{colors.neutral.900}",
          },
        },
        "tabs.border": {
          value: {
            base: "{colors.neutral.300}",
            _dark: "{colors.neutral.700}",
          },
        },
        "tabs.activeBg": {
          value: {
            base: "#ffffff",
            _dark: "{colors.neutral.800}",
          },
        },
        "tabs.activeText": {
          value: {
            base: "{colors.brand.900}",
            _dark: "{colors.brand.50}",
            deuteranopia: "{colors.brandColorblind.900}",
            _dark__deuteranopia: "{colors.brandColorblind.50}",
          },
        },
        "tabs.inactiveBg": {
          value: {
            base: "{colors.neutral.50}",
            _dark: "{colors.neutral.900}",
          },
        },
        "tabs.inactiveText": {
          value: {
            base: "{colors.neutral.500}",
            _dark: "{colors.neutral.400}",
          },
        },
        "tabs.hoverBg": {
          value: {
            base: "{colors.brand.50}",
            _dark: "{colors.brand.900}",
            deuteranopia: "{colors.brandColorblind.50}",
            _dark__deuteranopia: "{colors.brandColorblind.900}",
          },
        },
        "tabs.hoverText": {
          value: {
            base: "{colors.brand.950}",
            _dark: "{colors.brand.50}",
            deuteranopia: "{colors.brandColorblind.950}",
            _dark__deuteranopia: "{colors.brandColorblind.50}",
          },
        },

        // Editor colors
        "editor.bg": {
          value: {
            base: "#ffffff",
            _dark: "#1f1f1f",
          },
        },
        "editor.text": {
          value: {
            base: "{colors.brand.950}",
            _dark: "{colors.brand.50}",
            deuteranopia: "{colors.brandColorblind.950}",
            _dark__deuteranopia: "{colors.brandColorblind.50}",
          },
        },
        "editor.lineNumbers": {
          value: {
            base: "{colors.neutral.100}",
            _dark: "{colors.neutral.800}",
          },
        },
        "editor.lineNumbersText": {
          value: {
            base: "{colors.neutral.500}",
            _dark: "{colors.neutral.400}",
          },
        },
        "editor.lineNumbersBorder": {
          value: {
            base: "{colors.neutral.300}",
            _dark: "{colors.neutral.700}",
          },
        },
        "editor.inputBorder": {
          value: {
            base: "{colors.brand.600}",
            _dark: "{colors.brand.400}",
            deuteranopia: "{colors.brandColorblind.600}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },

        // Diagram colors - BPMN
        "diagram.bpmn.task.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.bpmn.task.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.bpmn.event.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.bpmn.event.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.bpmn.gateway.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.bpmn.gateway.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.bpmn.pool.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.bpmn.pool.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },

        // Diagram colors - Sequence
        "diagram.sequence.actor.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.sequence.actor.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.sequence.lifeline.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.sequence.lifeline.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.sequence.activation.fill": {
          value: {
            base: "#e3f2fd",
            _dark: "#1e3a5f",
          },
        },
        "diagram.sequence.activation.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.sequence.note.fill": {
          value: {
            base: "#fffde7",
            _dark: "#3d3d1f",
          },
        },
        "diagram.sequence.note.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },

        // Diagram colors - Data Flow
        "diagram.dataFlow.process.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.dataFlow.process.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.dataFlow.dataStore.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.dataFlow.dataStore.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.dataFlow.entity.fill": {
          value: {
            base: "#ffffff",
            _dark: "#2d2d2d",
          },
        },
        "diagram.dataFlow.entity.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },
        "diagram.dataFlow.subprocess.fill": {
          value: {
            base: "#f5f5f5",
            _dark: "#262626",
          },
        },
        "diagram.dataFlow.subprocess.stroke": {
          value: {
            base: "#000000",
            _dark: "#e5e5e5",
          },
        },

        // Markdown colors
        "markdown.code.bg": {
          value: {
            base: "{colors.neutral.100}",
            _dark: "{colors.neutral.800}",
          },
        },
        "markdown.code.border": {
          value: {
            base: "{colors.neutral.200}",
            _dark: "{colors.neutral.700}",
          },
        },
        "markdown.blockquote.border": {
          value: {
            base: "{colors.neutral.200}",
            _dark: "{colors.neutral.700}",
          },
        },
        "markdown.blockquote.text": {
          value: {
            base: "{colors.neutral.500}",
            _dark: "{colors.neutral.400}",
          },
        },
        "markdown.link": {
          value: {
            base: "{colors.brand.600}",
            _dark: "{colors.brand.400}",
            deuteranopia: "{colors.brandColorblind.600}",
            _dark__deuteranopia: "{colors.brandColorblind.400}",
          },
        },
        "markdown.table.border": {
          value: {
            base: "{colors.neutral.200}",
            _dark: "{colors.neutral.700}",
          },
        },
        "markdown.table.headerBg": {
          value: {
            base: "{colors.neutral.100}",
            _dark: "{colors.neutral.800}",
          },
        },
        "markdown.headingBorder": {
          value: {
            base: "{colors.neutral.200}",
            _dark: "{colors.neutral.700}",
          },
        },
        "markdown.hr": {
          value: {
            base: "{colors.neutral.200}",
            _dark: "{colors.neutral.700}",
          },
        },
      },
    },
  },
  globalCss: {},
});

export const system = createSystem(config, defaultConfig);
