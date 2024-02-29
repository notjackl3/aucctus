import { useState } from 'react';
import { Concept, Concepts } from '../../../../libs/api/typings';
import { StatusColor, StatusLabel } from '../Concepts.types';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import { useParams } from 'react-router-dom';

type StatusList = string[];

const useConcepts = () => {
  const { category } = useParams();
  const allConceptsQuery = useQuery({
    queryKey: ['concepts/active', category],
    retry: 1,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      activateFilter('');
      return api.concept.getConcepts('', category);
    },
  });

  const [activeFilter, setActiveFilter] = useState<string>('');

  const statusLabelsObj: StatusLabel = {
    ideating: 'Ideating',
    in_review: 'In Review',
    commercialized: 'Commercialized',
    prototyping: 'Prototyping',
    proof_of_concept: 'Proof Of Concept',
    minimum_viable_product: 'Minimum Viable Product',
    archived: 'Archived',
  };

  const statusColorObj: StatusColor = {
    new: 'blue',
    ideating: 'blue',
    in_review: 'blue',
    commercialized: 'green',
    prototyping: 'purple',
    proof_of_concept: 'purple',
    minimum_viable_product: 'pink',
    archived: 'red',
  };

  const activateFilter = (filter: string) => {
    setActiveFilter(filter);
  };

  const getStatusList = (conceptList: Concepts): StatusList => {
    const statusSet = new Set<string>();
    conceptList.forEach((concept: Concept) => {
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
    statusLabelsObj,
    statusColorObj,
    category,
    categoryCount,
    getStatusList,
    activateFilter,
    conceptStatusList,
  };
};

export default useConcepts;
