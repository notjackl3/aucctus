import React, { useState, useCallback } from 'react';
import AssumptionDetailCard from './components/cards/AssumptionDetailCard';
import Card from '@components/Card';
import CategoryProgressCard from './components/cards/category-progress-card/CategoryProgressCard';
import telemetry from '@libs/telemetry';
import { Loading, Icon, Modal } from '@components';
import { IAssumptionV2, AssumptionCategory } from '@libs/api/types';
import { CategoryMetric } from '@hooks/query/assumptions.hook';
import {
  CATEGORY_CONFIG,
  getValidationStatusFromMetrics,
  getValidationPercentageFromMetrics,
  getCategoryInsightByStatus,
  getCategoryInsightTitleByStatus,
} from './utils/assumptionUtils';
import { useAssumptionAdd } from '@hooks/query/concepts.hook';
import { useModal } from '@context/ModalContextProvider';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';

interface AssumptionsTableProps {
  assumptions: IAssumptionV2[];
  categoryMetrics?: Record<AssumptionCategory, CategoryMetric>;
  selectedCategory?: AssumptionCategory;
  onCategoryChange?: (category: AssumptionCategory) => void;
  isLoading?: boolean;
}

const AssumptionsTable: React.FC<AssumptionsTableProps> = ({
  assumptions,
  categoryMetrics,
  selectedCategory: propSelectedCategory,
  onCategoryChange,
  isLoading = false,
}) => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { openModal } = useModal();
  const { mutate: addAssumption } = useAssumptionAdd();

  // State to track which category is selected
  const [internalSelectedCategory, setInternalSelectedCategory] =
    useState<AssumptionCategory>('desirability');

  const selectedCategory = propSelectedCategory || internalSelectedCategory;

  // Handle category selection
  const handleCategorySelect = (category: AssumptionCategory) => {
    if (!propSelectedCategory) {
      setInternalSelectedCategory(category);
    }
    onCategoryChange?.(category);
  };

  // Handle adding new assumption
  const handleAddAssumption = useCallback(() => {
    openModal(
      Modal.AssumptionStatementModal,
      {
        mode: 'add',
        onSubmit: () => {
          // This won't be called when onConfirm is provided
        },
        onConfirm: async (statement: string) => {
          addAssumption({
            rootIdentifier: concept.identifier,
            data: { statement },
          });
        },
      },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
      },
    );
  }, [concept.identifier, openModal, addAssumption]);

  // Get validation status from categoryMetrics
  const getValidationStatus = (category: AssumptionCategory) => {
    return getValidationStatusFromMetrics(category, categoryMetrics);
  };

  // Calculate validation percentages from categoryMetrics (for legacy AI insights)
  const getValidationPercentage = (category: AssumptionCategory): number => {
    return getValidationPercentageFromMetrics(category, categoryMetrics);
  };

  // Get the insight for the selected category using validation status
  const categoryValidationStatus = getValidationStatus(selectedCategory);

  const categoryInsight = getCategoryInsightByStatus(
    selectedCategory,
    categoryValidationStatus,
  );

  const insightTitle = getCategoryInsightTitleByStatus(
    selectedCategory,
    categoryValidationStatus,
  );

  telemetry.log('progress', {
    desirabilityProgress: getValidationPercentage('desirability'),
    viabilityProgress: getValidationPercentage('viability'),
    feasibilityProgress: getValidationPercentage('feasibility'),
    adaptabilityProgress: getValidationPercentage('adaptability'),
  });

  return (
    <div className='aucctus-border-primary overflow-hidden rounded-lg border shadow-sm'>
      <div className='flex flex-col md:flex-row'>
        {/* Left column: Category cards - takes ~30% of space */}
        <div className='aucctus-bg-primary aucctus-border-primary border-r p-6 md:w-[30%]'>
          <h3 className='aucctus-header-md-bold aucctus-text-md mb-4'>
            Categories
          </h3>

          {CATEGORY_CONFIG.map((categoryConfig) => (
            <CategoryProgressCard
              key={categoryConfig.category}
              category={categoryConfig.category}
              title={categoryConfig.title}
              description={categoryConfig.description}
              validationStatus={getValidationStatus(categoryConfig.category)}
              validationPercentage={
                categoryMetrics?.[categoryConfig.category]?.validationPercentage
              }
              isSelected={selectedCategory === categoryConfig.category}
              onClick={() => handleCategorySelect(categoryConfig.category)}
            />
          ))}
        </div>

        <div className='flex-1 p-6'>
          <Card.AiInsightCard title={insightTitle} className='mb-6'>
            {categoryInsight}
          </Card.AiInsightCard>

          {isLoading ? (
            <div className='flex justify-center py-8'>
              <Loading />
            </div>
          ) : (
            <>
              {/* Add New Assumption Plus Button */}
              <div className='mb-4 flex justify-end'>
                <button
                  onClick={handleAddAssumption}
                  className='aucctus-bg-primary-hover aspect-square rounded-lg p-1'
                  aria-label='Add new assumption'
                  disabled={isLoading}
                >
                  <Icon
                    variant='plus'
                    className='aucctus-stroke-brand-primary h-5 w-5'
                  />
                </button>
              </div>

              {assumptions.length > 0 ? (
                <div className='space-y-4'>
                  {assumptions.map((assumption) => (
                    <AssumptionDetailCard
                      key={assumption.uuid}
                      assumption={assumption}
                    />
                  ))}
                </div>
              ) : (
                <p className='aucctus-text-tertiary p-4'>
                  No assumptions in this category yet.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssumptionsTable;
