import { Container, Table } from '@components';
import BulkEditConceptsModal from '@components/Modal/BulkEditConceptsModal/BulkEditConceptsModal';
import { useBulkPrioritySocketEvents } from '@hooks/query/concept-priority.hook';
import {
  IConceptFilterOptions,
  useConceptBank,
} from '@hooks/tables/concept-bank.hook';
import React, { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

// Define type for context being passed from parent
type ConceptBankContextType = {
  filterOptions: IConceptFilterOptions;
  updateTableFiltering: (value: Partial<IConceptFilterOptions>) => void;
  onSelectionChange: (uuids: string[], isAll: boolean, total: number) => void;
  isBulkEditOpen: boolean;
  setIsBulkEditOpen: () => void;
  resolvedBulkUuids: string[] | null;
};

const BankConcepts: React.FC = () => {
  // Get context from parent
  const {
    filterOptions,
    updateTableFiltering,
    onSelectionChange,
    isBulkEditOpen,
    setIsBulkEditOpen,
    resolvedBulkUuids,
  } = useOutletContext<ConceptBankContextType>();

  const hookResult = useConceptBank(filterOptions, updateTableFiltering);

  const {
    table,
    page,
    setPage,
    numberOfPages,
    isLoading,
    selectedConceptUuids,
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
