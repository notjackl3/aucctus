import { useEffect, useRef, useState } from 'react';

interface UseFadeTransitionProps<T> {
  currentValue: T;
}

export function useFadeTransition<T>({
  currentValue,
}: UseFadeTransitionProps<T>) {
  const [stateValue, setStateValue] = useState<T>(currentValue);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) {
      return;
    }

    contentElement.classList.add('transition-all');
    contentElement.classList.add('duration-300');
    contentElement.classList.add('ease');
  }, []);

  useEffect(() => {
    if (stateValue === currentValue) {
      return;
    }

    const contentElement = contentRef.current;
    if (!contentElement) {
      setStateValue(currentValue);
      return;
    }

    contentElement.classList.remove('opacity-100');
    contentElement.classList.add('opacity-0');

    const handleTransitionEnd = () => {
      setStateValue(currentValue);
      contentElement.classList.remove('opacity-0');
      contentElement.classList.add('opacity-100');
    };

    contentElement.addEventListener('transitionend', handleTransitionEnd);
    return () =>
      contentElement.removeEventListener('transitionend', handleTransitionEnd);
  }, [currentValue, stateValue]);

  return {
    contentRef,
    stateValue,
  };
}
