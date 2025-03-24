import Assumptions from './Assumptions';
import Column from './Columns';
import ConceptBank from './ConceptBank';
import Header from './Header';
import Pagination from './Pagination';
import Row from './Row';
import SeedBank from './SeedBank';
import Default from './Table';

// Attach other components as properties to Default
(Default as any).ConceptBank = ConceptBank;
(Default as any).SeedBank = SeedBank;
(Default as any).Header = Header;
(Default as any).Row = Row;
(Default as any).Pagination = Pagination;
(Default as any).Column = Column;
(Default as any).Assumptions = Assumptions;

const Table = Default as typeof Default & {
  ConceptBank: typeof ConceptBank;
  Header: typeof Header;
  Row: typeof Row;
  Pagination: typeof Pagination;
  Column: typeof Column;
  Assumptions: typeof Assumptions;
  SeedBank: typeof SeedBank;
};

export default Table;
