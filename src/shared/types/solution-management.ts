/**
 * Solution Management Type Definitions
 *
 * Defines the data models for solutions, components, and changes.
 * Solutions can encompass products, services, processes, etc.
 */

/**
 * Solution represents a high-level product, service, process, or system
 */
export interface Solution {
  id: string;
  name: string;
}

/**
 * Component represents a part or module of a solution
 */
export interface Component {
  id: string;
  name: string;
  solutionId: string;
}

/**
 * Change represents a modification or update to a component
 */
export interface Change {
  id: string;
  name: string;
  componentId: string;
}
