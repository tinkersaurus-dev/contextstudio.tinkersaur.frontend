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
