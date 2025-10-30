/**
 * Text wrapping and measurement utilities for canvas text rendering
 */

export type TextTruncation = 'ellipsis' | 'clip' | 'none';
export type TextPlacement = 'inside' | 'below';

export interface TextWrapOptions {
  /** Maximum width for text lines in pixels */
  maxWidth: number;
  /** Maximum number of lines to display */
  maxLines?: number;
  /** How to handle text that exceeds maxLines */
  truncation?: TextTruncation;
  /** Line height multiplier (e.g., 1.2 = 120% of font size) */
  lineHeight?: number;
}

export interface WrappedTextResult {
  /** Array of text lines after wrapping */
  lines: string[];
  /** Total height required to render all lines */
  totalHeight: number;
  /** Whether text was truncated */
  wasTruncated: boolean;
}

/**
 * Wraps text into multiple lines that fit within a given width
 * Uses canvas measureText for accurate width calculations
 *
 * @param ctx - Canvas rendering context (must have font already set)
 * @param text - Text to wrap
 * @param options - Wrapping options
 * @returns Wrapped text result with lines and dimensions
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  options: TextWrapOptions
): WrappedTextResult {
  const { maxWidth, maxLines, truncation = 'ellipsis', lineHeight = 1.2 } = options;

  // Handle empty text
  if (!text || text.trim() === '') {
    return {
      lines: [],
      totalHeight: 0,
      wasTruncated: false,
    };
  }

  // Get font size from current context
  const fontSize = getFontSize(ctx);
  const lineHeightPx = fontSize * lineHeight;

  const lines: string[] = [];
  const words = text.split(/\s+/);
  let currentLine = '';
  let wasTruncated = false;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    // Check if adding this word exceeds the max width
    if (testWidth > maxWidth && currentLine !== '') {
      // Current line is full, push it
      lines.push(currentLine);

      // Check if we've hit max lines
      if (maxLines && lines.length >= maxLines) {
        wasTruncated = true;
        // Collect remaining words to add to the last line for truncation
        const remainingWords = words.slice(i);
        const lastLineIndex = lines.length - 1;
        const lastLineWithRemaining = `${lines[lastLineIndex]} ${remainingWords.join(' ')}`;
        lines[lastLineIndex] = lastLineWithRemaining;
        break;
      }

      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  // Add the last line if not already added and not truncated
  if (currentLine && (!maxLines || lines.length < maxLines)) {
    lines.push(currentLine);
  }

  // Apply truncation to the last line if needed
  if (wasTruncated && lines.length > 0) {
    const lastLineIndex = lines.length - 1;
    lines[lastLineIndex] = truncateText(ctx, lines[lastLineIndex], maxWidth, truncation);
  }

  const totalHeight = lines.length * lineHeightPx;

  return {
    lines,
    totalHeight,
    wasTruncated,
  };
}

/**
 * Truncates a single line of text to fit within maxWidth
 *
 * @param ctx - Canvas rendering context
 * @param text - Text to truncate
 * @param maxWidth - Maximum width in pixels
 * @param truncation - Truncation style
 * @returns Truncated text
 */
export function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  truncation: TextTruncation
): string {
  if (truncation === 'none') {
    return text;
  }

  const metrics = ctx.measureText(text);
  if (metrics.width <= maxWidth) {
    return text;
  }

  if (truncation === 'clip') {
    // Binary search to find the longest substring that fits
    let left = 0;
    let right = text.length;
    let result = '';

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const substring = text.substring(0, mid);
      const width = ctx.measureText(substring).width;

      if (width <= maxWidth) {
        result = substring;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  }

  // Ellipsis truncation
  const ellipsis = '...';
  const ellipsisWidth = ctx.measureText(ellipsis).width;
  const availableWidth = maxWidth - ellipsisWidth;

  if (availableWidth <= 0) {
    return ellipsis;
  }

  // Binary search for the longest text that fits with ellipsis
  let left = 0;
  let right = text.length;
  let result = '';

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const substring = text.substring(0, mid);
    const width = ctx.measureText(substring).width;

    if (width <= availableWidth) {
      result = substring;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return result + ellipsis;
}

/**
 * Measures the total dimensions required to render wrapped text
 *
 * @param ctx - Canvas rendering context
 * @param text - Text to measure
 * @param options - Wrapping options
 * @returns Object with width and height dimensions
 */
export function measureTextDimensions(
  ctx: CanvasRenderingContext2D,
  text: string,
  options: TextWrapOptions
): { width: number; height: number } {
  const result = wrapText(ctx, text, options);

  // Find the widest line
  let maxWidth = 0;
  for (const line of result.lines) {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxWidth) {
      maxWidth = metrics.width;
    }
  }

  return {
    width: Math.min(maxWidth, options.maxWidth),
    height: result.totalHeight,
  };
}

/**
 * Extracts font size from canvas context's current font setting
 * Falls back to 14px if unable to parse
 *
 * @param ctx - Canvas rendering context
 * @returns Font size in pixels
 */
function getFontSize(ctx: CanvasRenderingContext2D): number {
  const fontMatch = ctx.font.match(/(\d+)px/);
  return fontMatch ? parseInt(fontMatch[1], 10) : 14;
}

/**
 * Get default text wrapping configuration for a specific shape type
 *
 * @param shapeType - The base shape type
 * @returns Default text configuration
 */
export function getDefaultTextConfig(shapeType: string): {
  placement: TextPlacement;
  maxLines: number;
  lineHeight: number;
} {
  const configs: Record<string, { placement: TextPlacement; maxLines: number; lineHeight: number }> = {
    event: { placement: 'below', maxLines: 2, lineHeight: 1.2 },
    task: { placement: 'inside', maxLines: 3, lineHeight: 1.2 },
    gateway: { placement: 'below', maxLines: 2, lineHeight: 1.2 },
    pool: { placement: 'inside', maxLines: 5, lineHeight: 1.2 },
    rectangle: { placement: 'inside', maxLines: 3, lineHeight: 1.2 },
  };

  return configs[shapeType] || configs.rectangle;
}
