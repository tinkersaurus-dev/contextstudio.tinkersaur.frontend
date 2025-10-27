import type { ThemeConfig } from "./types";

/**
 * Default theme configuration
 *
 * This is the original blue-based theme extracted from the existing
 * theme.ts file and various configuration files throughout the app.
 *
 * Primary: Blue (#268dff and variants)
 * Secondary: Gray (neutral tones)
 * Tertiary: Orange (selection/accent)
 */
export const defaultTheme: ThemeConfig = {
  id: "default",
  name: "Default Blue",
  description: "Original blue-based theme with orange accents",

  // Primary color: Blue (from original brand colors)
  primary: {
    50: "#e6f2ff",
    100: "#bfdeff",
    200: "#99caff",
    300: "#72b5ff",
    400: "#4ca1ff",
    500: "#268dff", // Base blue
    600: "#0070f3",
    700: "#0055b8",
    800: "#003a7d",
    900: "#002042",
    950: "#001a33",
  },

  // Secondary color: Gray/Neutral (from Chakra defaults + custom)
  secondary: {
    50: "#f7f7f7",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#0a0a0a",
  },

  // Tertiary color: Orange (from selection colors)
  tertiary: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#ff6b35", // Selection orange
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },

  // Neutral: Additional gray scale
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0f0f0f",
  },

  // Canvas-specific colors
  canvas: {
    background: "#f7f7f7",

    grid: {
      minor: "#CED8F7", // Light purple-blue
      major: "#CED8F7",
    },

    selection: {
      border: "#ff6b35", // Tertiary.500 (orange)
      fill: "rgba(255, 107, 53, 0.1)", // Semi-transparent orange
    },

    selectionBox: {
      border: "#3b82f6", // Blue
      fill: "rgba(59, 130, 246, 0.1)", // Semi-transparent blue
    },

    shapes: {
      fill: "#ffffff", // White
      stroke: "#000000", // Black
      text: "#000000", // Black
    },

    connectors: {
      default: "#000000", // Black
      selected: "#ff6b35", // Tertiary.500 (orange)
      hover: "#3b82f6", // Blue
    },

    connectionPoints: {
      default: "#3b82f6", // Blue
      hover: "#ff6b35", // Orange
      border: "#ffffff", // White
    },
  },

  // UI component semantic tokens (default uses light mode values)
  ui: {
    header: {
      bg: "#002042", // Primary.900
      title: "#bfdeff", // Primary.100
      nav: "#bfdeff", // Primary.100
      navHover: "#e6f2ff", // Primary.50
    },

    panel: {
      bg: "#002042", // Primary.900
      text: "#bfdeff", // Primary.100
    },

    sidebar: {
      bg: "#ffffff", // White
      toolbar: "#99caff", // Primary.200
      text: "#001a33", // Primary.950
    },

    editor: {
      bg: "#ffffff", // White
      text: "#001a33", // Primary.950
      lineNumbers: "#f3f4f6", // Secondary.100
      lineNumbersText: "#6b7280", // Secondary.500
      lineNumbersBorder: "#d1d5db", // Secondary.300
      inputBorder: "#0066cc", // Blue variant
    },
  },

  // Diagram-specific colors
  diagrams: {
    bpmn: {
      task: { fill: "#ffffff", stroke: "#000000" },
      event: { fill: "#ffffff", stroke: "#000000" },
      gateway: { fill: "#ffffff", stroke: "#000000" },
      pool: { fill: "#ffffff", stroke: "#000000" },
    },

    sequence: {
      actor: { fill: "#ffffff", stroke: "#000000" },
      lifeline: { fill: "#ffffff", stroke: "#000000" },
      activation: { fill: "#e3f2fd", stroke: "#000000" }, // Light blue
      note: { fill: "#fffde7", stroke: "#000000" }, // Light yellow
    },

    dataFlow: {
      process: { fill: "#ffffff", stroke: "#000000" },
      dataStore: { fill: "#ffffff", stroke: "#000000" },
      entity: { fill: "#ffffff", stroke: "#000000" },
      subprocess: { fill: "#f5f5f5", stroke: "#000000" }, // Light gray
    },
  },

  // Markdown styling colors
  markdown: {
    code: {
      bg: "#f3f4f6", // Secondary.100
      border: "#e5e7eb", // Secondary.200
    },

    blockquote: {
      border: "#e5e7eb", // Secondary.200
      text: "#6b7280", // Secondary.500
    },

    link: "#2563eb", // Blue

    table: {
      border: "#e5e7eb", // Secondary.200
      headerBg: "#f3f4f6", // Secondary.100
    },

    headingBorder: "#e5e7eb", // Secondary.200

    hr: "#e5e7eb", // Secondary.200
  },

  // Status colors (using Chakra-like palettes)
  status: {
    // Info: Blue tones
    info: {
      50: "#eff6ff",
      100: "#dbeafe",
      200: "#bfdbfe",
      300: "#93c5fd",
      400: "#60a5fa",
      500: "#3b82f6",
      600: "#2563eb",
      700: "#1d4ed8",
      800: "#1e40af",
      900: "#1e3a8a",
      950: "#172554",
    },

    // Success: Green tones
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

    // Warning: Yellow/Orange tones
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
