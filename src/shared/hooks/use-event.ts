import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * useEvent - Creates a stable callback that always calls the latest version
 *
 * This is based on the RFC for useEvent from the React team.
 * It provides a stable function reference that won't change between renders,
 * but always calls the most recent version of the callback.
 *
 * Use this when:
 * - You need a stable callback reference for external systems (event listeners, etc.)
 * - You want to avoid adding the callback to dependency arrays
 * - The callback needs to access current props/state
 *
 * @example
 * ```tsx
 * const handleClick = useEvent((e) => {
 *   console.log(currentCount); // Always accesses latest count
 * });
 *
 * useEffect(() => {
 *   element.addEventListener('click', handleClick);
 *   return () => element.removeEventListener('click', handleClick);
 * }, []); // handleClick is stable, so dependency array can be empty
 * ```
 */
export function useEvent<Args extends unknown[], Return>(
  callback: (...args: Args) => Return
): (...args: Args) => Return {
  const callbackRef = useRef<(...args: Args) => Return>(callback);

  // Update the ref to the latest callback after each render
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // Return a stable function that calls the latest callback
  return useCallback((...args: Args) => callbackRef.current(...args), []);
}
