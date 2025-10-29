import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { IAssumptionV2, AssumptionCategory } from '@libs/api/types';
import { useAssumptionBatchUpdate } from '@hooks/query/concepts.hook';
import { useModal } from '@context/ModalContextProvider';
import { useBatchAssumptionChangesStore } from '../../stores/batch-assumption-changes';
import { IConceptReportContext } from '../../pages/Concept/Report';
import { toast } from '@components';
import { Modal } from '@components';
import BatchConfirmationModal from '@components/Modal/AssumptionLifecycleModal/BatchConfirmationModal';

interface UseBatchAssumptionTableProps {
  assumptions: IAssumptionV2[];
  selectedCategory?: AssumptionCategory;
  onCategoryChange?: (category: AssumptionCategory) => void;
  isLoading?: boolean;
}

export const useBatchAssumptionTable = ({
  assumptions,
  selectedCategory: propSelectedCategory,
  onCategoryChange,
  isLoading = false,
}: UseBatchAssumptionTableProps) => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { openModal, closeModal } = useModal();
  const { mutate: batchUpdateAssumptions } = useAssumptionBatchUpdate();
  const navigate = useNavigate();

  // Batch changes management - directly use the store
  const {
    conceptId: storeConceptId,
    setConceptId,
    addChange,
    removeChange,
    clearChanges,
    clearChangesForConcept,
    hasUnsavedChanges,
    unsavedChangesCount,
    changesArray,
    getChange,
    hasChangeForAssumption,
    getEffectiveAssumptionData,
    isMarkedForDeletion,
    getNewAssumptions,
  } = useBatchAssumptionChangesStore();

  // Set the concept ID when it changes
  useEffect(() => {
    if (concept.identifier !== storeConceptId) {
      setConceptId(concept.identifier);
    }
  }, [concept.identifier, storeConceptId, setConceptId]);

  // Clear changes when concept changes
  useEffect(() => {
    if (storeConceptId && storeConceptId !== concept.identifier) {
      clearChangesForConcept(storeConceptId);
    }
  }, [concept.identifier, storeConceptId, clearChangesForConcept]);

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
  const handleCategorySelect = useCallback(
    (category: AssumptionCategory) => {
      if (!propSelectedCategory) {
        setInternalSelectedCategory(category);
      }
      onCategoryChange?.(category);
    },
    [propSelectedCategory, onCategoryChange],
  );

  // Handle adding new assumption (batch editing)
  const handleStartAdding = useCallback(() => {
    if (isSubmitting || editingAssumptionId) return; // Prevent if already editing
    setIsAdding(true);
  }, [isSubmitting, editingAssumptionId]);

  const handleCancelAdding = useCallback(() => {
    setIsAdding(false);
  }, []);

  const handleSaveNewAssumption = useCallback(
    async (change: Parameters<typeof addChange>[0]) => {
      addChange(change);
      setIsAdding(false);
      toast.success('Assumption added to batch. Save all changes to apply.');
    },
    [addChange],
  );

  // Handle editing existing assumption (batch editing)
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
    async (change: Parameters<typeof addChange>[0]) => {
      addChange(change);
      setEditingAssumptionId(null);
    },
    [addChange],
  );

  // Helper function to convert frontend category to backend format
  const convertToBackendCategory = useCallback(
    (category: AssumptionCategory) => {
      const categoryMap = {
        desirability: 'Desirability',
        viability: 'Viability',
        feasibility: 'Feasibility',
        adaptability: 'Adaptability',
      } as const;
      return categoryMap[category];
    },
    [],
  );

  // Helper function to convert frontend score (0-1 range) to backend score (1-3 range)
  const convertToBackendScore = useCallback((frontendScore: number): number => {
    // Convert 0-1 range to 1-3 range
    if (frontendScore < 0.33) return 1; // Low
    if (frontendScore < 0.66) return 2; // Medium
    return 3; // High
  }, []);

  const performBatchSave = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Separate adds, updates, and deletes
      const changes = changesArray();
      const adds = changes.filter((c) => c.type === 'add');
      const updates = changes.filter((c) => c.type === 'edit');
      const deletes = changes.filter((c) => c.type === 'delete');

      // Build the batch request payload according to new API format
      const batchPayload = {
        create: adds
          .filter((change) => change.changes) // Type guard
          .map((change) => ({
            statement: change.changes!.statement,
            category: convertToBackendCategory(change.changes!.category),
            importance: convertToBackendScore(change.changes!.importance),
            certainty: convertToBackendScore(change.changes!.certainty),
          })),
        update: updates
          .filter((change) => change.originalData && change.changes) // Type guards
          .map((change) => ({
            uuid: change.originalData!.uuid,
            statement: change.changes!.statement,
            category: convertToBackendCategory(change.changes!.category),
            importance: convertToBackendScore(change.changes!.importance),
            certainty: convertToBackendScore(change.changes!.certainty),
          })),
        delete: deletes
          .filter((change) => change.originalData) // Type guard
          .map((change) => change.originalData!.uuid),
      };

      // Make the actual API call
      batchUpdateAssumptions({
        rootIdentifier: concept.identifier,
        data: batchPayload,
      });

      clearChanges();
      setIsAdding(false);
      setEditingAssumptionId(null);

      navigate('/concept');
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    changesArray,
    clearChanges,
    concept.identifier,
    batchUpdateAssumptions,
    navigate,
    convertToBackendCategory,
    convertToBackendScore,
  ]);

  // Batch operations
  const handleSaveAllChanges = useCallback(() => {
    if (!hasUnsavedChanges() || isSubmitting) return;

    // Open confirmation modal first
    openModal(
      BatchConfirmationModal,
      {
        changes: changesArray(),
        onConfirm: async () => {
          await performBatchSave();
        },
        onCancel: () => {
          // Modal will close automatically
        },
        isLoading: isSubmitting,
      },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
      },
    );
  }, [
    hasUnsavedChanges,
    isSubmitting,
    changesArray,
    openModal,
    performBatchSave,
  ]);

  const handleDiscardAllChanges = useCallback(() => {
    if (!hasUnsavedChanges()) return;

    openModal(
      Modal.Confirmation,
      {
        title: 'Discard All Changes?',
        subtitle: `Are you sure you want to discard ${unsavedChangesCount()} unsaved changes? This action cannot be undone.`,
        actions: [
          {
            title: 'Cancel',
            variant: 'secondary',
            onClick: () => {
              closeModal();
            },
          },
          {
            title: 'Discard',
            variant: 'danger',
            onClick: () => {
              clearChanges();
              setIsAdding(false);
              setEditingAssumptionId(null);
              toast.success('All changes discarded.');
              closeModal();
            },
          },
        ],
      },
      {
        position: 'center',
        backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
      },
    );
  }, [
    hasUnsavedChanges,
    unsavedChangesCount,
    clearChanges,
    closeModal,
    openModal,
  ]);

  // Handle deleting existing assumption (batch deletion)
  const handleDeleteAssumption = useCallback(
    (assumptionId: string, assumption: IAssumptionV2) => {
      // Show modal confirmation dialog before adding to batch
      openModal(
        Modal.Confirmation,
        {
          title: 'Delete Assumption from Batch?',
          subtitle: `Are you sure you want to delete this assumption?\n\n"${assumption.statement}"\n\nThis will add the deletion to your batch of changes. The assumption will be permanently deleted when you save all changes.`,
          actions: [
            {
              title: 'Cancel',
              variant: 'secondary',
              onClick: () => {
                closeModal();
              },
            },
            {
              title: 'Delete',
              variant: 'danger',
              onClick: () => {
                addChange({
                  id: assumptionId,
                  type: 'delete',
                  originalData: assumption,
                });
                toast.success(
                  'Assumption marked for deletion. Save all changes to apply.',
                );
                closeModal();
              },
            },
          ],
        },
        {
          position: 'center',
          backgroundClassName: 'aucctus-bg-secondary-solid bg-opacity-20',
        },
      );
    },
    [addChange, openModal, closeModal],
  );

  // Handle editing new assumptions
  const handleEditNewAssumption = useCallback(
    (newAssumptionId: string, change: Parameters<typeof addChange>[0]) => {
      // When editing a new assumption, remove the old change and add the updated one
      addChange({
        ...change,
        type: 'add',
        originalData: {
          uuid: newAssumptionId,
          statement: change.changes!.statement,
          category: change.changes!.category,
          importance: change.changes!.importance,
          certainty: change.changes!.certainty,
          status: 'untested',
          validationStatus: 'untested',
          risk: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as IAssumptionV2,
      });
      setEditingAssumptionId(null);
    },
    [addChange],
  );

  return {
    // State
    selectedCategory,
    isAdding,
    editingAssumptionId,
    isSubmitting,
    isLoading,

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
    handleStartEditing,
    handleCancelEditing,
    handleSaveEditedAssumption,
    handleDeleteAssumption,
    handleEditNewAssumption,
    handleSaveAllChanges,
    handleDiscardAllChanges,
    removeChange,

    // Data
    assumptions,
  };
};
