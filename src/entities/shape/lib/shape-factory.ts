/**
 * Shape Factory (Barrel Export)
 *
 * Central export point for all shape factory functions.
 * Factories are organized by domain/toolset for better maintainability:
 * - basic-shape-factory: Rectangle and other basic geometric shapes
 * - bpmn-shape-factory: BPMN process modeling shapes
 *
 * Future factories can be added here:
 * - uml-shape-factory: UML class diagrams, sequence diagrams, etc.
 * - flowchart-shape-factory: Flowchart-specific shapes
 * - erd-shape-factory: Entity-Relationship Diagram shapes
 */

// Re-export all basic shape factories
export * from './factories/basic-shape-factory';

// Re-export all BPMN shape factories
export * from './factories/bpmn-shape-factory';
