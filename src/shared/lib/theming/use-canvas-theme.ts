/**
 * Canvas Theme Hook
 *
 * Provides theme-aware canvas colors based on current color mode and variant.
 * Used by canvas rendering components to get appropriate colors for all canvas elements.
 */

import { useMemo } from 'react';
import { getCanvasTheme, type CanvasTheme } from './canvas-theme';

export interface UseCanvasThemeOptions {
  /** Current color mode ('light' or 'dark') */
  colorMode: string;
  /** Current theme variant ('standard' or 'deuteranopia') */
  variant: string;
}

/**
 * Hook to get the current canvas theme
 *
 * Returns a memoized theme object that only changes when colorMode or variant changes.
 * This prevents unnecessary re-renders of canvas components.
 *
 * @param options - Color mode and variant
 * @returns Canvas theme with appropriate colors
 *
 * @example
 * ```tsx
 * function DiagramCanvas() {
 *   const { colorMode } = useColorMode();
 *   const { variant } = useThemeVariant();
 *   const theme = useCanvasTheme({ colorMode, variant });
 *
 *   // Use theme colors in rendering
 *   ctx.fillStyle = theme.colors.background;
 * }
 * ```
 */
export function useCanvasTheme(options: UseCanvasThemeOptions): CanvasTheme {
  const { colorMode, variant } = options;

  // Memoize theme to prevent unnecessary recalculations
  const theme = useMemo(() => {
    return getCanvasTheme(colorMode, variant);
  }, [colorMode, variant]);

  return theme;
}
