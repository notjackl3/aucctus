import { OverseerPopup, OverseerSelectionButton } from '@components/Overseer';
import { useTextSelection } from '@hooks/useTextSelection';
import React, { createContext, useContext, useMemo } from 'react';

interface OverseerContextValue {
  /** Function to temporarily ignore the next text selection */
  ignoreNextSelection: () => void;
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
 *
 * This provider:
 * - Sets up text selection detection
 * - Renders the OverseerPopup portal
 * - Provides context for child components to interact with Overseer
 *
 * Usage:
 * ```tsx
 * <OverseerProvider pageContext="overview">
 *   <YourPageContent />
 * </OverseerProvider>
 * ```
 */
export const OverseerProvider: React.FC<OverseerProviderProps> = ({
  children,
  pageContext,
  enabled = true,
}) => {
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
    }),
    [ignoreNextSelection],
  );

  return (
    <OverseerContext.Provider value={contextValue}>
      {children}
      {enabled && (
        <>
          {/* Render the selection button - shown when text is selected */}
          <OverseerSelectionButton />
          {/* Render the popup - it will only show when isOpen is true */}
          <OverseerPopup />
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
