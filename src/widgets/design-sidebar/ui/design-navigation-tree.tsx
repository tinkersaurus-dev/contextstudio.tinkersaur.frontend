/**
 * Design Navigation Tree
 *
 * TreeView navigation for browsing and organizing design content.
 * Supports flexible folder structures with mixed content types
 * (diagrams, documents, images, etc.) at any hierarchy level.
 */

"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { TreeView, createTreeCollection } from "@/shared/ui";
import type { ContentNode } from "@/shared/types/design-studio";
import { LuFile, LuFolder, LuImage, LuFileText } from "react-icons/lu";
import { FolderAddContentMenu } from "./folder-add-content-menu";
import { CreateDiagramDialog } from "./create-diagram-dialog";
import { useContentStore } from "../model/content-store";
import type { DiagramType } from "@/shared/types/content-data";

/**
 * Empty root node structure reference
 *
 * Note: The actual root content is now managed by the Zustand store (useContentStore).
 * This constant is kept as documentation of the root node structure.
 */
// const initialContentData: ContentNode = {
//   id: "ROOT",
//   name: "",
//   type: "folder",
//   children: [],
// };

/**
 * Get icon for content type
 */
function getContentIcon(type: ContentNode["type"]) {
  switch (type) {
    case "folder":
      return <LuFolder />;
    case "diagram":
      return <LuFile />;
    case "document":
      return <LuFileText />;
    case "image":
      return <LuImage />;
    default:
      return <LuFile />;
  }
}

export interface DesignNavigationTreeProps {
  /** Callback when a folder is created */
  onCreateFolder?: (folderId: string) => void;
}

export interface DesignNavigationTreeRef {
  /** Create a new folder at the root level */
  createFolder: () => void;
  /** Delete a node from the tree */
  deleteNode: (nodeId: string) => void;
  /** Rename a node */
  renameNode: (nodeId: string, newName: string) => void;
  /** Select a node */
  selectNode: (nodeId: string) => void;
}

/**
 * Navigation tree component
 */
export const DesignNavigationTree = forwardRef<DesignNavigationTreeRef, DesignNavigationTreeProps>(
  function DesignNavigationTree(props, ref) {
    // Get state and actions from Zustand store
    const rootContent = useContentStore((state) => state.rootContent);
    const createFolder = useContentStore((state) => state.createFolder);
    const addContentToFolder = useContentStore((state) => state.addContentToFolder);
    const deleteNode = useContentStore((state) => state.deleteNode);
    const renameNode = useContentStore((state) => state.renameNode);
    const selectNode = useContentStore((state) => state.selectNode);
    const openContent = useContentStore((state) => state.openContent);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

    // Create tree collection from store data
    const collection = createTreeCollection<ContentNode>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      nodeToChildren: (node) => node.children ?? [],
      rootNode: rootContent,
    });

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      createFolder,
      deleteNode,
      renameNode,
      selectNode,
    }));

    // Handle double-click on tree items to open diagrams and documents
    const handleDoubleClick = (node: ContentNode) => {
      if (node.type === 'diagram' || node.type === 'document') {
        openContent(node.id);
      }
    };

    // Handle opening the diagram dialog
    const handleOpenDiagramDialog = (folderId: string) => {
      setSelectedFolderId(folderId);
      setIsDialogOpen(true);
    };

    // Handle creating a diagram from the dialog
    const handleCreateDiagram = (name: string, diagramType: DiagramType) => {
      if (selectedFolderId) {
        addContentToFolder(selectedFolderId, 'diagram', name, diagramType);
      }
      setIsDialogOpen(false);
      setSelectedFolderId(null);
    };

    // Handle closing the dialog
    const handleCloseDialog = () => {
      setIsDialogOpen(false);
      setSelectedFolderId(null);
    };

    return (
      <>
        <TreeView.Root
          collection={collection}
          size="xs"
          color="sidebar.text"
        >
          <TreeView.Label srOnly>Project Navigation</TreeView.Label>
          <TreeView.Tree gap="0">
            <TreeView.Node
              render={({ node, nodeState }) =>
                nodeState.isBranch ? (
                  <TreeView.BranchControl py="0" my="0">
                    {getContentIcon(node.type)}
                    <TreeView.BranchText display="flex" alignItems="center" justifyContent="space-between" flex="1">
                      <span>{node.name}</span>
                      <FolderAddContentMenu
                        onAddDiagram={() => handleOpenDiagramDialog(node.id)}
                        onAddDocument={() => addContentToFolder(node.id, 'document')}
                      />
                    </TreeView.BranchText>
                  </TreeView.BranchControl>
                ) : (
                  <TreeView.Item
                    py="0"
                    my="0"
                    onDoubleClick={() => handleDoubleClick(node)}
                    cursor={node.type === 'diagram' || node.type === 'document' ? 'pointer' : 'default'}
                  >
                    {getContentIcon(node.type)}
                    <TreeView.ItemText display="flex" alignItems="center" justifyContent="space-between" flex="1">
                      <span>{node.name}</span>
                      <FolderAddContentMenu
                        onAddDiagram={() => handleOpenDiagramDialog(node.id)}
                        onAddDocument={() => addContentToFolder(node.id, 'document')}
                      />
                    </TreeView.ItemText>
                  </TreeView.Item>
                )
              }
            />
          </TreeView.Tree>
        </TreeView.Root>

        <CreateDiagramDialog
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          onCreate={handleCreateDiagram}
        />
      </>
    );
  }
);
