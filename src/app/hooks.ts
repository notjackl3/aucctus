import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';
import { useLocation } from 'react-router-dom';
import React from 'react';
import { useRef, useState, useEffect } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useQueryParams() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

/**
 * Returns the Previous state
 * @param state
 * @returns
 */
export function usePrevious<T>(state: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = state;
  }, [state]);
  return ref.current;
}

/**
 *
 *
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
