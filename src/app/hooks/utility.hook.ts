import { useEffect, useRef, useState } from 'react';
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

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

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
