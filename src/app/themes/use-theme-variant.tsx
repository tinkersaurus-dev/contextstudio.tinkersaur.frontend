"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * Theme variants supported by the application
 * - standard: Default blue-based theme
 * - deuteranopia: Colorblind-friendly amber/blue theme for red-green colorblindness
 */
export type ThemeVariant = "standard" | "deuteranopia";

interface ThemeVariantContextValue {
  variant: ThemeVariant;
  setVariant: (variant: ThemeVariant) => void;
}

const ThemeVariantContext = createContext<ThemeVariantContextValue | undefined>(undefined);

const VARIANT_STORAGE_KEY = "theme-variant";

/**
 * Detect if user prefers colorblind-friendly themes
 * Uses system preferences where available
 */
function detectColorblindPreference(): ThemeVariant {
  if (typeof window === "undefined") {
    return "standard";
  }

  // Check localStorage first (user preference overrides auto-detection)
  const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
  if (stored === "standard" || stored === "deuteranopia") {
    return stored;
  }

  // Auto-detect from system preferences
  // Note: There's no standard media query for colorblindness detection yet,
  // but we can use prefers-contrast as a proxy for accessibility needs
  if (window.matchMedia?.("(prefers-contrast: more)").matches) {
    return "deuteranopia";
  }

  return "standard";
}

interface ThemeVariantProviderProps {
  children: ReactNode;
}

/**
 * Theme Variant Provider
 *
 * Provides theme variant context (standard/deuteranopia) and manages:
 * - Auto-detection from system preferences
 * - localStorage persistence
 * - Applying data-theme attribute to HTML element
 *
 * This works in conjunction with next-themes for light/dark mode.
 */
export function ThemeVariantProvider({ children }: ThemeVariantProviderProps) {
  const [variant, setVariantState] = useState<ThemeVariant>(detectColorblindPreference);

  // Apply data-theme attribute to html element
  useEffect(() => {
    document.documentElement.dataset.theme = variant;
  }, [variant]);

  const setVariant = (newVariant: ThemeVariant) => {
    setVariantState(newVariant);

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(VARIANT_STORAGE_KEY, newVariant);
    }
  };

  const value: ThemeVariantContextValue = {
    variant,
    setVariant,
  };

  return (
    <ThemeVariantContext.Provider value={value}>
      {children}
    </ThemeVariantContext.Provider>
  );
}

/**
 * Hook to access theme variant context
 *
 * @returns Theme variant value with current variant and setter
 *
 * @example
 * ```tsx
 * const { variant, setVariant } = useThemeVariant();
 *
 * return (
 *   <select value={variant} onChange={(e) => setVariant(e.target.value)}>
 *     <option value="standard">Standard</option>
 *     <option value="deuteranopia">Colorblind-Friendly</option>
 *   </select>
 * );
 * ```
 */
export function useThemeVariant(): ThemeVariantContextValue {
  const context = useContext(ThemeVariantContext);

  if (!context) {
    throw new Error("useThemeVariant must be used within a ThemeVariantProvider");
  }

  return context;
}
