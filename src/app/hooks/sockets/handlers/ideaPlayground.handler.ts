import { useSocketEvent } from '../aucctus';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../../query/query-keys';

export const useIdeaPlaygroundHandler = () => {
  const queryClient = useQueryClient();

  useSocketEvent<'idea_playground.concepts.generated.user'>(
    'idea_playground.concepts.generated.user',
    (message: any) => {
      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.ideaPlaygroundGeneratedIdeas,
          message.seedUuid,
        ],
      });
    },
  );
};
