import { FunctionComponent, ReactNode, useMemo } from 'react';
import styles from './dropdown.module.scss';
import { useState } from 'react';
import Icon from '../../Icons/Icon/Icon';

export interface Option {
  label: ReactNode;
  displayLabel: ReactNode;
  value: string;
}

interface DropdownProps {
  options: Option[];
  selected?: string;
  onSelect: (value: string) => void;

  chevronColor?: string;
  hideChevron?: boolean;
}

const Dropdown: FunctionComponent<DropdownProps> = ({
  options,
  onSelect,
  selected,
  chevronColor,
  hideChevron = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(() => options.find((option) => option.value === selected), [options, selected]);

  const handleSelect = (option: Option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdown}>
      <div className={styles.dropdownToggle} onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.displayLabel : 'Select an option'}</span>
        {!hideChevron ? <Icon variant={!isOpen ? 'chevrondown' : 'chevronup'} stroke={chevronColor} /> : null}
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
