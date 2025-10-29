import React from 'react';
import { Icon } from '@components';
import { BatchAssumptionChange } from '@stores/batch-assumption-changes';

interface BatchChangesIndicatorProps {
  changesCount: number;
  changes: BatchAssumptionChange[];
  onSaveAll: () => void;
  onDiscardAll: () => void;
  isLoading?: boolean;
}

const BatchChangesIndicator: React.FC<BatchChangesIndicatorProps> = ({
  changesCount,
  changes,
  onSaveAll,
  onDiscardAll,
  isLoading = false,
}) => {
  if (changesCount === 0) return null;

  const addCount = changes.filter((c) => c.type === 'add').length;
  const editCount = changes.filter((c) => c.type === 'edit').length;
  const deleteCount = changes.filter((c) => c.type === 'delete').length;

  return (
    <div className='aucctus-bg-warning-secondary aucctus-border-warning sticky top-0 z-10 rounded-lg border p-4 shadow-md'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <Icon
            variant='alert-circle'
            className='aucctus-stroke-warning-primary h-5 w-5'
          />
          <div>
            <div className='aucctus-text-sm-semibold aucctus-text-warning-primary'>
              {changesCount} unsaved change{changesCount !== 1 ? 's' : ''}
            </div>
            <div className='aucctus-text-xs aucctus-text-tertiary'>
              {addCount > 0 && `${addCount} new`}
              {addCount > 0 && (editCount > 0 || deleteCount > 0) && ', '}
              {editCount > 0 && `${editCount} edited`}
              {editCount > 0 && deleteCount > 0 && ', '}
              {deleteCount > 0 && `${deleteCount} deleted`}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            className='btn btn-secondary btn-sm'
            onClick={onDiscardAll}
            disabled={isLoading}
          >
            <Icon
              variant='closeX'
              className='aucctus-stroke-secondary mr-1 h-4 w-4'
            />
            Discard All
          </button>
          <button
            type='button'
            className='btn btn-primary btn-sm'
            onClick={onSaveAll}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icon
                  variant='loading-02'
                  className='aucctus-stroke-white mr-1 h-4 w-4 animate-spin'
                />
                Saving...
              </>
            ) : (
              <>
                <Icon
                  variant='save'
                  className='aucctus-stroke-white mr-1 h-4 w-4'
                />
                Save All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      <details className='mt-3'>
        <summary className='aucctus-text-xs aucctus-text-tertiary hover:aucctus-text-secondary cursor-pointer'>
          View changes details
        </summary>
        <div className='mt-2 space-y-1'>
          {changes.map((change) => (
            <div
              key={change.id}
              className='aucctus-text-xs aucctus-text-tertiary flex items-center gap-2 rounded bg-white bg-opacity-50 p-2'
            >
              <Icon
                variant={
                  change.type === 'add'
                    ? 'plus'
                    : change.type === 'edit'
                      ? 'edit'
                      : 'trash'
                }
                className='aucctus-stroke-tertiary h-3 w-3'
              />
              <span className='font-medium'>
                {change.type === 'add'
                  ? 'New'
                  : change.type === 'edit'
                    ? 'Edit'
                    : 'Delete'}
                :
              </span>
              <span className='flex-1 truncate'>
                {change.changes?.statement ||
                  change.originalData?.statement ||
                  'Untitled assumption'}
              </span>
              <span className='aucctus-text-xs capitalize'>
                {change.changes?.category || change.originalData?.category}
              </span>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
};

export default BatchChangesIndicator;
