/**
 * Folder Add Content Menu
 *
 * Menu for adding new content (diagrams, documents) to a folder.
 * Displays as a plus icon button that opens a menu of content types.
 */

"use client";

import { IconButton as ChakraIconButton, Portal } from "@chakra-ui/react";
import { Menu } from "@/shared/ui";
import { LuPlus, LuFile, LuFileText } from "react-icons/lu";

export interface FolderAddContentMenuProps {
  /** Callback when "Diagram" is selected (triggers the dialog) */
  onAddDiagram: () => void;
  /** Callback when "Document" is selected */
  onAddDocument: () => void;
}

/**
 * Menu for adding content to a folder
 */
export function FolderAddContentMenu({ onAddDiagram, onAddDocument }: FolderAddContentMenuProps) {
  return (
    <Menu.Root positioning={{ placement: "right-start" }}>
      <Menu.Trigger asChild>
        <ChakraIconButton
          aria-label="Add content to folder"
          size="xs"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
          }}
          marginLeft="auto"
          opacity={0.6}
          _hover={{ opacity: 1 }}
        >
          <LuPlus />
        </ChakraIconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Content minWidth="140px">
          <Menu.Item
            value="diagram"
            onClick={onAddDiagram}
          >
            <LuFile />
            Diagram
          </Menu.Item>
          <Menu.Item
            value="document"
            onClick={onAddDocument}
          >
            <LuFileText />
            Document
          </Menu.Item>
        </Menu.Content>
      </Portal>
    </Menu.Root>
  );
}
