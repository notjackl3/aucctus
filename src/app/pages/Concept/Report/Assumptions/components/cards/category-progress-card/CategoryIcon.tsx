import React from 'react';
import { Icon } from '@components';
import { CategoryIconProps } from './types';
import { getCategoryColors } from '../../../constants/categoryColors';

const CategoryIcon: React.FC<CategoryIconProps> = ({ category }) => {
  const categoryColors = getCategoryColors(category);

  switch (category) {
    case 'desirability':
      return (
        <Icon variant='heart' className={`${categoryColors.stroke} h-5 w-5`} />
      );
    case 'feasibility':
      return (
        <Icon variant='gear' className={`${categoryColors.stroke} h-5 w-5`} />
      );
    case 'viability':
      return (
        <Icon
          variant='currency-dollar'
          className={`${categoryColors.stroke} h-5 w-5`}
        />
      );
    case 'adaptability':
      return (
        <Icon variant='waves' className={`${categoryColors.stroke} h-5 w-5`} />
      );
    default:
      return (
        <Icon
          variant='help-circle'
          className='aucctus-stroke-tertiary h-5 w-5'
        />
      );
  }
};

export default CategoryIcon;
