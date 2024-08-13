import Icon from '@components/Icons';
import { IConceptFilterOptions } from '@hooks/tables/concepts.hook';
import utils from '@libs/utils';

import React from 'react';

interface IFilterOptionsHeaderItemProps {
  propertyName: keyof IConceptFilterOptions;
  value: string;
}

const FilterOptionsHeaderItem: React.FC<IFilterOptionsHeaderItemProps> = ({ propertyName, value }) => {
  return (
    <span
      className={
        'flex h-full w-fit  max-w-96 items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 align-middle text-primary-600 [&>svg]:stroke-primary-600'
      }
    >
      <span className='[&>svg]:stroke-primary-600'>
        <Icon variant={getPropertyIcon(propertyName)} width={16} height={16} />
      </span>
      <span className='truncate'>{`${utils.string.camelCaseToTitleCase(propertyName)}: ${value}`}</span>
    </span>
  );
};

const getPropertyIcon = (propertyName: keyof IConceptFilterOptions): IconVariant => {
  switch (propertyName) {
    case 'status':
      return 'announcement';
    case 'createdBy':
      return 'user-group';
    default:
      return 'search-refraction';
  }
};

export default FilterOptionsHeaderItem;
