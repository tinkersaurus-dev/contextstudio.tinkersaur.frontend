/**
 * Canvas Theme System
 *
 * Centralized color configuration for canvas elements across all theme modes and variants.
 * Provides theme-aware default colors that respond to light/dark mode and accessibility variants.
 *
 * Theme Structure:
 * - 4 theme combinations: light+standard, light+deuteranopia, dark+standard, dark+deuteranopia
 * - Each theme defines colors for all canvas elements
 * - Shape/connector attributes override theme defaults when specified
 *
 * Color Categories:
 * - Canvas: Background and grid
 * - Shapes: Fill, stroke, and text defaults
 * - Connectors: Line colors
 * - Selection: Selection indicators and boxes
 * - ConnectionPoints: Interactive connection point colors
 */

export interface CanvasThemeColors {
  /** Canvas background color */
  background: string;

  /** Grid line colors */
  grid: {
    minor: string;
    major: string;
  };

  /** Default shape colors (used when shape doesn't specify its own) */
  shape: {
    fill: string;
    stroke: string;
    text: string;
  };

  /** Default connector colors */
  connector: {
    stroke: string;
  };

  /** Selection indicator colors */
  selection: {
    stroke: string;
    box: string;
    boxFill: string;
  };

  /** Connection point colors */
  connectionPoint: {
    normal: string;
    hover: string;
    active: string;
    preview: string;
  };
}

export interface CanvasTheme {
  colors: CanvasThemeColors;
}

/**
 * Light mode - Standard theme (blue-based)
 */
const lightStandardTheme: CanvasTheme = {
  colors: {
    background: '#F9FAFB',
    grid: {
      minor: '#E5E7EB',
      major: '#D1D5DB',
    },
    shape: {
      fill: '#FFFFFF',
      stroke: '#1F2937',
      text: '#1F2937',
    },
    connector: {
      stroke: '#1F2937',
    },
    selection: {
      stroke: '#3B82F6',
      box: '#3B82F6',
      boxFill: 'rgba(59, 130, 246, 0.1)',
    },
    connectionPoint: {
      normal: '#E5E7EB',
      hover: '#60A5FA',
      active: '#3B82F6',
      preview: '#3B82F6',
    },
  },
};

/**
 * Light mode - Deuteranopia theme (amber-based for colorblind accessibility)
 */
const lightDeuteranopiaTheme: CanvasTheme = {
  colors: {
    background: '#F9FAFB',
    grid: {
      minor: '#E5E7EB',
      major: '#D1D5DB',
    },
    shape: {
      fill: '#FFFFFF',
      stroke: '#1F2937',
      text: '#1F2937',
    },
    connector: {
      stroke: '#1F2937',
    },
    selection: {
      stroke: '#F59E0B',
      box: '#F59E0B',
      boxFill: 'rgba(245, 158, 11, 0.1)',
    },
    connectionPoint: {
      normal: '#E5E7EB',
      hover: '#FBBF24',
      active: '#F59E0B',
      preview: '#F59E0B',
    },
  },
};

/**
 * Dark mode - Standard theme (blue-based)
 */
const darkStandardTheme: CanvasTheme = {
  colors: {
    background: '#111827',
    grid: {
      minor: '#1F2937',
      major: '#374151',
    },
    shape: {
      fill: '#1F2937',
      stroke: '#9CA3AF',
      text: '#F9FAFB',
    },
    connector: {
      stroke: '#ffffffff',
    },
    selection: {
      stroke: '#60A5FA',
      box: '#60A5FA',
      boxFill: 'rgba(96, 165, 250, 0.15)',
    },
    connectionPoint: {
      normal: '#374151',
      hover: '#60A5FA',
      active: '#3B82F6',
      preview: '#60A5FA',
    },
  },
};

/**
 * Dark mode - Deuteranopia theme (amber-based for colorblind accessibility)
 */
const darkDeuteranopiaTheme: CanvasTheme = {
  colors: {
    background: '#111827',
    grid: {
      minor: '#1F2937',
      major: '#374151',
    },
    shape: {
      fill: '#1F2937',
      stroke: '#9CA3AF',
      text: '#F9FAFB',
    },
    connector: {
      stroke: '#afa19c',
    },
    selection: {
      stroke: '#FBBF24',
      box: '#FBBF24',
      boxFill: 'rgba(251, 191, 36, 0.15)',
    },
    connectionPoint: {
      normal: '#374151',
      hover: '#FBBF24',
      active: '#F59E0B',
      preview: '#FBBF24',
    },
  },
};

/**
 * Theme registry - maps (colorMode, variant) to theme
 */
const themeRegistry: Record<string, Record<string, CanvasTheme>> = {
  light: {
    standard: lightStandardTheme,
    deuteranopia: lightDeuteranopiaTheme,
  },
  dark: {
    standard: darkStandardTheme,
    deuteranopia: darkDeuteranopiaTheme,
  },
};

/**
 * Get canvas theme for the given color mode and variant
 *
 * @param colorMode - 'light' or 'dark'
 * @param variant - 'standard' or 'deuteranopia'
 * @returns Canvas theme with appropriate colors
 *
 * @example
 * const theme = getCanvasTheme('dark', 'standard');
 * ctx.fillStyle = theme.colors.background;
 */
export function getCanvasTheme(
  colorMode: string,
  variant: string
): CanvasTheme {
  // Normalize inputs to handle edge cases
  const normalizedMode = colorMode === 'dark' ? 'dark' : 'light';
  const normalizedVariant = variant === 'deuteranopia' ? 'deuteranopia' : 'standard';

  return themeRegistry[normalizedMode][normalizedVariant];
}
