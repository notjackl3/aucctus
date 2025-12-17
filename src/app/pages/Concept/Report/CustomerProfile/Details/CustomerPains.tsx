import React, { useState, useMemo } from 'react';
import { Icon } from '@components';
import { ICustomerPain, ICustomerListItemWithUuid } from '@libs/api/types';
import EditableList from './components/EditableList';
import {
  useCustomerPainsList,
  useCustomerPainCreate,
  useCustomerPainUpdate,
  useCustomerPainDelete,
} from '@hooks/query/concepts.hook';
import telemetry from '@libs/telemetry';
import PriorityIndicator from './components/PriorityIndicator';
import SectionHeader from './components/SectionHeader';

export interface Pain {
  text: string;
  priority?: number;
}

interface PainPointsProps {
  customerProfileUuid: string;
  pains?: ICustomerPain[];
}

const PRIORITY_COLOR_TEXT = 'text-orangeDark-600';
const PRIORITY_COLOR_LINE = 'bg-orangeDark-700';

const PRIORITY_COLOR_ICON = 'stroke-orangeDark-600';
const PRIORITY_COLOR_ICON_BG = 'bg-orangeDark-100';

const PainPoints: React.FC<PainPointsProps> = ({
  customerProfileUuid,
  pains: initialPains,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const painsQuery = useCustomerPainsList(customerProfileUuid || '');
  const createPain = useCustomerPainCreate(customerProfileUuid || '');

  // Mutations for update and delete (use hooks with no arguments)
  const updatePainMutation = useCustomerPainUpdate();
  const deletePainMutation = useCustomerPainDelete();

  // Memoize pains and items
  const pains: ICustomerPain[] = useMemo(
    () => painsQuery.data || initialPains || [],
    [painsQuery.data, initialPains],
  );
  telemetry;
  const sortedPains = useMemo(
    () => [...pains].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [pains],
  );
  const items: ICustomerListItemWithUuid[] = useMemo(
    () =>
      sortedPains.map((pain) => ({
        description: pain.description,
        order: pain.order,
        icon: pain.icon,
        uuid: pain.uuid,
      })),
    [sortedPains],
  );

  // Create
  const handleCreate = async (newValue: string) => {
    // Find the lowest order in the current pains list
    const minOrder =
      pains.length > 0 ? Math.min(...pains.map((pain) => pain.order ?? 0)) : 0;
    // Set new pain order to one less than the lowest (so it appears last)
    const newOrder = pains.length > 0 ? minOrder - 1 : 0;
    await createPain.mutateAsync({ description: newValue, order: newOrder });
  };

  // Edit
  const handleEdit = async (
    item: ICustomerListItemWithUuid,
    _index: number,
    newValue: string,
  ) => {
    if (!item.uuid || !customerProfileUuid) return;

    // Find the original pain object to preserve all its data
    const originalPain = pains.find((pain) => pain.uuid === item.uuid);
    if (!originalPain) return;

    await updatePainMutation.mutateAsync({
      customerProfileUuid,
      painUuid: item.uuid,
      data: { ...originalPain, description: newValue },
    });
  };

  // Delete
  const handleDelete = async (item: ICustomerListItemWithUuid) => {
    if (!item.uuid || !customerProfileUuid) return;
    await deletePainMutation.mutateAsync({
      customerProfileUuid,
      painUuid: item.uuid,
    });
  };

  // Add form handlers
  const handleStartAdding = React.useCallback(() => setIsAdding(true), []);
  const handleCancelAdding = React.useCallback(() => setIsAdding(false), []);
  const handleAddComplete = React.useCallback(() => setIsAdding(false), []);

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-lg border shadow-sm'>
      <SectionHeader
        icon='alert-circle'
        iconClass={PRIORITY_COLOR_ICON}
        iconBgClass='aucctus-bg-primary aucctus-border-secondary'
        title='Pain Points'
        noDivider={true}
        rightAction={
          <button
            className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors disabled:opacity-50'
            aria-label='Add pain point'
            onClick={handleStartAdding}
            disabled={isAdding}
          >
            <Icon variant='plus' height={18} width={18} />
          </button>
        }
      />

      <div className='px-4 py-2'>
        <p className='aucctus-text-secondary aucctus-text-sm mb-6'>
          Issues and challenges affecting your customer
        </p>

        <div className='flex w-full'>
          <PriorityIndicator
            textColorClass={PRIORITY_COLOR_TEXT}
            lineColorClass={PRIORITY_COLOR_LINE}
          />
          <div className='max-h-[400px] min-w-0 flex-1 overflow-y-auto pr-1'>
            {/* Pain points list */}
            <EditableList
              items={items}
              onCreate={async (val) => {
                await handleCreate(val);
                handleAddComplete();
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemLabel='pain point'
              isAdding={isAdding}
              onStartAdding={handleStartAdding}
              onCancelAdding={handleCancelAdding}
              iconColorClass={PRIORITY_COLOR_ICON}
              iconBgClass={PRIORITY_COLOR_ICON_BG}
              iconSize='md'
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PainPoints);
