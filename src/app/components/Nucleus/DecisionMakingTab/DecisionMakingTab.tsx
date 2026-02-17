/**
 * DecisionMakingTab - Concept Scoring Configuration wrapper
 *
 * Renders the ConceptScoringConfig component in expanded mode
 * as the Decision Making tab content within the Nucleus page.
 */

import React from 'react';
import { ConceptScoringConfig } from '../ConceptScoringConfig';

const DecisionMakingTab: React.FC = () => (
  <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
    <ConceptScoringConfig isExpanded={true} />
  </div>
);

export default DecisionMakingTab;
