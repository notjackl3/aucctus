import React from 'react';
import AssumptionDetailCard from './components/cards/AssumptionDetailCard';
import BatchEditableAssumptionCard from './components/cards/BatchEditableAssumptionCard';
import RegenerateTestsBanner from './components/RegenerateTestsBanner';
import CategoryProgressCard from './components/cards/category-progress-card/CategoryProgressCard';
import { CategoryStatusCounts } from './components/cards/category-progress-card/types';
import telemetry from '@libs/telemetry';
import { Icon } from '@components';
import { IAssumptionV2, AssumptionCategory } from '@libs/api/types';
import { CategoryMetric } from '@hooks/query/assumptions.hook';
import {
  CATEGORY_CONFIG,
  getValidationStatusFromMetrics,
  getValidationPercentageFromMetrics,
} from './utils/assumptionUtils';
import { ExpandCollapse } from '@hooks/animation/animation.hook';
import { useBatchAssumptionTable } from '@hooks/concepts/useBatchAssumptionTable';

const DEFAULT_STATUS_COUNTS: CategoryStatusCounts = {
  validated: 0,
  partiallyValidated: 0,
  invalidated: 0,
  untested: 0,
};

const buildInitialCategoryCounts = () =>
  CATEGORY_CONFIG.reduce<Record<AssumptionCategory, CategoryStatusCounts>>(
    (acc, config) => {
      acc[config.category] = { ...DEFAULT_STATUS_COUNTS };
      return acc;
    },
    {} as Record<AssumptionCategory, CategoryStatusCounts>,
  );

const calculateCategoryCounts = (
  assumptionList: IAssumptionV2[],
  category: AssumptionCategory,
): CategoryStatusCounts => {
  return assumptionList.reduce<CategoryStatusCounts>(
    (counts, assumption) => {
      if (assumption.category !== category) {
        return counts;
      }

      if (assumption.validationStatus === 'validated') {
        counts.validated += 1;
      } else if (assumption.validationStatus === 'partially_validated') {
        counts.partiallyValidated += 1;
      } else if (assumption.validationStatus === 'invalidated') {
        counts.invalidated += 1;
      } else if (assumption.validationStatus === 'untested') {
        counts.untested += 1;
      }

      return counts;
    },
    { ...DEFAULT_STATUS_COUNTS },
  );
};

interface AssumptionsTableProps {
  assumptions: IAssumptionV2[];
  allAssumptions: IAssumptionV2[];
  categoryMetrics?: Record<AssumptionCategory, CategoryMetric>;
  selectedCategory?: AssumptionCategory;
  onCategoryChange?: (category: AssumptionCategory) => void;
}

