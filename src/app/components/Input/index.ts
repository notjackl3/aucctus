import CheckBox from './CheckBox';
import ConceptIgnition from './ConceptIgnition';
import Default from './DebounceInput';
import Field from './InputField/InputField';
import Search from './SearchField';
import TextArea from './TextArea/TextArea';

(Default as any).CheckBox = CheckBox;
(Default as any).ConceptIgnition = ConceptIgnition;
(Default as any).Search = Search;
(Default as any).TextArea = TextArea;
(Default as any).Field = Field;

const Input = Default as typeof Default & {
  CheckBox: typeof CheckBox;
  Search: typeof Search;
  TextArea: typeof TextArea;
  Field: typeof Field;
  ConceptIgnition: typeof ConceptIgnition;
};

export default Input;
