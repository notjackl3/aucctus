import ConceptBank from './ConceptBank';
import Header from './Header';
import Default from './Table';
import Row from './TableRow';

// Attach other components as properties to Default
(Default as any).ConceptBank = ConceptBank;
(Default as any).Header = Header;
(Default as any).Row = Row;

const Table = Default as typeof Default & {
  ConceptBank: typeof ConceptBank;
  Header: typeof Header;
  Row: typeof Row;
};

export default Table;
