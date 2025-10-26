/**
 * Canvas Store Provider
 *
 * React Context provider for diagram canvas store.
 * Ensures each diagram tab has its own isolated store instance.
 */

'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useStore } from 'zustand';
import { type CanvasStore } from './canvas-store';
import { getOrCreateCanvasStore } from './canvas-store-cache';
import type { Diagram } from '@/shared/types/content-data';

/**
 * Context for canvas store
 */
const CanvasStoreContext = createContext<CanvasStore | null>(null);

/**
 * Props for CanvasStoreProvider
 */
export interface CanvasStoreProviderProps {
  diagram: Diagram;
  children: ReactNode;
}

/**
 * Provider component that creates and provides a canvas store instance
 */
export function CanvasStoreProvider({ diagram, children }: CanvasStoreProviderProps) {
  // Get or create store from cache - this persists across unmounts
  // useMemo ensures we only call getOrCreateCanvasStore when diagram.id changes
  const store = useMemo(() => {
    console.log(`[CanvasStoreProvider] Getting/creating store for diagram ${diagram.id}`);
    return getOrCreateCanvasStore(diagram);
  }, [diagram.id, diagram]);

  return (
    <CanvasStoreContext.Provider value={store}>
      {children}
    </CanvasStoreContext.Provider>
  );
}

/**
 * Hook to access the canvas store from context
 * Must be used within a CanvasStoreProvider
 */
export function useCanvasStoreContext() {
  const store = useContext(CanvasStoreContext);

  if (!store) {
    throw new Error('useCanvasStoreContext must be used within a CanvasStoreProvider');
  }

  return store;
}

/**
 * Hook to select values from the canvas store
 * Usage: const shapes = useCanvasStore(state => state.shapes)
 */
export function useCanvasStore<T>(selector: (state: ReturnType<CanvasStore['getState']>) => T): T {
  const store = useCanvasStoreContext();
  return useStore(store, selector);
}
