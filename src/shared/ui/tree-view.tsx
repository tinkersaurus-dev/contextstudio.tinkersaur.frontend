/**
 * TreeView Component Wrapper
 *
 * A thin wrapper around Chakra UI's TreeView component that allows
 * for easy customization and consistent styling across the application.
 */

import {
  TreeView as ChakraTreeView,
  createTreeCollection as chakraCreateTreeCollection,
  type TreeViewRootProps as ChakraTreeViewRootProps,
} from "@chakra-ui/react";
import { forwardRef } from "react";

// ============================================================================
// TYPES
// ============================================================================

export type TreeViewRootProps = ChakraTreeViewRootProps;

// ============================================================================
// ROOT COMPONENT
// ============================================================================

export const TreeViewRoot = forwardRef<HTMLDivElement, TreeViewRootProps>(
  function TreeViewRoot(props, ref) {
    return <ChakraTreeView.Root ref={ref} {...props} />;
  }
);

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * TreeView namespace containing all TreeView sub-components
 */
export const TreeView = {
  Root: TreeViewRoot,
  RootProvider: ChakraTreeView.RootProvider,
  Label: ChakraTreeView.Label,
  Tree: ChakraTreeView.Tree,
  Node: ChakraTreeView.Node,
  NodeProvider: ChakraTreeView.NodeProvider,
  Branch: ChakraTreeView.Branch,
  BranchContent: ChakraTreeView.BranchContent,
  BranchControl: ChakraTreeView.BranchControl,
  BranchIndicator: ChakraTreeView.BranchIndicator,
  BranchIndentGuide: ChakraTreeView.BranchIndentGuide,
  BranchText: ChakraTreeView.BranchText,
  BranchTrigger: ChakraTreeView.BranchTrigger,
  Item: ChakraTreeView.Item,
  ItemIndicator: ChakraTreeView.ItemIndicator,
  ItemText: ChakraTreeView.ItemText,
  NodeCheckbox: ChakraTreeView.NodeCheckbox,
  NodeCheckboxIndicator: ChakraTreeView.NodeCheckboxIndicator,
};

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Re-export createTreeCollection helper
 *
 * Note: This is a direct pass-through to Chakra UI's createTreeCollection utility.
 * It's re-exported here for convenience and consistency, but adds no additional functionality.
 * The wrapper is primarily for UI components, not utilities.
 */
export const createTreeCollection = chakraCreateTreeCollection;
