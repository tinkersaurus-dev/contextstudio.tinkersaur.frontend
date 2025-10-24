'use client';

import { CanvasBadgeMenu } from '@/shared/ui';
import { ZOOM_CONTROL_POSITION } from '@/shared/config/canvas-config';

export interface ZoomControlProps {
  /** Current zoom level (scale) */
  zoom: number;
  /** Callback when reset is triggered */
  onReset: () => void;
}

/**
 * Zoom Control Component
 *
 * Displays the current zoom level as a badge with a menu to reset zoom.
 * Positioned in the bottom-right corner of the canvas.
 *
 * @example
 * <ZoomControl zoom={1.5} onReset={() => setZoom(1.0)} />
 */
export function ZoomControl({ zoom, onReset }: ZoomControlProps) {
  const zoomPercentage = Math.round(zoom * 100);

  return (
    <CanvasBadgeMenu
      badgeContent={`${zoomPercentage}%`}
      menuItems={[
        {
          id: 'reset-zoom',
          label: 'Reset to 100%',
          onSelect: onReset,
        },
      ]}
      colorPalette="gray"
      variant="solid"
      size="md"
      style={{
        position: 'absolute',
        bottom: `${ZOOM_CONTROL_POSITION.bottom}px`,
        right: `${ZOOM_CONTROL_POSITION.right}px`,
      }}
    />
  );
}
