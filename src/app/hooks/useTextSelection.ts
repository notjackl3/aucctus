import { useCallback, useEffect, useRef } from 'react';
import useStore from '@stores/store';

/**
 * Configuration for the text selection hook
 */
interface UseTextSelectionConfig {
  /** Whether the hook is enabled */
  enabled?: boolean;
  /** Minimum characters required for selection to trigger */
  minLength?: number;
  /** The current page context (e.g., 'overview', 'customer_profiles') */
  pageContext: string;
  /** Optional container ref to scope selection detection */
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * Expands a partial selection to the full sentence containing it.
 *
 * @param selectedText - The text that was selected
 * @param fullContent - The full content to search within
 * @returns The expanded sentence or the original selection if not found
 */
function expandToSentence(selectedText: string, fullContent: string): string {
  if (!selectedText || !fullContent) return selectedText;

  // Find the selected text in the full content
  const startIndex = fullContent.indexOf(selectedText);
  if (startIndex === -1) return selectedText;

  // Sentence-ending punctuation followed by space or end of string
  const sentenceEnders = /[.!?]/;

  // Find the start of the sentence
  let sentenceStart = startIndex;
  for (let i = startIndex - 1; i >= 0; i--) {
    const char = fullContent[i];
    if (sentenceEnders.test(char)) {
      // Found a sentence ender, start after it (skip whitespace)
      sentenceStart = i + 1;
      while (
        sentenceStart < startIndex &&
        /\s/.test(fullContent[sentenceStart])
      ) {
        sentenceStart++;
      }
      break;
    }
    if (i === 0) {
      sentenceStart = 0;
    }
  }

  // Find the end of the sentence
  const selectionEnd = startIndex + selectedText.length;
  let sentenceEnd = selectionEnd;
  for (let i = selectionEnd; i < fullContent.length; i++) {
    const char = fullContent[i];
    if (sentenceEnders.test(char)) {
      // Include the punctuation
      sentenceEnd = i + 1;
      break;
    }
    if (i === fullContent.length - 1) {
      sentenceEnd = fullContent.length;
    }
  }

  return fullContent.slice(sentenceStart, sentenceEnd).trim();
}

/**
 * Gets the text content of an element, preserving some structure
 */
function getElementTextContent(element: Element): string {
  // Get text content, which automatically handles nested elements
  return element.textContent || '';
}

/**
 * Calculates the position for the "Ask Overseer" button based on selection bounds
 * Positions above the selection by default, or below if not enough space
 */
function calculateButtonPosition(
  rect: DOMRect,
): { x: number; y: number } | null {
  if (!rect || rect.width === 0) return null;

  const padding = 8;
  const buttonWidth = 130;
  const buttonHeight = 32;

  // Center horizontally over the selection
  let x = rect.left + rect.width / 2 - buttonWidth / 2;

  // Try to position above the selection first
  let y = rect.top - buttonHeight - padding;

  // If not enough space above, position below
  if (y < padding) {
    y = rect.bottom + padding;
  }

  // Ensure button stays within viewport horizontally
  if (x < padding) {
    x = padding;
  } else if (x + buttonWidth > window.innerWidth - padding) {
    x = window.innerWidth - buttonWidth - padding;
  }

  // Ensure button stays within viewport vertically
  if (y + buttonHeight > window.innerHeight - padding) {
    y = window.innerHeight - buttonHeight - padding;
  }

  return { x, y };
}

/**
 * Calculates the position for the popup based on selection bounds.
 * CRITICAL: The popup must NEVER escape the viewport boundaries.
 */
function calculatePopupPosition(
  rect: DOMRect,
): { x: number; y: number } | null {
  if (!rect || rect.width === 0) return null;

  const padding = 16;
  const popupWidth = 420;
  const popupHeight = 500; // Match COMPACT_PANEL_HEIGHT from OverseerPopup

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Calculate maximum allowed positions
  const maxX = viewportWidth - popupWidth - padding;
  const maxY = viewportHeight - popupHeight - padding;

  // Start with position below the selection, centered
  let x = rect.left + rect.width / 2 - popupWidth / 2;
  let y = rect.bottom + padding;

  // HORIZONTAL: Clamp to viewport bounds
  x = Math.max(padding, Math.min(x, maxX));

  // VERTICAL: Try below first, then above, then clamp to viewport
  if (y + popupHeight > viewportHeight - padding) {
    // Not enough space below - try above the selection
    const yAbove = rect.top - popupHeight - padding;

    if (yAbove >= padding) {
      // Enough space above
      y = yAbove;
    } else {
      // Not enough space above or below - clamp to viewport
      // Position at the top or wherever fits best
      y = Math.max(padding, Math.min(y, maxY));
    }
  }

  // Final safety clamp - NEVER allow escape
  x = Math.max(padding, Math.min(x, maxX));
  y = Math.max(padding, Math.min(y, maxY));

  return { x, y };
}

/**
 * Hook for detecting text selection and showing the "Ask Overseer" button.
 *
 * This hook:
 * - Listens for mouseup events to detect text selection
 * - Auto-expands partial selections to full sentences
 * - Shows a button that the user can click to open Overseer
 * - Hides the button when clicking elsewhere
 *
 * @param config - Configuration options
 */
export function useTextSelection(config: UseTextSelectionConfig) {
  const { enabled = true, minLength = 3, pageContext, containerRef } = config;

  const showSelectionButton = useStore(
    (state) => state.overseer.showSelectionButton,
  );
  const hideSelectionButton = useStore(
    (state) => state.overseer.hideSelectionButton,
  );
  const showingSelectionButton = useStore(
    (state) => state.overseer.showingSelectionButton,
  );

  // Track if we should ignore the next selection (e.g., when clicking inside Overseer)
  const ignoreNextSelection = useRef(false);

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!enabled) return;

