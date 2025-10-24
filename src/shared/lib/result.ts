/**
 * Result Type for Error Handling
 *
 * Provides a type-safe way to handle operations that may fail without using exceptions.
 * This approach makes error handling explicit and forces callers to handle both success and failure cases.
 *
 * @example
 * ```typescript
 * function parseNumber(input: string): Result<number> {
 *   const num = parseInt(input, 10);
 *   if (isNaN(num)) {
 *     return err('Invalid number format');
 *   }
 *   return ok(num);
 * }
 *
 * const result = parseNumber('42');
 * if (result.ok) {
 *   console.log('Value:', result.value); // TypeScript knows result.value exists
 * } else {
 *   console.error('Error:', result.error); // TypeScript knows result.error exists
 * }
 * ```
 */

/**
 * Represents the result of an operation that may succeed or fail.
 *
 * - Success case: `{ ok: true, value: T }`
 * - Failure case: `{ ok: false, error: string }`
 *
 * The discriminated union allows TypeScript to narrow the type based on the `ok` field.
 */
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

/**
 * Creates a successful Result with a value.
 *
 * @param value - The success value to wrap
 * @returns A successful Result
 *
 * @example
 * ```typescript
 * const result = ok(42);
 * // result is { ok: true, value: 42 }
 * ```
 */
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

/**
 * Creates a failed Result with an error message.
 *
 * @param error - The error message describing the failure
 * @returns A failed Result
 *
 * @example
 * ```typescript
 * const result = err('Something went wrong');
 * // result is { ok: false, error: 'Something went wrong' }
 * ```
 */
export function err<T>(error: string): Result<T> {
  return { ok: false, error };
}

/**
 * Unwraps a Result, returning the value if successful or throwing if failed.
 *
 * CAUTION: This should only be used when you're certain the operation succeeded
 * or when you want to propagate the error as an exception.
 *
 * @param result - The Result to unwrap
 * @returns The unwrapped value
 * @throws Error if the Result is a failure
 *
 * @example
 * ```typescript
 * const result = ok(42);
 * const value = unwrap(result); // 42
 *
 * const failed = err('oops');
 * const value2 = unwrap(failed); // throws Error: 'oops'
 * ```
 */
export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.value;
}

/**
 * Unwraps a Result, returning the value if successful or a default value if failed.
 *
 * @param result - The Result to unwrap
 * @param defaultValue - The value to return if the Result is a failure
 * @returns The unwrapped value or the default value
 *
 * @example
 * ```typescript
 * const result = err<number>('failed');
 * const value = unwrapOr(result, 0); // 0
 * ```
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/**
 * Maps a successful Result value through a transformation function.
 * If the Result is a failure, returns the failure unchanged.
 *
 * @param result - The Result to map
 * @param fn - The transformation function to apply to the success value
 * @returns A new Result with the transformed value or the original error
 *
 * @example
 * ```typescript
 * const result = ok(5);
 * const doubled = map(result, x => x * 2); // ok(10)
 *
 * const failed = err<number>('oops');
 * const stillFailed = map(failed, x => x * 2); // err('oops')
 * ```
 */
export function map<T, U>(result: Result<T>, fn: (value: T) => U): Result<U> {
  if (!result.ok) {
    return result;
  }
  return ok(fn(result.value));
}

/**
 * Chains Result-returning operations together.
 * If the Result is a failure, returns the failure unchanged.
 * If successful, applies the function which itself returns a Result.
 *
 * @param result - The Result to chain from
 * @param fn - The function to apply, which returns a new Result
 * @returns The Result from the chained function or the original error
 *
 * @example
 * ```typescript
 * function parseNumber(s: string): Result<number> {
 *   const n = parseInt(s, 10);
 *   return isNaN(n) ? err('Invalid number') : ok(n);
 * }
 *
 * function sqrt(n: number): Result<number> {
 *   return n < 0 ? err('Cannot take sqrt of negative') : ok(Math.sqrt(n));
 * }
 *
 * const result = andThen(parseNumber('16'), sqrt); // ok(4)
 * const result2 = andThen(parseNumber('-4'), sqrt); // ok(-4) then err(...)
 * const result3 = andThen(parseNumber('abc'), sqrt); // err('Invalid number')
 * ```
 */
