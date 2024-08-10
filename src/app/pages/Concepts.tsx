import React from 'react';

import { Header, Icon, Table, Text } from '@components';
import { useConceptTable } from '@hooks/tables/concepts.hook';
import { ConceptStatus } from '@libs/api/types';
import { ACTIVE_CONCEPT_STATUS_LIST, ARCHIVE_CONCEPT_STATUS_LIST, DRAFT_CONCEPT_STATUS_LIST } from '@libs/concepts';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';

export const CONCEPT_STATUS_LIST_MAP = {
  draft: DRAFT_CONCEPT_STATUS_LIST,
  active: ACTIVE_CONCEPT_STATUS_LIST,
  archive: ARCHIVE_CONCEPT_STATUS_LIST,
};

const Concepts: React.FC = () => {
  const navigate = useNavigate();

  const {
    table,
    page,
    setPage,
    numberOfPages,
    isLoading,
    searchParam,
    setSearchParam,
    visibleStatuses,
    setVisibleStatuses,
  } = useConceptTable();

  return (
    <div className='box-border flex flex-col p-8'>
      <div className='mb-8 flex flex-row items-start justify-between self-stretch'>
        <Header.One text='Concepts' />

        <button
          className={`btn btn-primary [&>svg]:stroke-white`}
          onClick={() => {
            navigate(AppPath.IgniteConcept);
          }}
        >
          <Icon variant='rocket' height={20} width={20} />
          Add Concept
        </button>
      </div>

      <Table
        isLoading={isLoading}
        header={
          <div className='flex h-full w-full flex-row items-center justify-start gap-2 align-middle'>
            <Text.Search
              name=''
              type='text'
              value={searchParam || ''}
              onChange={(e) => setSearchParam(e.target.value)}
            />

            <Table.ConceptBank.FilterOptions
              onStatusSelect={(value: ConceptStatus) => (checked: boolean) => {
                setVisibleStatuses((current) => {
                  const updatedStatuses = new Set(current); // Create a new Set to avoid direct mutation

                  if (!checked) {
                    updatedStatuses.delete(value);
                  } else {
                    updatedStatuses.add(value);
                  }

                  return updatedStatuses; // Return the new Set
                });
              }}
              selectedStatus={Array.from(visibleStatuses)}
            />
          </div>
        }
        table={table}
        pagination={{
          page: page,
          flipPage: (page: number) => setPage(page),
          numberOfPages: numberOfPages,
        }}
      />
    </div>
  );
};

export default Concepts;
