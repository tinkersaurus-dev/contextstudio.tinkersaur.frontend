/**
 * Design Sidebar Toolbar
 *
 * Toolbar with action buttons for managing content in the design sidebar.
 * Includes actions like creating new folders, diagrams, and other content.
 */

"use client";

import { HStack } from "@chakra-ui/react";
import { IconButton } from "@/shared/ui";
import { LuFolderPlus } from "react-icons/lu";

export interface DesignSidebarToolbarProps {
  /** Callback when new folder button is clicked */
  onCreateFolder?: () => void;
}

/**
 * Toolbar component for design sidebar
 */
export function DesignSidebarToolbar({
  onCreateFolder,
}: DesignSidebarToolbarProps) {
  return (
    <HStack
      px={2}
      py={0}
      borderBottomWidth="1px"
      borderBottomColor="border.muted"
      gap={1}
      minHeight="auto"
      justify="right"
      bg="sidebar.toolbar"
    >
      <IconButton
        aria-label="Create new folder"
        onClick={onCreateFolder}
        size="sm"
        variant="ghost"
      >
        <LuFolderPlus />
      </IconButton>
    </HStack>
  );
}
