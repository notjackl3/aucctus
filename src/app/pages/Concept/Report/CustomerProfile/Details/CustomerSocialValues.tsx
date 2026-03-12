import React, { useState, useMemo } from 'react';
import { Heart, Plus, X, PenLine, Check } from 'lucide-react';
import { ICustomerSocialValue } from '@libs/api/types';
import {
  useCustomerSocialValuesList,
  useCustomerSocialValueCreate,
  useCustomerSocialValueUpdate,
  useCustomerSocialValueDelete,
} from '@hooks/query/concepts.hook';
import SectionHeader from './components/SectionHeader';
import { useConceptReportContext } from '../../ConceptReport/ConceptReportContext';

interface CustomerSocialValuesProps {
  customerProfileUuid: string;
  socialValues?: ICustomerSocialValue[];
}

const CustomerSocialValues: React.FC<CustomerSocialValuesProps> = ({
  customerProfileUuid,
  socialValues: initialValues,
}) => {
  const { isReadOnly } = useConceptReportContext();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');

  const valuesQuery = useCustomerSocialValuesList(customerProfileUuid);
  const createValue = useCustomerSocialValueCreate(customerProfileUuid);
  const updateValueMutation = useCustomerSocialValueUpdate();
  const deleteValueMutation = useCustomerSocialValueDelete();

  const values: ICustomerSocialValue[] = useMemo(
    () => valuesQuery.data || initialValues || [],
    [valuesQuery.data, initialValues],
  );

  const sortedValues = useMemo(
    () => [...values].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [values],
  );

  const handleAdd = async () => {
    if (newTitle.trim() && newDescription.trim()) {
      const minOrder =
        values.length > 0 ? Math.min(...values.map((v) => v.order ?? 0)) : 0;
      const newOrder = values.length > 0 ? minOrder - 1 : 0;
      await createValue.mutateAsync({
        title: newTitle.trim(),
        description: newDescription.trim(),
        order: newOrder,
      });
      setNewTitle('');
      setNewDescription('');
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editingUuid && editingTitle.trim() && editingDescription.trim()) {
      await updateValueMutation.mutateAsync({
        customerProfileUuid,
        valueUuid: editingUuid,
        data: {
          title: editingTitle.trim(),
          description: editingDescription.trim(),
        },
      });
      setEditingUuid(null);
    }
  };

  const handleDelete = async (valueUuid: string) => {
    try {
      await deleteValueMutation.mutateAsync({ customerProfileUuid, valueUuid });
    } catch {
      // handled by mutation onError
    }
  };

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary flex h-full flex-col overflow-hidden rounded-lg border shadow-sm'>
      <SectionHeader
        icon='heart'
        iconClass='stroke-pink-600'
        iconBgClass='bg-pink-500/10'
        title='Social Values'
        noDivider={true}
        rightAction={
          !isReadOnly ? (
            <button
              className='aucctus-bg-secondary-hover flex items-center justify-center rounded-full p-2 transition-colors disabled:opacity-50'
              aria-label='Add social value'
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
          Core beliefs and values that guide their decisions and lifestyle
        </p>

        <div className='max-h-[400px] overflow-y-auto pr-1'>
          <div className='space-y-3'>
            {isAdding && (
              <div className='space-y-2 rounded-md border border-pink-200 bg-pink-500/5 p-3'>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder='Value title...'
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none'
                />
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder='Description...'
                  rows={2}
                  className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full resize-none rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                />
                <div className='flex justify-end gap-2'>
                  <button
                    className='aucctus-bg-secondary-hover rounded-full p-1.5 transition-colors'
                    onClick={() => setIsAdding(false)}
                  >
                    <X className='h-4 w-4' />
                  </button>
                  <button
                    className='flex items-center gap-1 rounded-md bg-pink-600 px-3 py-1 text-sm text-white transition-colors hover:bg-pink-700'
                    onClick={handleAdd}
                  >
                    <Check className='h-4 w-4' />
                    Add
                  </button>
                </div>
              </div>
            )}

            {sortedValues.map((value) => (
              <div
                key={value.uuid}
                className='aucctus-bg-primary aucctus-border-secondary aucctus-bg-secondary-hover group relative rounded-lg border p-4 transition-colors'
              >
                {editingUuid === value.uuid ? (
                  <div className='space-y-2'>
                    <input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full rounded-md border px-3 py-1.5 text-sm font-medium focus:outline-none'
                    />
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      rows={2}
                      className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary w-full resize-none rounded-md border px-3 py-1.5 text-sm focus:outline-none'
                    />
                    <div className='flex justify-end gap-2'>
                      <button
                        className='aucctus-bg-secondary-hover rounded-full p-1.5 transition-colors'
                        onClick={() => setEditingUuid(null)}
                      >
                        <X className='h-4 w-4' />
                      </button>
                      <button
                        className='rounded-full bg-pink-600 p-1.5 text-white transition-colors hover:bg-pink-700'
                        onClick={handleSaveEdit}
                      >
                        <Check className='h-4 w-4' />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className='flex items-start gap-3'>
                      <div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-pink-500/10'>
                        <Heart className='h-4 w-4 text-pink-600' />
                      </div>
                      <div className='min-w-0 flex-1 pr-14'>
                        <h4 className='aucctus-text-primary aucctus-text-sm-semibold'>
                          {value.title}
                        </h4>
                        <p className='aucctus-text-secondary aucctus-text-sm mt-1'>
                          {value.description}
                        </p>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <div className='absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                        <button
                          className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full transition-colors'
                          onClick={() => {
                            setEditingUuid(value.uuid);
                            setEditingTitle(value.title);
                            setEditingDescription(value.description);
                          }}
                        >
                          <PenLine className='h-3.5 w-3.5' />
                        </button>
                        <button
                          className='aucctus-bg-secondary-hover flex h-7 w-7 items-center justify-center rounded-full text-red-500 transition-colors'
                          onClick={() => handleDelete(value.uuid)}
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
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerSocialValues);
