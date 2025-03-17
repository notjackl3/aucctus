import { ConceptIncubationClarifyingQuestion } from '@libs/api/types/conceptSeedQuestionnaire';
import { useEffect } from 'react';

/**
 * Custom hook to manage the question icon line height
 */
export const useQuestionIconLine = (
  questionIconRef: React.RefObject<HTMLSpanElement>,
  questionIconLineRef: React.RefObject<HTMLDivElement>,
  spacerRef: React.RefObject<HTMLDivElement>,
  currentQuestionOrder: number,
  activeClarifyingQuestion: ConceptIncubationClarifyingQuestion | undefined,
) => {
  useEffect(() => {
    const questionIcon = questionIconRef.current;
    const iconLine = questionIconLineRef.current;
    const spacer = spacerRef.current;

    if (!questionIcon || !iconLine || !spacer) return;

    // Function to update the line height
    const updateLineHeight = () => {
      const iconRect = questionIcon?.getBoundingClientRect();
      const parentRect = iconLine.parentElement?.getBoundingClientRect();

      if (parentRect) {
        // Calculate the distance from the parent's top to the icon's top
        const distanceToIcon = iconRect.top - parentRect.top + 25;
        // Set the height to reach exactly the top of the icon
        iconLine.style.height = `${distanceToIcon}px`;
      }
    };

    // Initial height adjustment
    updateLineHeight();

    // Create a ResizeObserver to detect size changes
    const resizeObserver = new ResizeObserver(updateLineHeight);
    resizeObserver.observe(spacer);

    // Also observe the parent to detect layout changes
    if (iconLine.parentElement) {
      resizeObserver.observe(iconLine.parentElement);
    }

    // Create a MutationObserver to watch for DOM changes
    const mutationObserver = new MutationObserver(updateLineHeight);

    mutationObserver.observe(questionIcon, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    // Also listen for resize events to handle window size changes
    window.addEventListener('resize', updateLineHeight);

    // Cleanup function
    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateLineHeight);
    };
  }, [
    questionIconRef,
    questionIconLineRef,
    spacerRef,
    currentQuestionOrder,
    activeClarifyingQuestion,
  ]);
};
