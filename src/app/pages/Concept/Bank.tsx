import React, { useCallback, useMemo } from 'react';

import { Badge, Header, Icon, Input, Modal, Table } from '@components';
import CompactFilterRibbon from '@components/Tables/ConceptBank/CompactFilterRibbon';
import { useModal } from '@context/ModalContextProvider';
import { useAllUsers } from '@hooks/query/account.hook';
import {
  useBulkPrioritySocketEvents,
  usePrioritySocketEvents,
} from '@hooks/query/concept-priority.hook';
import { useSubmissionLinks } from '@hooks/query/idea-submissions.hook';
import { usePropertyDefinitions } from '@hooks/query/properties.hook';
import {
  IConceptFilterOptions,
  useConceptBank,
} from '@hooks/tables/concept-bank.hook';
import {
  ISeedFilterOptions,
  useSeedsBank,
} from '@hooks/tables/concept-seed.hook';
import { ConceptStatus, IPropertyFilter } from '@libs/api/types';
import {
  ACTIVE_CONCEPT_STATUS_LIST,
  ARCHIVE_CONCEPT_STATUS_LIST,
  DRAFT_CONCEPT_STATUS_LIST,
} from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';
import { toCamelCase } from '@libs/utils/string';
import { AppPath } from '@routes/routes';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Link2, Upload } from 'lucide-react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

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
const areFilterOptionsSet = (
  filterOptions: IConceptFilterOptions | ISeedFilterOptions,
) => {
  const { status, createdBy, search, sort } = filterOptions;
  const lastModifiedBy =
    'lastModifiedBy' in filterOptions
      ? filterOptions.lastModifiedBy
      : undefined;
  const propertyFilters =
    'propertyFilters' in filterOptions
      ? filterOptions.propertyFilters
      : undefined;

  return (
    (status && status.size > 0) ||
    !!createdBy ||
    !!lastModifiedBy ||
    !!search ||
    !!sort ||
    (propertyFilters && propertyFilters.length > 0)
  );
};

