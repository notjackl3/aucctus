import React from 'react';
import { animated } from 'react-spring';
import AssumptionDetailCard from './components/cards/AssumptionDetailCard';
import BatchEditableAssumptionCard from './components/cards/BatchEditableAssumptionCard';
import BatchChangesIndicator from './components/BatchChangesIndicator';
import CategoryProgressCard from './components/cards/category-progress-card/CategoryProgressCard';
import telemetry from '@libs/telemetry';
import { Icon } from '@components';
import { AssumptionCardsListSkeleton } from '@components/Skeleton/ConceptReport';
import { IAssumptionV2, AssumptionCategory } from '@libs/api/types';
import { CategoryMetric } from '@hooks/query/assumptions.hook';
import {
  CATEGORY_CONFIG,
  getValidationStatusFromMetrics,
  getValidationPercentageFromMetrics,
} from './utils/assumptionUtils';
import { useExpandCollapseTransition } from '@hooks/animation/animation.hook';
import { useBatchAssumptionTable } from '@hooks/concepts/useBatchAssumptionTable';

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
  const {
    // State
    selectedCategory,
    isAdding,
    editingAssumptionId,
    isSubmitting,

    // Batch changes state
    hasUnsavedChanges,
    unsavedChangesCount,
    changesArray,
    getChange,
    hasChangeForAssumption,
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
    selectedCategory: propSelectedCategory,
    onCategoryChange,
    isLoading,
  });

  // Animation for add form
  const addFormTransition = useExpandCollapseTransition({
    isExpanded: isAdding,
    withOpacity: true,
    collapsedHeight: 0,
    maxHeight: 300,
  });

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
    <div className='aucctus-border-primary overflow-hidden rounded-lg border shadow-sm'>
      {/* Batch changes indicator */}
      {hasUnsavedChanges() && (
        <div className='p-4'>
          <BatchChangesIndicator
            changesCount={unsavedChangesCount()}
            changes={changesArray()}
            onSaveAll={handleSaveAllChanges}
            onDiscardAll={handleDiscardAllChanges}
            isLoading={isSubmitting}
          />
        </div>
      )}

      <div className='flex flex-col md:flex-row'>
        {/* Left column: Category cards - takes ~30% of space */}
        <div className='aucctus-bg-primary aucctus-border-primary border-r p-6 md:w-[30%]'>
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
          {isLoading ? (
            <AssumptionCardsListSkeleton />
          ) : (
            <>
              {assumptions.length > 0 || getNewAssumptions().length > 0 ? (
                <>
                  <div className='space-y-4'>
                    {/* Render existing assumptions */}
                    {assumptions.map((assumption) => {
                      const isEditingThis =
                        editingAssumptionId === assumption.uuid;
                      const hasChange = hasChangeForAssumption(assumption.uuid);
                      const isDeleted = isMarkedForDeletion(assumption.uuid);
                      const effectiveData =
                        getEffectiveAssumptionData(assumption);

                      // Determine outline style based on change type
                      let outlineClass = '';
                      let statusText = '';

                      if (isDeleted) {
                        outlineClass = 'rounded-lg ring-2 ring-red-400';
                        statusText = '• Marked for deletion';
                      } else if (hasChange) {
                        outlineClass = 'rounded-lg ring-2 ring-yellow-300';
                        statusText = '• Unsaved changes';
                      }

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
                          <div className={outlineClass}>
                            <AssumptionDetailCard
                              assumption={effectiveData}
                              showActions={
                                !isAdding &&
                                !editingAssumptionId &&
                                !isSubmitting &&
                                !isDeleted
                              }
                              onDelete={() =>
                                handleDeleteAssumption(
                                  assumption.uuid,
                                  assumption,
                                )
                              }
                            />
                          </div>
                          {(hasChange || isDeleted) && (
                            <div
                              className={`aucctus-text-xs mt-1 text-center ${
                                isDeleted
                                  ? 'aucctus-text-error-primary'
                                  : 'aucctus-text-warning-primary'
                              }`}
                            >
                              {statusText}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Render new assumptions from batch */}
                    {getNewAssumptions().map((newAssumption) => {
                      if (!newAssumption.changes) return null;

                      const isEditingThis =
                        editingAssumptionId === newAssumption.id;
                      const hasAdditionalChanges =
                        hasChangeForAssumption(newAssumption.id) &&
                        getChange(newAssumption.id)?.type === 'edit';

                      // Create a base assumption object for the new assumption
                      const baseAssumption = {
                        uuid: newAssumption.id,
                        statement: newAssumption.changes.statement,
                        category: newAssumption.changes.category,
                        importance: newAssumption.changes.importance,
                        certainty: newAssumption.changes.certainty,
                        status: 'untested',
                        validationStatus: 'untested',
                        risk: 0,
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
                          <div className='rounded-lg ring-2 ring-yellow-300'>
                            <AssumptionDetailCard
                              assumption={effectiveData}
                              showActions={
                                !isAdding &&
                                !editingAssumptionId &&
                                !isSubmitting
                              }
                              onDelete={() => removeChange(newAssumption.id)}
                            />
                          </div>
                          <div className='aucctus-text-xs aucctus-text-warning-primary mt-1 text-center'>
                            • New assumption (unsaved)
                            {hasAdditionalChanges && ' • Modified'}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Assumption Button - Dashed Border at Bottom */}
                  {!isLoading && !isAdding && (
                    <div className='mt-4'>
                      <button
                        type='button'
                        onClick={handleStartAdding}
                        className='aucctus-border-secondary aucctus-text-brand-tertiary hover:aucctus-bg-secondary-hover aucctus-text-sm-medium flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                        disabled={
                          editingAssumptionId !== null ||
                          isSubmitting ||
                          hasUnsavedChanges()
                        }
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
                  {!isLoading && !isAdding && (
                    <div className='mt-4'>
                      <button
                        type='button'
                        onClick={handleStartAdding}
                        className='aucctus-border-secondary aucctus-text-brand-tertiary hover:aucctus-bg-secondary-hover aucctus-text-sm-medium flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 transition-colors disabled:cursor-not-allowed disabled:opacity-60'
                        disabled={
                          editingAssumptionId !== null ||
                          isSubmitting ||
                          hasUnsavedChanges()
                        }
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
              {!isLoading &&
                addFormTransition(
                  (style, item) =>
                    item && (
                      <animated.div style={style} className='mt-4'>
                        <BatchEditableAssumptionCard
                          mode='add'
                          category={selectedCategory}
                          onSave={handleSaveNewAssumption}
                          onCancel={handleCancelAdding}
                          isLoading={isSubmitting}
                          tempId={`temp_${Date.now()}`}
                        />
                      </animated.div>
                    ),
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssumptionsTable;
