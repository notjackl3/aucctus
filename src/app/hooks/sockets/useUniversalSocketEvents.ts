import React from 'react';
import {
  useConceptWorkflowHandler,
  useSyntheticTestingHandler,
  useNucleusHandler,
  useMagicShareHandler,
  useTestGenerationHandler,
  useIdeaPlaygroundHandler,
  useIdeaSubmissionsHandler,
  createPreventDuplicate,
} from './handlers';

// Re-export public API from handlers
export {
  dismissConceptWorkflowToastForConcept,
  restoreConceptWorkflowToast,
} from './handlers';

/**
 * Universal hook for managing WebSocket events across the application.
 * Delegates to domain-specific handler hooks for each event category.
 */
export const useUniversalSocketEvents = () => {
  // Shared dedup helper — stable across renders (created once via ref)
  const preventDuplicateRef = React.useRef(createPreventDuplicate());
  const preventDuplicate = preventDuplicateRef.current;

  // Domain-specific handlers
  useConceptWorkflowHandler(preventDuplicate);
  useSyntheticTestingHandler(preventDuplicate);
  useNucleusHandler(preventDuplicate);
  useMagicShareHandler(preventDuplicate);
  useTestGenerationHandler(preventDuplicate);
  useIdeaPlaygroundHandler();
  useIdeaSubmissionsHandler(preventDuplicate);
};