const ConceptBank: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal } = useModal();
  const { resetQuestionnaire, setIsNewSeed } = useConceptIncubationStore();

  // Listen for priority calculation WebSocket events
  // Individual priority events (for real-time updates in concept table)
  usePrioritySocketEvents();
  // Bulk priority events (progress, completion, portfolio summary)
  // Must be called here so listeners stay active when user navigates between tabs
  useBulkPrioritySocketEvents();

  // Get account UUID for property definitions
  const accountUuid = useStore((state) => state.auth.user?.account?.uuid);

  // Fetch property definitions for column visibility menu
  const { data: propertyDefinitions } = usePropertyDefinitions(accountUuid);

  // Fetch all users for natural language filter conversion
  const { users: allUsers } = useAllUsers();

  // Get linkUuid from URL params for submissions route
  const { linkUuid } = useParams<{ linkUuid?: string }>();

  // Determine current route for tab highlighting
  const isDraftsRoute = location.pathname.includes('/drafts');
  const isPortfolioRoute = location.pathname.includes('/portfolio');
  const isSubmissionsRoute = location.pathname.includes('/submissions');

  // Fetch submission links for the source filter dropdown (only on submissions route)
  const { submissionLinks } = useSubmissionLinks();

  // Source filter dropdown state
  const [isSourceFilterOpen, setIsSourceFilterOpen] = React.useState(false);

  // Get current selected link for display
  const selectedLink = React.useMemo(() => {
    if (!isSubmissionsRoute || !linkUuid) return null;
    return submissionLinks.find((l) => l.uuid === linkUuid) || null;
  }, [isSubmissionsRoute, linkUuid, submissionLinks]);

  // Handle source link change
  const handleSourceChange = useCallback(
    (newLinkUuid: string) => {
      setIsSourceFilterOpen(false);
      navigate(
        AppPath.ConceptBankSubmissionDetail.replace(':linkUuid', newLinkUuid),
      );
    },
    [navigate],
  );

  // Initialize both hooks to manage both concept and seed data
  const {
    filterOptions: conceptFilterOptions,
    updateTableFiltering: updateConceptFiltering,
  } = useConceptBank();

  const {
    filterOptions: seedFilterOptions,
    updateTableFiltering: updateSeedFiltering,
  } = useSeedsBank();

  // Store users in a ref to avoid infinite re-render loop in useCallback
  // (allUsers array reference changes on every render)
  const allUsersRef = React.useRef(allUsers);
  React.useEffect(() => {
    allUsersRef.current = allUsers;
  }, [allUsers]);

  // Use the appropriate filter options and update function based on current route
  const filterOptions = isDraftsRoute
    ? seedFilterOptions
    : conceptFilterOptions;
  const updateTableFiltering = isDraftsRoute
    ? updateSeedFiltering
    : updateConceptFiltering;

  const handleAddConcept = useCallback(() => {
    resetQuestionnaire();
    setIsNewSeed(true);
    navigate(AppPath.IncubateConcept);
  }, [resetQuestionnaire, navigate, setIsNewSeed]);

  const handleOpenImportModal = useCallback(() => {
    openModal(
      Modal.ImportConcepts,
      {},
      {
        position: 'center',
        shouldCloseOnOverlayClick: true,
        shouldCloseOnEscape: true,
      },
    );
  }, [openModal]);

  const handleTabChange = useCallback(
    (tabPath: string) => {
      navigate(tabPath);
    },
    [navigate],
  );

  // Store last search value to prevent debounce loops
  const lastSearchValueRef = React.useRef(filterOptions.search);

  // Memoize search handling to prevent unnecessary function recreation
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      // Only update if the value actually changed from what we last set
      if (newValue !== lastSearchValueRef.current) {
        lastSearchValueRef.current = newValue;
        updateTableFiltering({ search: newValue });
      }
    },
    [updateTableFiltering],
  );

  // Handle natural language filter application
  const handleNaturalLanguageFilters = useCallback(
    (
      filters: IPropertyFilter[],
      standardFilters?: Array<{ filterType: string; value: string | string[] }>,
    ) => {
      // Only apply to concepts, not drafts
      if (!isDraftsRoute) {
        const updates: Partial<IConceptFilterOptions> = {};

        // Always set propertyFilters - this replaces existing filters completely
        // If filters array is empty, this will clear existing property filters
        if (filters !== undefined) {
          updates.propertyFilters = filters.length > 0 ? filters : [];
        }

        // Process standardFilters if present
        if (standardFilters !== undefined) {
          if (standardFilters.length > 0) {
            standardFilters.forEach((filter) => {
              switch (filter.filterType) {
                case 'sort':
                  // Replace existing sorts completely (don't merge)
                  if (typeof filter.value === 'string') {
                    updates.sort = filter.value as any;
                  }
                  break;

                case 'status': {
                  // Convert comma-separated snake_case status values to Set<ConceptStatus>
                  // API returns: "ideating,in_review,prototyping"
                  // Need to convert to: Set(['ideating', 'inReview', 'prototyping'])
                  const statusString =
                    typeof filter.value === 'string'
                      ? filter.value
                      : Array.isArray(filter.value)
                        ? filter.value.join(',')
                        : '';

                  if (statusString) {
                    const statusValues = statusString
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean);

                    // Convert snake_case to camelCase and validate
                    const validStatuses = statusValues
                      .map((status) => {
                        // Convert snake_case to camelCase (e.g., "in_review" -> "inReview")
                        const camelStatus = toCamelCase(status);
                        return camelStatus as ConceptStatus;
                      })
                      .filter((status): status is ConceptStatus => {
                        // Validate against known ConceptStatus values
                        const validStatusList: ConceptStatus[] = [
                          'new',
                          'ideating',
                          'inReview',
                          'prototyping',
                          'proofOfConcept',
                          'minimumViableProduct',
                          'commercialized',
                          'archived',
                        ];
                        return validStatusList.includes(status);
                      });

                    if (validStatuses.length > 0) {
                      updates.status = new Set(validStatuses);
                    }
                  }
                  break;
                }

                case 'createdBy': {
                  // Convert user name(s) to Set<IUser>
                  // API returns: "John Doe" or ["John Doe", "Jane Smith"]
                  const createdByNames = Array.isArray(filter.value)
                    ? filter.value
                    : [filter.value];

                  if (
                    createdByNames.length > 0 &&
                    allUsersRef.current.length > 0
                  ) {
                    const createdByUsers = allUsersRef.current.filter((user) =>
                      createdByNames.some((name) => {
                        const fullName =
                          `${user.firstName} ${user.lastName}`.toLowerCase();
                        const searchName = name.toLowerCase();
                        // Match if either the full name contains the search or vice versa
                        return (
                          fullName.includes(searchName) ||
                          searchName.includes(fullName)
                        );
                      }),
                    );

                    if (createdByUsers.length > 0) {
                      updates.createdBy = new Set(createdByUsers);
                    }
                  }
                  break;
                }

                case 'lastModifiedBy': {
                  // Convert user name(s) to Set<IUser>
                  // API returns: "John Doe" or ["John Doe", "Jane Smith"]
                  const lastModifiedByNames = Array.isArray(filter.value)
                    ? filter.value
                    : [filter.value];

                  if (
                    lastModifiedByNames.length > 0 &&
                    allUsersRef.current.length > 0
                  ) {
                    const lastModifiedByUsers = allUsersRef.current.filter(
                      (user) =>
                        lastModifiedByNames.some((name) => {
                          const fullName =
                            `${user.firstName} ${user.lastName}`.toLowerCase();
                          const searchName = name.toLowerCase();
                          // Match if either the full name contains the search or vice versa
                          return (
                            fullName.includes(searchName) ||
                            searchName.includes(fullName)
                          );
                        }),
                    );

                    if (lastModifiedByUsers.length > 0) {
                      updates.lastModifiedBy = new Set(lastModifiedByUsers);
                    }
                  }
                  break;
                }

                case 'search': {
                  // Handle search filter
                  // API returns: "hydration" or search term
                  const searchValue =
                    typeof filter.value === 'string'
                      ? filter.value
                      : Array.isArray(filter.value)
                        ? filter.value[0]
                        : '';

                  if (searchValue) {
                    updates.search = searchValue;
                    // Update the ref to prevent handleSearchChange from triggering again
                    lastSearchValueRef.current = searchValue;
                  }
                  break;
                }

                default:
                  break;
              }
            });
          } else {
            // Empty standardFilters array means clear all standard filters
            updates.sort = undefined;
            updates.status = undefined;
            updates.createdBy = undefined;
            updates.lastModifiedBy = undefined;
            updates.search = '';
            lastSearchValueRef.current = '';
          }
        }

        // Use updateConceptFiltering directly since we know we're not on drafts route
        updateConceptFiltering(updates);
      }
    },
    [isDraftsRoute, updateConceptFiltering],
  );

  // Memoize UI parts to prevent unnecessary recalculations
  const filterHeaderSection = useMemo(() => {
    return areFilterOptionsSet(filterOptions) ? (
      <CompactFilterRibbon
        filterOptions={conceptFilterOptions}
        propertyDefinitions={propertyDefinitions}
        onUpdateFilters={updateConceptFiltering}
      />
    ) : null;
  }, [
    filterOptions,
    conceptFilterOptions,
    propertyDefinitions,
    updateConceptFiltering,
  ]);

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
        <div className='flex items-center gap-2'>
          <button
            className='btn btn-secondary flex h-10 w-10 items-center justify-center p-0'
            onClick={handleOpenImportModal}
            title='Import concepts'
          >
            <Upload className='h-4 w-4' />
          </button>
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
      </div>

      <div className='flex h-full w-full flex-col gap-3'>
        {/* Top navigation bar with tabs on left and search/filter on right */}
        <div className='flex w-full flex-row items-center justify-between'>
          {/* Tabs grouped on the left */}
          <div className='flex items-center gap-1'>
            <button
              className={cn('btn', {
                'btn-outlined': isPortfolioRoute,
                'btn-no-border aucctus-text-tertiary': !isPortfolioRoute,
              })}
              onClick={() => handleTabChange(AppPath.ConceptBankPortfolio)}
            >
              <Icon
                variant='lightbulb'
                height={16}
                width={16}
                className={cn({
                  'aucctus-stroke-primary': isPortfolioRoute,
                  'aucctus-stroke-tertiary': !isPortfolioRoute,
                })}
              />
              Portfolio
              <Badge.Beta size='xs' />
            </button>
            <button
              className={cn('btn', {
                'btn-outlined':
                  !isDraftsRoute && !isPortfolioRoute && !isSubmissionsRoute,
                'btn-no-border aucctus-text-tertiary':
                  isDraftsRoute || isPortfolioRoute || isSubmissionsRoute,
              })}
              onClick={() => handleTabChange(AppPath.ConceptBank)}
            >
              Concepts
            </button>
            <button
              className={cn('btn', {
                'btn-outlined': isSubmissionsRoute,
                'btn-no-border aucctus-text-tertiary': !isSubmissionsRoute,
              })}
              onClick={() => handleTabChange(AppPath.ConceptBankSubmissions)}
            >
              <Upload
                height={16}
                width={16}
                className={cn({
                  'aucctus-stroke-primary': isSubmissionsRoute,
                  'aucctus-stroke-tertiary': !isSubmissionsRoute,
                })}
              />
              Submissions
              <Badge.Beta size='xs' />
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

          {/* Source Filter - Only on Submissions tab (right aligned) */}
          {isSubmissionsRoute && selectedLink && (
            <div className='relative'>
              <button
                onClick={() => setIsSourceFilterOpen(!isSourceFilterOpen)}
                className='aucctus-border-secondary hover:aucctus-bg-secondary flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors'
              >
                <Link2 className='aucctus-stroke-tertiary h-3.5 w-3.5' />
                <span className='aucctus-text-sm aucctus-text-secondary'>
                  Source
                </span>
                <span className='aucctus-text-sm-medium aucctus-text-primary'>
                  {selectedLink.title}
                </span>
                <ChevronDown
                  className={cn(
                    'aucctus-stroke-tertiary h-3.5 w-3.5 transition-transform',
                    isSourceFilterOpen && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence>
                {isSourceFilterOpen && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      className='fixed inset-0 z-10'
                      onClick={() => setIsSourceFilterOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className='aucctus-bg-primary aucctus-border-secondary absolute right-0 top-full z-20 mt-1 min-w-[280px] rounded-lg border shadow-lg'
                    >
                      <div className='p-2'>
                        <div className='aucctus-text-xs aucctus-text-tertiary mb-2 px-2'>
                          Select source
                        </div>
                        {submissionLinks.map((link) => (
                          <button
                            key={link.uuid}
                            onClick={() => handleSourceChange(link.uuid)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors',
                              link.uuid === linkUuid
                                ? 'aucctus-bg-brand-secondary'
                                : 'hover:aucctus-bg-secondary',
                            )}
                          >
                            <div className='flex items-center gap-2'>
                              <span
                                className={cn(
                                  'h-2 w-2 rounded-full',
                                  link.isActive
                                    ? 'bg-green-500'
                                    : 'bg-gray-400',
                                )}
                              />
                              <span
                                className={cn(
                                  'aucctus-text-sm',
                                  link.uuid === linkUuid
                                    ? 'aucctus-text-brand-primary font-medium'
                                    : 'aucctus-text-secondary',
                                )}
                              >
                                {link.title}
                              </span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <span className='aucctus-text-xs aucctus-text-tertiary'>
                                {link.submissionCount} ideas
                              </span>
                              {link.uuid === linkUuid && (
                                <Check className='h-4 w-4 text-green-500' />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Search and filter controls moved from child components - hidden on Portfolio and Submissions tabs */}
          {!isPortfolioRoute && !isSubmissionsRoute && (
            <div className='flex items-center gap-3'>
              {/* Property management and column visibility (only show for concepts, not drafts) */}
              {!isDraftsRoute && (
                <>
                  <Table.PropertyColumns.FiltersMenu
                    propertyDefinitions={propertyDefinitions}
                    filterOptions={conceptFilterOptions}
                    onUpdateFilters={updateConceptFiltering}
                  />
                  <Table.PropertyColumns.SortsMenu
                    propertyDefinitions={propertyDefinitions}
                    currentSort={conceptFilterOptions.sort}
                    onSort={(field, direction, isProperty) => {
                      // Parse current sorts
                      const currentSortConfigs = conceptFilterOptions.sort
                        ? conceptFilterOptions.sort.split(',').map((s) => {
                            const trimmed = s.trim();
                            const isDesc = trimmed.startsWith('-');
                            const fieldStr = isDesc
                              ? trimmed.slice(1)
                              : trimmed;
                            return { field: fieldStr, isDesc };
                          })
                        : [];

                      // Build the field string with proper prefix
                      const fieldStr = isProperty ? `property:${field}` : field;
                      const directionPrefix = direction === 'desc' ? '-' : '';
                      const newSortField = `${directionPrefix}${fieldStr}`;

                      // Check if this field already exists in sorts
                      const existingIndex = currentSortConfigs.findIndex(
                        (c) =>
                          c.field === fieldStr ||
                          c.field === `property:${field}` ||
                          c.field === field,
                      );

                      let newSorts: string[];
                      if (existingIndex >= 0) {
                        // Update existing sort
                        const sortStrings = currentSortConfigs.map(
                          (c) => `${c.isDesc ? '-' : ''}${c.field}`,
                        );
                        sortStrings[existingIndex] = newSortField;
                        newSorts = sortStrings;
                      } else {
                        // Add new sort
                        newSorts = [
                          ...currentSortConfigs.map(
                            (c) => `${c.isDesc ? '-' : ''}${c.field}`,
                          ),
                          newSortField,
                        ];
                      }

                      updateConceptFiltering({
                        sort: newSorts.join(','),
                      } as any);
                    }}
                    onRemoveSort={(field, isProperty) => {
                      const currentSortConfigs = conceptFilterOptions.sort
                        ? conceptFilterOptions.sort.split(',').map((s) => {
                            const trimmed = s.trim();
                            const isDesc = trimmed.startsWith('-');
                            const fieldStr = isDesc
                              ? trimmed.slice(1)
                              : trimmed;
                            return { field: fieldStr, isDesc };
                          })
                        : [];

                      const fieldStr = isProperty ? `property:${field}` : field;
                      const remainingSorts = currentSortConfigs.filter(
                        (c) =>
                          c.field !== fieldStr &&
                          c.field !== `property:${field}` &&
                          c.field !== field,
                      );

                      if (remainingSorts.length === 0) {
                        updateConceptFiltering({ sort: undefined } as any);
                      } else {
                        updateConceptFiltering({
                          sort: remainingSorts
                            .map((c) => `${c.isDesc ? '-' : ''}${c.field}`)
                            .join(','),
                        } as any);
                      }
                    }}
                  />
                  <Table.PropertyColumns.PropertyManager
                    propertyDefinitions={propertyDefinitions}
                  />
                  <Table.PropertyColumns.ColumnVisibilityMenu
                    propertyDefinitions={propertyDefinitions}
                  />
                </>
              )}

              {/* Keep FilterMenubar for drafts route only */}
              {isDraftsRoute && (
                <Table.SeedBank.FilterMenubar
                  updateFilterOptions={
                    updateTableFiltering as (
                      value: Partial<ISeedFilterOptions>,
                    ) => void
                  }
                  filterOptions={filterOptions as ISeedFilterOptions}
                  statusOptions={SEED_STATUS_OPTIONS}
                />
              )}

              {/* Search input - Natural Language for concepts, regular for drafts */}
              <div className='w-64'>
                {!isDraftsRoute ? (
                  <Input.NaturalLanguageSearch
                    onFiltersApplied={handleNaturalLanguageFilters}
                    placeholder='Search with AI...'
                  />
                ) : (
                  <Input.Search
                    name=''
                    type='text'
                    placeholder='Search'
                    value={filterOptions.search || ''}
                    onChange={handleSearchChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filter ribbons row - only shows when filters/sorts are active (hidden on Portfolio and Submissions) */}
        {!isPortfolioRoute && !isSubmissionsRoute && filterHeaderSection && (
          <div className='w-full overflow-hidden'>
            <div className='flex flex-wrap items-center gap-2'>
              {filterHeaderSection}
            </div>
          </div>
        )}

        {/* Outlet component will render the child routes with context */}
        <Outlet context={outletContext} />
      </div>
    </div>
  );
};

export default React.memo(ConceptBank);
