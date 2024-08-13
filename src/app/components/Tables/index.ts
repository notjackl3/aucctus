import ConceptBank from './ConceptBank';
import Header from './Header';
import Default from './Table';
import Row from './Row';
import Pagination from './Pagination';

// Attach other components as properties to Default
(Default as any).ConceptBank = ConceptBank;
(Default as any).Header = Header;
(Default as any).Row = Row;
(Default as any).Pagination = Pagination;

const Table = Default as typeof Default & {
  ConceptBank: typeof ConceptBank;
  Header: typeof Header;
  Row: typeof Row;
  Pagination: typeof Pagination;
};

export default Table;
