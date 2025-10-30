import type { ThemeConfig } from "./types";

/**
 * Dark Theme
 *
 * Dark mode optimized for low-light viewing and reduced eye strain.
 * Uses the default blue color palette with dark backgrounds.
 *
 * Primary: Blue
 * Secondary: Dark Gray
 * Tertiary: Orange
 */
export const darkTheme: ThemeConfig = {
  id: "dark",
  name: "Dark",
  description: "Dark mode for low-light viewing",

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

  // Secondary color: Dark Gray
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

  // Neutral: Dark gray scale
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

  // Canvas-specific colors (optimized for dark mode)
  canvas: {
    background: "#303030",

    grid: {
      minor: "#3f4957",
      major: "#4c5561",
    },

    selection: {
      border: "#ff6b35",
      fill: "rgba(255, 107, 53, 0.15)",
    },

    selectionBox: {
      border: "#4ca1ff",
      fill: "rgba(76, 161, 255, 0.15)",
    },

    shapes: {
      fill: "#2d2d2d",
      stroke: "#e0e0e0",
      text: "#e0e0e0",
    },

    connectors: {
      default: "#e0e0e0",
      selected: "#ff6b35",
      hover: "#4ca1ff",
    },

    connectionPoints: {
      default: "#4ca1ff",
      hover: "#ff6b35",
      border: "#1a1a1a",
    },
  },

  // UI component colors (dark mode)
  ui: {
    header: {
      bg: "#171717",
      title: "#a3a3a3",
      nav: "#a3a3a3",
      navHover: "#fafafa",
    },

    panel: {
      bg: "#262626",
      text:"#a3a3a3"
    },

    sidebar: {
      bg: "#1f2937",
      toolbar: "#333f50ff",
      text: "#bfdeff",
    },

    editor: {
      bg: "#1f2937",
      text: "#e5e7eb",
      lineNumbers: "#374151",
      lineNumbersText: "#9ca3af",
      lineNumbersBorder: "#4b5563",
      inputBorder: "#3b82f6",
    },
  },

  // Diagram-specific colors (adjusted for dark mode)
  diagrams: {
    bpmn: {
      task: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      event: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      gateway: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      pool: { fill: "#2d2d2d", stroke: "#e0e0e0" },
    },

    sequence: {
      actor: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      lifeline: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      activation: { fill: "#1e3a5f", stroke: "#e0e0e0" }, // Dark blue
      note: { fill: "#3a3520", stroke: "#e0e0e0" }, // Dark yellow
    },

    dataFlow: {
      process: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      dataStore: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      entity: { fill: "#2d2d2d", stroke: "#e0e0e0" },
      subprocess: { fill: "#1a1a1a", stroke: "#e0e0e0" },
    },
  },

  // Markdown styling colors (dark mode)
  markdown: {
    code: {
      bg: "#2d2d2d",
      border: "#3a3a3a",
    },

    blockquote: {
      border: "#3a3a3a",
      text: "#9ca3af",
    },

    link: "#60a5fa",

    table: {
      border: "#3a3a3a",
      headerBg: "#2d2d2d",
    },

    headingBorder: "#3a3a3a",

    hr: "#3a3a3a",
  },

  // Status colors (same as light, work well in dark mode)
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
