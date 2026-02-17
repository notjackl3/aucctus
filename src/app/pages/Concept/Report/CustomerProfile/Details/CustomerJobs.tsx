import React, { useState, useMemo } from 'react';
import { ICustomerJob, ICustomerListItemWithUuid } from '@libs/api/types';
import EditableList from './components/EditableList';
import {
  useCustomerJobsList,
  useCustomerJobCreate,
  useCustomerJobUpdate,
  useCustomerJobDelete,
} from '@hooks/query/concepts.hook';
import PriorityIndicator from './components/PriorityIndicator';
import SectionHeader from './components/SectionHeader';
import { Plus } from 'lucide-react';

export interface Job {
  text: string;
  priority?: number;
}

interface JobsToBeDoneProps {
  customerProfileUuid: string;
  jobs?: ICustomerJob[];
}

const PRIORITY_COLOR_TEXT = 'text-orangeDark-900';
const PRIORITY_COLOR_LINE = 'bg-orangeDark-700';

const PRIORITY_COLOR_ICON = 'stroke-orangeDark-900';
const PRIORITY_COLOR_ICON_BG = 'bg-orangeDark-100';

const JobsToBeDone: React.FC<JobsToBeDoneProps> = ({
  customerProfileUuid,
  jobs: initialJobs,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  const jobsQuery = useCustomerJobsList(customerProfileUuid || '');
  const createJob = useCustomerJobCreate(customerProfileUuid || '');

  // Mutations for update and delete (use hooks with no arguments)
  const updateJobMutation = useCustomerJobUpdate();
  const deleteJobMutation = useCustomerJobDelete();

  // Memoize jobs and items
  const jobs: ICustomerJob[] = useMemo(
    () => jobsQuery.data || initialJobs || [],
    [jobsQuery.data, initialJobs],
  );
  const sortedJobs = useMemo(
    () => [...jobs].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [jobs],
  );
  const items: ICustomerListItemWithUuid[] = useMemo(
    () =>
      sortedJobs.map((job) => ({
        description: job.description,
        order: job.order,
        icon: job.icon,
        uuid: job.uuid,
      })),
    [sortedJobs],
  );

  // Create
  const handleCreate = async (newValue: string) => {
    // Find the lowest order in the current jobs list
    const minOrder =
      jobs.length > 0 ? Math.min(...jobs.map((job) => job.order ?? 0)) : 0;
    // Set new job order to one less than the lowest (so it appears last)
    const newOrder = jobs.length > 0 ? minOrder - 1 : 0;
    await createJob.mutateAsync({ description: newValue, order: newOrder });
  };

  // Edit
  const handleEdit = async (
    item: ICustomerListItemWithUuid,
    _index: number,
    newValue: string,
  ) => {
    if (!item.uuid || !customerProfileUuid) return;

    // Find the original job object to preserve all its data
    const originalJob = jobs.find((job) => job.uuid === item.uuid);
    if (!originalJob) return;

    await updateJobMutation.mutateAsync({
      customerProfileUuid,
      jobUuid: item.uuid,
      data: { ...originalJob, description: newValue },
    });
  };

  // Delete
  const handleDelete = async (item: ICustomerListItemWithUuid) => {
    if (!item.uuid || !customerProfileUuid) return;
    await deleteJobMutation.mutateAsync({
      customerProfileUuid,
      jobUuid: item.uuid,
    });
  };

  // Add form handlers
  const handleStartAdding = React.useCallback(() => setIsAdding(true), []);
  const handleCancelAdding = React.useCallback(() => setIsAdding(false), []);
  const handleAddComplete = React.useCallback(() => setIsAdding(false), []);

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary overflow-hidden rounded-lg border shadow-sm'>
      <SectionHeader
        icon='briefcase'
        iconClass={PRIORITY_COLOR_ICON}
        iconBgClass='aucctus-bg-primary aucctus-border-secondary'
        title='Jobs to be Done'
        noDivider={true}
        rightAction={
          <button
            className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors disabled:opacity-50'
            aria-label='Add job'
            onClick={handleStartAdding}
            disabled={isAdding}
          >
            <Plus />
          </button>
        }
      />

      <div className='px-4 py-2'>
        <p className='aucctus-text-secondary aucctus-text-sm mb-6'>
          Tasks your customer needs to accomplish
        </p>

        <div className='flex w-full'>
          <PriorityIndicator
            textColorClass={PRIORITY_COLOR_TEXT}
            lineColorClass={PRIORITY_COLOR_LINE}
          />
          <div className='max-h-[400px] min-w-0 flex-1 overflow-y-auto pr-1'>
            {/* Jobs list */}
            <EditableList
              items={items}
              onCreate={async (val) => {
                await handleCreate(val);
                handleAddComplete();
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              itemLabel='job'
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

export default React.memo(JobsToBeDone);
