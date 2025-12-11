import React, { useEffect, useCallback, useState, useRef } from 'react';
import { LogoAnimation } from '@components';
import { useQuestions } from '@hooks/query/ideaPlayground.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import { useDebouncedInvalidation } from '@hooks/query/useDebouncedInvalidation';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import { useMutation } from 'react-query';
import api from '@libs/api';
import { isGenerationInProgress } from '@libs/api/ideaPlayground';

interface PlaygroundLoadingTransitionProps {
  seedUuid: string | null;
  onReady: () => void;
}

/**
 * Fun loading messages that rotate every 5 seconds
 */
const LOADING_MESSAGES = [
  'Generating your ideation questions...',
  'Extracting top-notch insights...',
  'Scanning the innovation landscape...',
  'Connecting the dots for you...',
  'Finding hidden opportunities...',
  'Analyzing market trends...',
  'Curating breakthrough ideas...',
  'Exploring creative possibilities...',
  'Synthesizing research data...',
  'Building your innovation canvas...',
];

/**
 * Calculate asymptotic progress that approaches 100% but never quite reaches it
 * Uses exponential decay formula: progress = 100 * (1 - e^(-t/tau))
 * At t=45s, we should be around 95%
 */
const calculateAsymptoticProgress = (elapsedSeconds: number): number => {
  // tau = 15 gives us ~95% at 45 seconds
  const tau = 15;
  const progress = 100 * (1 - Math.exp(-elapsedSeconds / tau));
  // Cap at 98% to never quite reach 100%
  return Math.min(98, progress);
};

/**
 * Shows the LogoAnimation and loading messages while waiting for:
 * 1. Questions to be generated
 * 2. Each question to have at least one PossibleAnswer AND one ResearchInsight
 *
 * Triggers data generation and calls onReady when all data is available.
 */
const PlaygroundLoadingTransition: React.FC<
  PlaygroundLoadingTransitionProps