      // Always ignore selections made inside the Overseer popup or selection button
      const target = event.target as HTMLElement;
      if (
        target.closest('[data-overseer-root]') ||
        target.closest('[data-overseer-button]')
      ) {
        return;
      }

      // Ignore if flagged
      if (ignoreNextSelection.current) {
        ignoreNextSelection.current = false;
        return;
      }

      // Get the current selection
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // No selection - hide button if showing
        if (showingSelectionButton) {
          hideSelectionButton();
        }
        return;
      }

      const selectedText = selection.toString().trim();

      // Check minimum length
      if (selectedText.length < minLength) {
        if (showingSelectionButton) {
          hideSelectionButton();
        }
        return;
      }

      // Check if selection is within our container (if specified)
      if (containerRef?.current) {
        const range = selection.getRangeAt(0);
        const container = containerRef.current;
        if (!container.contains(range.commonAncestorContainer)) {
          return;
        }
      }

      // Get the selection range for positioning
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Calculate button and popup positions
      const buttonPosition = calculateButtonPosition(rect);
      const popupPosition = calculatePopupPosition(rect);
      if (!buttonPosition || !popupPosition) return;

      // Get the parent element to find full content for sentence expansion
      const parentElement =
        range.commonAncestorContainer.nodeType === Node.TEXT_NODE
          ? range.commonAncestorContainer.parentElement
          : (range.commonAncestorContainer as Element);

      // Try to find a reasonable parent for context (paragraph, div, etc.)
      let contextElement = parentElement;
      const blockElements = ['P', 'DIV', 'LI', 'TD', 'SECTION', 'ARTICLE'];
      while (
        contextElement &&
        !blockElements.includes(contextElement.tagName)
      ) {
        contextElement = contextElement.parentElement;
      }

      const fullContent = contextElement
        ? getElementTextContent(contextElement)
        : selectedText;

      // Expand selection to full sentence
      const expandedText = expandToSentence(selectedText, fullContent);

      // Show the selection button (don't clear selection yet)
      showSelectionButton({
        selectedText,
        expandedText,
        pageContext,
        buttonPosition,
        popupPosition,
      });
    },
    [
      enabled,
      minLength,
      pageContext,
      containerRef,
      showSelectionButton,
      hideSelectionButton,
      showingSelectionButton,
    ],
  );

  // Handle clicks outside to hide the button
  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (!showingSelectionButton) return;

      const target = event.target as HTMLElement;
      // Don't hide if clicking the button itself
      if (target.closest('[data-overseer-button]')) {
        return;
      }

      hideSelectionButton();
    },
    [showingSelectionButton, hideSelectionButton],
  );

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enabled, handleMouseUp, handleMouseDown]);

  // Return a function to temporarily ignore the next selection
  return {
    ignoreNextSelection: () => {
      ignoreNextSelection.current = true;
    },
  };
}

export default useTextSelection;
