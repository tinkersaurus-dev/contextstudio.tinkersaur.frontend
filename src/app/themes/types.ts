/**
 * Theme system type definitions
 *
 * Defines the complete structure for application themes including
 * color palettes, semantic tokens, and specialized color tokens
 * for different parts of the application.
 */

/**
 * Standard color palette with 11 shades (50-950)
 * Following Chakra UI/Tailwind convention for color scales
 */
export interface ColorPalette {
  50: string;   // Lightest
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Base/default shade
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;  // Darkest
}


/**
 * Canvas-specific color configuration
 * Used for diagram rendering, shapes, connectors, and selection
 */
export interface CanvasColors {
  /** Canvas background color */
  background: string;

  /** Grid line colors */
  grid: {
    /** Minor grid lines (dense) */
    minor: string;
    /** Major grid lines (sparse/emphasized) */
    major: string;
  };

  /** Selected entity colors */
  selection: {
    /** Border color for selected shapes */
    border: string;
    /** Fill color for selected shapes (semi-transparent) */
    fill: string;
  };

  /** Multi-select box colors (drag selection) */
  selectionBox: {
    /** Selection box border color */
    border: string;
    /** Selection box fill color (semi-transparent) */
    fill: string;
  };

  /** Default shape styling */
  shapes: {
    /** Default shape fill color */
    fill: string;
    /** Default shape stroke/border color */
    stroke: string;
    /** Default text color for shape labels */
    text: string;
  };

  /** Connector line colors */
  connectors: {
    /** Default connector stroke color */
    default: string;
    /** Selected connector stroke color */
    selected: string;
    /** Hovered connector stroke color */
    hover: string;
  };

  /** Connection point colors (shape attachment points) */
  connectionPoints: {
    /** Default connection point color */
    default: string;
    /** Hovered connection point color */
    hover: string;
    /** Connection point border color */
    border: string;
  };
}

/**
 * UI component semantic color tokens
 * Each theme defines its own complete set of UI colors
 */
export interface UIColors {
  /** Header component colors */
  header: {
    /** Header background color */
    bg: string;
    /** Header title text color */
    title: string;
    /** Navigation link color */
    nav: string;
    /** Navigation link hover color */
    navHover: string;
  };

  /** Panel/sidebar background colors */
  panel: {
    /** Panel background color */
    bg: string;
    text: string;
  };

  /** Sidebar colors */
  sidebar: {
    /** Sidebar main background */
    bg: string;
    /** Sidebar toolbar background */
    toolbar: string;
    /** Sidebar text color */
    text: string;
  };

  /** Editor component colors */
  editor: {
    /** Editor background color */
    bg: string;
    /** Editor text color */
    text: string;
    /** Line numbers background */
    lineNumbers: string;
    /** Line numbers text color */
    lineNumbersText: string;
    /** Line numbers border */
    lineNumbersBorder: string;
    /** Text input border */
    inputBorder: string;
  };
}

/**
 * Diagram-specific shape colors
 * Different diagram types may use different default colors
 */
export interface DiagramColors {
  /** BPMN diagram shapes */
  bpmn: {
    /** Task/activity shape */
    task: { fill: string; stroke: string };
    /** Event shapes (start/end) */
    event: { fill: string; stroke: string };
    /** Gateway/decision shapes */
    gateway: { fill: string; stroke: string };
    /** Pool/lane shapes */
    pool: { fill: string; stroke: string };
  };

  /** Sequence diagram shapes */
  sequence: {
    /** Actor/participant shape */
    actor: { fill: string; stroke: string };
    /** Lifeline shape */
    lifeline: { fill: string; stroke: string };
    /** Activation box */
    activation: { fill: string; stroke: string };
    /** Note/comment shape */
    note: { fill: string; stroke: string };
  };

  /** Data flow diagram shapes */
  dataFlow: {
    /** Process shape */
    process: { fill: string; stroke: string };
    /** Data store shape */
    dataStore: { fill: string; stroke: string };
    /** External entity shape */
    entity: { fill: string; stroke: string };
    /** Subprocess shape */
    subprocess: { fill: string; stroke: string };
  };
}

/**
 * Markdown editor styling colors
 */
export interface MarkdownColors {
  /** Code block styling */
  code: {
    /** Code background color */
    bg: string;
    /** Code border color */
    border: string;
  };

  /** Blockquote styling */
  blockquote: {
    /** Blockquote left border */
    border: string;
    /** Blockquote text color */
    text: string;
  };

  /** Link color */
  link: string;

  /** Table styling */
  table: {
    /** Table border color */
    border: string;
    /** Table header background */
    headerBg: string;
  };

  /** Heading underline color */
  headingBorder: string;

  /** Horizontal rule color */
  hr: string;
}

/**
 * Status/semantic color palettes
 * Used for success, warning, error states
 */
export interface StatusColors {
  /** Info/informational states (typically blue) */
  info: ColorPalette;

  /** Success states (typically green) */
  success: ColorPalette;

  /** Warning states (typically yellow/orange) */
  warning: ColorPalette;

  /** Danger/error states (typically red) */
  danger: ColorPalette;
}

/**
 * Complete theme configuration
 * This is the main theme object that defines all colors for the application
 */
export interface ThemeConfig {
  /** Theme identifier */
  id: string;

  /** Theme display name */
  name: string;

  /** Theme description */
  description?: string;

  /** Primary brand color palette */
  primary: ColorPalette;

  /** Secondary accent color palette */
  secondary: ColorPalette;

  /** Tertiary accent color palette */
  tertiary: ColorPalette;

  /** Neutral/gray color palette */
  neutral: ColorPalette;

  /** Canvas-specific colors */
  canvas: CanvasColors;

  /** UI component semantic tokens */
  ui: UIColors;

  /** Diagram-specific colors */
  diagrams: DiagramColors;

  /** Markdown styling colors */
  markdown: MarkdownColors;

  /** Status/semantic colors */
  status: StatusColors;
}

/**
 * Theme registry type
 * Maps theme IDs to theme configurations
 */
export type ThemeRegistry = Record<string, ThemeConfig>;
