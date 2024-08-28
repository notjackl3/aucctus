import Feature from './FeatureIcon';
import Default from './Icon/Icon';

import Tooltip from './Tooltip';

(Default as any).Feature = Feature;
(Default as any).Tooltip = Tooltip;

const Icon = Default as typeof Default & {
  Feature: typeof Feature;
  Tooltip: typeof Tooltip;
};

export default Icon;
