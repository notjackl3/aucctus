import React, { useState, useCallback } from 'react';
import { Icon } from '@components';
import { AssumptionCategory } from '@libs/api/types';
import { getCategoryColors } from '../../constants/categoryColors';
import { getCategoryIcon } from '../../utils/assumptionUtils';
import EditableImportanceMeter from '../badges/EditableImportanceMeter';
import EditableCertaintyMeter from '../badges/EditableCertaintyMeter';

// Internal frontend format for editing
interface EditableAssumptionData {
  statement: string;
  category: string; // Backend format: 'Desirability' | 'Viability' | 'Feasibility' | 'Adaptability'
  importance: number; // Backend format: 1-3
  certainty: number; // Backend format: 1-3
}

interface EditableAssumptionCardProps {
  mode: 'add' | 'edit';
  category: AssumptionCategory; // Frontend format
  initialData?: {
    statement: string;
    importance: number; // 0-1 range (frontend format)
    certainty: number; // 0-1 range (frontend format)
  };
  onSave: (data: EditableAssumptionData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EditableAssumptionCard: React.FC<EditableAssumptionCardProps> = ({
  mode,
  category,
  initialData,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  // State for form data (using frontend 0-1 format internally)
  const [statement, setStatement] = useState(initialData?.statement || '');
  const [importance, setImportance] = useState(initialData?.importance || 0.16); // Default to "Low" (16% -> backend 1)
  const [certainty, setCertainty] = useState(initialData?.certainty || 0.16); // Default to "Low" (16% -> backend 1)

  // Validation
  const isFormValid = statement.trim().length > 0;

  // Get category colors and icon
  const categoryColors = getCategoryColors(category);
  const iconVariant = getCategoryIcon(category);

  // Convert 0-1 values to 0-100 percentages for display
  const importancePercentage = Math.round(importance * 100);
  const certaintyPercentage = Math.round(certainty * 100);

  // Helper functions to transform data for backend API
  const convertToBackendCategory = (
    frontendCategory: AssumptionCategory,
  ): string => {
    const categoryMap: Record<AssumptionCategory, string> = {
      desirability: 'Desirability',
      viability: 'Viability',
      feasibility: 'Feasibility',
      adaptability: 'Adaptability',
    };
    return categoryMap[frontendCategory];
  };

  const convertToBackendScore = (frontendScore: number): number => {
    // Convert 0-1 range to 1-3 range
    if (frontendScore < 0.33) return 1; // Low
    if (frontendScore < 0.66) return 2; // Medium
    return 3; // High
  };

  // Handle save
  const handleSave = useCallback(async () => {
    if (!isFormValid || isLoading) return;

    await onSave({
      statement: statement.trim(),
      category: convertToBackendCategory(category),
      importance: convertToBackendScore(importance),
      certainty: convertToBackendScore(certainty),
    });
  }, [
    statement,
    category,
    importance,
    certainty,
    isFormValid,
    isLoading,
    onSave,
  ]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    },
    [onCancel],
  );

  // Handle importance change (from clickable meter)
  const handleImportanceChange = useCallback((newImportance: number) => {
    setImportance(newImportance / 100); // Convert percentage back to 0-1 range
  }, []);

  // Handle certainty change (from clickable meter)
  const handleCertaintyChange = useCallback((newCertainty: number) => {
    setCertainty(newCertainty / 100); // Convert percentage back to 0-1 range
  }, []);

  return (
    <div className='aucctus-bg-primary aucctus-border-brand relative rounded-lg border-2 p-5 shadow-sm'>
      {/* Assumption header */}
      <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
        <div className='flex items-center'>
          <Icon
            variant={iconVariant as any}
            className={`${categoryColors.stroke} h-5 w-5`}
          />
          <span className='aucctus-text-sm-medium ml-2 capitalize'>
            {category}
          </span>
        </div>
        <div className='flex items-center gap-2'>
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
      <div className='flex justify-end gap-2'>
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
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <>
              <Icon
                variant='loading-02'
                className='aucctus-stroke-white mr-2 h-4 w-4 animate-spin'
              />
              {mode === 'add' ? 'Adding...' : 'Saving...'}
            </>
          ) : mode === 'add' ? (
            'Add Assumption'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </div>
  );
};

export default EditableAssumptionCard;
