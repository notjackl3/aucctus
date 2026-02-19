import { toast } from '@components';
import { useSocketEvent } from '../aucctus';
import { useQueryClient } from 'react-query';
import type {
  IIdeaSubmissionsUploadStartedMessage,
  IIdeaSubmissionsUploadProgressMessage,
  IIdeaSubmissionsUploadCompletedMessage,
  IIdeaSubmissionsUploadErrorMessage,
} from '@libs/api/types';

export const useIdeaSubmissionsHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  const queryClient = useQueryClient();

  // Upload started (no-op)
  useSocketEvent<
    'idea_submissions.upload.started.user',
    IIdeaSubmissionsUploadStartedMessage
  >('idea_submissions.upload.started.user', () => {
    return;
  });

  // Upload progress (no-op)
  useSocketEvent<
    'idea_submissions.upload.progress.user',
    IIdeaSubmissionsUploadProgressMessage
  >('idea_submissions.upload.progress.user', () => {
    return;
  });

  // Upload completed
  useSocketEvent<
    'idea_submissions.upload.completed.user',
    IIdeaSubmissionsUploadCompletedMessage
  >('idea_submissions.upload.completed.user', (message) => {
    const messageKey = `idea-upload-completed-${message.sourceFileUuid}`;
    if (preventDuplicate(messageKey)) return;

    queryClient.invalidateQueries({
      queryKey: ['submissionLinkSubmissions', message.submissionLinkUuid],
    });
    queryClient.invalidateQueries({
      queryKey: ['submissionLink', message.submissionLinkUuid],
    });
    queryClient.invalidateQueries({ queryKey: ['submissionLinks'] });

    toast.deferred.completed(
      'File Upload Complete',
      `Extracted ${message.ideasExtracted} ideas from your file`,
    );
  });

  // Upload error
  useSocketEvent<
    'idea_submissions.upload.error.user',
    IIdeaSubmissionsUploadErrorMessage
  >('idea_submissions.upload.error.user', (message) => {
    const messageKey = `idea-upload-error-${message.sourceFileUuid}`;
    if (preventDuplicate(messageKey)) return;

    toast.deferred.error(
      'File Upload Failed',
      message.errorMessage || 'Please try uploading your file again',
    );
  });
};
