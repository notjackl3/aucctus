import { toast } from '@components';
import { useSocketEvent } from '../aucctus';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '../../query/query-keys';
import type {
  INucleusUploadProgressMessage,
  INucleusUploadCompletedMessage,
  INucleusUploadErrorMessage,
  INucleusAnswerCompletedMessage,
  INucleusAnswerErrorMessage,
} from '@libs/api/types';

export const useNucleusHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  const queryClient = useQueryClient();

  // Upload progress
  useSocketEvent<
    'nucleus_upload.progress.account',
    INucleusUploadProgressMessage
  >('nucleus_upload.progress.account', (message) => {
    if (message.stage === 'completed') {
      toast.deferred.completed('Documents Processed');
    }
  });

  // Upload completed
  useSocketEvent<
    'nucleus_upload.completed.account',
    INucleusUploadCompletedMessage
  >('nucleus_upload.completed.account', (message) => {
    const messageKey = `nucleus-completed-${message.nucleusReportUuid}-${message.uploadedCount}`;
    if (preventDuplicate(messageKey)) return;

    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.nucleusReportLatest],
    });

    toast.deferred.completed(
      `${message.uploadedCount} Document${message.uploadedCount > 1 ? 's' : ''} Uploaded`,
    );
  });

  // Upload error
  useSocketEvent<'nucleus_upload.error.account', INucleusUploadErrorMessage>(
    'nucleus_upload.error.account',
    (message) => {
      const messageKey = `nucleus-error-${message.nucleusReportUuid || 'unknown'}-${message.errorCode || message.message}`;
      if (preventDuplicate(messageKey)) return;

      toast.deferred.error(
        'Document Upload Failed',
        message.message || 'Please try uploading your documents again',
      );
    },
  );

  // Answer completed
  useSocketEvent<
    'nucleus_answer.completed.account',
    INucleusAnswerCompletedMessage
  >('nucleus_answer.completed.account', (message) => {
    const messageKey = `nucleus-answer-completed-${message.questionUuid}-${message.answerUuid}`;
    if (preventDuplicate(messageKey)) return;
  });

  // Answer error (no-op)
  useSocketEvent<'nucleus_answer.error.account', INucleusAnswerErrorMessage>(
    'nucleus_answer.error.account',
    () => {
      return;
    },
  );
};
