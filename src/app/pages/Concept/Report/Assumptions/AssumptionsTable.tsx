import React, { useState, useCallback } from 'react';
import { animated } from 'react-spring';
import AssumptionDetailCard from './components/cards/AssumptionDetailCard';
import EditableAssumptionCard from './components/cards/EditableAssumptionCard';
import Card from '@components/Card';
import CategoryProgressCard from './components/cards/category-progress-card/CategoryProgressCard';
import telemetry from '@libs/telemetry';
import { Loading, Icon, Modal } from '@components';
import {
  IAssumptionV2,
  AssumptionCategory,
  IAssumptionLifecycleAddRequest,
  IAssumptionLifecycleUpdateRequest,
} from '@libs/api/types';
import { CategoryMetric } from '@hooks/query/assumptions.hook';
import {
  CATEGORY_CONFIG,
  getValidationStatusFromMetrics,
  getValidationPercentageFromMetrics,
  getCategoryInsightByStatus,
  getCategoryInsightTitleByStatus,
} from './utils/assumptionUtils';
import {
  useAssumptionAdd,
  useAssumptionUpdate,
} from '@hooks/query/concepts.hook';
import { useModal } from '@context/ModalContextProvider';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';
import { AppPath } from '@routes/routes';
import { useExpandCollapseTransition } from '@hooks/animation/animation.hook';

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
  const { mutate: updateAssumption } = useAssumptionUpdate();
  const navigate = useNavigate();

  // State to track which category is selected
  const [internalSelectedCategory, setInternalSelectedCategory] =
    useState<AssumptionCategory>('desirability');

  // State for inline editing
  const [isAdding, setIsAdding] = useState(false);
  const [editingAssumptionId, setEditingAssumptionId] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCategory = propSelectedCategory || internalSelectedCategory;

  // Handle category selection
  const handleCategorySelect = (category: AssumptionCategory) => {
    if (!propSelectedCategory) {
      setInternalSelectedCategory(category);
    }
    onCategoryChange?.(category);
  };

  // Animation for add form
  const addFormTransition = useExpandCollapseTransition({
    isExpanded: isAdding,
    withOpacity: true,
    collapsedHeight: 0,
    maxHeight: 300,
  });

  // Handle adding new assumption (inline editing)
  const handleStartAdding = useCallback(() => {
    if (isSubmitting || editingAssumptionId) return; // Prevent if already editing
    setIsAdding(true);
  }, [isSubmitting, editingAssumptionId]);

  const handleCancelAdding = useCallback(() => {
    setIsAdding(false);
  }, []);

  const handleSaveNewAssumption = useCallback(
    async (data: {
      statement: string;
      category: string; // Backend format
      importance: number; // Backend format 1-3
      certainty: number; // Backend format 1-3
    }) => {
      setIsSubmitting(true);

      // Convert to API format
      const apiData: IAssumptionLifecycleAddRequest = {
        statement: data.statement,
        category: data.category as any, // Backend format is already correct
        importance: data.importance,
        certainty: data.certainty,
      };

      // Open confirmation modal with the complete data
      openModal(
        Modal.AssumptionLifecycleConfirmationModal,
        {
          mode: 'add_edit',
          assumptionStatement: apiData.statement,
          assumptionData: apiData,
          onConfirm: async () => {
            addAssumption({
              rootIdentifier: concept.identifier,
              data: apiData,
            });
            setIsAdding(false);
            setIsSubmitting(false);
            navigate(AppPath.ConceptBank, {
              replace: true,
            });
          },
        },
        {
          position: 'center',
          backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
        },
      );
      setIsSubmitting(false);
    },
    [concept.identifier, openModal, addAssumption, navigate],
  );

  // Handle editing existing assumption
  const handleStartEditing = useCallback(
    (assumptionId: string) => {
      if (isSubmitting || isAdding) return; // Prevent if already adding
      setEditingAssumptionId(assumptionId);
    },
    [isSubmitting, isAdding],
  );

  const handleCancelEditing = useCallback(() => {
    setEditingAssumptionId(null);
  }, []);

  const handleSaveEditedAssumption = useCallback(
    async (
      assumptionId: string,
      data: {
        statement: string;
        category: string; // Backend format
        importance: number; // Backend format 1-3
        certainty: number; // Backend format 1-3
      },
    ) => {
      setIsSubmitting(true);

      // Convert to API format
      const apiData: IAssumptionLifecycleUpdateRequest = {
        statement: data.statement,
        category: data.category as any, // Backend format is already correct
        importance: data.importance,
        certainty: data.certainty,
      };

      // Open confirmation modal with the complete data
      openModal(
        Modal.AssumptionLifecycleConfirmationModal,
        {
          mode: 'add_edit',
          assumptionStatement: apiData.statement,
          assumptionData: apiData,
          onConfirm: async () => {
            updateAssumption({
              rootIdentifier: concept.identifier,
              assumptionUuid: assumptionId,
              data: apiData,
            });
            setEditingAssumptionId(null);
            setIsSubmitting(false);
            navigate(AppPath.ConceptBank, {
              replace: true,
            });
          },
        },
        {
          position: 'center',
          backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
        },
      );
      setIsSubmitting(false);
    },
    [concept.identifier, openModal, updateAssumption, navigate],
  );

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
            <div className='flex justify-center py-8'>
              <Loading />
            </div>
          ) : (
            <>
              {/* Add New Assumption Plus Button */}
              <div className='mb-4 flex justify-end'>
                <button
                  onClick={handleStartAdding}
                  className='aucctus-bg-primary-hover aspect-square rounded-lg p-1'
                  aria-label='Add new assumption'
                  disabled={
                    isLoading ||
                    isAdding ||
                    editingAssumptionId !== null ||
                    isSubmitting
                  }
                >
                  <Icon
                    variant='plus'
                    className='aucctus-stroke-brand-primary h-5 w-5'
                  />
                </button>
              </div>

              {/* Add New Assumption Form */}
              {addFormTransition(
                (style, item) =>
                  item && (
                    <animated.div style={style} className='mb-4'>
                      <EditableAssumptionCard
                        mode='add'
                        category={selectedCategory}
                        onSave={handleSaveNewAssumption}
                        onCancel={handleCancelAdding}
                        isLoading={isSubmitting}
                      />
                    </animated.div>
                  ),
              )}

              {assumptions.length > 0 ? (
                <div className='space-y-4'>
                  {assumptions.map((assumption) => {
                    const isEditingThis =
                      editingAssumptionId === assumption.uuid;

                    if (isEditingThis) {
                      return (
                        <EditableAssumptionCard
                          key={assumption.uuid}
                          mode='edit'
                          category={assumption.category}
                          initialData={{
                            statement: assumption.statement,
                            importance: assumption.importance, // Already in 0-1 format from backend
                            certainty: assumption.certainty, // Already in 0-1 format from backend
                          }}
                          onSave={(data) =>
                            handleSaveEditedAssumption(assumption.uuid, data)
                          }
                          onCancel={handleCancelEditing}
                          isLoading={isSubmitting}
                        />
                      );
                    }

                    return (
                      <AssumptionDetailCard
                        key={assumption.uuid}
                        assumption={assumption}
                        showActions={
                          !isAdding && !editingAssumptionId && !isSubmitting
                        }
                        onEdit={() => handleStartEditing(assumption.uuid)}
                      />
                    );
                  })}
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
