/**
 * Design Studio Type Definitions
 *
 * Types for the design studio content hierarchy, supporting flexible
 * folder structures that can contain any mix of content types.
 */

/**
 * Content types supported in the design studio
 */
export type ContentType = 'folder' | 'diagram' | 'document' | 'image';

/**
 * Base content node interface
 */
export interface ContentNode {
  /** Unique identifier for the content node */
  id: string;

  /** Display name of the content */
  name: string;

  /** Type of content */
  type: ContentType;

  /** Child nodes (for folders or any hierarchical structure) */
  children?: ContentNode[];
}

/**
 * Type guards for content nodes
 */
export const isFolder = (node: ContentNode): node is ContentNode & { type: 'folder' } =>
  node.type === 'folder';
export const isDiagram = (node: ContentNode): node is ContentNode & { type: 'diagram' } =>
  node.type === 'diagram';
export const isDocument = (node: ContentNode): node is ContentNode & { type: 'document' } =>
  node.type === 'document';
export const isImage = (node: ContentNode): node is ContentNode & { type: 'image' } =>
  node.type === 'image';
