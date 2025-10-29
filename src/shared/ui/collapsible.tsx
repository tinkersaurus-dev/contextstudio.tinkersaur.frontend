'use client';

import { Collapsible as ChakraCollapsible } from '@chakra-ui/react';
import type { ComponentProps } from 'react';

/**
 * Collapsible Root component - wrapper for Chakra UI Collapsible
 */
export const CollapsibleRoot = ChakraCollapsible.Root;
export type CollapsibleRootProps = ComponentProps<typeof ChakraCollapsible.Root>;

/**
 * Collapsible Trigger component - button to toggle the collapsible
 */
export const CollapsibleTrigger = ChakraCollapsible.Trigger;
export type CollapsibleTriggerProps = ComponentProps<typeof ChakraCollapsible.Trigger>;

/**
 * Collapsible Content component - the content that expands/collapses
 */
export const CollapsibleContent = ChakraCollapsible.Content;
export type CollapsibleContentProps = ComponentProps<typeof ChakraCollapsible.Content>;

/**
 * Collapsible Indicator component - icon that rotates when toggled
 */
export const CollapsibleIndicator = ChakraCollapsible.Indicator;
export type CollapsibleIndicatorProps = ComponentProps<typeof ChakraCollapsible.Indicator>;

/**
 * Collapsible Context - access collapsible state
 */
export const CollapsibleContext = ChakraCollapsible.Context;

/**
 * Compound component for easier access
 */
export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
  Indicator: CollapsibleIndicator,
  Context: CollapsibleContext,
};
