import { Container, Table } from '@components';
import BulkEditConceptsModal from '@components/Modal/BulkEditConceptsModal/BulkEditConceptsModal';
import { useBulkPrioritySocketEvents } from '@hooks/query/concept-priority.hook';
import {
  IConceptFilterOptions,
  useConceptBank,
} from '@hooks/tables/concept-bank.hook';
import api from '@libs/api';
import React, { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

// Define type for context being passed from parent
type ConceptBankContextType = {
  filterOptions: IConceptFilterOptions;
  updateTableFiltering: (value: Partial<IConceptFilterOptions>) => void;
  onSelectionChange: (uuids: string[], isAll: boolean, total: number) => void;
  isBulkEditOpen: boolean;
  setIsBulkEditOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const BankConcepts: React.FC = () => {
  // Get context from parent
  const {
    filterOptions,
    updateTableFiltering,
    onSelectionChange,
    isBulkEditOpen,
    setIsBulkEditOpen,
  } = useOutletContext<ConceptBankContextType>();

  const hookResult = useConceptBank(filterOptions, updateTableFiltering);

  const {
    table,
    page,
    setPage,
    numberOfPages,
    isLoading,
    selectedConceptUuids,
    setRowSelection,
    isAllAcrossPagesSelected,
    totalCount,
    clearSelection,
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
    onSelectionChange(
      selectedConceptUuids,
      isAllAcrossPagesSelected,
      totalCount,
    );
  }, [
    selectedConceptUuids,
    isAllAcrossPagesSelected,
    totalCount,
    onSelectionChange,
  ]);

  // Resolve UUIDs for bulk edit when all-across-pages is selected
  const [resolvedBulkUuids, setResolvedBulkUuids] = React.useState<
    string[] | null
  >(null);
  const [isResolvingUuids, setIsResolvingUuids] = React.useState(false);

  // When bulk edit opens with all-across-pages, fetch all UUIDs
  React.useEffect(() => {
    if (!isBulkEditOpen) {
      setResolvedBulkUuids(null);
      return;
    }
    if (!isAllAcrossPagesSelected) return;

    let cancelled = false;
    setIsResolvingUuids(true);

    const fetchAllUuids = async () => {
      try {
        const opts = filterOptions;
        const allData = await api.concept.getConcepts({
          status:
            opts.status && opts.status.size > 0
              ? Array.from(opts.status).join(',')
              : undefined,
          createdBy:
            opts.createdBy && opts.createdBy.size > 0
              ? Array.from(opts.createdBy)
                  .map((user) => `${user.firstName} ${user.lastName}`)
                  .join(',')
              : undefined,
          lastModifiedBy:
            opts.lastModifiedBy && opts.lastModifiedBy.size > 0
              ? Array.from(opts.lastModifiedBy)
                  .map((user) => `${user.firstName} ${user.lastName}`)
                  .join(',')
              : undefined,
          search: opts.search,
          sort: opts.sort,
          properties:
            opts.propertyFilters && opts.propertyFilters.length > 0
              ? JSON.stringify(
                  opts.propertyFilters.map((filter) => ({
                    ...filter,
                    value:
                      typeof filter.value === 'boolean'
                        ? String(filter.value)
                        : filter.value,
                  })),
                )
              : undefined,
          pageSize: 5000,
        });
        if (!cancelled) {
          setResolvedBulkUuids(allData.results.map((c) => c.uuid));
        }
      } catch {
        if (!cancelled) {
          const { toast } = await import('@components');
          toast.error('Failed to load all concepts for bulk edit');
          setIsBulkEditOpen(false);
        }
      } finally {
        if (!cancelled) setIsResolvingUuids(false);
      }
    };

    fetchAllUuids();
    return () => {
      cancelled = true;
    };
  }, [isBulkEditOpen, isAllAcrossPagesSelected, filterOptions]);

  const bulkEditUuids = isAllAcrossPagesSelected
    ? (resolvedBulkUuids ?? selectedConceptUuids)
    : selectedConceptUuids;

  return (
    <>
      {/* Table */}
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
          <Table table={table} hasHorizontalScroll={hasHorizontalScroll} />
        )}
      </Container.ConceptTableWrapper>

      {/* Bulk Edit Modal */}
      <BulkEditConceptsModal
        isOpen={isBulkEditOpen && !isResolvingUuids}
        onClose={() => setIsBulkEditOpen(false)}
        selectedConceptUuids={bulkEditUuids}
        onSuccess={clearSelection}
        onRescoreStarted={handleRescoreStarted}
      />
    </>
  );
};

export default BankConcepts;
