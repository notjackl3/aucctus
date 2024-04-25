import { useState } from 'react';
import { IConceptGenerate } from '../../../../libs/api/types';
import { useMutation, useQueryClient } from 'react-query';
import api from '../../../../libs/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { defaultToastConfig } from '../../../../libs/toast';
import { AppPath } from '../../../../routes/routes';

const useIgniteConcept = (originalConcepts = [], originalGoalString = '') => {
  const [goalString, setGoalString] = useState<string>(originalGoalString);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const generateConceptMutation = useMutation({
    mutationFn: async (conceptObj: IConceptGenerate) => {
      return api.conceptIgnite.igniteConcepts(conceptObj);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      navigate(AppPath.GeneratedConcepts, {
        state: { concepts: [...originalConcepts, ...data?.concepts], goal: goalString },
      });
    },
    onError: () => {
      toast.error('Concept could not be generated. Please try again later.', defaultToastConfig);
    },
  });

  const generateConcepts = (goalString: string) => {
    const conceptGenerateObj: IConceptGenerate = {
      goal: goalString,
    };
    generateConceptMutation.mutate(conceptGenerateObj);
  };

  return {
    isIgniteLoading: generateConceptMutation?.isLoading,
    goalString,
    setGoalString,
    generateConcepts,
  };
};

export default useIgniteConcept;
