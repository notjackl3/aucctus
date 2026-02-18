import { Container, Table } from '@components';
import { Pencil } from 'lucide-react';
import BulkEditConceptsModal from '@components/Modal/BulkEditConceptsModal/BulkEditConceptsModal';
import { useBulkPrioritySocketEvents } from '@hooks/query/concept-priority.hook';
import {
  IConceptFilterOptions,
  useConceptBank,
} from '@hooks/tables/concept-bank.hook';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

// Define type for context being passed from parent
type ConceptBankContextType = {
  filterOptions: IConceptFilterOptions;
  updateTableFiltering: (value: Partial<IConceptFilterOptions>) => void;
};

const BankConcepts: React.FC = () => {
  // Get context from parent
  const { filterOptions, updateTableFiltering } =
    useOutletContext<ConceptBankContextType>();

  const hookResult = useConceptBank(filterOptions, updateTableFiltering);

  const {
    table,
    page,
    setPage,
    numberOfPages,
    isLoading,
    selectedConceptUuids,
    setRowSelection,
  } = hookResult;

  const [isBulkEditOpen, setIsBulkEditOpen] = React.useState(false);
  const { startCalculating } = useBulkPrioritySocketEvents();

  const handleRescoreStarted = useCallback(
    (affectedConceptUuids: string[]) => {
      startCalculating(affectedConceptUuids.length);
    },
    [startCalculating],
  );

  const selectedCount = selectedConceptUuids.length;

  return (
    <>
      {/* Bulk edit toolbar */}
      <AnimatePresence>
        {selectedCount > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className='overflow-hidden'
          >
            <div className='flex items-center gap-3 pb-2'>
              <button
                className={cn(
                  'btn btn-secondary btn-sm relative flex items-center gap-2',
                )}
                onClick={() => setIsBulkEditOpen(true)}
              >
                <Pencil className='aucctus-stroke-primary h-4 w-4' />
                Edit
                <span className='aucctus-bg-brand-solid flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-medium text-white'>
                  {selectedCount}
                </span>
              </button>
              <button
                className='btn btn-no-border btn-sm aucctus-text-tertiary'
                onClick={() => setRowSelection({})}
              >
                Clear selection
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        onClose={() => setIsBulkEditOpen(false)}
        selectedConceptUuids={selectedConceptUuids}
        onSuccess={() => setRowSelection({})}
        onRescoreStarted={handleRescoreStarted}
      />
    </>
  );
};

export default BankConcepts;
