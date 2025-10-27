import type { ThemeConfig } from "./types";

/**
 * Light Theme
 *
 * Clean, bright theme optimized for daylight viewing.
 * Uses the default blue color palette with light backgrounds.
 *
 * Primary: Blue
 * Secondary: Light Gray
 * Tertiary: Orange
 */
export const lightTheme: ThemeConfig = {
  id: "light",
  name: "Light",
  description: "Clean, bright theme for daylight viewing",

  // Primary color: Blue (from original brand colors)
  primary: {
    50: "#e6f2ff",
    100: "#bfdeff",
    200: "#99caff",
    300: "#72b5ff",
    400: "#4ca1ff",
    500: "#268dff",
    600: "#0070f3",
    700: "#0055b8",
    800: "#003a7d",
    900: "#002042",
    950: "#001a33",
  },

  // Secondary color: Light Gray
  secondary: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },

  // Tertiary color: Orange
  tertiary: {
    50: "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#ff6b35",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },

  // Neutral: Gray scale
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
    950: "#0a0a0a",
  },

  // Canvas-specific colors (optimized for light mode)
  canvas: {
    background: "#f7f7f7",

    grid: {
      minor: "#CED8F7",
      major: "#CED8F7",
    },

    selection: {
      border: "#ff6b35",
      fill: "rgba(255, 107, 53, 0.1)",
    },

    selectionBox: {
      border: "#3b82f6",
      fill: "rgba(59, 130, 246, 0.1)",
    },

    shapes: {
      fill: "#ffffff",
      stroke: "#000000",
      text: "#000000",
    },

    connectors: {
      default: "#000000",
      selected: "#ff6b35",
      hover: "#3b82f6",
    },

    connectionPoints: {
      default: "#3b82f6",
      hover: "#ff6b35",
      border: "#ffffff",
    },
  },

  // UI component colors (light mode)
  ui: {
    header: {
      bg: "#002042",
      title: "#bfdeff",
      nav: "#bfdeff",
      navHover: "#e6f2ff",
    },

    panel: {
      bg: "#f5f5f5",
      text:"#001a33"
    },

    sidebar: {
      bg: "#ffffff",
      toolbar: "#99caff",
      text: "#001a33",
    },

    editor: {
      bg: "#ffffff",
      text: "#001a33",
      lineNumbers: "#f3f4f6",
      lineNumbersText: "#6b7280",
      lineNumbersBorder: "#d1d5db",
      inputBorder: "#0066cc",
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
      activation: { fill: "#e3f2fd", stroke: "#000000" },
      note: { fill: "#fffde7", stroke: "#000000" },
    },

    dataFlow: {
      process: { fill: "#ffffff", stroke: "#000000" },
      dataStore: { fill: "#ffffff", stroke: "#000000" },
      entity: { fill: "#ffffff", stroke: "#000000" },
      subprocess: { fill: "#f5f5f5", stroke: "#000000" },
    },
  },

  // Markdown styling colors
  markdown: {
    code: {
      bg: "#f3f4f6",
      border: "#e5e7eb",
    },

    blockquote: {
      border: "#e5e7eb",
      text: "#6b7280",
    },

    link: "#2563eb",

    table: {
      border: "#e5e7eb",
      headerBg: "#f3f4f6",
    },

    headingBorder: "#e5e7eb",

    hr: "#e5e7eb",
  },

  // Status colors
  status: {
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
