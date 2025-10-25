/**
 * Design Sidebar Configuration
 *
 * Centralized configuration for design sidebar layout and behavior.
 */

export interface SidebarConfig {
  width: number;
  minWidth: number;
  maxWidth: number;
}

export const SIDEBAR_CONFIG: SidebarConfig = {
  width: 280,
  minWidth: 200,
  maxWidth: 400,
} as const;
