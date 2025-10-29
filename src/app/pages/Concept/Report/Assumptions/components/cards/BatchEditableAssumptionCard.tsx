import React, { useState, useCallback, useEffect } from 'react';
import { Icon } from '@components';
import { AssumptionCategory, IAssumptionV2 } from '@libs/api/types';
import { getCategoryColors } from '../../constants/categoryColors';
import { getCategoryIcon } from '../../utils/assumptionUtils';
import EditableImportanceMeter from '../badges/EditableImportanceMeter';
import EditableCertaintyMeter from '../badges/EditableCertaintyMeter';
import { BatchAssumptionChange } from '@stores/batch-assumption-changes';

interface BatchEditableAssumptionCardProps {
  mode: 'add' | 'edit';
  category: AssumptionCategory;
  assumption?: IAssumptionV2; // For edit mode
  existingChange?: BatchAssumptionChange; // If there's already a pending change
  onSave: (change: Omit<BatchAssumptionChange, 'timestamp'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  tempId?: string; // For add mode, provide a temporary ID
}

const BatchEditableAssumptionCard: React.FC<
  BatchEditableAssumptionCardProps
> = ({
  mode,
  category,
  assumption,
  existingChange,
  onSave,
  onCancel,
  isLoading = false,
  tempId,
}) => {
  // Initialize form data
  const getInitialData = () => {
    if (existingChange && existingChange.changes) {
      return {
        statement: existingChange.changes.statement,
        importance: existingChange.changes.importance,
        certainty: existingChange.changes.certainty,
        category: existingChange.changes.category,
      };
    }

    if (mode === 'edit' && assumption) {
      return {
        statement: assumption.statement,
        importance: assumption.importance,
        certainty: assumption.certainty,
        category: assumption.category,
      };
    }

    return {
      statement: '',
      importance: 0.16, // Default to "Low" (16% -> backend 1)
      certainty: 0.16, // Default to "Low" (16% -> backend 1)
      category,
    };
  };

  const initialData = getInitialData();
  const [statement, setStatement] = useState(initialData.statement);
  const [importance, setImportance] = useState(initialData.importance);
  const [certainty, setCertainty] = useState(initialData.certainty);
  const [selectedCategory, setSelectedCategory] = useState(
    initialData.category,
  );

  // Track if the form has been modified
  const [isModified, setIsModified] = useState(false);

  // Check if form is modified whenever values change
  useEffect(() => {
    const current = {
      statement,
      importance,
      certainty,
      category: selectedCategory,
    };
    const hasChanged =
      current.statement !== initialData.statement ||
      current.importance !== initialData.importance ||
      current.certainty !== initialData.certainty ||
      current.category !== initialData.category;
    setIsModified(hasChanged);
  }, [statement, importance, certainty, selectedCategory, initialData]);

  // Validation
  const isFormValid = statement.trim().length > 0;

  // Get category colors and icon
  const categoryColors = getCategoryColors(selectedCategory);
  const iconVariant = getCategoryIcon(selectedCategory);

  // Convert 0-1 values to 0-100 percentages for display
  const importancePercentage = Math.round(importance * 100);
  const certaintyPercentage = Math.round(certainty * 100);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!isFormValid || isLoading || !isModified) return;

    const changeId =
      mode === 'add' ? tempId || `temp_${Date.now()}` : assumption?.uuid!;

    const change: Omit<BatchAssumptionChange, 'timestamp'> = {
      id: changeId,
      type: mode,
      originalData: mode === 'edit' ? assumption : undefined,
      changes: {
        statement: statement.trim(),
        category: selectedCategory,
        importance,
        certainty,
      },
    };

    onSave(change);
  }, [
    statement,
    selectedCategory,
    importance,
    certainty,
    isFormValid,
    isLoading,
    isModified,
    mode,
    tempId,
    assumption,
    onSave,
  ]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        handleSave();
      }
    },
    [onCancel, handleSave],
  );

  // Handle importance change (from clickable meter)
  const handleImportanceChange = useCallback((newImportance: number) => {
    setImportance(newImportance / 100); // Convert percentage back to 0-1 range
  }, []);

  // Handle certainty change (from clickable meter)
  const handleCertaintyChange = useCallback((newCertainty: number) => {
    setCertainty(newCertainty / 100); // Convert percentage back to 0-1 range
  }, []);

  // Category options for dropdown
  const categoryOptions: AssumptionCategory[] = [
    'desirability',
    'viability',
    'feasibility',
    'adaptability',
  ];

  return (
    <div className='aucctus-bg-primary aucctus-border-brand relative rounded-lg border-2 p-5 shadow-sm'>
      {/* Assumption header */}
      <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
        <div className='flex items-center'>
          <Icon
            variant={iconVariant as any}
            className={`${categoryColors.stroke} h-5 w-5`}
          />
          <div className='ml-2'>
            {mode === 'add' ? (
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as AssumptionCategory)
                }
                className='aucctus-text-sm-medium aucctus-bg-primary aucctus-border-secondary rounded border px-2 py-1 capitalize'
                disabled={isLoading}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <span className='aucctus-text-sm-medium capitalize'>
                {selectedCategory}
              </span>
            )}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {isModified && (
            <span className='aucctus-text-xs aucctus-text-warning-primary'>
              • Unsaved
            </span>
          )}
          <span className='aucctus-text-xs aucctus-text-tertiary'>
            {mode === 'add' ? 'Adding' : 'Editing'}
          </span>
        </div>
      </div>

      {/* Editable statement */}
      <div className='mb-4'>
        <textarea
          className='aucctus-border-secondary aucctus-text-primary w-full rounded-md border p-3 focus:outline-none focus:ring-2 focus:ring-blue-500'
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder='Enter your assumption statement here...'
          rows={3}
          disabled={isLoading}
          onKeyDown={handleKeyPress}
          autoFocus={mode === 'add'}
        />
      </div>

      {/* Editable meters */}
      <div className='mb-4 flex flex-wrap gap-2'>
        <EditableImportanceMeter
          importance={importancePercentage}
          onChange={handleImportanceChange}
          disabled={isLoading}
        />
        <EditableCertaintyMeter
          certainty={certaintyPercentage}
          onChange={handleCertaintyChange}
          disabled={isLoading}
        />
      </div>

      {/* Action buttons */}
      <div className='flex justify-between'>
        <div className='aucctus-text-xs aucctus-text-tertiary'>
          {mode === 'add'
            ? 'Ctrl+Enter to save'
            : 'Ctrl+Enter to save, Esc to cancel'}
        </div>
        <div className='flex gap-2'>
          <button
            type='button'
            className='btn btn-secondary btn-sm'
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type='button'
            className='btn btn-primary btn-sm'
            onClick={handleSave}
            disabled={!isFormValid || isLoading || !isModified}
          >
            {isLoading ? (
              <>
                <Icon
                  variant='loading-02'
                  className='aucctus-stroke-white mr-2 h-4 w-4 animate-spin'
                />
                Saving...
              </>
            ) : mode === 'add' ? (
              'Add to Batch'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchEditableAssumptionCard;
