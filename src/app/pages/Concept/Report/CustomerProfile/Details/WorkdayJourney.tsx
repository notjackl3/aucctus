import React, { useState, useMemo } from 'react';
import { toast, ComponentCarousel } from '@components';
import {
  Plus,
  X,
  PenLine,
  Check,
  Sun,
  Coffee,
  Utensils,
  Moon,
} from 'lucide-react';
import { IUserJourneyStep } from '@libs/api/types';
import SectionHeader from './components/SectionHeader';
import { useConceptReportContext } from '../../ConceptReport/ConceptReportContext';
import {
  useCustomerJourneyStepsList,
  useCustomerJourneyStepCreate,
  useCustomerJourneyStepUpdate,
  useCustomerJourneyStepDelete,
} from '@hooks/query/concepts.hook';

interface WorkdayJourneyProps {
  customerProfileUuid: string;
  journey?: IUserJourneyStep[];
}

const getTimeIcon = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  if (hour >= 5 && hour < 9) return Sun;
  if (hour >= 9 && hour < 12) return Coffee;
  if (hour >= 12 && hour < 17) return Utensils;
  return Moon;
};

const WorkdayJourney: React.FC<WorkdayJourneyProps> = ({
  customerProfileUuid,
  journey: initialJourney,
}) => {
  const { isReadOnly } = useConceptReportContext();
  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const { data: journeyStepsData, isLoading } =
    useCustomerJourneyStepsList(customerProfileUuid);
  const createJourneyStep = useCustomerJourneyStepCreate(customerProfileUuid);
  const updateJourneyStepMutation = useCustomerJourneyStepUpdate();
  const deleteJourneyStepMutation = useCustomerJourneyStepDelete();

  const allSteps = useMemo(() => {
    if (isLoading) return [];
    return journeyStepsData || initialJourney || [];
  }, [journeyStepsData, isLoading, initialJourney]);

  // Only show steps that have a time field
  const timeSteps = useMemo(
    () =>
      allSteps
        .filter((s) => s.time)
        .sort((a, b) => (a.time || '').localeCompare(b.time || '')),
    [allSteps],
  );

  const handleAdd = async () => {
    if (!newTime.trim() || !newTitle.trim()) return;
    try {
      const newOrder =
        allSteps.length > 0
          ? Math.min(...allSteps.map((s) => s.order || 0)) - 1
          : 0;
      await createJourneyStep.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim(),
        order: newOrder,
        time: newTime.trim(),
        relationType: 'Journey Step',
      });
      setNewTime('09:00');
      setNewTitle('');
      setNewDescription('');
      setIsAdding(false);
    } catch {
      toast.error('Step Addition Failed', 'Failed to add workday step');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUuid || !editingTime.trim() || !editingTitle.trim()) return;
    try {
      await updateJourneyStepMutation.mutateAsync({
        customerProfileUuid,
        stepUuid: editingUuid,
        data: {
          title: editingTitle.trim(),
          description: editingDescription.trim(),
          time: editingTime,
        },
      });
      setEditingUuid(null);
    } catch {
      toast.error('Step Update Failed', 'Failed to update workday step');
    }
  };

  const handleRemove = async (step: IUserJourneyStep) => {
    try {
      await deleteJourneyStepMutation.mutateAsync({
        customerProfileUuid,
        stepUuid: step.uuid,
      });
    } catch {
      toast.error('Step Deletion Failed', 'Failed to remove workday step');
    }
  };

  // Don't render if no steps have time values
  if (!isLoading && timeSteps.length === 0 && !isAdding) return null;

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-fit flex-1 overflow-hidden rounded-lg border shadow-sm'>
      <SectionHeader
        icon='clock'
        iconClass='stroke-violet-600'
        iconBgClass='bg-violet-500/10'
        title='A Day in Their Life'
        noDivider={true}
        rightAction={
          !isReadOnly ? (
            <button
              className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors disabled:opacity-50'
              aria-label='Add step'
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
            >
              <Plus className='h-4 w-4' />
            </button>
          ) : undefined
        }
      />

      <div className='px-4 py-2'>
        <p className='aucctus-text-secondary aucctus-text-sm mb-4'>
          Typical daily routine and touchpoints throughout the day
        </p>

        {isAdding && (
          <div className='mb-4 space-y-3 rounded-lg border border-violet-200 bg-violet-500/5 p-4'>
            <div className='flex gap-2'>
              <input
                type='time'
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-28 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
              />
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder='Activity title...'
                className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
              />
            </div>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder='Description...'
              rows={2}
              className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full resize-none rounded-md border px-3 py-1.5 text-sm focus:outline-none'
            />
            <div className='flex justify-end gap-2'>
              <button
                className='aucctus-bg-secondary-hover rounded-full p-1.5'
                onClick={() => setIsAdding(false)}
              >
                <X className='h-4 w-4' />
              </button>
              <button
                className='flex items-center gap-1 rounded-md bg-violet-600 px-3 py-1 text-sm text-white hover:bg-violet-700'
                onClick={handleAdd}
              >
                <Check className='h-4 w-4' />
                Add
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className='aucctus-text-secondary flex justify-center py-8'>
            Loading journey steps...
          </div>
        ) : timeSteps.length === 0 ? (
          <div className='flex flex-col items-center py-8'>
            <p className='aucctus-text-secondary mb-2'>
              No workday steps defined yet
            </p>
            <button
              className='btn btn-primary btn-sm'
              onClick={() => setIsAdding(true)}
            >
              Add First Step
            </button>
          </div>
        ) : (
          <div className='relative'>
            <ComponentCarousel
              cardWidth='220px'
              gap='16px'
              showNavigation={true}
              className='mt-2'
            >
              {timeSteps.map((step, index) => {
                const TimeIcon = getTimeIcon(step.time || '');
                const isIntervention =
                  step.relationType === 'Moment of Intervention';

                return (
                  <div key={step.uuid || index} className='relative pb-2 pt-6'>
                    {/* Timeline line behind cards */}
                    {index < timeSteps.length - 1 && (
                      <div className='absolute left-1/2 right-0 top-1/2 z-0 h-[2px] w-full -translate-y-1/2 bg-violet-500/20' />
                    )}

                    <div
                      className={`group relative z-10 rounded-lg border p-4 transition-all ${
                        isIntervention
                          ? 'border-indigo-300 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                          : 'aucctus-border-secondary aucctus-bg-primary hover:shadow-md'
                      }`}
                    >
                      {/* Time badge */}
                      <div className='absolute -top-3 left-4 flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2 py-1'>
                        <TimeIcon className='h-3 w-3 text-violet-600' />
                        <span className='text-xs font-medium text-violet-700'>
                          {step.time}
                        </span>
                      </div>

                      {/* Step number */}
                      <div
                        className={`absolute -top-3 right-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          isIntervention
                            ? 'bg-indigo-600 text-white'
                            : 'aucctus-bg-secondary aucctus-text-secondary'
                        }`}
                      >
                        {index + 1}
                      </div>

                      {editingUuid === step.uuid ? (
                        <div className='mt-2 space-y-2'>
                          <input
                            type='time'
                            value={editingTime}
                            onChange={(e) => setEditingTime(e.target.value)}
                            className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-28 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                          />
                          <input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                          />
                          <textarea
                            value={editingDescription}
                            onChange={(e) =>
                              setEditingDescription(e.target.value)
                            }
                            rows={2}
                            className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full resize-none rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                          />
                          <div className='flex justify-end gap-2'>
                            <button
                              className='aucctus-bg-secondary-hover rounded-full p-1.5'
                              onClick={() => setEditingUuid(null)}
                            >
                              <X className='h-4 w-4' />
                            </button>
                            <button
                              className='rounded-full bg-violet-600 p-1.5 text-white hover:bg-violet-700'
                              onClick={handleSaveEdit}
                            >
                              <Check className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className='aucctus-text-primary aucctus-text-sm-semibold mt-2'>
                            {step.title}
                          </h4>
                          <p className='aucctus-text-secondary mt-1 line-clamp-2 text-xs'>
                            {step.description}
                          </p>

                          {!isReadOnly && (
                            <div className='absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                              <button
                                className='aucctus-bg-secondary-hover flex h-6 w-6 items-center justify-center rounded-full'
                                onClick={() => {
                                  setEditingUuid(step.uuid);
                                  setEditingTime(step.time || '');
                                  setEditingTitle(step.title);
                                  setEditingDescription(step.description);
                                }}
                              >
                                <PenLine className='h-3 w-3' />
                              </button>
                              <button
                                className='aucctus-bg-secondary-hover flex h-6 w-6 items-center justify-center rounded-full text-red-500'
                                onClick={() => handleRemove(step)}
                              >
                                <X className='h-3 w-3' />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </ComponentCarousel>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(WorkdayJourney);
