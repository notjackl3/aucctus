import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import {
  usePublicStartAssessment,
  usePublicSubmitAnswer,
  usePublicSubmitLead,
  usePublicQuestionStatus,
  usePublicBriefing,
} from '@hooks/query/publicValueDiscovery.hook';
import { publicValueDiscoveryKeys } from '@hooks/query/publicValueDiscovery.hook';
import type {
  IQuestion,
  IExecutiveBriefing,
  ILeadCapturePayload,
} from '@libs/api/types/valueDiscovery';
import { toast } from '@components';
import { downloadPdf } from '@libs/utils/files';
import api from '@libs/api';
import { NucleusHeroBackground } from '@components/Nucleus/NucleusHeroBackground';
import { IntroScreen } from './components/IntroScreen';
import { CalibratingScreen } from './components/CalibratingScreen';
import { QuestionScreen } from './components/QuestionScreen';
import { LeadCaptureScreen } from './components/LeadCaptureScreen';
import { GeneratingScreen } from './components/GeneratingScreen';
import { BriefingResultsScreen } from './components/BriefingResultsScreen';
import { useQueryClient } from 'react-query';

type Step =
  | 'intro'
  | 'calibrating'
  | 'questioning'
  | 'lead_capture'
  | 'generating'
  | 'results';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const PublicValueDiscoveryPage = () => {
  const [step, setStep] = useState<Step>('intro');
  const [assessmentUuid, setAssessmentUuid] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<IQuestion | null>(
    null,
  );
  const [questionNumber, setQuestionNumber] = useState(1);
  const [briefing, setBriefing] = useState<IExecutiveBriefing | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [isPollingQuestions, setIsPollingQuestions] = useState(false);

  const turnstileRef = useRef<TurnstileInstance>(null);
  const queryClient = useQueryClient();

  const { startAssessment, isStarting } = usePublicStartAssessment();
  const { submitAnswer } = usePublicSubmitAnswer();
  const { submitLead, isSubmitting: isSubmittingLead } = usePublicSubmitLead();

  // Poll for question status
  const { questionStatus } = usePublicQuestionStatus(
    assessmentUuid,
    isPollingQuestions,
  );

  // When question is ready, update state and stop polling
  useEffect(() => {
    if (!questionStatus) return;

    if (questionStatus.status === 'ready' && questionStatus.question) {
      setIsPollingQuestions(false);
      setCurrentQuestion(questionStatus.question);
      setQuestionNumber(questionStatus.questionNumber);
      setStep((prev) =>
        prev === 'calibrating' || prev === 'intro' ? 'questioning' : prev,
      );
    } else if (questionStatus.status === 'complete') {
      setIsPollingQuestions(false);
      setStep('lead_capture');
    }
  }, [questionStatus]);

  // Poll briefing status when generating
  const { briefingData } = usePublicBriefing(
    assessmentUuid,
    step === 'generating',
  );

  // Watch for briefing completion
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

  // Time-based progress simulation for the generating screen (no WebSocket)
  const [generatingProgress, setGeneratingProgress] = useState({
    isGenerating: false,
    stage: '',
    progress: 0,
    message: '',
  });

  useEffect(() => {
    if (step !== 'generating') {
      setGeneratingProgress({
        isGenerating: false,
        stage: '',
        progress: 0,
        message: '',
      });
      return;
    }

    setGeneratingProgress({
      isGenerating: true,
      stage: 'started',
      progress: 10,
      message: 'Analyzing your responses...',
    });

    const stages = [
      {
        delay: 5000,
        stage: 'generating',
        progress: 40,
        message: 'Generating executive briefing...',
      },
      {
        delay: 15000,
        stage: 'completing',
        progress: 70,
        message: 'Finalizing recommendations...',
      },
      {
        delay: 25000,
        stage: 'completing',
        progress: 85,
        message: 'Almost there...',
      },
    ];

    const timeouts = stages.map((s) =>
      setTimeout(() => {
        setGeneratingProgress({
          isGenerating: true,
          stage: s.stage,
          progress: s.progress,
          message: s.message,
        });
      }, s.delay),
    );

    return () => timeouts.forEach(clearTimeout);
  }, [step]);

  const handleStart = async (companyName: string) => {
    if (assessmentUuid || isStarting) return;
    if (!captchaToken) {
      toast.error('Security Check', 'Please complete the CAPTCHA first.');
      return;
    }
    try {
      const result = await startAssessment({ companyName, captchaToken });
      setAssessmentUuid(result.assessmentUuid);
      setIsPollingQuestions(true);
      setStep('calibrating');
    } catch {
      // Reset CAPTCHA on failure so user can try again
      turnstileRef.current?.reset();
      setCaptchaToken('');
    }
  };

  const handleAnswer = async (
    answerText: string,
    answerSelections?: string[],
  ) => {
    if (!assessmentUuid) return;

    setCurrentQuestion(null);

    try {
      await submitAnswer({
        assessmentUuid,
        data: { answer_text: answerText, answer_selections: answerSelections },
      });
      // Invalidate previous question-status cache and start polling for next
      queryClient.removeQueries(
        publicValueDiscoveryKeys.questionStatus(assessmentUuid),
      );
      setIsPollingQuestions(true);
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

  const handleExportPdf = useCallback(async (uuid: string) => {
    const blob = await api.valueDiscovery.exportBriefingPdfPublic(uuid);
    await downloadPdf(blob, 'executive_briefing.pdf');
  }, []);

  const handleRestart = () => {
    setStep('intro');
    setAssessmentUuid(null);
    setCurrentQuestion(null);
    setQuestionNumber(1);
    setBriefing(null);
    setCaptchaToken('');
    setIsPollingQuestions(false);
    turnstileRef.current?.reset();
  };

  return (
    <div className='relative min-h-screen w-full overflow-hidden'>
      <NucleusHeroBackground gradientOverlay='bg-gradient-to-t from-black/80 via-black/60 to-black/40' />
      <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60' />

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
              <IntroScreen onStart={handleStart} isLoading={isStarting} />
              {/* Turnstile CAPTCHA below the intro */}
              <div className='relative z-10 flex justify-center pb-8'>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={
                    import.meta.env.VITE_TURNSTILE_SITE_KEY ||
                    '1x00000000000000000000AA'
                  }
                  onSuccess={(token: string) => setCaptchaToken(token)}
                  onError={() => setCaptchaToken('')}
                  onExpire={() => setCaptchaToken('')}
                  options={{ theme: 'dark', size: 'normal' }}
                />
              </div>
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
                  isLoading={!currentQuestion}
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
                <GeneratingScreen progress={generatingProgress} />
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
                  onExportPdf={handleExportPdf}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PublicValueDiscoveryPage;
