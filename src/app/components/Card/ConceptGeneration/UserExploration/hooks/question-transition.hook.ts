import { useState, useRef, useEffect, useCallback } from 'react';

export const useQuestionTransition = () => {
  const [showMask, setShowMask] = useState(false);

  // Refs for DOM elements involved in the transition
  const questionIconRef = useRef<HTMLSpanElement>(null);
  const nextCompletionIconRef = useRef<HTMLSpanElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const questionLabelRef = useRef<HTMLSpanElement>(null);
  const answerRowRef = useRef<HTMLDivElement>(null);
  const multiSelectAnswersRef = useRef<HTMLDivElement>(null);

  // Handle animation when moving to next question
  const handleForwardAnimation = useCallback((callback: () => void) => {
    const questionIcon = questionIconRef.current;
    const nextCompletionIcon = nextCompletionIconRef.current;
    const questionLabel = questionLabelRef.current;
    const answerRow = answerRowRef.current;
    const multiSelectAnswers = multiSelectAnswersRef.current;

    if (!questionIcon || !nextCompletionIcon || !questionLabel || !answerRow)
      return;

    questionIcon.classList.remove('animate-fade-in');

    // Clone the question icon for animation
    const questionIconClone = questionIcon.cloneNode(true) as HTMLSpanElement;
    const questionIconRect = questionIcon.getBoundingClientRect();
    const nextCompletionIconRect = nextCompletionIcon.getBoundingClientRect();

    // Collapse answer rows
    Array.from(answerRow.children).forEach((child) => {
      if (child instanceof HTMLDivElement) {
        child.classList.remove('animate-incubation-answer-expand');
        child.classList.add('animate-incubation-answer-collapse');
      }
    });

    Array.from(multiSelectAnswers?.children ?? []).forEach((child) => {
      if (child instanceof HTMLDivElement) {
        child.classList.remove('animate-incubation-answer-expand');
        child.classList.add('animate-incubation-answer-collapse');
      }
    });

    // Set up the cloned element for animation
    questionIconClone.classList.add(
      'aucctus-cloned-element',
      'absolute',
      'z-[999]',
      'transition-all',
      'duration-300',
      'ease-in-out',
    );
    questionIconClone.style.left = `${questionIconRect.left - 4}px`;
    questionIconClone.style.top = `${questionIconRect.top}px`;

    const handleTransitionEnd = () => {
      questionIconClone.removeEventListener(
        'transitionend',
        handleTransitionEnd,
      );
      questionLabel.classList.remove('opacity-0');
      questionIcon.classList.add('animate-fade-in');
      questionIcon.classList.remove('opacity-0');
      callback();

      setTimeout(() => {
        if (document.body.contains(questionIconClone)) {
          document.body.removeChild(questionIconClone); // Guarantees that the question completed icon is present before removal
        }

        setShowMask(false);
      }, 0);
    };

    questionIconClone.addEventListener('transitionend', handleTransitionEnd);
    document.body.appendChild(questionIconClone);

    // Animate the cloned element
    requestAnimationFrame(() => {
      void questionIconClone.offsetWidth; // Force reflow

      questionIcon.classList.add('opacity-0');
      questionIconClone.style.top = `${nextCompletionIconRect.top}px`;
      questionIconClone.style.left = `${nextCompletionIconRect.left + 4}px`;

      const firstChild = questionIconClone.firstElementChild;
      if (firstChild) {
        firstChild.classList.add(
          'transition-all',
          'duration-[280ms]',
          'ease-in-out',
          'opacity-0',
        );
      }

      // Transform the cloned element
      questionIconClone.classList.replace('w-10', 'w-8');
      questionIconClone.classList.replace('h-10', 'h-8');
      questionIconClone.classList.replace('p-2', 'p-1');
      questionIconClone.classList.replace('rounded-lg', 'rounded-md');
      questionIconClone.classList.replace(
        'aucctus-bg-primary',
        'aucctus-bg-secondary',
      );
      questionLabel.classList.add('opacity-0');
    });
  }, []);

  // Handle animation when moving to previous question
  const handleBackwardAnimation = useCallback((callback: () => void) => {
    const parentComponent = componentRef.current;
    if (parentComponent) {
      const handleTransitionEnd = () => {
        parentComponent.classList.remove('opacity-0');
        parentComponent.removeEventListener(
          'transitionend',
          handleTransitionEnd,
        );
        callback();
        setShowMask(false);
      };

      parentComponent.addEventListener('transitionend', handleTransitionEnd);
      parentComponent.classList.add('opacity-0');
    }
  }, []);

  useEffect(() => {
    const handleQuestionTransition = (
      event: CustomEvent<{
        type: 'forward' | 'backward';
        callback: () => void;
      }>,
    ) => {
      setShowMask(true);
      const { type, callback } = event.detail;

      if (type === 'forward') {
        handleForwardAnimation(callback);
      } else {
        handleBackwardAnimation(callback);
      }
    };

    // Add event listener with type assertion
    window.addEventListener(
      'aucctus-question-transition',
      handleQuestionTransition as EventListener,
    );

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener(
        'aucctus-question-transition',
        handleQuestionTransition as EventListener,
      );
    };
  }, [handleForwardAnimation, handleBackwardAnimation]);

  return {
    showMask,
    setShowMask,
    questionIconRef,
    questionLabelRef,
    nextCompletionIconRef,
    answerRowRef,
    componentRef,
    multiSelectAnswersRef,
  };
};
