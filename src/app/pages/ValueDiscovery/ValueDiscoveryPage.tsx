import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useStartAssessment,
  useSubmitAnswer,
  useSubmitLead,
  useBriefing,
  useValueDiscoverySocket,
  useValueDiscoveryQuestionSocket,
} from '@hooks/query/valueDiscovery.hook';
import type {
  IQuestion,
  IExecutiveBriefing,
  ILeadCapturePayload,
} from '@libs/api/types/valueDiscovery';
import { toast } from '@components';
import { NucleusHeroBackground } from '@components/Nucleus/NucleusHeroBackground';
import { IntroScreen } from './components/IntroScreen';
import { CalibratingScreen } from './components/CalibratingScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { LeadCaptureScreen } from './components/LeadCaptureScreen';
import { GeneratingScreen } from './components/GeneratingScreen';
import { BriefingResultsScreen } from './components/BriefingResultsScreen';

type Step =
  | 'intro'
  | 'calibrating'
  | 'questioning'
  | 'lead_capture'
  | 'generating'
  | 'results';

/**
 * To use a video background (e.g. head office footage),
 * set this to the URL/path of an mp4 file.
 * NucleusHeroBackground will display the video with a dark overlay
 * instead of the brand gradient + neural network.
 */
const VIDEO_URL: string | undefined = undefined;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const ValueDiscoveryPage = () => {
  const [step, setStep] = useState<Step>('intro');
  const [assessmentUuid, setAssessmentUuid] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<IQuestion | null>(
    null,
  );
  const [questionNumber, setQuestionNumber] = useState(1);
  const [briefing, setBriefing] = useState<IExecutiveBriefing | null>(null);

  const { startAssessment, isStarting } = useStartAssessment();
  const { submitAnswer } = useSubmitAnswer();
  const { submitLead, isSubmitting: isSubmittingLead } = useSubmitLead();
  const { briefingProgress } = useValueDiscoverySocket();

  // Stable callbacks for socket hooks — use functional state updates to avoid stale closures
  const onQuestionReady = useCallback(
    (question: IQuestion, qNumber: number) => {
      setCurrentQuestion(question);
      setQuestionNumber(qNumber);
      setStep((prev) =>
        prev === 'intro' || prev === 'calibrating' ? 'questioning' : prev,
      );
    },
    [],
  );

  const onQuestionsComplete = useCallback(() => {
    setStep('lead_capture');
  }, []);

  const onQuestionError = useCallback((message: string) => {
    toast.error('Question Error', message);
  }, []);

  // WebSocket listeners for question delivery from Celery workers
  const { isGeneratingQuestion, setIsGeneratingQuestion } =
    useValueDiscoveryQuestionSocket(
      onQuestionReady,
      onQuestionsComplete,
      onQuestionError,
    );

  // Poll briefing status when generating
  const { briefingData } = useBriefing(assessmentUuid, step === 'generating');

  // Watch for briefing completion via useEffect (not during render)
  useEffect(() => {
    if (
      briefingData?.status === 'completed' &&
      briefingData.briefing &&
      step === 'generating'
    ) {
      setBriefing(briefingData.briefing);
      setStep('results');
    }
  }, [briefingData, step]);

  const handleStart = async (companyName: string) => {
    if (assessmentUuid || isStarting) return;
    try {
      const result = await startAssessment(companyName);
      setAssessmentUuid(result.assessmentUuid);
      setIsGeneratingQuestion(true);
      setStep('calibrating');
    } catch {
      /* toast shown by mutation.onError */
    }
  };

  const handleAnswer = async (
    answerText: string,
    answerSelections?: string[],
  ) => {
    if (!assessmentUuid) return;

    setIsGeneratingQuestion(true);
    setCurrentQuestion(null);

    try {
      await submitAnswer({
        assessmentUuid,
        data: { answer_text: answerText, answer_selections: answerSelections },
      });
    } catch {
      /* toast shown by mutation.onError */
    }
  };

  const handleLeadSubmit = async (data: ILeadCapturePayload) => {
    if (!assessmentUuid) return;

    try {
      await submitLead({ assessmentUuid, data });
      setStep('generating');
    } catch {
      /* toast shown by mutation.onError */
    }
  };

  const handleRestart = () => {
    setStep('intro');
    setAssessmentUuid(null);
    setCurrentQuestion(null);
    setQuestionNumber(1);
    setBriefing(null);
  };

  // Show loading state on intro button while the API call is in flight
  const isWaitingForQuestion = isStarting;

  return (
    <div className='relative min-h-screen w-full overflow-hidden'>
      {/* Persistent immersive background across all steps */}
      <NucleusHeroBackground
        videoUrl={VIDEO_URL}
        gradientOverlay='bg-gradient-to-t from-black/80 via-black/60 to-black/40'
      />

      {/* Additional overlay for content readability */}
      <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60' />

      {/* Content layer */}
      <div className='relative z-10 min-h-screen'>
        <AnimatePresence mode='wait'>
          {step === 'intro' && (
            <motion.div
              key='intro'
              variants={pageVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              transition={{ duration: 0.4 }}
            >
              <IntroScreen
                onStart={handleStart}
                isLoading={isWaitingForQuestion}
              />
            </motion.div>
          )}

          {step === 'calibrating' && (
            <motion.div
              key='calibrating'
              variants={pageVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              transition={{ duration: 0.3 }}
            >
              <CalibratingScreen />
            </motion.div>
          )}

          {step === 'questioning' && (
            <motion.div
              key={`question-${questionNumber}`}
              variants={pageVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              transition={{ duration: 0.3 }}
              className='flex min-h-screen items-center justify-center px-6 py-12'
            >
              <div className='w-full max-w-2xl'>
                <QuestionScreen
                  question={currentQuestion}
                  questionNumber={questionNumber}
                  onSubmit={handleAnswer}
                  isLoading={isGeneratingQuestion}
                />
              </div>
            </motion.div>
          )}

          {step === 'lead_capture' && (
            <motion.div
              key='lead'
              variants={pageVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              transition={{ duration: 0.3 }}
              className='flex min-h-screen items-center justify-center px-6 py-12'
            >
              <div className='w-full max-w-lg'>
                <LeadCaptureScreen
                  onSubmit={handleLeadSubmit}
                  isLoading={isSubmittingLead}
                />
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key='generating'
              variants={pageVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              transition={{ duration: 0.3 }}
              className='flex min-h-screen items-center justify-center px-6 py-12'
            >
              <div className='w-full max-w-md'>
                <GeneratingScreen progress={briefingProgress} />
              </div>
            </motion.div>
          )}

          {step === 'results' && briefing && (
            <motion.div
              key='results'
              variants={pageVariants}
              initial='initial'
              animate='animate'
              exit='exit'
              transition={{ duration: 0.4 }}
              className='aucctus-bg-primary min-h-screen px-6 py-8'
            >
              <div className='mx-auto max-w-5xl'>
                <BriefingResultsScreen
                  briefing={briefing}
                  assessmentUuid={assessmentUuid}
                  onRestart={handleRestart}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
