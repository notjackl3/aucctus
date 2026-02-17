import React from 'react';
import AssumptionsTable from './AssumptionsTable';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import { useConceptExecutiveSummaries } from '@hooks/query/concepts.hook';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import { AssumptionCategory, IAssumptionV2 } from '@libs/api/types';
import { AssumptionsTableSkeleton } from '@components/Skeleton/ConceptReport';

const AssumptionsV2: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const [selectedCategory, setSelectedCategory] =
    React.useState<AssumptionCategory>('desirability');

  // Fetch ALL assumptions without category filter
  const filters = React.useMemo(
    () => ({
      page: 1,
      page_size: 199, // Get all assumptions
    }),
    [],
  );

  const {
    isLoading,
    assumptions: allAssumptions,
    categoryMetrics,
  } = useFilteredAssumptions(concept.identifier, filters);
  const { executiveSummaries, isLoading: isExecutiveSummariesLoading } =
    useConceptExecutiveSummaries(concept.uuid || '');

  // Filter assumptions client-side based on selected category
  const filteredAssumptions = React.useMemo<IAssumptionV2[]>(() => {
    if (!allAssumptions) return [];
    return allAssumptions.filter(
      (assumption) => assumption.category === selectedCategory,
    );
  }, [allAssumptions, selectedCategory]);

  const handleCategoryChange = (category: AssumptionCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div data-section-id='assumptions' className='space-y-6'>
      <ExecutiveSummaryBanner
        summary={executiveSummaries?.keyAssumptions}
        isLoading={isExecutiveSummariesLoading}
      />
      {isLoading ? (
        <AssumptionsTableSkeleton />
      ) : (
        <AssumptionsTable
          assumptions={filteredAssumptions}
          allAssumptions={allAssumptions}
          categoryMetrics={categoryMetrics}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}
    </div>
  );
};

export default AssumptionsV2;
