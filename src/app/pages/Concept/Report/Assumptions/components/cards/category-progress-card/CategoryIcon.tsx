import React from 'react';
import { CategoryIconProps } from './types';
import { getCategoryColors } from '../../../constants/categoryColors';
import { DollarSign, Heart, HelpCircle, Settings, Waves } from 'lucide-react';

const CategoryIcon: React.FC<CategoryIconProps> = ({ category }) => {
  const categoryColors = getCategoryColors(category);

  switch (category) {
    case 'desirability':
      return <Heart className={`${categoryColors.stroke} h-5 w-5`} />;
    case 'feasibility':
      return <Settings className={`${categoryColors.stroke} h-5 w-5`} />;
    case 'viability':
      return <DollarSign className={`${categoryColors.stroke} h-5 w-5`} />;
    case 'adaptability':
      return <Waves className={`${categoryColors.stroke} h-5 w-5`} />;
    default:
      return <HelpCircle className='aucctus-stroke-tertiary h-5 w-5' />;
  }
};

export default CategoryIcon;
