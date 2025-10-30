/**
 * Design Studio View
 *
 * Main view component for the design studio page.
 * Provides a two-column layout with a sidebar for navigation
 * and a main content area for displaying and editing content.
 */

"use client";

import { Flex } from "@chakra-ui/react";
import { DesignSidebar } from "@/widgets/design-sidebar";
import { DesignStudioContentArea } from "./ui/design-studio-content-area";
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
      bg="panel.bg"
    >
      {/* Sidebar */}
      <DesignSidebar />

      {/* Main Content Area with Tabs */}
      <DesignStudioContentArea />
    </Flex>
  );
}
