/**
 * Solution Management Store
 *
 * Zustand store for managing solutions, components, and changes.
 * Provides state and actions for add/delete operations.
 */

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Solution, Component, Change } from "@/shared/types/solution-management";

interface SolutionState {
  solutions: Solution[];
  components: Component[];
  changes: Change[];

  // Solution actions
  addSolution: (name: string) => void;
  deleteSolution: (id: string) => void;

  // Component actions
  addComponent: (name: string, solutionId: string) => void;
  deleteComponent: (id: string) => void;

  // Change actions
  addChange: (name: string, componentId: string) => void;
  deleteChange: (id: string) => void;

  // Helper getters
  getComponentsBySolution: (solutionId: string) => Component[];
  getChangesByComponent: (componentId: string) => Change[];
}

export const useSolutionStore = create<SolutionState>((set, get) => ({
  solutions: [],
  components: [],
  changes: [],

  // Solution actions
  addSolution: (name: string) => {
    const newSolution: Solution = {
      id: uuidv4(),
      name,
    };
    set((state) => ({
      solutions: [...state.solutions, newSolution],
    }));
  },

  deleteSolution: (id: string) => {
    // Delete solution and all its components and their changes
    const componentsToDelete = get().components.filter(
      (c) => c.solutionId === id
    );
    const componentIds = componentsToDelete.map((c) => c.id);

    set((state) => ({
      solutions: state.solutions.filter((s) => s.id !== id),
      components: state.components.filter((c) => c.solutionId !== id),
      changes: state.changes.filter((ch) => !componentIds.includes(ch.componentId)),
    }));
  },

  // Component actions
  addComponent: (name: string, solutionId: string) => {
    const newComponent: Component = {
      id: uuidv4(),
      name,
      solutionId,
    };
    set((state) => ({
      components: [...state.components, newComponent],
    }));
  },

  deleteComponent: (id: string) => {
    // Delete component and all its changes
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      changes: state.changes.filter((ch) => ch.componentId !== id),
    }));
  },

  // Change actions
  addChange: (name: string, componentId: string) => {
    const newChange: Change = {
      id: uuidv4(),
      name,
      componentId,
    };
    set((state) => ({
      changes: [...state.changes, newChange],
    }));
  },

  deleteChange: (id: string) => {
    set((state) => ({
      changes: state.changes.filter((ch) => ch.id !== id),
    }));
  },

  // Helper getters
  getComponentsBySolution: (solutionId: string) => {
    return get().components.filter((c) => c.solutionId === solutionId);
  },

  getChangesByComponent: (componentId: string) => {
    return get().changes.filter((ch) => ch.componentId === componentId);
  },
}));
