import { useCallback, useState } from 'react';

interface UsePaginationResult {
  currentIndex: number;
  total: number;
  direction: number;
  next: () => void;
  prev: () => void;
  canNext: boolean;
  canPrev: boolean;
}

export function usePagination(total: number): UsePaginationResult {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const canPrev = currentIndex > 0;
  const canNext = currentIndex < total - 1;

  const next = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  return { currentIndex, total, direction, next, prev, canNext, canPrev };
}
