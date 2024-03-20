import React from 'react';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import ConceptStatusDropdown from '../../../components/ConceptStatusDropdown';
import { Option } from '../../../components/Dropdown/Dropdown';
import { ConceptStatus as ConceptStatusType } from '../../../components/ConceptMenu/ConceptMenu';
import useConceptMenu from '../../../components/ConceptMenu/hooks/useConceptMenu';

const useConceptOverview = (conceptId: string) => {
  const { updateConceptStatus } = useConceptMenu({ conceptId: conceptId });

  const conceptGeneralQuery = useQuery({
    queryKey: ['concepts', 'overview'],
    retry: 1,
    queryFn: async () => await api.concept?.getConcept(conceptId || ''),
  });

  const overviewQuery = useQuery({
    queryKey: [`concept/overview/${conceptId}`],
    retry: 1,
    queryFn: async () => await api.concept?.getConceptOverview(conceptId || ''),
  });

  const tabs = [
    { label: 'Overview' },
    { label: 'Market Scan' },
    { label: 'Financial Projection' },
    { label: 'Customer Profile' },
    { label: 'Key Assumptions' },
  ];

  const options = [
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.ideating} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.ideating} isActive />,
      value: ConceptStatusType.ideating,
    },
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.inReview} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.inReview} isActive />,
      value: ConceptStatusType.inReview,
    },
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.prototyping} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.prototyping} isActive />,
      value: ConceptStatusType.prototyping,
    },
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.proofOfConcept} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.proofOfConcept} isActive />,
      value: ConceptStatusType.proofOfConcept,
    },
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.minimumViableProduct} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.minimumViableProduct} isActive />,
      value: ConceptStatusType.minimumViableProduct,
    },
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.commercialized} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.commercialized} isActive />,
      value: ConceptStatusType.commercialized,
    },
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.archived} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.archived} isActive />,
      value: ConceptStatusType.archived,
    },
  ];

  const changeConceptStatus = (option: Option) => {
    updateConceptStatus(option?.value as ConceptStatusType);
  };

  const getInitialOption = (status: ConceptStatusType | undefined) => {
    if (conceptId !== conceptGeneralQuery?.data?.uuid) {
      return;
    }
    for (const option of options) {
      if (option?.value && option.value === status) {
        return option;
      }
    }
  };

  const activeStatus = conceptGeneralQuery?.data?.status;
  const initialOption = getInitialOption(activeStatus);
  const conceptData = conceptGeneralQuery?.data;

  const conceptOverviewData = overviewQuery?.data;
  const isConceptOverviewLoading = overviewQuery?.isLoading;

  return {
    tabs,
    options,
    conceptData,
    conceptOverviewData,
    isConceptOverviewLoading,
    changeConceptStatus,
    initialOption,
  };
};

export default useConceptOverview;
