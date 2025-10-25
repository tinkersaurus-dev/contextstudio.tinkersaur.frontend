import { BaseShape } from '../model/types';
import { renderSelectionIndicator } from '@/shared/lib/canvas-rendering-utils';

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
 * Renders text centered within a shape
 * @param scale - Currently unused but available for future font size scaling based on zoom
 */
function renderShapeText(
  ctx: CanvasRenderingContext2D,
  shape: BaseShape,
  scale: number // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  if (!shape.text) return;

  const fontSize = shape.fontSize || 14;
  const textColor = shape.textColor || '#000000';

  ctx.save();
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Center text in shape
  const centerX = shape.position.x + shape.dimensions.width / 2;
  const centerY = shape.position.y + shape.dimensions.height / 2;

  ctx.fillText(shape.text, centerX, centerY);
  ctx.restore();
}
