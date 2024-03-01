import { useState } from 'react';
import { IConcept, ConceptStatus, ConceptCategory } from '../../../../libs/api/typings';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import { useParams } from 'react-router-dom';
import { IConceptQueryOptions } from '../../../../libs/api/endpoints';
import { IConceptStatusProps } from '../../../components/ConceptStatus/ConceptStatus';

type ConceptStatusFilter = ConceptStatus | '';
type StatusLabel = {
  [key in ConceptStatus]: string;
};
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
