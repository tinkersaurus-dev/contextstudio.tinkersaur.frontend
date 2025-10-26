/**
 * Canvas Store Cache
 *
 * Manages a cache of canvas store instances to persist them across
 * tab switches and component unmounts.
 */

import { createCanvasStore, type CanvasStore } from './canvas-store';
import type { Diagram } from '@/shared/types/content-data';

/**
 * Global cache of canvas stores by diagram ID
 */
const storeCache = new Map<string, CanvasStore>();

/**
 * Get or create a canvas store for a diagram.
 * Stores are cached and reused across component lifecycles.
 */
export function getOrCreateCanvasStore(diagram: Diagram): CanvasStore {
  const existingStore = storeCache.get(diagram.id);

  if (existingStore) {
    console.log(`[CanvasStoreCache] Reusing existing store for diagram ${diagram.id}`);
    // Store exists, but we should update it with the latest diagram data
    // in case shapes/connectors were modified elsewhere (e.g., auto-save)
    const currentState = existingStore.getState();
    const hasChanges =
      currentState.shapes.length !== diagram.shapes.length ||
      currentState.connectors.length !== diagram.connectors.length;

    if (hasChanges) {
      console.log(`[CanvasStoreCache] Diagram ${diagram.id} has external changes, syncing store`);
      // Update the store with new data from the diagram
      existingStore.setState({
        shapes: [...diagram.shapes],
        connectors: [...diagram.connectors],
      });
    }

    return existingStore;
  }

  console.log(`[CanvasStoreCache] Creating new store for diagram ${diagram.id} with ${diagram.shapes.length} shapes, ${diagram.connectors.length} connectors`);
  const newStore = createCanvasStore(diagram);
  storeCache.set(diagram.id, newStore);
  return newStore;
}

/**
 * Remove a store from the cache (e.g., when a diagram is deleted)
 */
export function removeCanvasStore(diagramId: string): void {
  console.log(`[CanvasStoreCache] Removing store for diagram ${diagramId}`);
  storeCache.delete(diagramId);
}

/**
 * Clear all cached stores
 */
export function clearCanvasStoreCache(): void {
  console.log('[CanvasStoreCache] Clearing all cached stores');
  storeCache.clear();
}
