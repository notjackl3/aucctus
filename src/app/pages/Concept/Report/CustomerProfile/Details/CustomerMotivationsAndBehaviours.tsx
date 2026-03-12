import React, { useState, useMemo } from 'react';
import { Zap, Target, Plus, X, PenLine, Check } from 'lucide-react';
import { ICustomerMotivation, ICustomerBehaviour } from '@libs/api/types';
import {
  useCustomerMotivationsList,
  useCustomerMotivationCreate,
  useCustomerMotivationUpdate,
  useCustomerMotivationDelete,
  useCustomerBehavioursList,
  useCustomerBehaviourCreate,
  useCustomerBehaviourUpdate,
  useCustomerBehaviourDelete,
} from '@hooks/query/concepts.hook';
import SectionHeader from './components/SectionHeader';
import { cn } from '@libs/utils/react';
import { useConceptReportContext } from '../../ConceptReport/ConceptReportContext';

interface CustomerMotivationsAndBehavioursProps {
  customerProfileUuid: string;
  motivations?: ICustomerMotivation[];
  behaviours?: ICustomerBehaviour[];
}

const CustomerMotivationsAndBehaviours: React.FC<
  CustomerMotivationsAndBehavioursProps
> = ({
  customerProfileUuid,
  motivations: initialMotivations,
  behaviours: initialBehaviours,
}) => {
  const { isReadOnly } = useConceptReportContext();
  const [activeTab, setActiveTab] = useState<'motivations' | 'behaviours'>(
    'motivations',
  );
  const [isAddingMotivation, setIsAddingMotivation] = useState(false);
  const [newMotivationText, setNewMotivationText] = useState('');
  const [isAddingBehaviour, setIsAddingBehaviour] = useState(false);
  const [newBehaviourText, setNewBehaviourText] = useState('');
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Motivations hooks
  const motivationsQuery = useCustomerMotivationsList(customerProfileUuid);
  const createMotivation = useCustomerMotivationCreate(customerProfileUuid);
  const updateMotivationMutation = useCustomerMotivationUpdate();
  const deleteMotivationMutation = useCustomerMotivationDelete();

  // Behaviours hooks
  const behavioursQuery = useCustomerBehavioursList(customerProfileUuid);
  const createBehaviour = useCustomerBehaviourCreate(customerProfileUuid);
  const updateBehaviourMutation = useCustomerBehaviourUpdate();
  const deleteBehaviourMutation = useCustomerBehaviourDelete();

  const motivations: ICustomerMotivation[] = useMemo(
    () => motivationsQuery.data || initialMotivations || [],
    [motivationsQuery.data, initialMotivations],
  );

  const sortedMotivations = useMemo(
    () =>
      [...motivations].sort((a, b) => (b.priority || 0) - (a.priority || 0)),
    [motivations],
  );

  const behaviours: ICustomerBehaviour[] = useMemo(
    () => behavioursQuery.data || initialBehaviours || [],
    [behavioursQuery.data, initialBehaviours],
  );

  const sortedBehaviours = useMemo(
    () => [...behaviours].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [behaviours],
  );

  const handleAddMotivation = async () => {
    if (!newMotivationText.trim()) return;
    const minOrder =
      motivations.length > 0
        ? Math.min(...motivations.map((m) => m.order ?? 0))
        : 0;
    await createMotivation.mutateAsync({
      text: newMotivationText.trim(),
      order: motivations.length > 0 ? minOrder - 1 : 0,
    });
    setNewMotivationText('');
    setIsAddingMotivation(false);
  };

  const handleAddBehaviour = async () => {
    if (!newBehaviourText.trim()) return;
    const minOrder =
      behaviours.length > 0
        ? Math.min(...behaviours.map((b) => b.order ?? 0))
        : 0;
    await createBehaviour.mutateAsync({
      text: newBehaviourText.trim(),
      order: behaviours.length > 0 ? minOrder - 1 : 0,
    });
    setNewBehaviourText('');
    setIsAddingBehaviour(false);
  };

  const handleSaveMotivationEdit = async (uuid: string) => {
    if (editingValue.trim()) {
      await updateMotivationMutation.mutateAsync({
        customerProfileUuid,
        motivationUuid: uuid,
        data: { text: editingValue.trim() },
      });
      setEditingUuid(null);
    }
  };

  const handleSaveBehaviourEdit = async (uuid: string) => {
    if (editingValue.trim()) {
      await updateBehaviourMutation.mutateAsync({
        customerProfileUuid,
        behaviourUuid: uuid,
        data: { text: editingValue.trim() },
      });
      setEditingUuid(null);
    }
  };

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col overflow-hidden rounded-lg border shadow-sm'>
      <SectionHeader
        icon='zap'
        iconClass='stroke-amber-600'
        iconBgClass='bg-amber-500/10'
        title='Motivations & Behaviours'
        noDivider={true}
        rightAction={
          !isReadOnly ? (
            <button
              className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors disabled:opacity-50'
              aria-label='Add item'
              onClick={() =>
                activeTab === 'motivations'
                  ? setIsAddingMotivation(true)
                  : setIsAddingBehaviour(true)
              }
              disabled={
                activeTab === 'motivations'
                  ? isAddingMotivation
                  : isAddingBehaviour
              }
            >
              <Plus className='h-4 w-4' />
            </button>
          ) : undefined
        }
      />

      <div className='px-4 py-2'>
        {/* Tab Switcher */}
        <div className='aucctus-border-secondary mb-4 flex flex-shrink-0 border-b'>
          <button
            onClick={() => {
              setActiveTab('motivations');
              setEditingUuid(null);
            }}
            className={cn(
              'flex-1 pb-2 text-center text-sm font-medium transition-colors',
              activeTab === 'motivations'
                ? 'aucctus-text-brand-primary border-b-2 border-current'
                : 'aucctus-text-secondary',
            )}
          >
            <span className='flex items-center justify-center gap-1'>
              <Target className='h-4 w-4' />
              Motivations ({motivations.length})
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab('behaviours');
              setEditingUuid(null);
            }}
            className={cn(
              'flex-1 pb-2 text-center text-sm font-medium transition-colors',
              activeTab === 'behaviours'
                ? 'aucctus-text-brand-primary border-b-2 border-current'
                : 'aucctus-text-secondary',
            )}
          >
            <span className='flex items-center justify-center gap-1'>
              <Zap className='h-4 w-4' />
              Behaviours ({behaviours.length})
            </span>
          </button>
        </div>

        {/* Scrollable Items List */}
        <div className='max-h-[400px] overflow-y-auto pr-1'>
          {activeTab === 'motivations' && (
            <div className='space-y-3'>
              {isAddingMotivation && (
                <div className='flex gap-2'>
                  <input
                    value={newMotivationText}
                    onChange={(e) => setNewMotivationText(e.target.value)}
                    placeholder='Add a motivation...'
                    className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleAddMotivation()
                    }
                  />
                  <button
                    className='rounded-md bg-amber-600 p-1.5 text-white hover:bg-amber-700'
                    onClick={handleAddMotivation}
                  >
                    <Check className='h-4 w-4' />
                  </button>
                  <button
                    className='aucctus-bg-secondary-hover rounded-full p-1.5'
                    onClick={() => setIsAddingMotivation(false)}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              )}
              {sortedMotivations.map((item) => (
                <div
                  key={item.uuid}
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-bg-secondary-hover group relative flex items-start gap-3 rounded-md border p-3 transition-colors'
                >
                  <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-500/20'>
                    <Target className='h-3 w-3 text-amber-600' />
                  </div>
                  {editingUuid === item.uuid ? (
                    <div className='flex min-w-0 flex-1 items-center gap-2'>
                      <input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            handleSaveMotivationEdit(item.uuid);
                          if (e.key === 'Escape') setEditingUuid(null);
                        }}
                        autoFocus
                        className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                      />
                      <button
                        className='aucctus-bg-secondary-hover flex-shrink-0 rounded px-2 py-1 text-sm'
                        onClick={() => setEditingUuid(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className='flex-shrink-0 rounded bg-amber-600 px-2 py-1 text-sm text-white hover:bg-amber-700'
                        onClick={() => handleSaveMotivationEdit(item.uuid)}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className='aucctus-text-sm flex-1 pr-14'>
                        {item.text}
                      </p>
                      <div className='absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full'
                          onClick={() => {
                            setEditingUuid(item.uuid);
                            setEditingValue(item.text);
                          }}
                        >
                          <PenLine className='h-3.5 w-3.5' />
                        </button>
                        <button
                          className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full text-red-500'
                          onClick={async () => {
                            try {
                              await deleteMotivationMutation.mutateAsync({
                                customerProfileUuid,
                                motivationUuid: item.uuid,
                              });
                            } catch {
                              // handled by mutation onError
                            }
                          }}
                        >
                          <X className='h-3.5 w-3.5' />
                        </button>
                      </div>
                      {!isReadOnly && (
                        <div className='absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                          <button
                            className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full'
                            onClick={() => {
                              setEditingUuid(item.uuid);
                              setEditingValue(item.text);
                            }}
                          >
                            <PenLine className='h-3.5 w-3.5' />
                          </button>
                          <button
                            className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full text-red-500'
                            onClick={async () => {
                              try {
                                await deleteMotivationMutation.mutateAsync({
                                  customerProfileUuid,
                                  motivationUuid: item.uuid,
                                });
                              } catch {
                                // handled by mutation onError
                              }
                            }}
                          >
                            <X className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'behaviours' && (
            <div className='space-y-3'>
              {isAddingBehaviour && (
                <div className='flex gap-2'>
                  <input
                    value={newBehaviourText}
                    onChange={(e) => setNewBehaviourText(e.target.value)}
                    placeholder='Add a behaviour...'
                    className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                    onKeyDown={(e) => e.key === 'Enter' && handleAddBehaviour()}
                  />
                  <button
                    className='rounded-md bg-blue-600 p-1.5 text-white hover:bg-blue-700'
                    onClick={handleAddBehaviour}
                  >
                    <Check className='h-4 w-4' />
                  </button>
                  <button
                    className='aucctus-bg-secondary-hover rounded-full p-1.5'
                    onClick={() => setIsAddingBehaviour(false)}
                  >
                    <X className='h-4 w-4' />
                  </button>
                </div>
              )}
              {sortedBehaviours.map((item) => (
                <div
                  key={item.uuid}
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-bg-secondary-hover group relative flex items-start gap-3 rounded-md border p-3 transition-colors'
                >
                  <div className='mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20'>
                    <Zap className='h-3 w-3 text-blue-600' />
                  </div>
                  {editingUuid === item.uuid ? (
                    <div className='flex min-w-0 flex-1 items-center gap-2'>
                      <input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            handleSaveBehaviourEdit(item.uuid);
                          if (e.key === 'Escape') setEditingUuid(null);
                        }}
                        autoFocus
                        className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                      />
                      <button
                        className='aucctus-bg-secondary-hover flex-shrink-0 rounded px-2 py-1 text-sm'
                        onClick={() => setEditingUuid(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className='flex-shrink-0 rounded bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700'
                        onClick={() => handleSaveBehaviourEdit(item.uuid)}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className='aucctus-text-sm flex-1 pr-14'>
                        {item.text}
                      </p>
                      <div className='absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full'
                          onClick={() => {
                            setEditingUuid(item.uuid);
                            setEditingValue(item.text);
                          }}
                        >
                          <PenLine className='h-3.5 w-3.5' />
                        </button>
                        <button
                          className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full text-red-500'
                          onClick={async () => {
                            try {
                              await deleteBehaviourMutation.mutateAsync({
                                customerProfileUuid,
                                behaviourUuid: item.uuid,
                              });
                            } catch {
                              // handled by mutation onError
                            }
                          }}
                        >
                          <X className='h-3.5 w-3.5' />
                        </button>
                      </div>
                      {!isReadOnly && (
                        <div className='absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                          <button
                            className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full'
                            onClick={() => {
                              setEditingUuid(item.uuid);
                              setEditingValue(item.text);
                            }}
                          >
                            <PenLine className='h-3.5 w-3.5' />
                          </button>
                          <button
                            className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full text-red-500'
                            onClick={async () => {
                              try {
                                await deleteBehaviourMutation.mutateAsync({
                                  customerProfileUuid,
                                  behaviourUuid: item.uuid,
                                });
                              } catch {
                                // handled by mutation onError
                              }
                            }}
                          >
                            <X className='h-3.5 w-3.5' />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerMotivationsAndBehaviours);
