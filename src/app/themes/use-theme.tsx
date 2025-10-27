"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { ThemeConfig } from "./types";
import { getTheme, getThemeIds } from "./theme-registry";

interface ThemeContextValue {
  /** Current active theme */
  currentTheme: ThemeConfig;
  /** ID of the current theme */
  currentThemeId: string;
  /** All available theme IDs */
  availableThemeIds: string[];
  /** Switch to a different theme */
  setTheme: (themeId: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = "app-theme-id";

/**
 * Get the initial theme ID
 * Priority: localStorage > environment variable > default
 */
function getInitialThemeId(): string {
  // Check localStorage first (client-side only)
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return stored;
    }
  }

  // Fall back to environment variable or default
  return process.env.NEXT_PUBLIC_THEME_ID || "default";
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 *
 * Provides theme context and allows runtime theme switching.
 * Persists theme selection to localStorage.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<string>(getInitialThemeId);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = getTheme(themeId);
  const availableThemeIds = getThemeIds();

  const handleSetTheme = (newThemeId: string) => {
    setThemeId(newThemeId);

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newThemeId);
    }

    // Force a page reload to apply the new theme
    // This is necessary because theme colors are loaded at build time
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const value: ThemeContextValue = {
    currentTheme,
    currentThemeId: themeId,
    availableThemeIds,
    setTheme: handleSetTheme,
  };

  // Don't render children until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 *
 * @returns Theme context value with current theme and setter
 *
 * @example
 * ```tsx
 * const { currentTheme, currentThemeId, availableThemeIds, setTheme } = useTheme();
 *
 * return (
 *   <select value={currentThemeId} onChange={(e) => setTheme(e.target.value)}>
 *     {availableThemeIds.map(id => (
 *       <option key={id} value={id}>{id}</option>
 *     ))}
 *   </select>
 * );
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
