import { createContext, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { IConcept } from '@libs/api/types';

export interface IConceptReportContext {
  navigateToTab: (tab: string) => void;
  concept: IConcept;
  isReadOnly?: boolean;
}

/**
 * Shared context for concept report data. Used by both:
 * - ConceptReport (authenticated, via React Router Outlet)
 * - SharedReportProvider (public shared reports)
 */
export const ConceptReportContext = createContext<IConceptReportContext | null>(
  null,
);

/**
 * Hook to access concept report context.
 * Checks the shared ConceptReportContext first, then falls back to
 * React Router's useOutletContext for backward compatibility.
 */
export function useConceptReportContext(): IConceptReportContext {
  const customContext = useContext(ConceptReportContext);
  // Always call useOutletContext to satisfy the rules of hooks (unconditional call order).
  // When customContext is set (shared reports), the outlet value is unused.
  const outletContext = useOutletContext<IConceptReportContext>();
  return customContext ?? outletContext;
}
