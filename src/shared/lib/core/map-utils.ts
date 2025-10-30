/**
 * Map Utilities
 *
 * Type-safe utility functions for creating and working with Maps.
 */

import type { Shape } from '@/entities/shape';
import type { Connector } from '@/entities/connector';
import type { DiagramEntity } from '@/entities/diagram-entity';

/**
 * Create a type-safe map of shapes indexed by ID
 *
 * @param shapes - Array of shapes
 * @returns Map from shape ID to shape
 *
 * @example
 * ```typescript
 * const shapes = [shape1, shape2, shape3];
 * const shapesMap = createShapeMap(shapes);
 * const shape = shapesMap.get('shape-1');
 * ```
 */
export function createShapeMap(shapes: Shape[]): Map<string, Shape> {
  return new Map(shapes.map((shape) => [shape.id, shape]));
}

/**
 * Create a type-safe map of connectors indexed by ID
 *
 * @param connectors - Array of connectors
 * @returns Map from connector ID to connector
 *
 * @example
 * ```typescript
 * const connectors = [conn1, conn2, conn3];
 * const connectorsMap = createConnectorMap(connectors);
 * const connector = connectorsMap.get('connector-1');
 * ```
 */
export function createConnectorMap(connectors: Connector[]): Map<string, Connector> {
  return new Map(connectors.map((connector) => [connector.id, connector]));
}

/**
 * Create a type-safe map of diagram entities indexed by ID
 *
 * @param entities - Array of diagram entities
 * @returns Map from entity ID to entity
 *
 * @example
 * ```typescript
 * const entities = [...shapes, ...connectors];
 * const entitiesMap = createEntityMap(entities);
 * const entity = entitiesMap.get('entity-1');
 * ```
 */
export function createEntityMap(entities: DiagramEntity[]): Map<string, DiagramEntity> {
  return new Map(entities.map((entity) => [entity.id, entity]));
}

/**
 * Create a type-safe map from an array of items using a key function
 *
 * @param items - Array of items
 * @param keyFn - Function to extract the key from each item
 * @returns Map from key to item
 *
 * @example
 * ```typescript
 * const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
 * const usersMap = createMap(users, user => user.id);
 * ```
 */
export function createMap<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K
): Map<K, T> {
  return new Map(items.map((item) => [keyFn(item), item]));
}
