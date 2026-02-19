import { toast } from '@components';
import { useSocketEvent } from '../aucctus';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../../query/query-keys';
import useStore from '@stores/store';
import type {
  IMagicShareProgressMessage,
  IMagicShareCompletedMessage,
  IMagicShareErrorMessage,
} from '@libs/api/types';

export const useMagicShareHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  const queryClient = useQueryClient();
  const setShareProgress = useStore(
    (state) => state.magicShare.setShareProgress,
  );

  // Magic Share progress
  useSocketEvent<'magic_share.progress.account', IMagicShareProgressMessage>(
    'magic_share.progress.account',
    (message) => {
      const magicShareUuid = `${message.accountUuid}:${message.conceptUuid}`;

      setShareProgress(
        message.conceptUuid,
        message.stage,
        message.message,
        message.progress,
        undefined,
        magicShareUuid,
      );

      const stageMessages: Record<string, string> = {
        started: 'Starting Magic Share generation...',
        gathering_data: 'Gathering concept data...',
        generating_html: 'Generating HTML...',
        generating_pdf: 'Generating PDF...',
        generating_video: 'Generating video...',
        uploading: 'Uploading document...',
        completed: 'Magic Share completed!',
      };

      const displayMessage =
        stageMessages[message.stage] || message.message || 'Processing...';

      setShareProgress(
        message.conceptUuid,
        message.stage,
        displayMessage,
        message.progress,
        undefined,
        magicShareUuid,
      );
    },
  );

  // Magic Share completed
  useSocketEvent<'magic_share.completed.account', IMagicShareCompletedMessage>(
    'magic_share.completed.account',
    (message) => {
      const messageKey = `magic-share-completed-${message.conceptUuid}`;
      if (preventDuplicate(messageKey)) return;

      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.conceptMagicShareLatest,
          message.conceptUuid,
        ],
      });

      setShareProgress(
        message.conceptUuid,
        'completed',
        'Magic Share completed!',
        100,
        message.snapshotUrl,
        message.magicShareUuid,
      );
    },
  );

  // Magic Share error
  useSocketEvent<'magic_share.error.account', IMagicShareErrorMessage>(
    'magic_share.error.account',
    (message) => {
      const messageKey = `magic-share-error-${message.conceptUuid}-${message.errorCode || message.message}`;
      if (preventDuplicate(messageKey)) return;

      toast.deferred.error(
        'Magic Share Failed',
        message.message || 'Failed magic share generation. Please try again.',
        5000,
      );

      queryClient.invalidateQueries({
        queryKey: [
          AucctusQueryKeys.conceptMagicShareLatest,
          message.conceptUuid,
        ],
      });
    },
  );
};
