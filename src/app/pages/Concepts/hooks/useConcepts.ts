import { useEffect, useState } from 'react';
import { IConcept, ConceptStatus, ConceptCategory } from '../../../../libs/api/typings';
import { useQuery } from 'react-query';
import api from '../../../../libs/api';
import { useParams } from 'react-router-dom';
import { IConceptQueryOptions } from '../../../../libs/api/endpoints';
import { RowSelectionState } from '@tanstack/react-table';

type ConceptStatusFilter = ConceptStatus | '';

const FIRST_PAGE = 1;

const useConcepts = () => {
  const [activeFilter, setActiveFilter] = useState<ConceptStatusFilter>('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [excludeIdSet, setExcludeIdSet] = useState(new Set());
  const [isEntireCategorySelected, setIsEntireCategorySelected] = useState(false);
  const [openPopupMenuId, setOpenPopupMenuId] = useState('');
  const [activePage, setActivePage] = useState(FIRST_PAGE);

  const { category } = useParams<{ category: ConceptCategory }>();
  const { data } = useQuery({
    queryKey: ['concepts/active', category],
    retry: 1,
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    queryFn: async () => {
      activateFilter('');
      const queryOptionsObj: IConceptQueryOptions = {
        ...(category && { category }),
        page: FIRST_PAGE,
      };
      return api.concept.getConcepts(queryOptionsObj);
    },
  });

  const resetSelections = () => {
    setRowSelection({});
    setIsEntireCategorySelected(false);
    setExcludeIdSet(new Set());
    setActivePage(FIRST_PAGE);
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
    setIsEntireCategorySelected(!isAllRowsSelected);
  };

  const clearPopupMenuId = () => {
    selectPopupMenuId('');
  };

  const selectPopupMenuId = (conceptId: string) => {
    if (conceptId === openPopupMenuId) {
      setOpenPopupMenuId('');
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

  const conceptStatusList = getStatusList(data ? data.results : []);
  const categoryCount = data ? data.count : 0;

  return {
    activeFilter,
    category,
    categoryCount,
    rowSelection,
    excludeIdSet,
    isEntireCategorySelected,
    activePage,
    addExcludedId,
    removeExcludedId,
    modifyExclusionSet,
    openPopupMenuId,
    getStatusList,
    activateFilter,
    setExcludeIdSet,
    setRowSelection,
    toggleIsEntireCategorySelectedFlag,
    selectPopupMenuId,
    clearPopupMenuId,
    setActivePage,
    conceptStatusList,
  };
};

export default useConcepts;
