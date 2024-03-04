import { useState } from 'react';
import { IConcept, ConceptStatus, ConceptCategory } from '../../../../libs/api/typings';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import { useParams } from 'react-router-dom';
import { IConceptQueryOptions } from '../../../../libs/api/endpoints';

type ConceptStatusFilter = ConceptStatus | '';

const useConcepts = () => {
  const [activeFilter, setActiveFilter] = useState<ConceptStatusFilter>('');
  const [openPopupMenuId, setOpenPopupMenuId] = useState('');

  const { category } = useParams<{ category: ConceptCategory }>();
  const allConceptsQuery = useQuery({
    queryKey: ['concepts/active', category],
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      activateFilter('');
      const queryOptionsObj: IConceptQueryOptions = { ...(category && { category }) };
      return api.concept.getConcepts(queryOptionsObj);
    },
  });

  const activateFilter = (filter: ConceptStatusFilter) => {
    setActiveFilter(filter);
  };

  const clearPopupMenuId = () => {
    selectPopupMenuId('');
  };

  const selectPopupMenuId = (conceptId: string) => {
    if (conceptId === openPopupMenuId) {
      selectPopupMenuId('');
    } else {
      setOpenPopupMenuId(conceptId);
    }
  };

  const getStatusList = (conceptList: IConcept[]): ConceptStatus[] => {
    const statusSet = new Set<ConceptStatus>();
    conceptList.forEach((concept: IConcept) => {
      const statusType = concept?.status || '';
      if (statusType) {
        statusSet.add(statusType);
      }
    });
    return Array.from(statusSet);
  };

  const conceptStatusList = getStatusList(allConceptsQuery?.data?.results || []);
  const categoryCount = allConceptsQuery?.data?.count || 0;

  return {
    activeFilter,
    category,
    categoryCount,
    openPopupMenuId,
    getStatusList,
    activateFilter,
    selectPopupMenuId,
    clearPopupMenuId,
    conceptStatusList,
  };
};

export default useConcepts;
