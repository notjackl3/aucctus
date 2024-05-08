import { useRef, useState, useEffect, useCallback } from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { AucctusStorage, AucctusStorageEvent, StorageKeys } from '../../libs/localStorage';
import analytics from '../../libs/analytics';

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

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);
  return mousePosition;
};

declare global {
  interface WindowEventMap {
    aucctusStorage: AucctusStorageEvent;
  }
}

const createStorageHook =
  (type: 'local' | 'session') =>
  <T = unknown>(key: StorageKeys) => {
    // Using state to manage the storage value
    const [value, setValue] = useState(() => AucctusStorage.get<T>(key, { type }));

    // Handler to update both state and storage
    const handleSetValue = useCallback(
      (newValue: T | undefined) => {
        AucctusStorage.set(key, newValue, type);
        setValue(newValue);
      },
      [key],
    );

    // Effect for syncing state with storage changes
    useEffect(() => {
      const storageEventListener = (e: AucctusStorageEvent) => {
        const detail = e.detail;
        if (detail.key === key && detail.type === type) {
          const newValue = AucctusStorage.get<T>(key, { type });
          if (newValue !== value) {
            setValue(newValue);
          }
        }
      };

      window.addEventListener('aucctusStorage', storageEventListener);
      return () => window.removeEventListener('aucctusStorage', storageEventListener);
    }, [key, value]);

    return [value, handleSetValue] as [typeof value, typeof handleSetValue];
  };

export function useLocalStorage<T>(key: StorageKeys) {
  return createStorageHook('local')<T>(key);
}

export function useSessionStorage<T>(key: StorageKeys) {
  return createStorageHook('session')<T>(key);
}
