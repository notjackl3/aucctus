import React, { useEffect, useState, useRef, useMemo } from 'react';
import { LogoAnimation } from '@components';
import { useQuestions } from '@hooks/query/ideaPlayground.hook';
import { useMutation } from 'react-query';
import api from '@libs/api';
import telemetry from '@libs/telemetry';
import type { IAnchorQuestion } from '@libs/api/types';

interface PlaygroundLoadingTransitionProps {
  seedUuid: string | null;
  onReady: () => void;
}

// Timeout in milliseconds (1 minutes)
const READY_TIMEOUT_MS = 60_000;

// Polling interval in milliseconds
const POLL_INTERVAL_MS = 2000;

/**
 * Fun loading messages that appear in glassmorphic bubbles around the logo
 */
const LOADING_MESSAGES = [
  'Generating ideation questions',
  'Extracting insights',
  'Scanning innovation landscape',
  'Connecting the dots',
  'Finding opportunities',
  'Analyzing market trends',
];

/**
 * Fisher-Yates shuffle for randomizing reveal order
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calculate asymptotic progress that approaches 100% but never quite reaches it
 */
const calculateAsymptoticProgress = (elapsedSeconds: number): number => {
  const tau = 15;
  const progress = 100 * (1 - Math.exp(-elapsedSeconds / tau));
  return Math.min(98, progress);
};

/**
 * Check if a question is ready to proceed
 * - Custom questions: always ready (no pipeline required)
 * - Non-custom questions: must have BOTH hasPossibleAnswerGenerated AND hasInsightsGenerated = true
 */
const isQuestionReady = (question: IAnchorQuestion): boolean => {
  // Custom questions don't need pipeline data - always ready
  if (question.isCustomQuestion) {
    return true;
  }

  // Non-custom questions: both flags must be true
  return (
    question.hasPossibleAnswerGenerated === true &&
    question.hasInsightsGenerated === true
  );
};

/**
 * Shows the LogoAnimation with glassmorphic message bubbles while waiting for
 * all non-custom questions to have hasPossibleAnswerGenerated AND hasInsightsGenerated = true.
 *
 * Uses polling to fetch the latest backend-provided pipeline status flags.
 */
const PlaygroundLoadingTransition: React.FC<
  PlaygroundLoadingTransitionProps
