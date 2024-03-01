import { useState } from 'react';
import { IConcept, ConceptStatus, ConceptCategory } from '../../../../libs/api/typings';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import { useParams } from 'react-router-dom';
import { IConceptQueryOptions } from '../../../../libs/api/endpoints';
import { IConceptStatusProps } from '../../../components/ConceptStatus/ConceptStatus';

type ConceptStatusFilter = ConceptStatus | '';

type StatusColor = {
  [key in ConceptStatus]: IConceptStatusProps['color'];
};

const useConcepts = () => {
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

  const [activeFilter, setActiveFilter] = useState<ConceptStatusFilter>('');

  const statusColorObj: StatusColor = {
    ideating: 'blue',
    in_review: 'blue',
    commercialized: 'green',
    prototyping: 'purple',
    proof_of_concept: 'purple',
    minimum_viable_product: 'pink',
    archived: 'red',
  };

  const activateFilter = (filter: ConceptStatusFilter) => {
    setActiveFilter(filter);
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
    statusColorObj,
    category,
    categoryCount,
    getStatusList,
    activateFilter,
    conceptStatusList,
  };
};

export default useConcepts;
