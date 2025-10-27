/**
 * Design Sidebar Header
 *
 * Header section of the design sidebar that displays the current workspace
 * or diagram title. This provides context for what the user is working on.
 */

"use client";

import { Box, Heading } from "@chakra-ui/react";

export interface DesignSidebarHeaderProps {
  /** Title to display in the header */
  title?: string;
}

/**
 * Header component for the design sidebar
 */
export function DesignSidebarHeader({
  title = "Diagram Editor",
}: DesignSidebarHeaderProps) {
  return (
    <Box
      px={4}
      py={3}
      borderBottomWidth="1px"
      borderBottomColor="border.muted"
      color="sidebar.text"
    >
      <Heading size="md" fontWeight="semibold">
        {title}
      </Heading>
    </Box>
  );
}
