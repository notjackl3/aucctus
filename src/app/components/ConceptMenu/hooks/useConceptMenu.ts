import { MutateOptions, useMutation, useQueryClient } from 'react-query';
import api from '../../../../libs/api';
import { ConceptStatus, IConcept, IFormError } from '../../../../libs/api/typings';
import { toast } from 'react-toastify';
import { defaultToastConfig } from '../../../../libs/toast';
import { AxiosError } from 'axios';
import { useCallback } from 'react';

export interface usePopupMenuProps {
  conceptId: string;
}

const useConceptMenu = ({ conceptId }: usePopupMenuProps) => {
  const queryClient = useQueryClient();

  // Helper function to create mutations with common onSuccess and onError callbacks
  const createMutation = <TData, TError, TVariables>(mutationFn: (variables: TVariables) => Promise<TData>) => {
    return useMutation<TData, AxiosError<TError>, TVariables>({
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['concepts'] });
        queryClient.invalidateQueries({ queryKey: ['concepts/active'] });
        queryClient.invalidateQueries({ queryKey: [`concepts/${conceptId}`] });
      },
      onError: () => {
        toast.error('Concept could not be updated. Please try again later.', defaultToastConfig);
      },
    });
  };

  const conceptStatusMutation = createMutation<IConcept, IFormError<IConcept>, Partial<IConcept>>(
    async (conceptObj: Partial<IConcept>) => {
      const conceptStatusObj = { status: conceptObj.status };
      return api.concept.updateConcept(conceptStatusObj, conceptObj.uuid || conceptId);
    }
  );

  const conceptReportRetryMutation = createMutation<IConcept, IFormError<IConcept>, string>(
    async (conceptUuid: string) => {
      return api.concept.retryReport(conceptUuid);
    }
  );

  const retryConceptReport = useCallback(
    (conceptUuid: string, options?: MutateOptions<IConcept, AxiosError<IFormError<IConcept>>, string>) => {
      conceptReportRetryMutation.mutate(conceptUuid, options);
    },
    [conceptReportRetryMutation]
  );

  const updateConceptStatus = useCallback(
    (
      status: ConceptStatus,
      conceptId: string,
      options?: MutateOptions<IConcept, AxiosError<IFormError<IConcept>>, Partial<IConcept>>
    ) => {
      const conceptPutObj: Partial<IConcept> = {
        status: status,
        uuid: conceptId,
      };
      conceptStatusMutation.mutate(conceptPutObj, options);
    },
    [conceptStatusMutation]
  );

  return {
    updateConceptStatus,
    retryConceptReport,
  };
};

export default useConceptMenu;