const AssumptionsTable: React.FC<AssumptionsTableProps> = ({
  assumptions,
  allAssumptions,
  categoryMetrics,
  selectedCategory: propSelectedCategory,
  onCategoryChange,
}) => {
  const {
    // State
    selectedCategory,
    isAdding,
    editingAssumptionId,
    isSubmitting,

    // Batch changes state
    hasUnsavedChanges,
    getChange,
    getEffectiveAssumptionData,
    isMarkedForDeletion,
    getNewAssumptions,

    // Handlers
    handleCategorySelect,
    handleStartAdding,
    handleCancelAdding,
    handleSaveNewAssumption,
    // handleStartEditing,
    handleCancelEditing,
    handleSaveEditedAssumption,
    handleDeleteAssumption,
    handleEditNewAssumption,
    handleSaveAllChanges,
    handleDiscardAllChanges,
    removeChange,
  } = useBatchAssumptionTable({
    assumptions,
    allAssumptions,
    selectedCategory: propSelectedCategory,
    onCategoryChange,
  });

  const [categoryStatusCounts, setCategoryStatusCounts] = React.useState<
    Record<AssumptionCategory, CategoryStatusCounts>
  >(buildInitialCategoryCounts);

  const leftColumnRef = React.useRef<HTMLDivElement>(null);
  const [leftColumnHeight, setLeftColumnHeight] = React.useState<number | null>(
    null,
  );

  // Calculate status counts for all categories using allAssumptions
  React.useEffect(() => {
    const newCounts = buildInitialCategoryCounts();
    CATEGORY_CONFIG.forEach((config) => {
      newCounts[config.category] = calculateCategoryCounts(
        allAssumptions,
        config.category,
      );
    });
    setCategoryStatusCounts(newCounts);
  }, [allAssumptions]);

  // Measure left column height and update right column max-height
  React.useEffect(() => {
    const updateHeight = () => {
      if (leftColumnRef.current) {
        setLeftColumnHeight(leftColumnRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [categoryStatusCounts]);

  const newAssumptionsForSelectedCategory = getNewAssumptions().filter(
    (change) => change.changes?.category === selectedCategory,
  );

  // Get validation status from categoryMetrics
  const getValidationStatus = (category: AssumptionCategory) => {
    return getValidationStatusFromMetrics(category, categoryMetrics);
  };

  // Calculate validation percentages from categoryMetrics (for legacy AI insights)
  const getValidationPercentage = (category: AssumptionCategory): number => {
    return getValidationPercentageFromMetrics(category, categoryMetrics);
  };

  telemetry.log('progress', {
    desirabilityProgress: getValidationPercentage('desirability'),
    viabilityProgress: getValidationPercentage('viability'),
    feasibilityProgress: getValidationPercentage('feasibility'),
    adaptabilityProgress: getValidationPercentage('adaptability'),
  });

  return (
    <div className='aucctus-border-primary rounded-lg border shadow-sm'>
      {/* Regenerate tests banner */}
      {hasUnsavedChanges() && (
        <RegenerateTestsBanner
          onRegenerate={handleSaveAllChanges}
          onDismiss={handleDiscardAllChanges}
          isLoading={isSubmitting}
        />
      )}

      <div className='flex flex-col md:flex-row md:items-start'>
        {/* Left column: Category cards - takes ~30% of space, fixed height */}
        <div
          ref={leftColumnRef}
          className='aucctus-bg-primary aucctus-border-primary flex-shrink-0 border-r md:w-[26%]'
        >
          {CATEGORY_CONFIG.map((categoryConfig, index) => (
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
              statusCounts={
                categoryStatusCounts[categoryConfig.category] ||
                DEFAULT_STATUS_COUNTS
              }
              isLast={index === CATEGORY_CONFIG.length - 1}
            />
          ))}
        </div>

        <div
          className='min-h-0 flex-1 overflow-y-auto p-6'
          style={{
            maxHeight: leftColumnHeight ? `${leftColumnHeight}px` : 'none',
          }}
        >
          {assumptions.length > 0 ||
          newAssumptionsForSelectedCategory.length > 0 ? (
            <>
              <div className='space-y-4'>
                {/* Render existing assumptions - filter out deleted ones */}
                {assumptions
                  .filter((assumption) => !isMarkedForDeletion(assumption.uuid))
                  .map((assumption) => {
                    const isEditingThis =
                      editingAssumptionId === assumption.uuid;
                    const effectiveData =
                      getEffectiveAssumptionData(assumption);

                    if (isEditingThis) {
                      return (
                        <BatchEditableAssumptionCard
                          key={assumption.uuid}
                          mode='edit'
                          category={assumption.category}
                          assumption={assumption}
                          existingChange={
                            getChange(assumption.uuid) || undefined
                          }
                          onSave={handleSaveEditedAssumption}
                          onCancel={handleCancelEditing}
                          isLoading={isSubmitting}
                        />
                      );
                    }

                    return (
                      <div key={assumption.uuid}>
                        <AssumptionDetailCard
                          assumption={effectiveData}
                          showActions={
                            !isAdding && !editingAssumptionId && !isSubmitting
                          }
                          onDelete={() =>
                            handleDeleteAssumption(assumption.uuid, assumption)
                          }
                        />
                      </div>
                    );
                  })}

                {/* Render new assumptions from batch */}
                {newAssumptionsForSelectedCategory.map((newAssumption) => {
                  if (!newAssumption.changes) return null;

                  const isEditingThis =
                    editingAssumptionId === newAssumption.id;

                  // Create a base assumption object for the new assumption
                  const baseAssumption = {
                    uuid: newAssumption.id,
                    statement: newAssumption.changes.statement,
                    category: newAssumption.changes.category,
                    importance: newAssumption.changes.importance,
                    certainty: newAssumption.changes.certainty,
                    status: 'untested',
                    validationStatus: 'untested',
                    risk: newAssumption.changes.risk ?? 0,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  } as IAssumptionV2;

                  // Get effective data (this will apply any additional changes)
                  const effectiveData =
                    getEffectiveAssumptionData(baseAssumption);

                  if (isEditingThis) {
                    return (
                      <BatchEditableAssumptionCard
                        key={newAssumption.id}
                        mode='edit'
                        category={newAssumption.changes.category}
                        assumption={effectiveData}
                        existingChange={
                          getChange(newAssumption.id) || undefined
                        }
                        onSave={(change) =>
                          handleEditNewAssumption(newAssumption.id, change)
                        }
                        onCancel={handleCancelEditing}
                        isLoading={isSubmitting}
                      />
                    );
                  }

                  return (
                    <div key={newAssumption.id}>
                      <AssumptionDetailCard
                        assumption={effectiveData}
                        showActions={
                          !isAdding && !editingAssumptionId && !isSubmitting
                        }
                        onDelete={() => removeChange(newAssumption.id)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Add New Assumption Button - Dashed Border at Bottom */}
              {!isAdding && (
                <div className='mt-4'>
                  <button
                    type='button'
                    onClick={handleStartAdding}
                    className='aucctus-border-secondary aucctus-text-brand-tertiary hover:aucctus-bg-secondary-hover aucctus-text-sm-medium flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                    disabled={editingAssumptionId !== null || isSubmitting}
                  >
                    <Icon
                      variant='plus'
                      className='h-4 w-4'
                      style={{ stroke: 'currentColor' }}
                    />
                    Add new assumption
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <p className='aucctus-text-tertiary p-4'>
                No assumptions in this category yet.
              </p>

              {/* Add New Assumption Button - Dashed Border at Bottom (empty state) */}
              {!isAdding && (
                <div className='mt-4'>
                  <button
                    type='button'
                    onClick={handleStartAdding}
                    className='aucctus-border-secondary aucctus-text-brand-tertiary hover:aucctus-bg-secondary-hover aucctus-text-sm-medium flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                    disabled={editingAssumptionId !== null || isSubmitting}
                  >
                    <Icon
                      variant='plus'
                      className='h-4 w-4'
                      style={{ stroke: 'currentColor' }}
                    />
                    Add new assumption
                  </button>
                </div>
              )}
            </>
          )}

          {/* Add New Assumption Form - appears at bottom */}
          <ExpandCollapse
            isExpanded={isAdding}
            withOpacity
            collapsedHeight={0}
            maxHeight={300}
            expandedOverflow='visible'
            className='mt-4'
          >
            <BatchEditableAssumptionCard
              mode='add'
              category={selectedCategory}
              onSave={handleSaveNewAssumption}
              onCancel={handleCancelAdding}
              isLoading={isSubmitting}
              tempId={`temp_${Date.now()}`}
            />
          </ExpandCollapse>
        </div>
      </div>
    </div>
  );
};

export default AssumptionsTable;
