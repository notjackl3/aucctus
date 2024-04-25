import { FunctionComponent, ReactNode, useMemo } from 'react';
import styles from './dropdown.module.scss';
import { useState } from 'react';

export interface Option {
  label: ReactNode;
  displayLabel: ReactNode;
  value: string;
}

interface DropdownProps {
  options: Option[];
  selected?: string;
  onSelect: (value: string) => void;
}

const Dropdown: FunctionComponent<DropdownProps> = ({ options, onSelect, selected }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(() => options.find((option) => option.value === selected), [options, selected]);

  const handleSelect = (option: Option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

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
