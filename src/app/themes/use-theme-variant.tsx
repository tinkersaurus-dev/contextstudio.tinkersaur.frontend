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

interface ThemeVariantProviderProps {
  children: ReactNode;
}

/**
 * Theme Variant Provider
 *
 * Provides theme variant context (standard/deuteranopia) and manages:
 * - localStorage persistence
 * - Applying data-theme attribute to HTML element
 *
 * This works in conjunction with next-themes for light/dark mode.
 *
 * Note: Always initializes with "standard" to prevent SSR hydration mismatches,
 * then applies stored preference on client mount.
 */
export function ThemeVariantProvider({ children }: ThemeVariantProviderProps) {
  // Always initialize with "standard" for SSR consistency
  const [variant, setVariantState] = useState<ThemeVariant>("standard");
  const [mounted, setMounted] = useState(false);

  // Load stored preference on client mount
  useEffect(() => {
    setMounted(true);

    // Check localStorage for user preference
    const stored = localStorage.getItem(VARIANT_STORAGE_KEY);
    if (stored === "standard" || stored === "deuteranopia") {
      setVariantState(stored);
    }
  }, []);

  // Apply data-theme attribute to html element whenever variant changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.dataset.theme = variant;
    }
  }, [variant, mounted]);

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
