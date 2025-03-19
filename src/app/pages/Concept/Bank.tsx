import React, { ReactNode, useCallback, useMemo } from 'react';

import { Header, Icon, Input, Table } from '@components';
import { useConceptBank, useSeedsBank } from '@hooks/tables/concept-bank.hook';
import { IConceptFilterOptions } from '@hooks/tables/concept-seed.hook';
import utils from '@libs/utils';
import { isUser } from '@libs/utils/account';
import {
  ACTIVE_CONCEPT_STATUS_LIST,
  ARCHIVE_CONCEPT_STATUS_LIST,
  DRAFT_CONCEPT_STATUS_LIST,
} from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';
import { camelCaseToTitleCase } from '@libs/utils/string';
import { AppPath } from '@routes/routes';
import { useConceptIncubationStore } from '@stores/concept-incubation.store';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export const CONCEPT_STATUS_LIST_MAP = {
  draft: DRAFT_CONCEPT_STATUS_LIST,
  active: ACTIVE_CONCEPT_STATUS_LIST,
  archive: ARCHIVE_CONCEPT_STATUS_LIST,
};

// Define seed status options
export const SEED_STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

// Helper function moved outside component to avoid recreation on each render
const areFilterOptionsSet = (filterOptions: IConceptFilterOptions) => {
  const { status, createdBy, search, sort } = filterOptions;

  return (status && status.size > 0) || !!createdBy || !!search || !!sort;
};

const ConceptBank: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetQuestionnaire } = useConceptIncubationStore();

  // Determine if we're on the drafts route
  const isDraftsRoute = location.pathname.includes('/drafts');

  // Initialize both hooks to manage both concept and seed data
  const {
    filterOptions: conceptFilterOptions,
    updateTableFiltering: updateConceptFiltering,
  } = useConceptBank();

  const {
    filterOptions: seedFilterOptions,
    updateTableFiltering: updateSeedFiltering,
  } = useSeedsBank();

  // Use the appropriate filter options and update function based on current route
  const filterOptions = isDraftsRoute
    ? seedFilterOptions
    : conceptFilterOptions;
  const updateTableFiltering = isDraftsRoute
    ? updateSeedFiltering
    : updateConceptFiltering;

  const handleAddConcept = useCallback(() => {
    resetQuestionnaire();
    navigate(AppPath.IncubateConcept);
  }, [resetQuestionnaire, navigate]);

  const handleTabChange = useCallback(
    (tabPath: string) => {
      navigate(tabPath);
    },
    [navigate],
  );

  // Memoize search handling to prevent unnecessary function recreation
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value !== filterOptions.search) {
        updateTableFiltering({ search: e.target.value });
      }
    },
    [filterOptions.search, updateTableFiltering],
  );

  // Create filter header chips
  const createFilterHeader = useCallback(() => {
    return Object.entries(filterOptions).reduce<ReactNode[]>(
      (headerItems, [key, value]) => {
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
              key={`${key}-${itemValue}`}
              propertyName={key as 'status' | 'createdBy' | 'search' | 'sort'}
              value={itemValue}
              onRemove={() => {
                // Handle removal of individual filter
                if (key === 'status') {
                  updateTableFiltering({ status: new Set() });
                } else if (key === 'createdBy') {
                  updateTableFiltering({ createdBy: undefined });
                } else if (key === 'search') {
                  updateTableFiltering({ search: '' });
                } else if (key === 'sort') {
                  updateTableFiltering({ sort: undefined });
                }
              }}
            />,
          );
        }

        return headerItems;
      },
      [],
    );
  }, [filterOptions, updateTableFiltering]);

  // Memoize UI parts to prevent unnecessary recalculations
  const filterHeaderSection = useMemo(() => {
    return areFilterOptionsSet(filterOptions) ? (
      <div className='mr-2 flex items-center gap-1'>{createFilterHeader()}</div>
    ) : null;
  }, [filterOptions, createFilterHeader]);

  // Create context value for child components
  const outletContext = useMemo(
    () => ({
      filterOptions,
      updateTableFiltering,
    }),
    [filterOptions, updateTableFiltering],
  );

  return (
    <div className='box-border flex flex-col p-8'>
      {/* Header */}
      <div className='mb-4 flex flex-row items-start justify-between self-stretch'>
        <Header.One text='Concepts' />
        <button
          className={cn('btn btn-bold btn-primary')}
          onClick={handleAddConcept}
        >
          <Icon
            variant='rocket'
            height={20}
            width={20}
            className='stroke-primary-100'
          />
          Add Concept
        </button>
      </div>

      <div className='flex h-full w-full flex-col gap-3'>
        {/* Top navigation bar with tabs on left and search/filter on right */}
        <div className='mb-4 flex w-full flex-row items-center justify-between'>
          {/* Tabs grouped on the left */}
          <div className='flex items-center'>
            <button
              className={cn('btn mr-2', {
                'btn-outlined': !isDraftsRoute,
                'btn-no-border aucctus-text-tertiary': isDraftsRoute,
              })}
              onClick={() => handleTabChange(AppPath.ConceptBank)}
            >
              Complete
            </button>
            <button
              className={cn('btn', {
                'btn-outlined': isDraftsRoute,
                'btn-no-border aucctus-text-tertiary': !isDraftsRoute,
              })}
              onClick={() => handleTabChange(AppPath.ConceptBankDrafts)}
            >
              Drafts
            </button>
          </div>

          {/* Search and filter controls moved from child components */}
          <div className='flex items-center gap-3'>
            {/* Filter chips appear here when active */}
            {filterHeaderSection}

            <div className='w-64'>
              <Input.Search
                name=''
                type='text'
                placeholder='Search'
                value={filterOptions.search || ''}
                onChange={handleSearchChange}
              />
            </div>

            <Table.ConceptBank.FilterMenubar
              updateFilterOptions={updateTableFiltering}
              filterOptions={filterOptions}
              statusOptions={isDraftsRoute ? SEED_STATUS_OPTIONS : undefined}
            />
          </div>
        </div>

        {/* Outlet component will render the child routes with context */}
        <Outlet context={outletContext} />
      </div>
    </div>
  );
};

export default React.memo(ConceptBank);
