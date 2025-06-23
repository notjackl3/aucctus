import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  useAssumptions,
  useFilteredAssumptions,
} from '@hooks/query/assumptions.hook';
import { IConceptReportContext } from '@pages/Concept/Report/ConceptReport/ConceptReport';
import KeyAssumptionsCard from './KeyAssumptionsCard';
import { Loading } from '@components';

interface IAssumptionsCardWrapperProps {
  onViewClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}

const AssumptionsCardWrapper: React.FC<IAssumptionsCardWrapperProps> = ({
  onViewClick,
}) => {
  const { concept } = useOutletContext<IConceptReportContext>();

  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.assumptions || 'v1';
  const shouldUseV2 = featureVersion === 'v2';

  // V1 Hook
  const { assumptions: assumptionsV1, isLoading: isV1Loading } = useAssumptions(
    concept.uuid,
  );

  // V2 Hook with filters
  const assumptionsFilters = useMemo(
    () => ({
      page: 1,
      page_size: 20,
    }),
    [],
  );

  const { assumptions: assumptionsV2, isLoading: isV2Loading } =
    useFilteredAssumptions(concept?.identifier || '', assumptionsFilters);

  // Convert V2 assumptions to V1 format for compatibility with existing Card component
  const convertedAssumptionsV2 = useMemo(() => {
    return (
      assumptionsV2?.map((assumption) => ({
        ...assumption,
        name: assumption.statement,
        text: assumption.statement,
        importanceRationale: '',
        certaintyRationale: '',
        status: 'notStarted' as const,
        testProgress: [],
        version: 1,
      })) || []
    );
  }, [assumptionsV2]);

  // Use the appropriate data and loading state based on version
  const assumptions = shouldUseV2 ? convertedAssumptionsV2 : assumptionsV1;
  const isLoading = shouldUseV2 ? isV2Loading : isV1Loading;

  if (isLoading) {
    return (
      <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
        <Loading />
      </div>
    );
  }

  return (
    <KeyAssumptionsCard assumptions={assumptions} onViewClick={onViewClick} />
  );
};

export default AssumptionsCardWrapper;
