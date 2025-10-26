/**
 * Content Data Type Definitions
 *
 * Defines the data structures for diagrams and documents that will be persisted.
 * These are separate from the UI tree structure (ContentNode) and represent
 * the actual content data.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';

/**
 * Types of diagrams supported by the application
 */
export enum DiagramType {
  BPMN = 'bpmn',
  Sequence = 'sequence',
  DataFlow = 'dataflow',
}

/**
 * Metadata shared by all content types
 */
export interface ContentMetadata {
  /** Timestamp when the content was created */
  createdAt: Date;
  /** Timestamp when the content was last modified */
  modifiedAt: Date;
}

/**
 * Diagram - represents a complete diagram with all its shapes and connectors
 */
export interface Diagram {
  /** Unique identifier matching the ContentNode id */
  id: string;
  /** Display name of the diagram */
  name: string;
  /** Type of diagram (determines available tools) */
  diagramType: DiagramType;
  /** All shapes in this diagram */
  shapes: Shape[];
  /** All connectors in this diagram */
  connectors: Connector[];
  /** Metadata about creation and modification */
  metadata: ContentMetadata;
}

/**
 * Document - represents a markdown document
 */
export interface Document {
  /** Unique identifier matching the ContentNode id */
  id: string;
  /** Display name of the document */
  name: string;
  /** Markdown content of the document */
  content: string;
  /** Metadata about creation and modification */
  metadata: ContentMetadata;
}

/**
 * Tab types that can be open in the content area
 */
export enum TabType {
  Home = 'home',
  Diagram = 'diagram',
  Document = 'document',
}

/**
 * Home tab (fixed, non-closeable)
 */
export interface HomeTab {
  type: TabType.Home;
  id: 'home';
  label: 'Home';
}

/**
 * Diagram tab
 */
export interface DiagramTab {
  type: TabType.Diagram;
  /** ID of the diagram (matches Diagram.id and ContentNode.id) */
  id: string;
  /** Display label for the tab */
  label: string;
}

/**
 * Document tab
 */
export interface DocumentTab {
  type: TabType.Document;
  /** ID of the document (matches Document.id and ContentNode.id) */
  id: string;
  /** Display label for the tab */
  label: string;
}

/**
 * Union type for all tab types
 */
export type OpenTab = HomeTab | DiagramTab | DocumentTab;

/**
 * Type guards for tabs
 */
export const isHomeTab = (tab: OpenTab): tab is HomeTab => tab.type === TabType.Home;
export const isDiagramTab = (tab: OpenTab): tab is DiagramTab => tab.type === TabType.Diagram;
export const isDocumentTab = (tab: OpenTab): tab is DocumentTab => tab.type === TabType.Document;

/**
 * Factory functions for creating tabs
 */
export const createHomeTab = (): HomeTab => ({
  type: TabType.Home,
  id: 'home',
  label: 'Home',
});

export const createDiagramTab = (id: string, label: string): DiagramTab => ({
  type: TabType.Diagram,
  id,
  label,
});

export const createDocumentTab = (id: string, label: string): DocumentTab => ({
  type: TabType.Document,
  id,
  label,
});

/**
 * Factory functions for creating empty content
 */
export const createEmptyDiagram = (id: string, name: string, diagramType: DiagramType = DiagramType.BPMN): Diagram => ({
  id,
  name,
  diagramType,
  shapes: [],
  connectors: [],
  metadata: {
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
});

export const createEmptyDocument = (id: string, name: string): Document => ({
  id,
  name,
  content: '',
  metadata: {
    createdAt: new Date(),
    modifiedAt: new Date(),
  },
});
