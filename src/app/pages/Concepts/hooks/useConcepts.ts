import { useEffect, useState } from 'react';
import { IConcept, ConceptStatus, ConceptCategory } from '../../../../libs/api/typings';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import { useParams } from 'react-router-dom';
import { IConceptQueryOptions } from '../../../../libs/api/endpoints';
import { RowSelectionState } from '@tanstack/react-table';

type ConceptStatusFilter = ConceptStatus | '';

const useConcepts = () => {
  const [activeFilter, setActiveFilter] = useState<ConceptStatusFilter>('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [excludeIdSet, setExcludeIdSet] = useState(new Set());
  const [isEntireCategorySelected, setIsEntireCategorySelected] = useState(false);
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

  const resetSelections = () => {
    setRowSelection({});
    setIsEntireCategorySelected(false);
    setExcludeIdSet(new Set());
  };

  useEffect(() => {
    resetSelections();
  }, [category]);

  const activateFilter = (filter: ConceptStatusFilter) => {
    resetSelections();
    setActiveFilter(filter);
  };

  const addExcludedId = (id: string) => {
    const newExcludedIds = new Set(excludeIdSet);
    newExcludedIds.add(id);
    setExcludeIdSet(newExcludedIds);
  };

  const removeExcludedId = (id: string) => {
    const newExcludedIds = new Set(excludeIdSet);
    newExcludedIds.delete(id);
    setExcludeIdSet(newExcludedIds);
  };

  const modifyExclusionSet = (isRowSelected: boolean, id: string) => {
    if (isRowSelected) {
      addExcludedId(id);
    } else {
      removeExcludedId(id);
    }
  };

  const toggleIsEntireCategorySelectedFlag = (isAllRowsSelected: boolean) => {
    if (isAllRowsSelected) {
      setIsEntireCategorySelected(false);
    } else {
      setIsEntireCategorySelected(true);
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
    rowSelection,
    excludeIdSet,
    isEntireCategorySelected,
    addExcludedId,
    removeExcludedId,
    modifyExclusionSet,
    getStatusList,
    activateFilter,
    setExcludeIdSet,
    setRowSelection,
    toggleIsEntireCategorySelectedFlag,
    conceptStatusList,
  };
};

export default useConcepts;
