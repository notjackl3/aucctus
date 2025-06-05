import React from 'react';
import { useFinancialProjectionV2 } from '@hooks/query/financial_projections.hook';
import FinancialProjectionV2 from './FinancialProjections/FinancialProjections';
import FinancialProjection from './FinancialDetails';
import useStore from '@stores/store';
import { IFinancialProjectionV2 } from '@libs/api/types/concept/financialProjectionV2';
import { IFinancialProjection } from '@libs/api/types/concept/financialProjection';
import { Loading } from '@components';

const FinancialProjectionsWrapper: React.FC = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const {
    financialProjectionResponse,
    isLoading: isFinancialProjectionV2Loading,
  } = useFinancialProjectionV2(activeConceptUuid);

  if (isFinancialProjectionV2Loading || !financialProjectionResponse) {
    return <Loading />;
  }

  return (
    <>
      {financialProjectionResponse.isV2 ? (
        <FinancialProjectionV2
          financialProjection={
            financialProjectionResponse.financialProjection as IFinancialProjectionV2
          }
        />
      ) : (
        <FinancialProjection
          financialProjection={
            financialProjectionResponse.financialProjection as IFinancialProjection
          }
        />
      )}
    </>
  );
};

export default FinancialProjectionsWrapper;
