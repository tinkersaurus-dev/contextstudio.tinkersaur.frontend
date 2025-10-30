/**
 * Snap Mode Configuration
 *
 * Configuration for snap mode options displayed in the canvas controls.
 * This centralizes the snap mode UI definitions for consistency.
 */

import { MdGrid3X3, MdGridGoldenratio } from 'react-icons/md';
import { CiNoWaitingSign } from 'react-icons/ci';
import type { SnapMode } from '@/shared/lib/rendering';
import type { IconType } from 'react-icons';

export interface SnapModeOption {
  mode: SnapMode;
  label: string;
  tooltip: string;
  Icon: IconType;
}

/**
 * Snap mode options configuration
 * Defines the available snap modes with their UI properties
 */
export const SNAP_MODE_OPTIONS: SnapModeOption[] = [
  {
    mode: 'minor',
    label: 'Snap to Minor Grid',
    tooltip: 'Snap to Minor Grid',
    Icon: MdGrid3X3,
  },
  {
    mode: 'major',
    label: 'Snap to Major Grid',
    tooltip: 'Snap to Major Grid',
    Icon: MdGridGoldenratio,
  },
  {
    mode: 'none',
    label: 'No Grid Snapping',
    tooltip: 'No Grid Snapping',
    Icon: CiNoWaitingSign,
  },
];
