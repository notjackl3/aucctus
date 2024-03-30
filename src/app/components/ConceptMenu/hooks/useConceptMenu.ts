import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import api from '../../../../libs/api';
import { ConceptStatus, IConcept, IFormError } from '../../../../libs/api/typings';
import { toast } from 'react-toastify';
import { defaultToastConfig } from '../../../../libs/toast';
import { AxiosError } from 'axios';

export interface usePopupMenuProps {
  conceptId: string;
}

const useConceptMenu = ({ conceptId }: usePopupMenuProps) => {
  const queryClient = useQueryClient();

  const conceptStatusMutation = useMutation<IConcept, AxiosError<IFormError<IConcept>>, Partial<IConcept>>({
    mutationFn: async (conceptObj: Partial<IConcept>) => {
      return api.concept.updateConcept(conceptObj, conceptId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      queryClient.invalidateQueries({ queryKey: ['concepts/active'] });
      queryClient.invalidateQueries({ queryKey: [`concepts/${conceptId}`] });
    },
    onError: () => {
      toast.error('Concept could not be updated. Please try again later.', defaultToastConfig);
    },
  });

  const updateConceptStatus = (
    status: ConceptStatus,
    options?: MutateOptions<IConcept, AxiosError<IFormError<IConcept>>, Partial<IConcept>>
  ) => {
    const conceptPutObj: Partial<IConcept> = {
      status: status,
    };
    conceptStatusMutation.mutate(conceptPutObj, options);
  };

  return {
    updateConceptStatus,
  };
};

export default useConceptMenu;
