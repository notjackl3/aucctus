import { Container, Table } from '@components';
import {
  ISeedFilterOptions,
  useSeedsBank,
} from '@hooks/tables/concept-seed.hook';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

// Define type for context being passed from parent
type ConceptBankContextType = {
  filterOptions: ISeedFilterOptions;
  updateTableFiltering: (value: Partial<ISeedFilterOptions>) => void;
};

const BankSeeds: React.FC = () => {
  // Get context from parent
  const { filterOptions, updateTableFiltering } =
    useOutletContext<ConceptBankContextType>();

  const { table, page, setPage, numberOfPages, isLoading } = useSeedsBank(
    filterOptions,
    updateTableFiltering,
  );

  return (
    <>
      {/* Search and filter controls moved to parent */}

      {/* Table now contains only the data display and pagination */}
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
    </>
  );
};

export default BankSeeds;
