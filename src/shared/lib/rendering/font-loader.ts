/**
 * Font Loading Utility
 *
 * Ensures custom fonts are loaded and available for canvas rendering.
 * Canvas text rendering requires fonts to be loaded before they can be used,
 * unlike regular HTML/CSS which handles font loading automatically.
 */

/**
 * Font loading state
 */
let fontsReady = false;
let fontLoadingPromise: Promise<void> | null = null;

/**
 * Ensures the application fonts are loaded and ready for canvas rendering
 *
 * This function uses the CSS Font Loading API to ensure fonts are available
 * before attempting to render text on canvas. It caches the result to avoid
 * repeated checks.
 *
 * @returns Promise that resolves when fonts are loaded
 */
export async function ensureFontsLoaded(): Promise<void> {
  // Return immediately if fonts are already loaded
  if (fontsReady) {
    return Promise.resolve();
  }

  // Return existing promise if already loading
  if (fontLoadingPromise) {
    return fontLoadingPromise;
  }

  // Check if Font Loading API is available
  if (typeof document === 'undefined' || !document.fonts) {
    // Server-side or unsupported browser - mark as ready
    fontsReady = true;
    return Promise.resolve();
  }

  // Create new loading promise
  fontLoadingPromise = (async () => {
    try {
      console.log('[FontLoader] Waiting for fonts to load...');

      // Wait for fonts to be ready
      await document.fonts.ready;

      console.log('[FontLoader] document.fonts.ready resolved');
      console.log('[FontLoader] Available fonts:', Array.from(document.fonts.values()).map(f => f.family));

      // Check various possible font names
      const possibleFontNames = [
        '__Nunito_Sans_Variable_f5a75d',
        'Nunito Sans Variable',
        '__Nunito_Sans_Variable',
        'Nunito Sans',
      ];

      let nunitoSansLoaded = false;
      for (const fontName of possibleFontNames) {
        if (document.fonts.check(`14px "${fontName}"`)) {
          console.log(`[FontLoader] Found font: ${fontName}`);
          nunitoSansLoaded = true;
          break;
        }
      }

      if (!nunitoSansLoaded) {
        console.warn('[FontLoader] Nunito Sans not detected, checking CSS variable...');

        // Try to get the actual font family from CSS variable
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'var(--font-nunito-sans), system-ui';
        document.body.appendChild(testElement);
        const computedFont = window.getComputedStyle(testElement).fontFamily;
        document.body.removeChild(testElement);

        console.log('[FontLoader] Computed font family from CSS variable:', computedFont);
      }

      fontsReady = true;
      console.log('[FontLoader] Fonts marked as ready');
    } catch (error) {
      console.error('[FontLoader] Error loading fonts:', error);
      // Mark as ready anyway to avoid blocking rendering
      fontsReady = true;
    } finally {
      fontLoadingPromise = null;
    }
  })();

  return fontLoadingPromise;
}

/**
 * Check if fonts are currently loaded (synchronous check)
 *
 * @returns true if fonts are loaded and ready
 */
export function areFontsLoaded(): boolean {
  return fontsReady;
}

/**
 * Reset font loading state (useful for testing)
 */
export function resetFontLoadingState(): void {
  fontsReady = false;
  fontLoadingPromise = null;
}

/**
 * Cached actual font family name resolved from CSS variable
 */
let resolvedFontFamily: string | null = null;

/**
 * Resolve the actual font family from the CSS variable
 * Next.js localFont generates unique class names, so we need to query the computed style
 */
function resolveActualFontFamily(): string {
  if (resolvedFontFamily) {
    return resolvedFontFamily;
  }

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    // Server-side fallback
    resolvedFontFamily = '"Nunito Sans", system-ui, -apple-system, sans-serif';
    return resolvedFontFamily;
  }

  try {
    // Create a temporary element with the CSS variable to get computed style
    const testElement = document.createElement('span');
    testElement.style.fontFamily = 'var(--font-nunito-sans, system-ui)';
    document.body.appendChild(testElement);
    const computedFont = window.getComputedStyle(testElement).fontFamily;
    document.body.removeChild(testElement);

    if (computedFont && computedFont !== 'system-ui') {
      resolvedFontFamily = computedFont;
      console.log('[FontLoader] Resolved font family:', resolvedFontFamily);
    } else {
      resolvedFontFamily = '"Nunito Sans", system-ui, -apple-system, sans-serif';
      console.warn('[FontLoader] Could not resolve CSS variable, using fallback');
    }
  } catch (error) {
    console.error('[FontLoader] Error resolving font family:', error);
    resolvedFontFamily = '"Nunito Sans", system-ui, -apple-system, sans-serif';
  }

  return resolvedFontFamily;
}

/**
 * Get the font string to use for canvas text rendering
 *
 * @param fontSize - Font size in pixels
 * @param fontWeight - Font weight (default: 400)
 * @returns CSS font string suitable for CanvasRenderingContext2D.font
 */
export function getCanvasFontString(fontSize: number, fontWeight: number | string = 400): string {
  const fontFamily = resolveActualFontFamily();
  return `${fontWeight} ${fontSize}px ${fontFamily}`;
}
