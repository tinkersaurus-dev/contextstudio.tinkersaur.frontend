import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { ContentNode, ContentType } from '@/shared/types/design-studio';
import { createError, logError, ErrorSeverity } from '@/shared/lib/result';

interface ContentState {
  // State
  rootContent: ContentNode;
  selectedNodeId: string | null;

  // Counters for naming
  folderCount: number;
  diagramCount: number;
  documentCount: number;
  imageCount: number;

  // Actions
  createFolder: () => void;
  addContentToFolder: (folderId: string, contentType: Exclude<ContentType, 'folder'>) => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  selectNode: (nodeId: string) => void;

  // Internal helpers (not in public API)
  _findNode: (nodeId: string, node?: ContentNode) => ContentNode | null;
  _updateNode: (nodeId: string, updater: (node: ContentNode) => ContentNode, node?: ContentNode) => ContentNode | null;
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Initial state
  rootContent: {
    id: 'ROOT',
    name: '',
    type: 'folder',
    children: [],
  },
  selectedNodeId: null,
  folderCount: 0,
  diagramCount: 0,
  documentCount: 0,
  imageCount: 0,

  // Internal helper: Find a node by ID recursively
  _findNode: (nodeId, node) => {
    const searchNode = node ?? get().rootContent;

    if (searchNode.id === nodeId) {
      return searchNode;
    }

    if (searchNode.children) {
      for (const child of searchNode.children) {
        const found = get()._findNode(nodeId, child);
        if (found) {
          return found;
        }
      }
    }

    return null;
  },

  // Internal helper: Update a node immutably
  _updateNode: (nodeId, updater, node) => {
    const searchNode = node ?? get().rootContent;

    if (searchNode.id === nodeId) {
      return updater(searchNode);
    }

    if (searchNode.children) {
      const updatedChildren = searchNode.children.map((child) => {
        const updated = get()._updateNode(nodeId, updater, child);
        return updated ?? child;
      });

      // Only create new object if children actually changed
      if (updatedChildren.some((child, idx) => child !== searchNode.children![idx])) {
        return { ...searchNode, children: updatedChildren };
      }
    }

    return null;
  },

  // Create a new folder at root level
  createFolder: () => {
    const folderCount = get().folderCount + 1;
    const newFolder: ContentNode = {
      id: uuidv4(),
      name: `Folder ${folderCount}`,
      type: 'folder',
      children: [],
    };

    set((state) => ({
      rootContent: {
        ...state.rootContent,
        children: [...(state.rootContent.children ?? []), newFolder],
      },
      folderCount,
    }));
  },

  // Add content to a specific folder
  addContentToFolder: (folderId, contentType) => {
    const folder = get()._findNode(folderId);

    if (!folder) {
      const error = createError(
        `Cannot add content: folder with id ${folderId} not found`,
        ErrorSeverity.Error,
        { code: 'FOLDER_NOT_FOUND', context: { folderId, contentType } }
      );
      logError(error);
      return;
    }

    if (folder.type !== 'folder') {
      const error = createError(
        `Cannot add content: node ${folderId} is not a folder`,
        ErrorSeverity.Error,
        { code: 'INVALID_PARENT_TYPE', context: { folderId, nodeType: folder.type, contentType } }
      );
      logError(error);
      return;
    }

    // Generate name and increment appropriate counter
    let name: string;
    let counterUpdate: Partial<ContentState>;

    switch (contentType) {
      case 'diagram': {
        const count = get().diagramCount + 1;
        name = `Diagram ${count}`;
        counterUpdate = { diagramCount: count };
        break;
      }
      case 'document': {
        const count = get().documentCount + 1;
        name = `Document ${count}`;
        counterUpdate = { documentCount: count };
        break;
      }
      case 'image': {
        const count = get().imageCount + 1;
        name = `Image ${count}`;
        counterUpdate = { imageCount: count };
        break;
      }
    }

    const newContent: ContentNode = {
      id: uuidv4(),
      name,
      type: contentType,
    };

    // Update the tree immutably
    const updatedRoot = get()._updateNode(
      folderId,
      (node) => ({
        ...node,
        children: [...(node.children ?? []), newContent],
      })
    );

    if (updatedRoot) {
      set({
        rootContent: updatedRoot as ContentNode,
        ...counterUpdate,
      });
    }
  },

  // Delete a node from the tree
  deleteNode: (nodeId) => {
    if (nodeId === 'ROOT') {
      const error = createError(
        'Cannot delete ROOT node',
        ErrorSeverity.Error,
        { code: 'CANNOT_DELETE_ROOT', context: { nodeId } }
      );
      logError(error);
      return;
    }

    const node = get()._findNode(nodeId);
    if (!node) {
      const error = createError(
        `Cannot delete node: node with id ${nodeId} not found`,
        ErrorSeverity.Error,
        { code: 'NODE_NOT_FOUND', context: { nodeId } }
      );
      logError(error);
      return;
    }

    // Helper to remove node from children array
    const removeFromChildren = (parent: ContentNode): ContentNode => {
      if (!parent.children) {
        return parent;
      }

      const newChildren = parent.children.filter((child) => child.id !== nodeId);
      if (newChildren.length === parent.children.length) {
        // Node not in this parent's children, check recursively
        return {
          ...parent,
          children: parent.children.map(removeFromChildren),
        };
      }

      return {
        ...parent,
        children: newChildren,
      };
    };

    const updatedRoot = removeFromChildren(get().rootContent);

    set((state) => ({
      rootContent: updatedRoot,
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  // Rename a node
  renameNode: (nodeId, newName) => {
    const node = get()._findNode(nodeId);
    if (!node) {
      const error = createError(
        `Cannot rename node: node with id ${nodeId} not found`,
        ErrorSeverity.Error,
        { code: 'NODE_NOT_FOUND', context: { nodeId, newName } }
      );
      logError(error);
      return;
    }

    const updatedRoot = get()._updateNode(
      nodeId,
      (node) => ({ ...node, name: newName })
    );

    if (updatedRoot) {
      set({ rootContent: updatedRoot as ContentNode });
    }
  },

  // Select a node
  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },
}));
