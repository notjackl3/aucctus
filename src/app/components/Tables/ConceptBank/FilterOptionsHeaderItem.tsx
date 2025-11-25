import Icon from '@components/Icon';
import { IConceptFilterOptions } from '@hooks/tables/concept-bank.hook';
import utils from '@libs/utils';

import React from 'react';

interface IFilterOptionsHeaderItemProps {
  propertyName: keyof IConceptFilterOptions | 'propertyFilter';
  value: string;
  onRemove?: () => void;
}

const FilterOptionsHeaderItem: React.FC<IFilterOptionsHeaderItemProps> = ({
  propertyName,
  value,
  onRemove,
}) => {
  // For property filters, the value already contains the full display text (e.g., "Delivery Type: Supplier")
  // so we don't need a prefix
  const isPropertyFilter = propertyName === 'propertyFilter';

  const prefix =
    propertyName === 'sort' ? removeFirstCharIfDash(value) : propertyName;
  const suffix = propertyName === 'sort' ? checkStringOrder(value) : value;

  // Determine display text
  const displayText = isPropertyFilter
    ? value // Already formatted with property name and value
    : `${utils.string.camelCaseToTitleCase(prefix)}: ${suffix}`;

  return (
    <span className='flex h-full w-fit max-w-96 items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 align-middle text-primary-600 [&>svg]:stroke-primary-600'>
      <span className='[&>svg]:stroke-primary-600'>
        <Icon variant={getPropertyIcon(propertyName)} width={16} height={16} />
      </span>
      <span className='truncate'>{displayText}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className='ml-1 rounded-full p-1 hover:bg-primary-100'
        >
          <Icon variant='closeX' width={12} height={12} />
        </button>
      )}
    </span>
  );
};

function removeFirstCharIfDash(str: string) {
  if (str.charAt(0) === '-') {
    return str.substring(1);
  }
  return str;
}

function checkStringOrder(str: string) {
  if (str.startsWith('-')) {
    return 'Descending';
  }
  return 'Ascending';
}

const getPropertyIcon = (
  propertyName: keyof IConceptFilterOptions | 'propertyFilter',
): IconVariant => {
  switch (propertyName) {
    case 'status':
      return 'loading-02';
    case 'createdBy':
      return 'user-group';
    case 'lastModifiedBy':
      return 'user-group';
    case 'sort':
      return 'switch-vertical-01';
    case 'propertyFilter':
      return 'filter-lines';
    default:
      return 'search-refraction';
  }
};

export default FilterOptionsHeaderItem;
