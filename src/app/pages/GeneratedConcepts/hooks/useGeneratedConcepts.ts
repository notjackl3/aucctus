import { useEffect, useState } from 'react';
import { IConcept, ConceptStatus, ConceptCategory } from '../../../../libs/api/typings';
import { useMutation, useQueryClient } from 'react-query';
import api from '../../../../libs/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { RowSelectionState } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import { defaultToastConfig } from '../../../../libs/toast';
import { AppPath } from '../../../../routes/routes';
import useIgniteConcept from '../../IgniteConcept/hooks/useIgniteConcept';

const useConcepts = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const generatedConceptData = location?.state?.concepts;
  const goalString = location?.state?.goal || '';

  const {
    isIgniteLoading,
    generateConcepts
  } = useIgniteConcept(generatedConceptData, goalString)

  const createConceptMutation = useMutation({
    mutationFn: async (conceptObj: Partial<IConcept>) => {
      return api.concept.batchCreateConcepts(conceptObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      navigate(AppPath.ConceptDraft)
    },
    onError: () => {
      toast.error('Concept could not be updated. Please try again later.', defaultToastConfig);
    },
  });
  
  const getFormattedConceptRequest = (originalConceptList, rowSelection) => {
    const selectedConceptList = originalConceptList?.map((concept, index) => {
      if (rowSelection[index]) {
        return {
          ...concept,
          status: 'ideating'
        };
      }
    });
    return selectedConceptList.filter(Boolean);
  };
  
  
  
  const newConceptsToSave = getFormattedConceptRequest(generatedConceptData, rowSelection);

  const saveNewConcepts = () => {
    createConceptMutation.mutate(newConceptsToSave);
  };
  
  const resetSelections = () => {
    setRowSelection({});
  };

  const numberSelectedConcepts = newConceptsToSave?.length ? String(newConceptsToSave?.length) : ''

  return {
    isIgniteLoading,
    rowSelection,
    generatedConceptData,
    numberSelectedConcepts,
    goalString,
    saveNewConcepts,
    getFormattedConceptRequest,
    generateConcepts,
    setRowSelection,
  };
};

export default useConcepts;