> = ({ seedUuid, onReady }) => {
  const { debouncedInvalidate } = useDebouncedInvalidation();

  // Track which questions have had generation triggered
  const [triggeredQuestions, setTriggeredQuestions] = useState<Set<string>>(
    new Set(),
  );

  // Message carousel state
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(true);

  // Progress state
  const startTimeRef = useRef<number>(Date.now());
  const [progress, setProgress] = useState(0);

  // Fetch questions
  const { questions, isLoading: isLoadingQuestions } = useQuestions(
    seedUuid || undefined,
  );

  // Message rotation effect
  useEffect(() => {
    const messageDuration = 5000; // 5 seconds per message
    const fadeOutDuration = 300; // 300ms fade out (fade in happens via CSS transition)

    const rotateMessage = () => {
      // Fade out
      setIsMessageVisible(false);

      // After fade out, change message and fade in
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        setIsMessageVisible(true);
      }, fadeOutDuration);
    };

    const interval = setInterval(rotateMessage, messageDuration);
    return () => clearInterval(interval);
  }, []);

  // Progress bar update effect
  useEffect(() => {
    const updateProgress = () => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      setProgress(calculateAsymptoticProgress(elapsedSeconds));
    };

    // Update immediately
    updateProgress();

    // Then update every 100ms for smooth animation
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, []);

  // Mutations for triggering generation
  const generateInsightsMutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
    }) => {
      return await api.ideaPlayground.generateResearchInsights(
        seedUuid,
        questionUuid,
      );
    },
    onSuccess: (data, variables) => {
      if (!isGenerationInProgress(data)) {
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          variables.seedUuid,
        ]);
      }
    },
  });

  const generatePossibleAnswerMutation = useMutation({
    mutationFn: async ({
      seedUuid,
      questionUuid,
    }: {
      seedUuid: string;
      questionUuid: string;
    }) => {
      return await api.ideaPlayground.generatePossibleAnswer(
        seedUuid,
        questionUuid,
      );
    },
    onSuccess: (data, variables) => {
      if (!isGenerationInProgress(data)) {
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          variables.seedUuid,
        ]);
      }
    },
  });

  // Trigger generation for all questions that need data
  const triggerGeneration = useCallback(() => {
    if (!seedUuid || questions.length === 0) return;

    questions.forEach((question) => {
      const questionId = question.uuid;

      // Skip if already triggered
      if (triggeredQuestions.has(questionId)) return;

      const hasPossibleAnswers =
        question.possibleAnswers && question.possibleAnswers.length > 0;
      const hasResearchInsights =
        (question.researchInsights && question.researchInsights.length > 0) ||
        (question.insights && question.insights.length > 0);

      // Trigger generation if data is missing
      if (!hasPossibleAnswers) {
        generatePossibleAnswerMutation.mutate({
          seedUuid,
          questionUuid: questionId,
        });
      }

      if (!hasResearchInsights) {
        generateInsightsMutation.mutate({
          seedUuid,
          questionUuid: questionId,
        });
      }

      // Mark as triggered
      setTriggeredQuestions((prev) => new Set([...prev, questionId]));
    });
  }, [
    seedUuid,
    questions,
    triggeredQuestions,
    generateInsightsMutation,
    generatePossibleAnswerMutation,
  ]);

  // Trigger generation when questions are loaded
  useEffect(() => {
    triggerGeneration();
  }, [triggerGeneration]);

  // WebSocket listener for questions generated
  useSocketEvent<'idea_playground.questions.generated.user'>(
    'idea_playground.questions.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          seedUuid,
        ]);
      }
    },
  );

  // WebSocket listener for possible answer generated
  useSocketEvent<'idea_playground.possible_answer.generated.user'>(
    'idea_playground.possible_answer.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          seedUuid,
        ]);
      }
    },
  );

  // WebSocket listener for research insights generated
  useSocketEvent<'idea_playground.research_insights.generated.user'>(
    'idea_playground.research_insights.generated.user',
    (data) => {
      if (data.seedUuid === seedUuid) {
        debouncedInvalidate([
          AucctusQueryKeys.ideaPlaygroundQuestions,
          seedUuid,
        ]);
      }
    },
  );

  // Check if all data is ready
  const isDataReady = React.useMemo(() => {
    if (isLoadingQuestions || questions.length === 0) return false;

    return questions.every((q) => {
      const hasPossibleAnswers =
        q.possibleAnswers && q.possibleAnswers.length > 0;
      const hasResearchInsights =
        (q.researchInsights && q.researchInsights.length > 0) ||
        (q.insights && q.insights.length > 0);
      return hasPossibleAnswers && hasResearchInsights;
    });
  }, [isLoadingQuestions, questions]);

  // Trigger onReady when all data is available
  React.useEffect(() => {
    if (isDataReady) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        onReady();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDataReady, onReady]);

  return (
    <div className='flex h-full w-full flex-col items-center justify-center'>
      <div className='flex flex-col items-center gap-8'>
        {/* Logo Animation */}
        <LogoAnimation size={200} loop fps={45} />

        {/* Loading Message with fade animation */}
        <div className='flex h-8 flex-col items-center justify-center'>
          <p
            className='aucctus-text-lg text-center text-white transition-opacity duration-300'
            style={{ opacity: isMessageVisible ? 1 : 0 }}
          >
            {LOADING_MESSAGES[currentMessageIndex]}
          </p>
        </div>

        {/* Asymptotic progress bar */}
        <div className='flex w-64 flex-col items-center gap-2'>
          <div className='h-1.5 w-full overflow-hidden rounded-full bg-white/20'>
            <div
              className='h-full rounded-full bg-white/80'
              style={{
                width: `${progress}%`,
                transition: 'width 150ms ease-out',
              }}
            />
          </div>
          <span className='aucctus-text-xs text-white/50'>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundLoadingTransition;
