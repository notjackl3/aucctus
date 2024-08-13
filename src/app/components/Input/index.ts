import CheckBox from './CheckBox';
import Default from './DebounceInput';
import Search from './SearchField';

(Default as any).CheckBox = CheckBox;
(Default as any).Search = Search;

const Input = Default as typeof Default & {
  CheckBox: typeof CheckBox;
  Search: typeof Search;
};

export default Input;
