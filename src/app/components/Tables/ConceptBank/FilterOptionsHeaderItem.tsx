import Icon from '@components/Icons';
import { IConceptFilterOptions } from '@hooks/tables/concepts.hook';
import utils from '@libs/utils';

import React from 'react';

interface IFilterOptionsHeaderItemProps {
  propertyName: keyof IConceptFilterOptions;
  value: string;
}

const FilterOptionsHeaderItem: React.FC<IFilterOptionsHeaderItemProps> = ({ propertyName, value }) => {
  const prefix = propertyName === 'sort' ? removeFirstCharIfDash(value) : propertyName;
  const suffix = propertyName === 'sort' ? checkStringOrder(value) : value;

  return (
    <span className='flex h-full w-fit  max-w-96 items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 align-middle text-primary-600 [&>svg]:stroke-primary-600'>
      <span className='[&>svg]:stroke-primary-600'>
        <Icon variant={getPropertyIcon(propertyName)} width={16} height={16} />
      </span>
      <span className='truncate'>{`${utils.string.camelCaseToTitleCase(prefix)}: ${suffix}`}</span>
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

const getPropertyIcon = (propertyName: keyof IConceptFilterOptions): IconVariant => {
  switch (propertyName) {
    case 'status':
      return 'loading-02';
    case 'createdBy':
      return 'user-group';
    case 'sort':
      return 'switch-vertical-01';
    default:
      return 'search-refraction';
  }
};

export default FilterOptionsHeaderItem;
