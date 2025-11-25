import ColumnVisibilityMenu from './ColumnVisibilityMenu';
import PropertyCell from './PropertyCell';
import PropertyColumnHeader from './PropertyColumnHeader';
import PropertyManager from './PropertyManager';
import EditablePropertyCell from './EditablePropertyCell';
import NotionStyleColumnMenu from './NotionStyleColumnMenu';
import StaticColumnMenu from './StaticColumnMenu';
import SortsMenu from './SortsMenu';
import FiltersMenu from './FiltersMenu';

// Export subcomponents for advanced usage
export * from './FilterInputs';
export * from './MenuComponents';
export * from './InlineDropdowns';
export * from './PropertyCells';
export * from './hooks';

const PropertyColumns = {
  ColumnVisibilityMenu,
  PropertyCell,
  PropertyColumnHeader,
  PropertyManager,
  EditablePropertyCell,
  NotionStyleColumnMenu,
  StaticColumnMenu,
  SortsMenu,
  FiltersMenu,
};

export default PropertyColumns;
