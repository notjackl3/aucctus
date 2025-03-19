import { IFormError } from '@libs/api/types';
import analytics from '@libs/telemetry';
import utils from '@libs/utils';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

// Common useMutation hook
export function useGenericConceptMutate<T, K = Partial<T> & { uuid: string }>(
  mutationFunction: (data: K) => Promise<T>,
  queryKeys: string[][],
) {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError<IFormError<T>>, K>({
    mutationFn: mutationFunction,
    onSuccess: () => {
      Promise.all(
        queryKeys.map((queryKey) => [
          queryClient.invalidateQueries({
            queryKey: queryKey,
          }),
        ]),
      );
    },
    onError: (e) => {
      analytics.debug(`Error:`, e);
      const message = utils.osiris.parseFormError(e);
      toast.error(message);
    },
  });
}

// Common useMutation hook
export function useGenericMutate<T, K = Partial<T>>(
  mutationFunction: (data: K) => Promise<T>,
  queryKeys: string[][],
) {
  const queryClient = useQueryClient();

  return useMutation<T, AxiosError<IFormError<T>>, K>({
    mutationFn: mutationFunction,
    onSuccess: () => {
      Promise.all(
        queryKeys.map((queryKey) => [
          queryClient.invalidateQueries({
            queryKey: queryKey,
          }),
        ]),
      );
    },
    onError: (e) => {
      analytics.debug(`Error:`, e);
      const message = utils.osiris.parseFormError(e);
      toast.error(message);
    },
  });
}
