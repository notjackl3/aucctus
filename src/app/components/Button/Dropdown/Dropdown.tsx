import { FunctionComponent, ReactNode, useMemo, useState } from 'react';
import Icon from '../../Icon/Icon/Icon';
import styles from './dropdown.module.scss';

export interface Option {
  label: ReactNode;
  displayLabel: ReactNode;
  value: string;
}

interface DropdownProps {
  options: Option[];
  selected?: string;
  onSelect: (value: string) => void;

  hidePadding?: boolean;
  chevronColor?: string;
  hideChevron?: boolean;
}

const Dropdown: FunctionComponent<DropdownProps> = ({
  options,
  onSelect,
  selected,
  chevronColor,
  hidePadding = false,

  hideChevron = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selected),
    [options, selected],
  );

  const handleSelect = (option: Option) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdown}>
      <div
        className={`${styles.dropdownToggle} ${hidePadding ? styles.noPadding : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {selectedOption ? selectedOption.displayLabel : 'Select an option'}
        </span>
        {!hideChevron ? (
          <Icon
            variant={!isOpen ? 'chevrondown' : 'chevronup'}
            stroke={chevronColor}
          />
        ) : null}
      </div>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {options.map((option, index) => (
            <div
              key={`${option.label}${index}`}
              className={styles.dropdownItem}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
