/**
 * Entity System
 *
 * Complete entity system with interfaces, validation, rendering, and hit testing.
 * Provides a unified API for working with diagram entities (shapes and connectors).
 */

// Core interfaces and types
export * from './interfaces';

// Main entity system facade
export * from './system';

// Entity styles and theming
export * from './styles';

// Entity validation
export * from './validation';

// Internal implementations - export with explicit names if needed externally
export { EntityRenderer } from './renderer';
export { EntityBoundsCalculator } from './bounds-calculator';
export { EntityHitTester } from './hit-tester';
