import React, { ReactNode } from 'react';

import { Header, Icon, Input, Table } from '@components';
import { areFilterOptionsSet, IConceptFilterOptions, useConceptTable } from '@hooks/tables/concepts.hook';
import utils from '@libs/utils';
import { isUser } from '@libs/utils/account';
import {
  ACTIVE_CONCEPT_STATUS_LIST,
  ARCHIVE_CONCEPT_STATUS_LIST,
  DRAFT_CONCEPT_STATUS_LIST,
} from '@libs/utils/concepts';
import { camelCaseToTitleCase } from '@libs/utils/string';
import { AppPath } from '@routes/routes';
import { useNavigate } from 'react-router-dom';

export const CONCEPT_STATUS_LIST_MAP = {
  draft: DRAFT_CONCEPT_STATUS_LIST,
  active: ACTIVE_CONCEPT_STATUS_LIST,
  archive: ARCHIVE_CONCEPT_STATUS_LIST,
};

const ConceptBank: React.FC = () => {
  const navigate = useNavigate();

  const { table, page, setPage, numberOfPages, isLoading, filterOptions, updateTableFiltering, resetFilter } =
    useConceptTable();

  const createFilterHeader = React.useCallback(() => {
    return Object.entries(filterOptions).reduce<ReactNode[]>((headerItems, [key, value]) => {
      let itemValue = '';

      if (value instanceof Set) {
        itemValue = Array.from(value).map(camelCaseToTitleCase).join(', ');
      } else if (typeof value === 'string') {
        itemValue = value;
      } else if (isUser(value)) {
        itemValue = utils.account.getUsersFullName(value);
      }

      if (itemValue) {
        headerItems.push(
          <Table.ConceptBank.FilterOptionsHeaderItem
            key={`${utils.string.generateRandomString(5)}${key}`}
            propertyName={key as keyof IConceptFilterOptions}
            value={itemValue}
          />,
        );
      }

      return headerItems;
    }, []);
  }, [filterOptions]);

  return (
    <div className='box-border flex flex-col p-8'>
      {/* Header */}
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

      <div className='flex h-full w-full flex-col gap-3'>
        {/* Search and Filter  */}
        <div className='flex w-full flex-row items-center justify-between'>
          <Input.Search
            name=''
            type='text'
            value={filterOptions.search}
            onChange={(e) => {
              if (e.target.value !== filterOptions.search) {
                updateTableFiltering({ search: e.target.value });
              }
            }}
          />

          <Table.ConceptBank.FilterMenubar updateFilterOptions={updateTableFiltering} filterOptions={filterOptions} />
        </div>

        <Table
          isLoading={isLoading}
          header={
            <>
              <div className='flex h-full w-full flex-row gap-2 overflow-x-scroll'>{createFilterHeader()}</div>

              {areFilterOptionsSet(filterOptions) ? (
                <button className='btn btn-no-border btn-light text-nowrap' onClick={resetFilter}>
                  <Icon variant='closeX' />
                  Reset Filter
                </button>
              ) : null}
            </>
          }
          table={table}
          footer={
            <Table.Pagination
              page={page}
              numberOfPages={numberOfPages}
              onPageChange={(page: number) => setPage(page)}
            />
          }
        />
      </div>
    </div>
  );
};

export default ConceptBank;
