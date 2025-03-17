import { useCallback, useEffect } from 'react';

type IncubationAnimationEvent = 'question-transition' | 'fade';

export const useListenForIncubationAnimation = (
  handleQuestionTransition: (callback: () => void) => void,
  handleFade: (callback: () => void) => void,
) => {
  useEffect(() => {
    const handleAucctusEvent = (event: CustomEvent) => {
      if (event.detail.type === 'question-transition') {
        handleQuestionTransition(event.detail.callback);
      } else if (event.detail.type === 'fade') {
        handleFade(event.detail.callback);
      }
    };

    window.addEventListener(
      'aucctus-question-transition',
      handleAucctusEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        'aucctus-question-transition',
        handleAucctusEvent as EventListener,
      );
    };
  }, [handleQuestionTransition, handleFade]);
};

export const useDispatchIncubationAnimation = () => {
  const dispatchAnimationEvent = useCallback(
    (type: IncubationAnimationEvent, callback: () => void) => {
      const event = new CustomEvent('aucctus-question-transition', {
        detail: {
          type,
          callback,
        },
      });
      window.dispatchEvent(event);
    },
    [],
  );

  return { dispatchAnimationEvent };
};
