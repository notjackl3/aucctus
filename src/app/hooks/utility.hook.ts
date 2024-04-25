import { useRef, useState, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

/**
 * Returns the previous value of the given state.
 * @param state The current state value.
 * @returns The previous value of the state.
 */
export function usePrevious<T>(state: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = state;
  }, [state]);
  return ref.current;
}

/**
 * Custom hook that measures the dimensions of a DOM element.
 * @template T - The type of the DOM element.
 * @returns An array containing a ref object and the bounds of the element.
 */
export const useMeasure = <T extends Element>() => {
  const ref = useRef<T>();
  const [bounds, set] = useState({ left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 });
  const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)));

  useEffect(() => {
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ro]);
  return [{ ref }, bounds];
};
