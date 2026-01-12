import ConceptVersionsButton from './ConceptVersionsButton';
import ActionsMenuButton from './ActionsMenuButton';
import RadioButtonGroup from './RadioButtonGroup';
import Default from './Button';
import Collapsible from './Collapsible';
import ConceptGenerate from './ConceptGenerateButton';
import Dropdown from './Dropdown/Dropdown';
import ProceedToPocButton from './ProceedToPocButton';
import RadioGroup from './RadioGroup';
import NaturalLanguageFilterButton from './NaturalLanguageFilterButton';

// Attach other components as properties to Default

(Default as any).Dropdown = Dropdown;
(Default as any).ConceptVersionsButton = ConceptVersionsButton;
(Default as any).ActionsMenuButton = ActionsMenuButton;
(Default as any).RadioButtonGroup = RadioButtonGroup;
(Default as any).Collapsible = Collapsible;
(Default as any).ConceptGenerate = ConceptGenerate;
(Default as any).ProceedToPoc = ProceedToPocButton;
(Default as any).RadioGroup = RadioGroup;
(Default as any).NaturalLanguageFilter = NaturalLanguageFilterButton;

const Button = Default as typeof Default & {
  Dropdown: typeof Dropdown;
  Collapsible: typeof Collapsible;
  ConceptGenerate: typeof ConceptGenerate;
  ProceedToPoc: typeof ProceedToPocButton;
  RadioGroup: typeof RadioGroup;
  RadioButtonGroup: typeof RadioButtonGroup;
  ActionsMenuButton: typeof ActionsMenuButton;
  ConceptVersionsButton: typeof ConceptVersionsButton;
  NaturalLanguageFilter: typeof NaturalLanguageFilterButton;
};

export default Button;
