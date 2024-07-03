import { FunctionComponent } from 'react';
import { MarketMetricType } from '../../../libs/api/types';
import { formatter } from '../../../libs/utils';

interface IMarketLegendProps {
  tam: number;
  sam: number;
  som: number;
}

const MarketLegend: FunctionComponent<IMarketLegendProps> = ({ tam, sam, som }) => {
  return (
    <div className='flex w-full flex-col gap-4'>
      <MarketLegendItem title='Total Addressable Market' metricType='TAM' value={formatter.format(tam)} />
      <MarketLegendItem title='Serviceable Addressable Market' metricType='SAM' value={formatter.format(sam)} />
      <MarketLegendItem title='Serviceable Obtainable Market' metricType='SOM' value={formatter.format(som)} />
    </div>
  );
};

export interface MarketLegendItemProps {
  title: string;
  value: number | string;
  metricType: MarketMetricType;
}

const METRIC_TYPE_COLOR_MAP: Record<MarketMetricType, string> = {
  SOM: 'bg-primary-600',
  SAM: 'bg-primary-450',
  TAM: 'bg-primary-250',
};

const MarketLegendItem: FunctionComponent<MarketLegendItemProps> = ({ value, title, metricType }) => {
  return (
    <div className='inline-flex h-4 w-full items-center justify-start gap-2'>
      <div className='flex items-center justify-start gap-2.5'>
        <div className={`h-4 w-4 ${METRIC_TYPE_COLOR_MAP[metricType]} rounded-full`}></div>
      </div>
      <div className='shrink grow basis-0 text-xs font-medium leading-none text-indigo-900'>{title}</div>
      <div className='text-xs font-medium leading-none text-indigo-900'>{value}</div>
    </div>
  );
};

export default MarketLegend;
