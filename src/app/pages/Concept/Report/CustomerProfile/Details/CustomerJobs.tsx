import React, { useState, useMemo } from 'react';
import { Icon } from '@components';
import {
  ICustomerProfile,
  ICustomerJob,
  ICustomerListItemWithUuid,
} from '@libs/api/types';
import EditableList from './components/EditableList';
import {
  useCustomerJobsList,
  useCustomerJobCreate,
  useCustomerJobUpdate,
  useCustomerJobDelete,
} from '@hooks/query/concepts.hook';
import PriorityIndicator from './components/PriorityIndicator';
import AiInsight from './components/AiInsight';
import SectionHeader from './components/SectionHeader';

export interface Job {
  text: string;
  priority?: number;
}

interface JobsToBeDoneProps {
  profile?: ICustomerProfile;
}

const PRIORITY_COLOR_TEXT = 'text-orangeDark-900';
const PRIORITY_COLOR_LINE = 'bg-orangeDark-700';

const PRIORITY_COLOR_ICON = 'stroke-orangeDark-900';
const PRIORITY_COLOR_ICON_BG = 'bg-orangeDark-100';

const AI_INSIGHT_TEXT_COLOR = 'text-orangeDark-900';
const AI_INSIGHT_ICON_STROKE = 'stroke-orangeDark-900';

const JobsToBeDone: React.FC<JobsToBeDoneProps> = ({ profile }) => {
  const [insightExpanded, setInsightExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const customerProfileUuid = profile?.uuid;
  const jobsQuery = useCustomerJobsList(customerProfileUuid || '');
  const createJob = useCustomerJobCreate(customerProfileUuid || '');

  // Mutations for update and delete (use hooks with no arguments)
  const updateJobMutation = useCustomerJobUpdate();
  const deleteJobMutation = useCustomerJobDelete();

  // Memoize jobs and items
  const jobs: ICustomerJob[] = useMemo(
    () => jobsQuery.data || [],
    [jobsQuery.data],
  );
  const sortedJobs = useMemo(
    () => [...jobs].sort((a, b) => (b.order || 0) - (a.order || 0)),
    [jobs],
  );
  const topJob = sortedJobs[0];
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
    await updateJobMutation.mutateAsync({
      customerProfileUuid,
      jobUuid: item.uuid,
      data: { ...item, description: newValue, uuid: item.uuid },
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
    <div className='aucctus-bg-primary aucctus-border-secondary h-fit flex-1 overflow-hidden rounded-lg border shadow-sm'>
      <SectionHeader
        icon='briefcase'
        iconClass={PRIORITY_COLOR_ICON}
        iconBgClass='aucctus-bg-primary aucctus-border-secondary'
        title='Jobs to be Done'
        rightAction={
          <button
            className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors disabled:opacity-50'
            aria-label='Add job'
            onClick={handleStartAdding}
            disabled={isAdding}
          >
            <Icon variant='plus' height={18} width={18} />
          </button>
        }
      />

      <div className='px-4 py-2'>
        <div className='flex w-full'>
          <PriorityIndicator
            textColorClass={PRIORITY_COLOR_TEXT}
            lineColorClass={PRIORITY_COLOR_LINE}
          />
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
            maxVisible={4}
            isAdding={isAdding}
            onStartAdding={handleStartAdding}
            onCancelAdding={handleCancelAdding}
            iconColorClass={PRIORITY_COLOR_ICON}
            iconBgClass={PRIORITY_COLOR_ICON_BG}
          />
        </div>

        {/* AI Insight */}
        {topJob && (
          <AiInsight
            topJob={topJob}
            insightExpanded={insightExpanded}
            setInsightExpanded={setInsightExpanded}
            textColorClass={AI_INSIGHT_TEXT_COLOR}
            iconStrokeClass={AI_INSIGHT_ICON_STROKE}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(JobsToBeDone);
