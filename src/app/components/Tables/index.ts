import ConceptBank from './ConceptBank';
import Header from './Header';
import Default from './Table';
import CheckBox from './TableCheckBox';
import Row from './TableRow';

// Attach other components as properties to Default
(Default as any).ConceptBank = ConceptBank;
(Default as any).Header = Header;
(Default as any).CheckBox = CheckBox;
(Default as any).Row = Row;

const Table = Default as typeof Default & {
  ConceptBank: typeof ConceptBank;
  Header: typeof Header;
  CheckBox: typeof CheckBox;
  Row: typeof Row;
};

export default Table;
