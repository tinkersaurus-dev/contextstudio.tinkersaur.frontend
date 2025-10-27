import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { ContentNode, ContentType } from '@/shared/types/design-studio';
import {
  type Diagram,
  type Document,
  type OpenTab,
  DiagramType,
  createHomeTab,
  createDiagramTab,
  createDocumentTab,
  createEmptyDiagram,
  createEmptyDocument,
} from '@/shared/types/content-data';
import { MAX_OPEN_TABS } from '@/shared/config/workspace-config';
import { createError, logError, ErrorSeverity } from '@/shared/lib/result';

interface ContentState {
  // Tree State
  rootContent: ContentNode;
  selectedNodeId: string | null;

  // Counters for naming
  folderCount: number;
  diagramCount: number;
  documentCount: number;
  imageCount: number;

  // Content Data (diagrams and documents)
  diagrams: Map<string, Diagram>;
  documents: Map<string, Document>;

  // Tab Management
  openTabs: OpenTab[];
  activeTabId: string | null;
  errorMessage: string | null;

  // Tree Actions
  createFolder: () => void;
  addContentToFolder: (folderId: string, contentType: Exclude<ContentType, 'folder'>, name?: string, diagramType?: DiagramType) => void;
  deleteNode: (nodeId: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  selectNode: (nodeId: string) => void;

  // Tab Actions
  openContent: (contentId: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  setErrorMessage: (message: string | null) => void;

  // Content Data Actions
  getDiagram: (id: string) => Diagram | null;
  getDocument: (id: string) => Document | null;
  updateDiagram: (id: string, updates: Partial<Diagram>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;

  // Internal helpers (not in public API)
  _findNode: (nodeId: string, node?: ContentNode) => ContentNode | null;
  _updateNode: (nodeId: string, updater: (node: ContentNode) => ContentNode, node?: ContentNode) => ContentNode | null;
}

export const useContentStore = create<ContentState>((set, get) => ({
  // Tree Initial state
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

  // Content Data Initial state
  diagrams: new Map<string, Diagram>(),
  documents: new Map<string, Document>(),

  // Tab Management Initial state
  openTabs: [createHomeTab()],
  activeTabId: 'home',
  errorMessage: null,

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
  addContentToFolder: (folderId, contentType, name, diagramType) => {
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
    let contentName: string;
    let counterUpdate: Partial<ContentState>;

    const contentId = uuidv4();

    switch (contentType) {
      case 'diagram': {
        const count = get().diagramCount + 1;
        contentName = name || `Diagram ${count}`;
        counterUpdate = { diagramCount: count };

        // Create empty diagram data with the specified type (or default to BPMN)
        const newDiagram = createEmptyDiagram(
          contentId,
          contentName,
          diagramType || DiagramType.BPMN
        );
        const diagrams = new Map(get().diagrams);
        diagrams.set(contentId, newDiagram);
        counterUpdate.diagrams = diagrams;
        break;
      }
      case 'document': {
        const count = get().documentCount + 1;
        contentName = name || `Document ${count}`;
        counterUpdate = { documentCount: count };

        // Create empty document data
        const newDocument = createEmptyDocument(contentId, contentName);
        const documents = new Map(get().documents);
        documents.set(contentId, newDocument);
        counterUpdate.documents = documents;
        break;
      }
      case 'image': {
        const count = get().imageCount + 1;
        contentName = name || `Image ${count}`;
        counterUpdate = { imageCount: count };
        break;
      }
    }

    const newContent: ContentNode = {
      id: contentId,
      name: contentName,
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

    // Note: Canvas stores are now managed internally by DiagramCanvas components
    // No need to manually clean up cache

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

  // ============================================================================
  // TAB MANAGEMENT ACTIONS
  // ============================================================================

  // Open content in a tab (or switch to existing tab)
  openContent: (contentId) => {
    const { openTabs, diagrams, documents, _findNode } = get();

    // Check if tab is already open
    const existingTab = openTabs.find(tab => tab.id === contentId);
    if (existingTab) {
      // Tab already open, just switch to it
      set({ activeTabId: contentId, errorMessage: null });
      return;
    }

    // Check if we're at the max tab limit (excluding home tab)
    const contentTabsCount = openTabs.filter(tab => tab.id !== 'home').length;
    if (contentTabsCount >= MAX_OPEN_TABS) {
      set({ errorMessage: `Cannot open more than ${MAX_OPEN_TABS} files at once` });
      return;
    }

    // Find the content node to get its name and type
    const node = _findNode(contentId);
    if (!node) {
      const error = createError(
        `Cannot open content: node with id ${contentId} not found`,
        ErrorSeverity.Error,
        { code: 'NODE_NOT_FOUND', context: { contentId } }
      );
      logError(error);
      set({ errorMessage: 'Content not found' });
      return;
    }

    // Create appropriate tab based on content type
    let newTab: OpenTab | null = null;

    if (node.type === 'diagram') {
      // Verify diagram data exists
      if (!diagrams.has(contentId)) {
        const error = createError(
          `Cannot open diagram: diagram data for id ${contentId} not found`,
          ErrorSeverity.Error,
          { code: 'DIAGRAM_DATA_NOT_FOUND', context: { contentId } }
        );
        logError(error);
        set({ errorMessage: 'Diagram data not found' });
        return;
      }
      newTab = createDiagramTab(contentId, node.name);
    } else if (node.type === 'document') {
      // Verify document data exists
      if (!documents.has(contentId)) {
        const error = createError(
          `Cannot open document: document data for id ${contentId} not found`,
          ErrorSeverity.Error,
          { code: 'DOCUMENT_DATA_NOT_FOUND', context: { contentId } }
        );
        logError(error);
        set({ errorMessage: 'Document data not found' });
        return;
      }
      newTab = createDocumentTab(contentId, node.name);
    } else {
      // Images or other types not yet supported
      set({ errorMessage: `Cannot open ${node.type} files yet` });
      return;
    }

    if (newTab) {
      set({
        openTabs: [...openTabs, newTab],
        activeTabId: contentId,
        errorMessage: null,
      });
    }
  },

  // Close a tab
  closeTab: (tabId) => {
    const { openTabs, activeTabId } = get();

    // Cannot close home tab
    if (tabId === 'home') {
      return;
    }

    const newTabs = openTabs.filter(tab => tab.id !== tabId);

    // If we're closing the active tab, switch to home
    const newActiveTabId = activeTabId === tabId ? 'home' : activeTabId;

    set({
      openTabs: newTabs,
      activeTabId: newActiveTabId,
    });
  },

  // Set active tab
  setActiveTab: (tabId) => {
    const { openTabs } = get();

    // Verify tab exists
    const tab = openTabs.find(t => t.id === tabId);
    if (!tab) {
      return;
    }

    set({ activeTabId: tabId });
  },

  // Set error message
  setErrorMessage: (message) => {
    set({ errorMessage: message });
  },

  // ============================================================================
  // CONTENT DATA ACTIONS
  // ============================================================================

  // Get diagram by ID
  getDiagram: (id) => {
    return get().diagrams.get(id) ?? null;
  },

  // Get document by ID
  getDocument: (id) => {
    return get().documents.get(id) ?? null;
  },

  // Update diagram
  updateDiagram: (id, updates) => {
    const { diagrams } = get();
    const diagram = diagrams.get(id);

    if (!diagram) {
      const error = createError(
        `Cannot update diagram: diagram with id ${id} not found`,
        ErrorSeverity.Error,
        { code: 'DIAGRAM_NOT_FOUND', context: { diagramId: id } }
      );
      logError(error);
      return;
    }

    const updatedDiagram: Diagram = {
      ...diagram,
      ...updates,
      metadata: {
        ...diagram.metadata,
        modifiedAt: new Date(),
      },
    };

    const newDiagrams = new Map(diagrams);
    newDiagrams.set(id, updatedDiagram);

    set({ diagrams: newDiagrams });
  },

  // Update document
  updateDocument: (id, updates) => {
    const { documents } = get();
    const document = documents.get(id);

    if (!document) {
      const error = createError(
        `Cannot update document: document with id ${id} not found`,
        ErrorSeverity.Error,
        { code: 'DOCUMENT_NOT_FOUND', context: { documentId: id } }
      );
      logError(error);
      return;
    }

    const updatedDocument: Document = {
      ...document,
      ...updates,
      metadata: {
        ...document.metadata,
        modifiedAt: new Date(),
      },
    };

    const newDocuments = new Map(documents);
    newDocuments.set(id, updatedDocument);

    set({ documents: newDocuments });
  },
}));
