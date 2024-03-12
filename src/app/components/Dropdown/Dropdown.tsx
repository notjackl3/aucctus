import { FunctionComponent, ReactNode } from 'react';
import styles from './styles/dropdown.module.scss';

import { useState } from 'react';
import { ConceptStatus } from '../ConceptMenu/ConceptMenu';

export interface Option {
  label: ReactNode;
  displayLabel: ReactNode;
  value: ConceptStatus | string;
}

interface DropdownProps {
  options: Option[];
  initialOption?: Option;
  onSelect: (option: Option) => void;
}

const Dropdown: FunctionComponent<DropdownProps> = ({ options, onSelect, initialOption }) => {
  const [selectedOption, setSelectedOption] = useState<Option | undefined>(initialOption);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: Option) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  if (initialOption && !selectedOption) {
    setSelectedOption(initialOption);
  }

  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownToggle} onClick={() => setIsOpen(!isOpen)}>
        {selectedOption ? selectedOption.displayLabel : 'Select an option'}
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <div key={index} className={styles.dropdownItem} onClick={() => handleSelect(option)}>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
