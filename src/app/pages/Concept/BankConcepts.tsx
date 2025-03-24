import { Container, Table } from '@components';
import {
  IConceptFilterOptions,
  useConceptBank,
} from '@hooks/tables/concept-bank.hook';
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

  const { table, page, setPage, numberOfPages, isLoading } = useConceptBank(
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
        <Table table={table} />
      </Container.ConceptTableWrapper>
    </>
  );
};

export default BankConcepts;
