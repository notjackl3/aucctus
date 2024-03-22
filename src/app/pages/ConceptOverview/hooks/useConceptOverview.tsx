import React from 'react';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import ConceptStatusDropdown from '../../../components/ConceptStatusDropdown';
import { Option } from '../../../components/Dropdown/Dropdown';
import { ConceptStatus as ConceptStatusType } from '../../../components/ConceptMenu/ConceptMenu';
import useConceptMenu from '../../../components/ConceptMenu/hooks/useConceptMenu';

export const CONCEPT_TABS = [
  { label: 'Overview' },
  { label: 'Market Scan' },
  { label: 'Financial Projection' },
  { label: 'Customer Profile' },
  { label: 'Key Assumptions' },
];

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

  const customerQuery = useQuery({
    queryKey: [`concept/${conceptId}/customer-profile`],
    retry: 1,
    queryFn: async () => await api.concept?.getConceptCustomerProfiles(conceptId || ''),
  });

  const marketQuery = useQuery({
    queryKey: [`concept/${conceptId}/market-scan`],
    retry: 1,
    queryFn: async () => await api.concept?.getConceptMarketScan(conceptId || ''),
  });

  const financialQuery = useQuery({
    queryKey: [`concept/${conceptId}/financial`],
    retry: 1,
    queryFn: async () => await api.concept?.getConceptFinancialProjection(conceptId || ''),
  });

  const options = [
    {
      label: <ConceptStatusDropdown status={ConceptStatusType.new} />,
      displayLabel: <ConceptStatusDropdown status={ConceptStatusType.new} isActive />,
      value: ConceptStatusType.new,
    },
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

  const conceptCustomerData = customerQuery?.data?.results || [];
  const isConceptCustomerLoading = overviewQuery?.isLoading;

  const conceptMarketData = marketQuery?.data;
  const isConceptMarketLoading = overviewQuery?.isLoading;

  const conceptFinancialData = financialQuery.data;
  const isConceptFinancialLoading = financialQuery?.isLoading;

  return {
    tabs: CONCEPT_TABS,
    options,
    conceptData,
    conceptOverviewData,
    isConceptOverviewLoading,
    conceptCustomerData,
    isConceptCustomerLoading,
    conceptMarketData,
    isConceptMarketLoading,
    conceptFinancialData,
    isConceptFinancialLoading,
    changeConceptStatus,
    initialOption,
  };
};

export default useConceptOverview;
