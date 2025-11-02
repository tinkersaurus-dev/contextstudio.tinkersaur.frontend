/**
 * Color Palettes for Theme System
 *
 * Defines color palettes for different theme variants:
 * - Standard: Blue-based palette (original theme)
 * - Deuteranopia: Colorblind-friendly amber/blue palette
 *
 * These palettes are consumed by the Chakra theme configuration.
 */

export interface ColorPalette {
  [key: string]: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * Standard Blue Palette
 * Primary brand color for standard theme
 */
export const standardBluePalette: ColorPalette = {
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
};

/**
 * Deuteranopia Amber Palette
 * Primary brand color for colorblind-friendly theme
 * Amber is highly distinguishable for red-green colorblindness
 */
export const deuteranopiaAmberPalette: ColorPalette = {
  50: "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  300: "#fcd34d",
  400: "#fbbf24",
  500: "#f59e0b", // Base amber
  600: "#d97706",
  700: "#b45309",
  800: "#92400e",
  900: "#78350f",
  950: "#451a03",
};

/**
 * Neutral Gray Palette
 * Used across all themes for neutral elements
 */
export const neutralGrayPalette: ColorPalette = {
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
};

/**
 * Status Color Palettes
 * Used for info, success, warning, and danger states
 */

export const infoBluePalette: ColorPalette = {
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
};

export const successGreenPalette: ColorPalette = {
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
};

/**
 * Warning Amber Palette
 * For standard theme - uses amber
 * For deuteranopia theme - uses a distinguishable blue-tinted amber
 */
export const warningAmberPalette: ColorPalette = {
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
};

export const dangerRedPalette: ColorPalette = {
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
};
