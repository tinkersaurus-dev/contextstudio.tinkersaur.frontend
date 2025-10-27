import type { ThemeConfig } from "./types";

/**
 * Forest Green Theme
 *
 * A nature-inspired theme with green primary colors,
 * brown secondary tones, and orange tertiary accents.
 *
 * Primary: Forest Green
 * Secondary: Earthy Brown
 * Tertiary: Autumn Orange
 */
export const forestTheme: ThemeConfig = {
  id: "forest",
  name: "Forest Green",
  description: "Nature-inspired theme with green, brown, and orange tones",

  // Primary color: Forest Green
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e", // Base green
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },

  // Secondary color: Earthy Brown
  secondary: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
    950: "#0c0a09",
  },

  // Tertiary color: Autumn Orange
  tertiary: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316", // Base orange
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },

  // Neutral: Warm gray scale
  neutral: {
    50: "#fafaf9",
    100: "#f5f5f4",
    200: "#e7e5e4",
    300: "#d6d3d1",
    400: "#a8a29e",
    500: "#78716c",
    600: "#57534e",
    700: "#44403c",
    800: "#292524",
    900: "#1c1917",
    950: "#0c0a09",
  },

  // Canvas-specific colors
  canvas: {
    background: "#fafaf9", // Warm light background

    grid: {
      minor: "#d6d3d1", // Light brown
      major: "#d6d3d1",
    },

    selection: {
      border: "#f97316", // Tertiary.500 (orange)
      fill: "rgba(249, 115, 22, 0.1)", // Semi-transparent orange
    },

    selectionBox: {
      border: "#22c55e", // Primary.500 (green)
      fill: "rgba(34, 197, 94, 0.1)", // Semi-transparent green
    },

    shapes: {
      fill: "#ffffff", // White
      stroke: "#1c1917", // Dark brown
      text: "#1c1917", // Dark brown
    },

    connectors: {
      default: "#1c1917", // Dark brown
      selected: "#f97316", // Tertiary.500 (orange)
      hover: "#22c55e", // Primary.500 (green)
    },

    connectionPoints: {
      default: "#22c55e", // Primary.500 (green)
      hover: "#f97316", // Tertiary.500 (orange)
      border: "#ffffff", // White
    },
  },

  // UI component semantic tokens (forest uses light mode values)
  ui: {
    header: {
      bg: "#14532d", // Primary.900
      title: "#dcfce7", // Primary.100
      nav: "#dcfce7", // Primary.100
      navHover: "#f0fdf4", // Primary.50
    },

    panel: {
      bg: "#a8a29e", // Primary.900
      text: "#052e16"
    },

    sidebar: {
      bg: "#ffffff", // White
      toolbar: "#bbf7d0", // Primary.200
      text: "#052e16", // Primary.950
    },

    editor: {
      bg: "#ffffff", // White
      text: "#052e16", // Primary.950
      lineNumbers: "#f5f5f4", // Secondary.100
      lineNumbersText: "#78716c", // Secondary.500
      lineNumbersBorder: "#d6d3d1", // Secondary.300
      inputBorder: "#16a34a", // Primary.600
    },
  },

  // Diagram-specific colors
  diagrams: {
    bpmn: {
      task: { fill: "#ffffff", stroke: "#1c1917" },
      event: { fill: "#ffffff", stroke: "#1c1917" },
      gateway: { fill: "#ffffff", stroke: "#1c1917" },
      pool: { fill: "#ffffff", stroke: "#1c1917" },
    },

    sequence: {
      actor: { fill: "#ffffff", stroke: "#1c1917" },
      lifeline: { fill: "#ffffff", stroke: "#1c1917" },
      activation: { fill: "#dcfce7", stroke: "#1c1917" }, // Light green
      note: { fill: "#ffedd5", stroke: "#1c1917" }, // Light orange
    },

    dataFlow: {
      process: { fill: "#ffffff", stroke: "#1c1917" },
      dataStore: { fill: "#ffffff", stroke: "#1c1917" },
      entity: { fill: "#ffffff", stroke: "#1c1917" },
      subprocess: { fill: "#fafaf9", stroke: "#1c1917" }, // Warm light gray
    },
  },

  // Markdown styling colors
  markdown: {
    code: {
      bg: "#f5f5f4", // Secondary.100
      border: "#e7e5e4", // Secondary.200
    },

    blockquote: {
      border: "#e7e5e4", // Secondary.200
      text: "#78716c", // Secondary.500
    },

    link: "#15803d", // Primary.700

    table: {
      border: "#e7e5e4", // Secondary.200
      headerBg: "#f5f5f4", // Secondary.100
    },

    headingBorder: "#e7e5e4", // Secondary.200

    hr: "#e7e5e4", // Secondary.200
  },

  // Status colors
  status: {
    // Info: Teal tones
    info: {
      50: "#f0fdfa",
      100: "#ccfbf1",
      200: "#99f6e4",
      300: "#5eead4",
      400: "#2dd4bf",
      500: "#14b8a6",
      600: "#0d9488",
      700: "#0f766e",
      800: "#115e59",
      900: "#134e4a",
      950: "#042f2e",
    },

    // Success: Green (same as primary)
    success: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
      950: "#052e16",
    },

    // Warning: Amber tones
    warning: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
      950: "#451a03",
    },

    // Danger: Red tones
    danger: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
      950: "#450a0a",
    },
  },
};
