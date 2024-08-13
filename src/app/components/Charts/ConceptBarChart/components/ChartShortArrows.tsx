import { ConceptStatus } from '@libs/api/types';
import utils from '@libs/utils';
import { FunctionComponent, useMemo } from 'react';
import { BAR_WIDTH } from '../ConceptBarChart';

export interface ChartLongArrow {
  data: { [key in ConceptStatus | 'total']: number };
}
const defaultTextProps = {
  dominantBaseline: 'middle',
  fill: 'white',
  textAnchor: 'middle',
  fontSize: '10',
};

const defaultProps = {
  fill: '#4318FF',
};
const ChartShortArrows: FunctionComponent<ChartLongArrow> = ({ data }) => {
  const percentList = useMemo(() => {
    const proofOfConceptPercent = utils.number.calculatePercent(data.proofOfConcept, data.prototyping);
    const minimumViableProductPercent = utils.number.calculatePercent(data.minimumViableProduct, data.proofOfConcept);
    const commercializedPercent = utils.number.calculatePercent(data.commercialized, data.minimumViableProduct);

    return [proofOfConceptPercent, minimumViableProductPercent, commercializedPercent];
  }, [data]);

  return (
    <>
      {percentList.map((percent, i) => (
        <svg
          key={`arrow-percent-${i}`}
          width='35'
          height='19'
          x={(i + 1) * BAR_WIDTH - 10}
          y='240'
          viewBox='0 0 35 19'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M3.46464 0C1.55117 0 0 1.55117 0 3.46464V15.0134C0 16.9269 1.55117 18.4781 3.46464 18.4781H25.9848C27.2235 18.4781 28.3103 17.8281 28.9229 16.8505V17.1861L33.4548 11.3919C34.4418 10.1301 34.435 8.35625 33.4384 7.10204L28.9229 1.41897V1.62756C28.3103 0.650023 27.2235 0 25.9848 0H3.46464Z'
            {...defaultProps}
          />
          <text x='50%' y='55%' {...defaultTextProps}>
            {percent}%
          </text>
        </svg>
      ))}
    </>
  );
};

export default ChartShortArrows;