> = ({ seedUuid, onReady }) => {
  // Track which questions have had generation triggered
  const triggeredQuestionsRef = useRef<Set<string>>(new Set());

  // Track if timeout has been reached
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Bubble visibility state
  const [visibleBubbleIds, setVisibleBubbleIds] = useState<Set<number>>(
    new Set(),
  );

  // Progress state
  const startTimeRef = useRef<number>(Date.now());
  const [progress, setProgress] = useState(0);

  // Fetch questions - this is the source of truth
  const {
    questions,
    isLoading: isLoadingQuestions,
    refetch,
  } = useQuestions(seedUuid || undefined);

  // Poll for latest pipeline status every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (seedUuid && !timeoutReached) {
        refetch();
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [seedUuid, timeoutReached, refetch]);

  // Pre-calculate bubble positions
  const bubbleData = useMemo(() => {
    return LOADING_MESSAGES.map((message, index) => {
      const angle = (index / LOADING_MESSAGES.length) * 360 - 90;
      const radiusX = 280;
      const radiusY = 200;
      const x = Math.cos((angle * Math.PI) / 180) * radiusX;
      const y = Math.sin((angle * Math.PI) / 180) * radiusY;
      return { id: index, message, x, y };
    });
  }, []);

  // Randomized order for revealing bubbles
  const revealOrder = useMemo(
    () => shuffleArray(LOADING_MESSAGES.map((_, i) => i)),
    [],
  );

  // Reveal bubbles one at a time
  useEffect(() => {
    if (visibleBubbleIds.size >= LOADING_MESSAGES.length) return;
    const timeout = setTimeout(() => {
      const nextId = revealOrder[visibleBubbleIds.size];
      setVisibleBubbleIds((prev) => new Set([...prev, nextId]));
    }, 3500);
    return () => clearTimeout(timeout);
  }, [visibleBubbleIds.size, revealOrder]);

  // Progress bar update
  useEffect(() => {
    const updateProgress = () => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      setProgress(calculateAsymptoticProgress(elapsedSeconds));
    };
    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, []);

  // Timeout - after 90 seconds, proceed anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      telemetry.log('ideaPlayground.transition.timeout', {
        seedUuid,
        elapsedMs: READY_TIMEOUT_MS,
      });
      setTimeoutReached(true);
    }, READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [seedUuid]);

  // Mutation to trigger possible answer generation (fire and forget)
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
  });

  // Mutation to trigger insights generation (fire and forget)
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
  });

  // Trigger generation for non-custom questions that need it (one-time per question)
  useEffect(() => {
    if (!seedUuid || questions.length === 0) return;

    questions.forEach((question) => {
      const questionId = question.uuid;

      // Skip custom questions - they don't need pipeline data
      if (question.isCustomQuestion) return;

      // Skip if already triggered
      if (triggeredQuestionsRef.current.has(questionId)) return;
      triggeredQuestionsRef.current.add(questionId);

      // Trigger generation if not already generated/generating
      if (
        !question.hasPossibleAnswerGenerated &&
        !question.isGeneratingPossibleAnswer
      ) {
        generatePossibleAnswerMutation.mutate({
          seedUuid,
          questionUuid: questionId,
        });
      }

      if (!question.hasInsightsGenerated && !question.isGeneratingInsights) {
        generateInsightsMutation.mutate({
          seedUuid,
          questionUuid: questionId,
        });
      }
    });
  }, [
    seedUuid,
    questions,
    generatePossibleAnswerMutation,
    generateInsightsMutation,
  ]);

  // Check if ALL questions are ready using backend pipeline status flags
  const allQuestionsReady = useMemo(() => {
    if (isLoadingQuestions) return false;
    if (questions.length === 0) return false;
    return questions.every(isQuestionReady);
  }, [isLoadingQuestions, questions]);

  // Ready when all questions ready OR timeout
  const isDataReady = allQuestionsReady || timeoutReached;

  // Log completion
  useEffect(() => {
    if (allQuestionsReady && !timeoutReached) {
      telemetry.log('ideaPlayground.transition.dataReady', {
        seedUuid,
        questionCount: questions.length,
        elapsedMs: Date.now() - startTimeRef.current,
      });
    }
  }, [allQuestionsReady, timeoutReached, seedUuid, questions.length]);

  // Transition when ready
  useEffect(() => {
    if (isDataReady) {
      const timer = setTimeout(() => {
        onReady();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isDataReady, onReady]);

  return (
    <div className='flex h-full w-full items-center justify-center'>
      {/* Bubbles container */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='relative h-full w-full'>
          {bubbleData
            .filter((bubble) => visibleBubbleIds.has(bubble.id))
            .map((bubble) => (
              <div
                key={bubble.id}
                className='absolute'
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${bubble.x}px, ${bubble.y}px)`,
                }}
              >
                <div
                  className='animate-[bubblePopIn_0.5s_ease-out_forwards]'
                  style={{ opacity: 0 }}
                >
                  <div
                    className='animate-[bubbleFloat_3s_ease-in-out_infinite]'
                    style={{
                      animationDelay: `${bubble.id * 0.3}s`,
                      animationDuration: `${3 + (bubble.id % 3) * 0.5}s`,
                    }}
                  >
                    <div className='whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md'>
                      <span className='text-sm font-medium text-white/90'>
                        {bubble.message}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Logo and progress bar */}
      <div className='relative z-20 flex -translate-y-24 flex-col items-center'>
        <div className='absolute left-1/2 top-14 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-[glowPulse_3s_ease-in-out_infinite] rounded-full bg-white/20 blur-2xl' />
        <div className='relative flex h-28 w-28 animate-[logoPulse_2s_ease-in-out_infinite] items-center justify-center'>
          <LogoAnimation size={112} loop fps={75} />
        </div>
        <div className='mt-6 h-2 w-48 overflow-hidden rounded-full bg-white/10 backdrop-blur-xl'>
          <div
            className='h-full rounded-full bg-white/50 transition-all duration-150 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className='mt-2 text-xs text-white/50'>
          {Math.round(progress)}%
        </span>
      </div>

      <style>{`
        @keyframes bubblePopIn {
            0% { opacity: 0; transform: scale(0.7); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bubbleFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
        }
        @keyframes logoPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes glowPulse {
            0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
            50% { opacity: 0.4; transform: translate(-50%, -50%) scale(1.15); }
        }
      `}</style>
    </div>
  );
};

export default PlaygroundLoadingTransition;
