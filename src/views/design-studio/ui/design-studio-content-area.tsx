/**
 * Design Studio Content Area
 *
 * Main content area with tabbed interface for editing diagrams and documents.
 * Features a fixed home tab and dynamic closeable tabs for content.
 */

"use client";

import { Box, Tabs, CloseButton } from "@chakra-ui/react";
import { LuFileText, LuFile, LuHouse } from "react-icons/lu";
import { useContentStore } from "@/widgets/design-sidebar/model/content-store";
import { TabType, isDiagramTab, isDocumentTab } from "@/shared/types/content-data";
import { TabContentWrapper } from "./tab-content-wrapper";

/**
 * Get icon for tab type
 */
function getTabIcon(tabType: TabType) {
  switch (tabType) {
    case TabType.Home:
      return <LuHouse />;
    case TabType.Diagram:
      return <LuFile />;
    case TabType.Document:
      return <LuFileText />;
    default:
      return null;
  }
}

/**
 * Design Studio Content Area Component
 */
export function DesignStudioContentArea() {
  const openTabs = useContentStore((state) => state.openTabs);
  const activeTabId = useContentStore((state) => state.activeTabId);
  const setActiveTab = useContentStore((state) => state.setActiveTab);
  const closeTab = useContentStore((state) => state.closeTab);

  return (
    <Tabs.Root
      value={activeTabId ?? 'home'}
      onValueChange={(e) => e.value && setActiveTab(e.value)}
      variant="outline"
      size="sm"
      height="100%"
      width="100%"
      display="flex"
      flexDirection="column"
      bg="white"
      overflow="visible"
    >
      <Tabs.List >
        {openTabs.map((tab) => (
          <Tabs.Trigger value={tab.id} key={tab.id} py={0}>
            {getTabIcon(tab.type)}
            {tab.label}
            {tab.id !== 'home' && (
              <CloseButton
                as="span"
                role="button"
                size="2xs"
                me="-2"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              />
            )}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.ContentGroup flex="1" pt={1}>
        {openTabs.map((tab) => (
          <Tabs.Content value={tab.id} key={tab.id} height="100%" pt={0} position="relative">
            {tab.id === 'home' ? (
              <Box height="100%" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
                <Box textAlign="center">
                  <LuHouse size={48} style={{ margin: '0 auto', opacity: 0.3 }} />
                  <Box mt={4} fontSize="lg" color="gray.600">
                    Welcome to Design Studio
                  </Box>
                  <Box mt={2} fontSize="sm" color="gray.500">
                    Double-click a diagram or document in the sidebar to start editing
                  </Box>
                </Box>
              </Box>
            ) : isDiagramTab(tab) ? (
              <TabContentWrapper type="diagram" contentId={tab.id} />
            ) : isDocumentTab(tab) ? (
              <TabContentWrapper type="document" contentId={tab.id} />
            ) : null}
          </Tabs.Content>
        ))}
      </Tabs.ContentGroup>
    </Tabs.Root>
  );
}
