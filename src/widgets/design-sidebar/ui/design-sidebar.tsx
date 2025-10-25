/**
 * Design Sidebar
 *
 * Sidebar container for the design studio that includes a header,
 * toolbar, and navigation tree for browsing project content.
 */

"use client";

import { useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { SIDEBAR_CONFIG } from "../config/sidebar-config";
import { DesignSidebarHeader } from "./design-sidebar-header";
import { DesignSidebarToolbar } from "./design-sidebar-toolbar";
import { DesignNavigationTree, type DesignNavigationTreeRef } from "./design-navigation-tree";

export interface DesignSidebarProps {
  /** Title for the sidebar header */
  title?: string;
}

/**
 * Sidebar component for design studio
 */
export function DesignSidebar({ title }: DesignSidebarProps) {
  const treeRef = useRef<DesignNavigationTreeRef>(null);

  const handleCreateFolder = () => {
    treeRef.current?.createFolder();
  };

  return (
    <Flex
      direction="column"
      width={`${SIDEBAR_CONFIG.width}px`}
      height="100%"
      bg="panel.bg"
      borderRightWidth="1px"
      borderRightColor="border.muted"
    >
      <DesignSidebarHeader title={title} />
      <DesignSidebarToolbar onCreateFolder={handleCreateFolder} />
      <Box flex="1" overflowY="auto" p={2} bg="white">
        <DesignNavigationTree ref={treeRef} />
      </Box>
    </Flex>
  );
}
