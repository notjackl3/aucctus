import ActionsMenuButton from './ActionsMenuButton';
import RadioButtonGroup from './RadioButtonGroup';
import Default from './Button';
import Collapsible from './Collapsible';
import ConceptGenerate from './ConceptGenerateButton';
import Dropdown from './Dropdown/Dropdown';
import RadioGroup from './RadioGroup';

// Attach other components as properties to Default

(Default as any).Dropdown = Dropdown;
(Default as any).ActionsMenuButton = ActionsMenuButton;
(Default as any).RadioButtonGroup = RadioButtonGroup;
(Default as any).Collapsible = Collapsible;
(Default as any).ConceptGenerate = ConceptGenerate;
(Default as any).RadioGroup = RadioGroup;

const Button = Default as typeof Default & {
  Dropdown: typeof Dropdown;
  Collapsible: typeof Collapsible;
  ConceptGenerate: typeof ConceptGenerate;
  RadioGroup: typeof RadioGroup;
  RadioButtonGroup: typeof RadioButtonGroup;
  ActionsMenuButton: typeof ActionsMenuButton;
};

export default Button;
