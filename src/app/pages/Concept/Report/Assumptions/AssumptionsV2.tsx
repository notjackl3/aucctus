import React from 'react';
import AssumptionsTable from './AssumptionsTable';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import { useConceptExecutiveSummaries } from '@hooks/query/concepts.hook';
import ExecutiveSummaryBanner from '@components/ConceptOverview/ExecutiveSummaryBanner';
import { AssumptionCategory } from '@libs/api/types';

const AssumptionsV2: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const [selectedCategory, setSelectedCategory] =
    React.useState<AssumptionCategory>('desirability');

  const filters = React.useMemo(
    () => ({
      category: selectedCategory,
      page: 1,
      page_size: 20,
    }),
    [selectedCategory],
  );

  const { isLoading, assumptions, categoryMetrics } = useFilteredAssumptions(
    concept.identifier,
    filters,
  );
  const { executiveSummaries, isLoading: isExecutiveSummariesLoading } =
    useConceptExecutiveSummaries(concept.uuid || '');

  const handleCategoryChange = (category: AssumptionCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className='space-y-6'>
      <ExecutiveSummaryBanner
        summary={executiveSummaries?.keyAssumptions}
        isLoading={isExecutiveSummariesLoading}
      />
      <AssumptionsTable
        assumptions={assumptions}
        categoryMetrics={categoryMetrics}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AssumptionsV2;
