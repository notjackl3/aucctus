import { OverseerPopup, OverseerSelectionButton } from '@components/Overseer';
import SectionHighlightOverlay from '@components/Overseer/sectionHighlight/SectionHighlightOverlay';
import { useTextSelection } from '@hooks/useTextSelection';
import useStore from '@stores/store';
import React, { createContext, useContext, useMemo } from 'react';

interface OverseerContextValue {
  /** Function to temporarily ignore the next text selection */
  ignoreNextSelection: () => void;
  /** Whether the Overseer panel is docked */
  isDocked: boolean;
}

const OverseerContext = createContext<OverseerContextValue | null>(null);

interface OverseerProviderProps {
  children: React.ReactNode;
  /** The current page context (e.g., 'overview', 'customer_profiles') */
  pageContext: string;
  /** Whether Overseer is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Provider component that enables Overseer functionality within its children.
 */
export const OverseerProvider: React.FC<OverseerProviderProps> = ({
  children,
  pageContext,
  enabled = true,
}) => {
  const isDocked = useStore((state) => state.overseer.isDocked);
  const isOpen = useStore((state) => state.overseer.isOpen);

  // Set up text selection hook
  const { ignoreNextSelection } = useTextSelection({
    enabled,
    pageContext,
    minLength: 3,
  });

  // Memoize context value
  const contextValue = useMemo(
    () => ({
      ignoreNextSelection,
      isDocked: isOpen && isDocked,
    }),
    [ignoreNextSelection, isDocked, isOpen],
  );

  return (
    <OverseerContext.Provider value={contextValue}>
      {children}
      {enabled && (
        <>
          <OverseerSelectionButton />
          <OverseerPopup />
          <SectionHighlightOverlay />
        </>
      )}
    </OverseerContext.Provider>
  );
};

/**
 * Hook to access Overseer context
 */
export const useOverseer = (): OverseerContextValue => {
  const context = useContext(OverseerContext);
  if (!context) {
    throw new Error('useOverseer must be used within an OverseerProvider');
  }
  return context;
};

export default OverseerProvider;
