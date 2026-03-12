import React, { useState, useMemo } from 'react';
import {
  Plus,
  X,
  PenLine,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { ICustomerKeyFact } from '@libs/api/types';
import {
  useCustomerKeyFactsList,
  useCustomerKeyFactCreate,
  useCustomerKeyFactUpdate,
  useCustomerKeyFactDelete,
} from '@hooks/query/concepts.hook';
import SectionHeader from './components/SectionHeader';
import { useConceptReportContext } from '../../ConceptReport/ConceptReportContext';

interface CustomerKeyFactsProps {
  customerProfileUuid: string;
  keyFacts?: ICustomerKeyFact[];
}

const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className='h-4 w-4 text-emerald-600' />;
    case 'down':
      return <TrendingDown className='h-4 w-4 text-red-600' />;
    default:
      return <Minus className='aucctus-text-secondary h-4 w-4' />;
  }
};

const getTrendColor = (trend?: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/50';
    case 'down':
      return 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/50';
    default:
      return 'aucctus-border-secondary aucctus-bg-primary';
  }
};

const CustomerKeyFacts: React.FC<CustomerKeyFactsProps> = ({
  customerProfileUuid,
  keyFacts: initialFacts,
}) => {
  const { isReadOnly } = useConceptReportContext();
  const [isAdding, setIsAdding] = useState(false);
  const [newStat, setNewStat] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newTrend, setNewTrend] = useState<'up' | 'down' | 'neutral'>(
    'neutral',
  );
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editingStat, setEditingStat] = useState('');
  const [editingLabel, setEditingLabel] = useState('');
  const [editingTrend, setEditingTrend] = useState<'up' | 'down' | 'neutral'>(
    'neutral',
  );

  const factsQuery = useCustomerKeyFactsList(customerProfileUuid);
  const createFact = useCustomerKeyFactCreate(customerProfileUuid);
  const updateFactMutation = useCustomerKeyFactUpdate();
  const deleteFactMutation = useCustomerKeyFactDelete();

  const facts: ICustomerKeyFact[] = useMemo(
    () => factsQuery.data || initialFacts || [],
    [factsQuery.data, initialFacts],
  );

  const sortedFacts = useMemo(
    () => [...facts].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [facts],
  );

  const handleAdd = async () => {
    const stat = newStat.trim();
    const label = newLabel.trim();
    if (!stat && !label) return;
    const minOrder =
      facts.length > 0 ? Math.min(...facts.map((f) => f.order ?? 0)) : 0;
    await createFact.mutateAsync({
      stat: stat || '',
      label: label || '',
      trend: newTrend,
      order: facts.length > 0 ? minOrder - 1 : 0,
    });
    setNewStat('');
    setNewLabel('');
    setNewTrend('neutral');
    setIsAdding(false);
  };

  const handleSaveEdit = async () => {
    if (editingUuid && editingStat.trim() && editingLabel.trim()) {
      await updateFactMutation.mutateAsync({
        customerProfileUuid,
        factUuid: editingUuid,
        data: {
          stat: editingStat.trim(),
          label: editingLabel.trim(),
          trend: editingTrend,
        },
      });
      setEditingUuid(null);
    }
  };

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col overflow-hidden rounded-lg border shadow-sm'>
      <SectionHeader
        icon='bar-chart-3'
        iconClass='stroke-indigo-600'
        iconBgClass='bg-indigo-500/10'
        title='Key Facts'
        noDivider={true}
        rightAction={
          !isReadOnly ? (
            <button
              className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors disabled:opacity-50'
              aria-label='Add key fact'
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
          Statistical insights and notable characteristics of this segment
        </p>

        <div className='max-h-[400px] overflow-y-auto pr-1'>
          <div className='flex flex-wrap gap-3'>
            {isAdding && (
              <div className='w-full space-y-2 rounded-lg border border-indigo-200 bg-indigo-500/5 p-3'>
                <div className='flex gap-2'>
                  <input
                    value={newStat}
                    onChange={(e) => setNewStat(e.target.value)}
                    placeholder='Stat (e.g., 59%)'
                    className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-24 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                  />
                  <input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder='Label (e.g., Renters)'
                    className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <select
                    value={newTrend}
                    onChange={(e) =>
                      setNewTrend(e.target.value as 'up' | 'down' | 'neutral')
                    }
                    className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-32 rounded-md border px-2 py-1.5 text-sm focus:outline-none'
                  >
                    <option value='neutral'>Neutral</option>
                    <option value='up'>Trending Up</option>
                    <option value='down'>Trending Down</option>
                  </select>
                  <div className='flex gap-2'>
                    <button
                      className='aucctus-bg-secondary-hover rounded-full p-1.5'
                      onClick={() => setIsAdding(false)}
                    >
                      <X className='h-4 w-4' />
                    </button>
                    <button
                      className='flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700'
                      onClick={handleAdd}
                    >
                      <Check className='h-4 w-4' />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sortedFacts.map((fact) => (
              <div
                key={fact.uuid}
                className={`group relative min-w-[calc(50%-0.375rem)] max-w-full flex-1 rounded-lg border p-4 transition-colors ${getTrendColor(fact.trend)}`}
              >
                {editingUuid === fact.uuid ? (
                  <div className='space-y-2'>
                    <input
                      value={editingStat}
                      onChange={(e) => setEditingStat(e.target.value)}
                      placeholder='Stat'
                      className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded-md border px-3 py-1.5 text-lg font-bold focus:outline-none'
                    />
                    <input
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      placeholder='Label'
                      className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                    />
                    <select
                      value={editingTrend}
                      onChange={(e) =>
                        setEditingTrend(
                          e.target.value as 'up' | 'down' | 'neutral',
                        )
                      }
                      className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded-md border px-2 py-1.5 text-sm focus:outline-none'
                    >
                      <option value='neutral'>Neutral</option>
                      <option value='up'>Trending Up</option>
                      <option value='down'>Trending Down</option>
                    </select>
                    <div className='flex justify-end gap-2'>
                      <button
                        className='aucctus-bg-secondary-hover rounded-full p-1.5'
                        onClick={() => setEditingUuid(null)}
                      >
                        <X className='h-4 w-4' />
                      </button>
                      <button
                        className='rounded-full bg-indigo-600 p-1.5 text-white hover:bg-indigo-700'
                        onClick={handleSaveEdit}
                      >
                        <Check className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='flex items-start justify-between'>
                      <div>
                        <p className='aucctus-text-primary text-2xl font-bold'>
                          {fact.stat}
                        </p>
                        <p className='aucctus-text-secondary mt-1 text-sm'>
                          {fact.label}
                        </p>
                      </div>
                      {getTrendIcon(fact.trend)}
                    </div>
                    {!isReadOnly && (
                      <div className='absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          className='aucctus-bg-secondary-hover flex h-6 w-6 items-center justify-center rounded-full'
                          onClick={() => {
                            setEditingUuid(fact.uuid);
                            setEditingStat(fact.stat);
                            setEditingLabel(fact.label);
                            setEditingTrend(fact.trend || 'neutral');
                          }}
                        >
                          <PenLine className='h-3 w-3' />
                        </button>
                        <button
                          className='aucctus-bg-secondary-hover flex h-6 w-6 items-center justify-center rounded-full text-red-500'
                          onClick={async () => {
                            try {
                              await deleteFactMutation.mutateAsync({
                                customerProfileUuid,
                                factUuid: fact.uuid,
                              });
                            } catch {
                              // handled by mutation onError
                            }
                          }}
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerKeyFacts);
