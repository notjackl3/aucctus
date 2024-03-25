import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import ConceptStatusDropdown from '../../../components/ConceptStatusDropdown';
import { Option } from '../../../components/Dropdown/Dropdown';
import { ConceptStatus as ConceptStatusType } from '../../../components/ConceptMenu/ConceptMenu';
import useConceptMenu from '../../../components/ConceptMenu/hooks/useConceptMenu';
import { useLocation, useNavigate } from 'react-router-dom';

export const CONCEPT_TABS = [
  { label: 'Overview', path: 'overview' },
  { label: 'Market Scan', path: 'market-scan' },
  { label: 'Financial Projection', path: 'financial-projection' },
  { label: 'Customer Profile', path: 'customer-profile' },
  { label: 'Key Assumptions', path: 'key-assumptions' },
];

const useConceptOverview = (conceptId: string) => {
  const { updateConceptStatus } = useConceptMenu({ conceptId: conceptId });

  const conceptGeneralQuery = useQuery({
    queryKey: [`concepts/overview/${conceptId}`],
    retry: 1,
    queryFn: async () => await api.concept.getConcept(conceptId || ''),
  });

  const location = useLocation();
  const lastSegment = location.pathname.split('/').at(-1);
  const navigate = useNavigate();
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  useEffect(() => {
    const currentActiveTab = CONCEPT_TABS.findIndex((tab) => tab.path === lastSegment);
    if (typeof currentActiveTab === 'number') {
      setActiveTabIndex(currentActiveTab);
    }
  }, [lastSegment]);
  const navigateConceptTab = (tabIndex: number) => {
    setActiveTabIndex(tabIndex);
    const basePath = location.pathname.split('/').slice(0, 4).join('/');
    const newPath = `${basePath}/${CONCEPT_TABS[tabIndex].path}`;
    navigate(newPath);
  };

  const closePage = () => {
    const basePath = location.pathname.split('/').slice(0, 3).join('/');
    navigate(basePath);
  };

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

  return {
    tabs: CONCEPT_TABS,
    options,
    conceptData,
    changeConceptStatus,
    initialOption,
    activeTabIndex,
    navigateConceptTab,
    closePage,
  };
};

export default useConceptOverview;
