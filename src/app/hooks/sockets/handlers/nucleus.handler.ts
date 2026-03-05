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
  INucleusOverviewCompletedMessage,
  INucleusOverviewErrorMessage,
  INucleusOverviewProgressMessage,
} from '@libs/api/types';
import type { DocumentWithUsage } from '@libs/api/types/nucleus';

export const useNucleusHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  const queryClient = useQueryClient();

  // Upload progress — includes per-document status updates
  useSocketEvent<
    'nucleus_upload.progress.account',
    INucleusUploadProgressMessage
  >('nucleus_upload.progress.account', (message) => {
    // Per-document status update: optimistically update React Query cache
    if (message.sourceUuid && message.processingStatus) {
      queryClient.setQueryData<DocumentWithUsage[] | undefined>(
        [AucctusQueryKeys.nucleusDocuments],
        (oldData) => {
          if (!oldData) return oldData;
          return oldData.map((doc) =>
            doc.uuid === message.sourceUuid
              ? {
                  ...doc,
                  processingStatus:
                    message.processingStatus as DocumentWithUsage['processingStatus'],
                }
              : doc,
          );
        },
      );
    }

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

    // Invalidate documents to reconcile processing_status from server
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.nucleusDocuments],
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

      // Invalidate documents to get updated failed status
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.nucleusDocuments],
      });

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

  // Overview progress (no-op — OverviewTab polls via overviewStatus on the report)
  useSocketEvent<
    'nucleus_overview.progress.account',
    INucleusOverviewProgressMessage
  >('nucleus_overview.progress.account', () => {
    return;
  });

  // Overview completed — invalidate widgets query so OverviewTab auto-fetches new data
  useSocketEvent<
    'nucleus_overview.completed.account',
    INucleusOverviewCompletedMessage
  >('nucleus_overview.completed.account', (message) => {
    const messageKey = `nucleus-overview-completed-${message.nucleusReportUuid}`;
    if (preventDuplicate(messageKey)) return;

    // Invalidate overview widgets to fetch the newly generated widgets
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.nucleusOverviewWidgets],
    });

    // Invalidate nucleus report to update overviewStatus from 'generating' → 'completed'
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.nucleusReportLatest],
    });

    toast.deferred.completed('Strategic Overview Generated');
  });

  // Overview error — update report status and notify user
  useSocketEvent<
    'nucleus_overview.error.account',
    INucleusOverviewErrorMessage
  >('nucleus_overview.error.account', (message) => {
    const messageKey = `nucleus-overview-error-${message.nucleusReportUuid}`;
    if (preventDuplicate(messageKey)) return;

    // Invalidate nucleus report to update overviewStatus from 'generating' → 'failed'
    queryClient.invalidateQueries({
      queryKey: [AucctusQueryKeys.nucleusReportLatest],
    });

    toast.deferred.error(
      'Overview Generation Failed',
      message.message || 'Please try generating the overview again',
    );
  });
};
