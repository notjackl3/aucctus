import { useEffect, RefObject } from 'react';

interface UseResizeObserverOptions {
  padding?: number;
}

/**
 * Hook to observe an element's size and adjust its max height based on viewport
 * @param elementRef - Reference to the element to observe
 * @param options - Configuration options
 * @returns void
 */
export const useObserveResizeQuestion = (
  elementRef: RefObject<HTMLElement>,
  options: UseResizeObserverOptions = {},
): void => {
  const { padding = 50 } = options;

  useEffect(() => {
    const element = elementRef.current;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === element) {
          const viewportHeight = window.innerHeight;
          const elementRect = element.getBoundingClientRect();
          const maxHeight = viewportHeight - elementRect.top;

          element.style.maxHeight = `${maxHeight - padding}px`;
        }
      }
    });

    if (element) {
      resizeObserver.observe(element);
    }

    return () => {
      if (element) {
        resizeObserver.unobserve(element);
      }
    };
  }, [elementRef, padding]);
};
