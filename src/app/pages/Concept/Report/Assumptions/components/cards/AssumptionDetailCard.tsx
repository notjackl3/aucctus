import React, { useState, useCallback } from 'react';
import { Icon, Modal } from '@components';
import EditableStatusBadge from '../badges/EditableStatusBadge';
import RiskBadge from '../badges/RiskBadge';
import EditableImportanceMeter from '../badges/EditableImportanceMeter';
import EditableCertaintyMeter from '../badges/EditableCertaintyMeter';
import ValidationBenchmarkCard from '../../../Testing/components/modal-sections/test-impact/components/ValidationBenchmarkCard';
import { IAssumptionV2, AssumptionStatusV2 } from '@libs/api/types';
import { useAssumptionRemove } from '@hooks/query/concepts.hook';
import { useModal } from '@context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import useStore from '@stores/store';
import { useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import { useBatchAssumptionChangesStore } from '@stores/batch-assumption-changes';

interface AssumptionDetailCardProps {
  assumption: IAssumptionV2;
  onClick?: () => void;
  showBenchmark?: boolean;
  showActions?: boolean;
  onDelete?: () => void;
}

const AssumptionDetailCard: React.FC<AssumptionDetailCardProps> = ({
  assumption,
  onClick,
  showBenchmark,
  showActions = true,
  onDelete,
}) => {
  const conceptIdentifier = useStore((state) => state.conceptReport.identifier);
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [isEditingStatement, setIsEditingStatement] = useState(false);
  const [editedStatement, setEditedStatement] = useState(assumption.statement);

  // Batch changes store
  const { addChange } = useBatchAssumptionChangesStore();

  // Mutation hooks
  const { mutate: removeAssumption } = useAssumptionRemove();

  // Convert 0-1 values to 0-100 percentages for display
  const riskPercentage = Math.round(assumption.risk * 100);
  const certaintyPercentage = Math.round(assumption.certainty * 100);
  const importancePercentage = Math.round(assumption.importance * 100);

  // Determine validation status from the validationStatus field
  const getValidationStatus = (): AssumptionStatusV2 => {
    // Use the validationStatus field directly, with fallback to status or untested
    return assumption.validationStatus || assumption.status || 'untested';
  };

  // Event handlers
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  const handleStatementClick = useCallback(() => {
    if (showActions && !isEditingStatement) {
      setIsEditingStatement(true);
      setEditedStatement(assumption.statement);
    }
  }, [showActions, isEditingStatement, assumption.statement]);

  const handleSaveStatement = useCallback(() => {
    const trimmedStatement = editedStatement.trim();

    if (!trimmedStatement) {
      // Don't save empty statements
      setEditedStatement(assumption.statement);
      setIsEditingStatement(false);
      return;
    }

    if (trimmedStatement === assumption.statement) {
      // No changes, just close editing
      setIsEditingStatement(false);
      return;
    }

    // Add change directly to batch store - this will show the yellow banner
    // without triggering the card-level edit mode
    addChange({
      id: assumption.uuid,
      type: 'edit',
      originalData: assumption,
      changes: {
        statement: trimmedStatement,
        category: assumption.category,
        importance: assumption.importance,
        certainty: assumption.certainty,
        validationStatus: assumption.validationStatus,
      },
    });

    setIsEditingStatement(false);
  }, [editedStatement, assumption, addChange]);

  const handleCancelStatement = useCallback(() => {
    setEditedStatement(assumption.statement);
    setIsEditingStatement(false);
  }, [assumption.statement]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        handleCancelStatement();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSaveStatement();
      }
    },
    [handleCancelStatement, handleSaveStatement],
  );

  const valuesMatch = (a: number, b: number) => Math.abs(a - b) < 0.001;

  const handleImportanceChange = useCallback(
    (newImportance: number) => {
      const importanceValue = newImportance / 100; // Convert percentage (0-100) to 0-1 range

      if (valuesMatch(importanceValue, assumption.importance)) {
        return; // Ignore no-op selections so we don't flag false edits
      }

      addChange({
        id: assumption.uuid,
        type: 'edit',
        originalData: assumption,
        changes: {
          statement: assumption.statement,
          category: assumption.category,
          importance: importanceValue,
          certainty: assumption.certainty,
          validationStatus: assumption.validationStatus,
        },
      });
    },
    [assumption, addChange],
  );

  const handleCertaintyChange = useCallback(
    (newCertainty: number) => {
      const certaintyValue = newCertainty / 100; // Convert percentage (0-100) to 0-1 range

      if (valuesMatch(certaintyValue, assumption.certainty)) {
        return; // Ignore no-op selections so banner stays hidden
      }

      addChange({
        id: assumption.uuid,
        type: 'edit',
        originalData: assumption,
        changes: {
          statement: assumption.statement,
          category: assumption.category,
          importance: assumption.importance,
          certainty: certaintyValue,
          validationStatus: assumption.validationStatus,
        },
      });
    },
    [assumption, addChange],
  );

  const handleStatusChange = useCallback(
    (newStatus: AssumptionStatusV2) => {
      const currentStatus =
        assumption.validationStatus || assumption.status || 'untested';

      if (newStatus === currentStatus) {
        return; // Ignore no-op selections so banner stays hidden
      }

      addChange({
        id: assumption.uuid,
        type: 'edit',
        originalData: assumption,
        changes: {
          statement: assumption.statement,
          category: assumption.category,
          importance: assumption.importance,
          certainty: assumption.certainty,
          validationStatus: newStatus,
        },
      });
    },
    [assumption, addChange],
  );

  const handleDeleteAssumption = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      openModal(
        Modal.AssumptionLifecycleConfirmationModal,
        {
          mode: 'delete',
          assumptionStatement: assumption.statement,
          onConfirm: async () => {
            removeAssumption({
              rootIdentifier: conceptIdentifier!,
              assumptionUuid: assumption.uuid,
            });
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
    },
    [assumption, conceptIdentifier, openModal, removeAssumption, navigate],
  );
  return (
    <div
      className={cn(
        'aucctus-bg-primary hover:aucctus-bg-primary-hover aucctus-border-primary relative rounded-lg border p-5 shadow-sm transition-colors',
        {
          'cursor-pointer': showActions,
        },
      )}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Assumption statement with badges on the right */}
      <div className='mb-4 flex items-start justify-between gap-4'>
        {isEditingStatement ? (
          <div className='flex-1'>
            <textarea
              value={editedStatement}
              onChange={(e) => setEditedStatement(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveStatement}
              className='aucctus-text-md-bold aucctus-text-primary aucctus-bg-primary aucctus-border-brand w-full rounded-md border-2 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              rows={3}
              autoFocus
            />
            <div className='aucctus-text-xs aucctus-text-tertiary mt-1'>
              Press Cmd/Ctrl+Enter to save, Esc to cancel
            </div>
          </div>
        ) : (
          <p
            className='aucctus-text-md-bold aucctus-text-primary flex-1 cursor-text'
            onClick={handleStatementClick}
          >
            {assumption.statement}
          </p>
        )}

        {/* Badges aligned to top-right */}
        <div className='flex flex-shrink-0 items-start gap-2'>
          <RiskBadge risk={riskPercentage} />
          <EditableStatusBadge
            status={getValidationStatus()}
            onChange={handleStatusChange}
            disabled={!showActions}
          />
        </div>
      </div>

      {/* Meters - Editable dropdowns */}
      <div className='mb-4 mt-3 flex flex-wrap gap-2'>
        <EditableImportanceMeter
          importance={importancePercentage}
          onChange={handleImportanceChange}
          disabled={!showActions}
        />
        <EditableCertaintyMeter
          certainty={certaintyPercentage}
          onChange={handleCertaintyChange}
          disabled={!showActions}
        />
      </div>

      {showBenchmark && assumption.benchmark && (
        <ValidationBenchmarkCard benchmark={assumption.benchmark} />
      )}

      {/* Action buttons - shown on hover only when showActions is true */}
      {showActions && (
        <div
          className={cn(
            'absolute bottom-3 right-3 transition-all duration-300',
            {
              'pointer-events-none opacity-0': !isHovering,
              'pointer-events-auto opacity-100': isHovering,
            },
          )}
        >
          <button
            onClick={onDelete || handleDeleteAssumption}
            className='aucctus-bg-primary-hover aucctus-border-secondary rounded-md border p-2 shadow-sm'
            aria-label='Delete assumption'
          >
            <Icon
              variant='trash'
              className='aucctus-stroke-error-primary h-4 w-4'
            />
          </button>
        </div>
      )}
    </div>
  );
};

export default AssumptionDetailCard;
