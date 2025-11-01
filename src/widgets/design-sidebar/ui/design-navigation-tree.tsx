/**
 * Design Navigation Tree
 *
 * TreeView navigation for browsing and organizing design content.
 * Supports flexible folder structures with mixed content types
 * (diagrams, documents, images, etc.) at any hierarchy level.
 */

"use client";

import { forwardRef, useImperativeHandle, useState, useCallback, useMemo } from "react";
import { TreeView, createTreeCollection } from "@/shared/ui";
import type { ContentNode } from "@/shared/types/design-studio";
import { LuFile, LuFolder, LuImage, LuFileText } from "react-icons/lu";
import { BsDiagram2 } from "react-icons/bs";
import { FolderAddContentMenu } from "./folder-add-content-menu";
import { CreateDiagramDialog } from "./create-diagram-dialog";
import { useContentStore } from "../model/content-store";
import type { DiagramType } from "@/shared/types/content-data";

/**
 * Get icon for content type
 */
function getContentIcon(type: ContentNode["type"]) {
  switch (type) {
    case "folder":
      return <LuFolder />;
    case "diagram":
      return <BsDiagram2 />;
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

    // Create tree collection from store data (memoize to prevent recreation)
    const collection = useMemo(() => createTreeCollection<ContentNode>({
      nodeToValue: (node) => node.id,
      nodeToString: (node) => node.name,
      nodeToChildren: (node) => node.children ?? [],
      rootNode: rootContent,
    }), [rootContent]);

    // Get all node IDs for expanding all branches
    const getAllNodeIds = useCallback((node: ContentNode): string[] => {
      const ids: string[] = [];
      if (node.type === 'folder' && node.children) {
        ids.push(node.id);
        node.children.forEach(child => {
          ids.push(...getAllNodeIds(child));
        });
      }
      return ids;
    }, []);

    // Memoize all expanded node IDs
    const allExpandedIds = useMemo(() => getAllNodeIds(rootContent), [rootContent, getAllNodeIds]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      createFolder,
      deleteNode,
      renameNode,
      selectNode,
    }), [createFolder, deleteNode, renameNode, selectNode]);

    // Handle double-click on tree items to open diagrams and documents
    const handleDoubleClick = useCallback((node: ContentNode) => {
      if (node.type === 'diagram' || node.type === 'document') {
        openContent(node.id);
      }
    }, [openContent]);

    // Handle opening the diagram dialog
    const handleOpenDiagramDialog = useCallback((folderId: string) => {
      setSelectedFolderId(folderId);
      setIsDialogOpen(true);
    }, []);

    // Handle creating a diagram from the dialog
    const handleCreateDiagram = useCallback((name: string, diagramType: DiagramType) => {
      if (!selectedFolderId) {
        setIsDialogOpen(false);
        setSelectedFolderId(null);
        return;
      }

      addContentToFolder(selectedFolderId, 'diagram', name, diagramType);
      setIsDialogOpen(false);
      setSelectedFolderId(null);
    }, [selectedFolderId, addContentToFolder]);

    // Handle closing the dialog
    const handleCloseDialog = useCallback(() => {
      setIsDialogOpen(false);
      setSelectedFolderId(null);
    }, []);

    // Memoize handler factory for adding diagram to folder
    const handleAddDiagram = useCallback((nodeId: string) => () => {
      handleOpenDiagramDialog(nodeId);
    }, [handleOpenDiagramDialog]);

    // Memoize handler factory for adding document to folder
    const handleAddDocument = useCallback((nodeId: string) => () => {
      addContentToFolder(nodeId, 'document');
    }, [addContentToFolder]);

    return (
      <>
        <TreeView.Root
          collection={collection}
          defaultExpandedValue={allExpandedIds}
          size="xs"
          color="sidebar.text"
          css={{
            "& [data-part='branch-content']": {
              marginTop: "0.125rem",
            }
          }}
        >
          <TreeView.Label srOnly>Project Navigation</TreeView.Label>
          <TreeView.Tree gap="0" bg="panel.bg">
            <TreeView.Node
              render={({ node, nodeState }) =>
                nodeState.isBranch ? (
                  <TreeView.BranchControl py="1" mb="0">
                    {getContentIcon(node.type)}
                    <TreeView.BranchText display="flex" alignItems="center" justifyContent="space-between" flex="1">
                      <span>{node.name}</span>
                      {node.type === 'folder' && (
                        <FolderAddContentMenu
                          onAddDiagram={handleAddDiagram(node.id)}
                          onAddDocument={handleAddDocument(node.id)}
                        />
                      )}
                    </TreeView.BranchText>
                  </TreeView.BranchControl>
                ) : (
                  <TreeView.Item
                    py="1"
                    mb="1"
                    onDoubleClick={() => handleDoubleClick(node)}
                    cursor={node.type === 'diagram' || node.type === 'document' ? 'pointer' : 'default'}
                  >
                    {getContentIcon(node.type)}
                    <TreeView.ItemText display="flex" alignItems="center" justifyContent="space-between" flex="1">
                      <span>{node.name}</span>
                      {node.type === 'folder' && (
                        <FolderAddContentMenu
                          onAddDiagram={handleAddDiagram(node.id)}
                          onAddDocument={handleAddDocument(node.id)}
                        />
                      )}
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
