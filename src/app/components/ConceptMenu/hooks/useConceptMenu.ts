import { useMutation, useQueryClient } from 'react-query';
import api from '../../../../libs/api';
import { ConceptStatus, IConcept } from '../../../../libs/api/typings';
import { toast } from 'react-toastify';
import { defaultToastConfig } from '../../../../libs/toast';

export interface usePopupMenuProps {
  conceptId: string;
}

const useConceptMenu = ({ conceptId }: usePopupMenuProps) => {
  const queryClient = useQueryClient();

  const conceptStatusMutation = useMutation({
    mutationFn: async (conceptObj: Partial<IConcept>) => {
      return api.concept.updateConcept(conceptObj, conceptId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['concepts'] });
      queryClient.invalidateQueries({ queryKey: ['concepts/active'] });
    },
    onError: () => {
      toast.error('Concept could not be updated. Please try again later.', defaultToastConfig);
    },
  });

  const updateConceptStatus = (status: ConceptStatus) => {
    const conceptPutObj: Partial<IConcept> = {
      status: status,
    };
    conceptStatusMutation.mutate(conceptPutObj);
  };

  return {
    updateConceptStatus,
  };
};

export default useConceptMenu;
