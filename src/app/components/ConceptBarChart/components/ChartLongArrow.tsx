import { FunctionComponent, useMemo } from 'react';
import { BAR_WIDTH } from '../ConceptBarChart';
import { ConceptStatus } from '../../../../libs/api/typings';
import { calculatePercent } from '../../../../libs/utils';
import { ACTIVE_CONCEPT_STATUS_LIST } from '../../../../libs/concepts';

export interface ChartLongArrow {
  data: { [key in ConceptStatus | 'total']: number };
}
const defaultProps = {
  dominantBaseline: 'middle',
  fill: 'white',
  fontFamily: 'Plus Jakarta, sans-serif',
  fontSize: '10',
};
const ChartLongArrow: FunctionComponent<ChartLongArrow> = ({ data }) => {
  const percentList = useMemo(() => {
    const totalActiveConcepts = ACTIVE_CONCEPT_STATUS_LIST.reduce((result, status) => {
      return data[status] + result;
    }, 0);

    const proofOfConceptPercent = calculatePercent(data.proofOfConcept, totalActiveConcepts);
    const minimumViableProductPercent = calculatePercent(data.minimumViableProduct, totalActiveConcepts);
    const commercializedPercent = calculatePercent(data.commercialized, totalActiveConcepts);
    return [proofOfConceptPercent, minimumViableProductPercent, commercializedPercent];
  }, [data]);

  return (
    <svg x="160" y="275" width="381" height="19" viewBox="0 0 381 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.46464 0.522705C1.55117 0.522705 0 2.07388 0 3.98735V15.5362C0 17.4496 1.55116 19.0008 3.46463 19.0008H371.872C373.077 19.0008 374.138 18.3855 374.759 17.4519V17.7068L379.291 11.9127C380.278 10.6509 380.271 8.877 379.274 7.62279L374.759 1.93972V2.07158C374.138 1.138 373.077 0.522705 371.872 0.522705H3.46464Z"
        fill="#4318FF"
      />
      {percentList && percentList.length > 0
        ? percentList.map((percent, i) => {
            const xCoord = 5 + i * BAR_WIDTH;
            return (
              <text key={`long-arrow-percent-${i}`} x={xCoord} y="55%" {...defaultProps}>
                {percent}%
              </text>
            );
          })
        : null}
    </svg>
  );
};

export default ChartLongArrow;
