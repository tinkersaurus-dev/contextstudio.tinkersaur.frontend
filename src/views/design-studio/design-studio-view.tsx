/**
 * Design Studio View
 *
 * Main view component for the design studio page.
 * Provides a two-column layout with a sidebar for navigation
 * and a main content area for displaying and editing content.
 */

"use client";

import { Box, Flex } from "@chakra-ui/react";
import { DesignSidebar } from "@/widgets/design-sidebar";
import { HEADER_HEIGHT } from "@/shared/config/canvas-config";

/**
 * Design studio view component
 */
export function DesignStudioView() {
  return (
    <Flex
      width="100vw"
      height={`calc(100vh - ${HEADER_HEIGHT}px)`}
      overflow="hidden"
    >
      {/* Sidebar */}
      <DesignSidebar />

      {/* Main Content Area */}
      <Box
        flex="1"
        bg="gray.50"
        overflow="auto"
      >
        {/* Content will be added later */}
      </Box>
    </Flex>
  );
}
