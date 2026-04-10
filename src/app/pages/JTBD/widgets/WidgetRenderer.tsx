import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
import React from 'react';

import { CardListWidget } from './CardListWidget';
import { MarketSizingWidget } from './MarketSizingWidget';
import { MetricChartWidget } from './MetricChartWidget';
import { SocialPostWidget } from './SocialPostWidget';
import { SparklineStatWidget } from './SparklineStatWidget';
import { StatListWidget } from './StatListWidget';
import { SurveyWidget } from './SurveyWidget';
import { TrendChartWidget } from './TrendChartWidget';

interface WidgetRendererProps {
  widget: IJTBDCustomWidget;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  switch (widget.widgetType) {
    case 'metric_chart':
      return <MetricChartWidget widget={widget} />;
    case 'trend_chart':
      return <TrendChartWidget widget={widget} />;
    case 'card_list':
      return <CardListWidget widget={widget} />;
    case 'stat_list':
      return <StatListWidget widget={widget} />;
    case 'social_post':
      return <SocialPostWidget widget={widget} />;
    case 'survey':
      return <SurveyWidget widget={widget} />;
    case 'sparkline_stat':
      return <SparklineStatWidget widget={widget} />;
    case 'market_sizing':
      return <MarketSizingWidget widget={widget} />;
    default:
      return null;
  }
};
