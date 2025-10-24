/**
 * ID Generator Utilities
 *
 * Provides utilities for generating unique identifiers across the application.
 * This ensures consistent ID generation patterns and reduces duplication.
 */

/**
 * Generate a unique ID with a given prefix
 *
 * Combines timestamp and random string for uniqueness.
 * Format: {prefix}-{timestamp}-{random}
 *
 * @param prefix - Prefix for the ID (e.g., 'shape', 'connector', 'node')
 * @returns A unique string identifier
 *
 * @example
 * const id = generateId('shape');
 * // Returns: "shape-1234567890-abc123xyz"
 */
export function generateId(prefix: string): string {
  // Use modern substring() instead of deprecated substr()
  // Generate random alphanumeric string using base36 encoding
  const randomPart = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${Date.now()}-${randomPart}`;
}

/**
 * Generate a unique shape ID
 *
 * @returns A unique shape identifier
 *
 * @example
 * const shapeId = generateShapeId();
 * // Returns: "shape-1234567890-abc123xyz"
 */
export function generateShapeId(): string {
  return generateId('shape');
}

/**
 * Generate a unique entity ID
 *
 * @param entityType - Type of entity (e.g., 'shape', 'connector', 'node')
 * @returns A unique entity identifier
 *
 * @example
 * const connectorId = generateEntityId('connector');
 * // Returns: "connector-1234567890-abc123xyz"
 */
export function generateEntityId(entityType: string): string {
  return generateId(entityType);
}

/**
 * Validate if a string matches the expected ID format
 *
 * @param id - ID string to validate
 * @param prefix - Optional expected prefix
 * @returns True if ID matches the expected format
 *
 * @example
 * isValidId('shape-1234567890-abc123xyz', 'shape'); // true
 * isValidId('invalid-id'); // false
 */
export function isValidId(id: string, prefix?: string): boolean {
  const pattern = prefix
    ? new RegExp(`^${prefix}-\\d+-[a-z0-9]+$`)
    : /^[a-z]+-\d+-[a-z0-9]+$/;

  return pattern.test(id);
}

/**
 * Extract prefix from an ID
 *
 * @param id - ID string
 * @returns The prefix part of the ID, or null if invalid format
 *
 * @example
 * extractPrefix('shape-1234567890-abc123xyz'); // 'shape'
 * extractPrefix('invalid'); // null
 */
export function extractPrefix(id: string): string | null {
  const match = id.match(/^([a-z]+)-\d+-[a-z0-9]+$/);
  return match ? match[1] : null;
}
