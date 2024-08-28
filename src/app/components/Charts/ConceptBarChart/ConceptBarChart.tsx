import utils from '@libs/utils';
import { ACTIVE_CONCEPT_STATUS_LIST } from '@libs/utils/concepts';
import { FunctionComponent, useMemo } from 'react';
import { ActiveConceptStatus, ConceptStatus } from '../../../../libs/api/types';
import ChartBar from './components/Bar';
import ChartLongArrow from './components/ChartLongArrow';
import ChartShortArrows from './components/ChartShortArrows';
import styles from './styles/conceptBarChart.module.scss';

const BAR_COLOR: Record<ActiveConceptStatus, string> = {
  prototyping: '#B9E6FE',
  proofOfConcept: '#84ADFF',
  minimumViableProduct: '#A4BCFD',
  commercialized: '#C3B5FD',
};

export interface IConceptBarChartProps {
  data?: { [key in ConceptStatus | 'total']: number };
}

export const BAR_WIDTH = 170;
export const MAX_BAR_HEIGHT = 200;

export const CHART_WIDTH = 670;
export const CHART_HEIGHT = 327;
export const LABEL_HEIGHT = 127;

const defaultData = {
  new: 0,
  ideating: 0,
  inReview: 0,
  prototyping: 0,
  proofOfConcept: 0,
  minimumViableProduct: 0,
  commercialized: 0,
  archived: 0,
  total: 0,
};

const ConceptBarChart: FunctionComponent<IConceptBarChartProps> = ({
  data = defaultData,
}) => {
  const maxValue = useMemo(() => {
    return ACTIVE_CONCEPT_STATUS_LIST.reduce((result, status) => {
      return data[status] > result ? data[status] : result;
    }, 0);
  }, [data]);

  const isDisplayBarChart = maxValue > 0;

  return (
    <div className={styles.conceptBarChart}>
      <svg
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        fill='none'
      >
        {data
          ? ACTIVE_CONCEPT_STATUS_LIST.map((status, i) => {
              const value = data[status];

              const ratio = value / maxValue;
              const originalOffset = LABEL_HEIGHT + MAX_BAR_HEIGHT;
              const height = ratio ? MAX_BAR_HEIGHT * ratio : 0;
              const y = originalOffset - height;

              return (
                <ChartBar
                  key={`chart-bar-${i}`}
                  chartHeight={CHART_HEIGHT}
                  width={BAR_WIDTH}
                  height={height}
                  x={i * BAR_WIDTH}
                  y={y}
                  value={data[status]}
                  label={utils.string.camelCaseToTitleCase(status)}
                  color={BAR_COLOR[status]}
                />
              );
            })
          : null}
        {isDisplayBarChart ? <ChartShortArrows data={data} /> : null}
        {isDisplayBarChart ? <ChartLongArrow data={data} /> : null}
      </svg>
    </div>
  );
};

export default ConceptBarChart;