export function andThen<T, U>(
  result: Result<T>,
  fn: (value: T) => Result<U>
): Result<U> {
  if (!result.ok) {
    return result;
  }
  return fn(result.value);
}

/**
 * Validation result that can contain multiple errors.
 * Useful for validating complex objects where multiple fields may be invalid.
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

/**
 * Creates a successful ValidationResult.
 *
 * @returns A valid ValidationResult
 */
export function valid(): ValidationResult {
  return { valid: true };
}

/**
 * Creates a failed ValidationResult with error messages.
 *
 * @param errors - Array of error messages
 * @returns An invalid ValidationResult
 */
export function invalid(...errors: string[]): ValidationResult {
  return { valid: false, errors };
}

/**
 * Combines multiple ValidationResults into one.
 * If any result is invalid, returns an invalid result with all errors combined.
 *
 * @param results - Array of ValidationResults to combine
 * @returns A combined ValidationResult
 *
 * @example
 * ```typescript
 * const results = combineValidations([
 *   valid(),
 *   invalid('Name is required'),
 *   invalid('Email is invalid')
 * ]);
 * // results = { valid: false, errors: ['Name is required', 'Email is invalid'] }
 * ```
 */
export function combineValidations(
  results: ValidationResult[]
): ValidationResult {
  const allErrors: string[] = [];

  for (const result of results) {
    if (!result.valid) {
      allErrors.push(...result.errors);
    }
  }

  return allErrors.length > 0 ? invalid(...allErrors) : valid();
}

/**
 * Error severity levels for categorizing different types of errors.
 */
export enum ErrorSeverity {
  /** Informational message, operation can continue */
  Info = 'info',
  /** Warning message, operation continues but user should be aware */
  Warning = 'warning',
  /** Error that prevents operation but doesn't crash the application */
  Error = 'error',
  /** Critical error that may require application restart */
  Critical = 'critical',
}

/**
 * Structured error with additional context.
 */
export interface AppError {
  /** Error message */
  message: string;
  /** Severity level */
  severity: ErrorSeverity;
  /** Optional error code for categorization */
  code?: string;
  /** Optional context data */
  context?: Record<string, unknown>;
  /** Original error if this wraps another error */
  cause?: Error;
}

/**
 * Creates an AppError instance.
 *
 * @param message - Error message
 * @param severity - Error severity level
 * @param options - Additional error options
 * @returns An AppError object
 */
export function createError(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.Error,
  options?: {
    code?: string;
    context?: Record<string, unknown>;
    cause?: Error;
  }
): AppError {
  return {
    message,
    severity,
    code: options?.code,
    context: options?.context,
    cause: options?.cause,
  };
}

/**
 * Logs an error to the console with appropriate formatting based on severity.
 *
 * @param error - The error to log
 */
export function logError(error: AppError): void {
  const prefix = `[${error.severity.toUpperCase()}]`;
  const message = error.code
    ? `${prefix} ${error.code}: ${error.message}`
    : `${prefix} ${error.message}`;

  switch (error.severity) {
    case ErrorSeverity.Info:
      console.info(message, error.context);
      break;
    case ErrorSeverity.Warning:
      console.warn(message, error.context);
      break;
    case ErrorSeverity.Error:
      console.error(message, error.context);
      if (error.cause) {
        console.error('Caused by:', error.cause);
      }
      break;
    case ErrorSeverity.Critical:
      console.error('🚨', message, error.context);
      if (error.cause) {
        console.error('Caused by:', error.cause);
      }
      break;
  }
}
