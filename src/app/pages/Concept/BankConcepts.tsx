import { Container, Table, toast } from '@components';
import BulkEditConceptsModal from '@components/Modal/BulkEditConceptsModal/BulkEditConceptsModal';
import { useBulkPrioritySocketEvents } from '@hooks/query/concept-priority.hook';
import {
  doFullConceptInvalidation,
  useConceptReportGenerate,
  useRetryConceptReport,
} from '@hooks/query/concepts.hook';
import {
  IConceptFilterOptions,
  useConceptBank,
} from '@hooks/tables/concept-bank.hook';
import { AppPath } from '@routes/routes';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckSquare, LayoutGrid, Square } from 'lucide-react';
import React, { useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import ConceptBankCard from './ConceptBankCard';

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const gridCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Define type for context being passed from parent
type ConceptBankContextType = {
  filterOptions: IConceptFilterOptions;
  updateTableFiltering: (value: Partial<IConceptFilterOptions>) => void;
  onSelectionChange: (
    uuids: string[],
    isAll: boolean,
    total: number,
    uuidIdentifierMap?: Record<string, string>,
  ) => void;
  isBulkEditOpen: boolean;
  setIsBulkEditOpen: () => void;
  resolvedBulkUuids: string[] | null;
  viewMode: 'grid' | 'list';
};

const BankConcepts: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: generateConceptReport } = useConceptReportGenerate();
  const { mutate: retryConceptReport } = useRetryConceptReport();

  // Get context from parent
  const {
    filterOptions,
    updateTableFiltering,
    onSelectionChange,
    isBulkEditOpen,
    setIsBulkEditOpen,
    resolvedBulkUuids,
    viewMode,
  } = useOutletContext<ConceptBankContextType>();

  const hookResult = useConceptBank(filterOptions, updateTableFiltering);

  const {
    table,
    concepts,
    page,
    setPage,
    numberOfPages,
    isLoading,
    selectedConceptUuids,
    isAllAcrossPagesSelected,
    setIsAllAcrossPagesSelected,
    totalCount,
    clearSelection,
    rowSelection,
    setRowSelection,
    priorityMap,
  } = hookResult;

  const { startCalculating } = useBulkPrioritySocketEvents();

  const handleRescoreStarted = useCallback(
    (affectedConceptUuids: string[]) => {
      startCalculating(affectedConceptUuids.length);
    },
    [startCalculating],
  );

  // Report selection changes to parent (Bank.tsx)
  React.useEffect(() => {
    const uuidIdentifierMap: Record<string, string> = {};
    for (const c of concepts) {
      uuidIdentifierMap[c.uuid] = c.identifier;
    }
    onSelectionChange(
      selectedConceptUuids,
      isAllAcrossPagesSelected,
      totalCount,
      uuidIdentifierMap,
    );
  }, [
    selectedConceptUuids,
    isAllAcrossPagesSelected,
    totalCount,
    onSelectionChange,
    concepts,
  ]);

  const bulkEditUuids = isAllAcrossPagesSelected
    ? (resolvedBulkUuids ?? selectedConceptUuids)
    : selectedConceptUuids;

  const handleOpen = useCallback(
    (identifier: string) => {
      doFullConceptInvalidation(queryClient, identifier);
      navigate(AppPath.ConceptOverview.replace(':id', identifier));
    },
    [navigate, queryClient],
  );

  const handleGenerate = useCallback(
    (uuid: string) => {
      generateConceptReport(uuid, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concepts],
          });
        },
      });
    },
    [generateConceptReport, queryClient],
  );

  const handleRetry = useCallback(
    (uuid: string) => {
      retryConceptReport(uuid, {
        onSuccess: () => {
          toast.warning(
            'Report retry started',
            'The system will now process your request. This may take a few minutes.',
          );
          queryClient.invalidateQueries({
            queryKey: [AucctusQueryKeys.concepts],
          });
        },
      });
    },
    [retryConceptReport, queryClient],
  );

  const handleToggleSelect = useCallback(
    (uuid: string) => {
      setRowSelection((prev) => {
        const wasSelected = prev[uuid];
        if (wasSelected && isAllAcrossPagesSelected) {
          setIsAllAcrossPagesSelected(false);
        }
        return {
          ...prev,
          [uuid]: !wasSelected,
        };
      });
    },
    [setRowSelection, isAllAcrossPagesSelected, setIsAllAcrossPagesSelected],
  );

  const handleSelectAll = useCallback(() => {
    if (isAllAcrossPagesSelected) {
      clearSelection();
    } else {
      setIsAllAcrossPagesSelected(true);
    }
  }, [isAllAcrossPagesSelected, clearSelection, setIsAllAcrossPagesSelected]);

  const isSomeSelected =
    !isAllAcrossPagesSelected && selectedConceptUuids.length > 0;

  return (
    <>
      {/* Content: Grid or Table */}
      <AnimatePresence mode='wait'>
        {isLoading ? (
          <motion.div
            key='loading'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='py-12 text-center'
          >
            <div className='flex animate-pulse flex-col items-center gap-4'>
              <div className='aucctus-border-brand h-12 w-12 animate-spin rounded-full border-4 border-t-transparent' />
              <p className='aucctus-text-sm aucctus-text-secondary'>
                Loading concepts...
              </p>
            </div>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key='grid'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Grid View */}
            {concepts.length > 0 && (
              <div className='mb-4 flex items-center gap-2'>
                <button
                  onClick={handleSelectAll}
                  className='aucctus-text-secondary hover:aucctus-text-primary flex items-center gap-2 transition-colors'
                  aria-label={
                    isAllAcrossPagesSelected ? 'Deselect all' : 'Select all'
                  }
                >
                  {isAllAcrossPagesSelected ? (
                    <CheckSquare className='h-4 w-4 text-green-500' />
                  ) : isSomeSelected ? (
                    <CheckSquare className='h-4 w-4 text-green-500 opacity-50' />
                  ) : (
                    <Square className='h-4 w-4' />
                  )}
                  <span className='aucctus-text-sm'>
                    {isAllAcrossPagesSelected
                      ? `All ${totalCount} selected`
                      : isSomeSelected
                        ? `${selectedConceptUuids.length} selected`
                        : 'Select all'}
                  </span>
                </button>
              </div>
            )}
            {concepts.length === 0 ? (
              <div className='py-12 text-center'>
                <div className='aucctus-bg-secondary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
                  <LayoutGrid className='aucctus-stroke-tertiary h-8 w-8' />
                </div>
                <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-2'>
                  No concepts found
                </h3>
                <p className='aucctus-text-sm aucctus-text-secondary'>
                  Try adjusting your filters.
                </p>
              </div>
            ) : (
              <motion.div
                className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
                variants={gridContainerVariants}
                initial='hidden'
                animate='visible'
              >
                {concepts.map((concept) => (
                  <motion.div
                    key={concept.uuid}
                    variants={gridCardVariants}
                    className='h-full'
                  >
                    <ConceptBankCard
                      concept={concept}
                      isSelected={!!rowSelection[concept.uuid]}
                      onToggleSelect={handleToggleSelect}
                      onOpen={handleOpen}
                      onGenerate={handleGenerate}
                      onRetry={handleRetry}
                      prioritySummary={priorityMap.get(concept.uuid)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Pagination for grid */}
            {numberOfPages > 1 && (
              <div className='mt-6'>
                <Table.Pagination
                  page={page}
                  numberOfPages={numberOfPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key='list'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Table View */}
            <Container.ConceptTableWrapper
              isLoading={isLoading}
              footer={
                <Table.Pagination
                  page={page}
                  numberOfPages={numberOfPages}
                  onPageChange={setPage}
                />
              }
            >
              {(hasHorizontalScroll) => (
                <Table
                  table={table}
                  hasHorizontalScroll={hasHorizontalScroll}
                />
              )}
            </Container.ConceptTableWrapper>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Edit Modal */}
      <BulkEditConceptsModal
        isOpen={isBulkEditOpen}
        onClose={setIsBulkEditOpen}
        selectedConceptUuids={bulkEditUuids}
        onSuccess={clearSelection}
        onRescoreStarted={handleRescoreStarted}
      />
    </>
  );
};

export default BankConcepts;
