import { useState } from 'react';
import { IConceptCreate } from '../../../../libs/api/types';
import { useMutation, useQueryClient } from 'react-query';
import api from '../../../../libs/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { RowSelectionState } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import { defaultToastConfig } from '../../../../libs/toast';
import { AppPath } from '../../../../routes/routes';
import useIgniteConcept from '../../IgniteConcept/hooks/useIgniteConcept';

const useGeneratedConcepts = () => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const generatedConceptData = location?.state?.concepts;
  const goalString = location?.state?.goal || '';

  const { isIgniteLoading, generateConcepts } = useIgniteConcept(generatedConceptData, goalString);
  const createConceptMutation = useMutation({
    mutationFn: async (conceptObj: IConceptCreate[]) => {
      return api.concept.batchCreateConcepts(conceptObj);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      navigate(`${AppPath.ConceptCategory}?category=draft`);
    },
    onError: () => {
      toast.error('Concepts could not be saved. Please try again later.', defaultToastConfig);
    },
  });

  const getFormattedConceptRequest = (
    originalConceptList: IConceptCreate[],
    rowSelection: RowSelectionState
  ): IConceptCreate[] => {
    const selectedConceptList = originalConceptList?.map((concept, index) => {
      if (rowSelection[index]) {
        return {
          ...concept,
        };
      } else {
        return {
          title: '',
          description: '',
        };
      }
    });
    return selectedConceptList?.filter((concept) => !!concept?.title && !!concept?.description);
  };

  const newConceptsToSave = getFormattedConceptRequest(generatedConceptData, rowSelection);

  const saveNewConcepts = () => {
    createConceptMutation.mutate(newConceptsToSave);
  };

  const numberSelectedConcepts = newConceptsToSave?.length ? String(newConceptsToSave?.length) : '';

  return {
    isIgniteLoading,
    isSaveConceptLoading: createConceptMutation?.isLoading,
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

export default useGeneratedConcepts;
