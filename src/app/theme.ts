import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * Custom theme configuration for the application.
 * This file centralizes all theme tokens, semantic tokens, and styles
 * for easy customization across the entire application.
 *
 * Supports both light and dark modes through semantic tokens.
 */
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // Add custom color tokens here if needed
        // Example:
        // brand: {
        //   50: { value: "#e6f2ff" },
        //   100: { value: "#bfdeff" },
        //   200: { value: "#99caff" },
        //   300: { value: "#72b5ff" },
        //   400: { value: "#4ca1ff" },
        //   500: { value: "#268dff" },
        //   600: { value: "#0070f3" },
        //   700: { value: "#0055b8" },
        //   800: { value: "#003a7d" },
        //   900: { value: "#002042" },
        //   950: { value: "#001a33" },
        // },
      },
    },
    semanticTokens: {
      colors: {
        // Add custom semantic tokens for your brand colors
        // These automatically adapt to light/dark mode
        // Example:
        // brand: {
        //   solid: { value: "{colors.brand.500}" },
        //   contrast: { value: "{colors.brand.100}" },
        //   fg: {
        //     value: {
        //       _light: "{colors.brand.700}",
        //       _dark: "{colors.brand.300}"
        //     }
        //   },
        //   muted: { value: "{colors.brand.100}" },
        //   subtle: { value: "{colors.brand.200}" },
        //   emphasized: { value: "{colors.brand.300}" },
        //   focusRing: { value: "{colors.brand.500}" },
        // },
      },
    },
    // Customize text styles
    textStyles: {
      // Add custom text styles here
      // Example:
      // heading: {
      //   value: {
      //     fontWeight: "bold",
      //     fontSize: "2xl",
      //     lineHeight: "1.2",
      //   },
      // },
    },
    // Customize layer styles (container styles)
    layerStyles: {
      // Add custom layer styles here
      // Example:
      // card: {
      //   value: {
      //     bg: "bg.surface",
      //     borderRadius: "lg",
      //     borderWidth: "1px",
      //     borderColor: "border",
      //     padding: "4",
      //   },
      // },
    },
  },
  // Global CSS
  globalCss: {
    // Add global styles here
    // Example:
    // body: {
    //   bg: "bg",
    //   color: "fg",
    // },
  },
});

export const system = createSystem(defaultConfig, config);
