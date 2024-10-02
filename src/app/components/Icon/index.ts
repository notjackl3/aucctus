import LoadingSpinner from './LoadingSpinner';
import AssumptionCategory from './AssumptionCategoryIcon';
import Feature from './FeatureIcon';
import Default from './Icon/Icon';
import RotatingIcon from './RotatingIcon';

import Tooltip from './Tooltip';

(Default as any).Feature = Feature;
(Default as any).LoadingSpinner = LoadingSpinner;
(Default as any).AssumptionCategory = AssumptionCategory;
(Default as any).RotatingIcon = RotatingIcon;
(Default as any).Tooltip = Tooltip;

const Icon = Default as typeof Default & {
  Feature: typeof Feature;
  Tooltip: typeof Tooltip;
  RotatingIcon: typeof RotatingIcon;
  AssumptionCategory: typeof AssumptionCategory;
  LoadingSpinner: typeof LoadingSpinner;
};

export default Icon;
