import { BaseShape } from '../model/types';
import { renderSelectionIndicator } from '@/shared/lib/rendering';
import { getCanvasFontString } from '@/shared/lib/rendering';
import {
  wrapText,
  getDefaultTextConfig,
  type TextTruncation,
  type TextPlacement,
} from '@/shared/lib/rendering';
import { getCanvasColors } from '@/shared/config/canvas-config';

export interface BaseShapeProps {
  shape: BaseShape;
  isSelected?: boolean;
  renderShape: (ctx: CanvasRenderingContext2D, shape: BaseShape, isSelected: boolean, scale: number) => void;
}

/**
 * Base shape rendering logic
 * This is not a React component but a utility function for rendering shapes to canvas
 */
export function renderBaseShape(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  isSelected: boolean,
  scale: number,
  renderShape: (ctx: CanvasRenderingContext2D, shape: BaseShape, isSelected: boolean, scale: number) => void
): void {
  ctx.save();

  // Render the shape using the provided render function
  renderShape(ctx, shape, isSelected, scale);

  // Render text if present
  if (shape.text) {
    renderShapeText(ctx, shape, scale);
  }

  // Render selection indicator if selected
  if (isSelected) {
    renderSelectionIndicator(
      ctx,
      shape.position.x,
      shape.position.y,
      shape.dimensions.width,
      shape.dimensions.height,
      scale
    );
  }

  ctx.restore();
}

/**
 * Renders text within or below a shape with optional wrapping
 * @param scale - Currently unused but available for future font size scaling based on zoom
 */
function renderShapeText(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  scale: number // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  if (!shape.text) return;

  const colors = getCanvasColors();
  const fontSize = shape.fontSize || 12;
  const textColor = shape.textColor ?? colors.shapeText;

  // Get default config for this shape type
  const defaultConfig = getDefaultTextConfig(shape.shapeType);

  // Determine text wrapping settings (with shape-specific defaults)
  const textWrap = shape.textWrap !== undefined ? shape.textWrap : true;
  const maxLines = shape.maxLines || defaultConfig.maxLines;
  const truncation: TextTruncation = shape.textTruncation || 'ellipsis';
  const placement: TextPlacement = shape.textPlacement || defaultConfig.placement;
  const lineHeight = shape.lineHeight || defaultConfig.lineHeight;

  ctx.save();

  // Use the application font for consistency
  ctx.font = getCanvasFontString(fontSize, 400);
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // If text wrapping is disabled, use legacy single-line rendering
  if (!textWrap) {
    const centerX = shape.position.x + shape.dimensions.width / 2;
    const centerY = shape.position.y + shape.dimensions.height / 2;
    ctx.fillText(shape.text, centerX, centerY);
    ctx.restore();
    return;
  }

  // Calculate available width for text (with padding)
  const horizontalPadding = 8;
  let maxWidth = shape.dimensions.width - horizontalPadding * 2;

  // For text placed below the shape, use a minimum width to prevent very short lines
  // This is especially important for small shapes like events (40px) and gateways (40px)
  if (placement === 'below') {
    const minTextWidth = 120; // Minimum width for readable text
    maxWidth = Math.max(maxWidth, minTextWidth);
  }

  // Wrap the text into multiple lines
  const wrappedResult = wrapText(ctx, shape.text, {
    maxWidth,
    maxLines,
    truncation,
    lineHeight,
  });

  if (wrappedResult.lines.length === 0) {
    ctx.restore();
    return;
  }

  const lineHeightPx = fontSize * lineHeight;
  const centerX = shape.position.x + shape.dimensions.width / 2;

  // Calculate starting Y position based on placement
  let startY: number;

  if (placement === 'below') {
    // Position text below the shape
    const strokeWidth = shape.strokeWidth || 1;
    const belowOffset = 5; // pixels below the shape
    startY = shape.position.y + shape.dimensions.height + strokeWidth + belowOffset;
  } else {
    // Position text inside the shape (centered vertically)
    const totalTextHeight = wrappedResult.totalHeight;
    const shapeHeight = shape.dimensions.height;
    startY = shape.position.y + (shapeHeight - totalTextHeight) / 2;
  }

  // Render each line
  for (let i = 0; i < wrappedResult.lines.length; i++) {
    const line = wrappedResult.lines[i];
    const lineY = startY + i * lineHeightPx + lineHeightPx / 2;
    ctx.fillText(line, centerX, lineY);
  }

  ctx.restore();
}
