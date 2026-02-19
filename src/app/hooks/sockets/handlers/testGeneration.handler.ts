import { useSocketEvent } from '../aucctus';
import type {
  ITestGenerationCompletedMessage,
  ITestGenerationErrorMessage,
} from '@libs/api/types';

export const useTestGenerationHandler = (
  preventDuplicate: (key: string) => boolean,
) => {
  // Test generation completed
  useSocketEvent<
    'test.generation.completed.user',
    ITestGenerationCompletedMessage
  >('test.generation.completed.user', (data) => {
    const messageKey = `test-generation-complete-${data.conceptUuid}-${data.testUuid}`;
    if (preventDuplicate(messageKey)) return;
  });

  // Test generation error
  useSocketEvent<'test.generation.error.user', ITestGenerationErrorMessage>(
    'test.generation.error.user',
    (data) => {
      const messageKey = `test-generation-error-${data.conceptUuid}-${data.testUuid || 'unknown'}`;
      if (preventDuplicate(messageKey)) return;
    },
  );
};
