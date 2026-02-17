import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronRight,
  Globe,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import NucleusHeroBackground from '../NucleusHeroBackground/NucleusHeroBackground';
import useStore from '@stores/store';
import {
  useInitializeNucleus,
  useCompanyInfoLookup,
} from '@hooks/query/nucleus.hook';
import { useQueryClient } from 'react-query';
import { AucctusQueryKeys } from '@hooks/query/query-keys';
import type { ContextQuestion as ApiContextQuestion } from '@libs/api/types/nucleus';

/** Accepted file types for document upload */
const ACCEPTED_FILE_TYPES =
  '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation';

/** Common upload suggestions shown as chips */
const COMMON_UPLOADS = [
  'Strategy Overview',
  'Customer Segments',
  'Innovation Priorities',
];

export type InitiationStep = 'company' | 'documents' | 'context';

export interface NucleusInitiationProps {
  /** Callback fired when initialization is complete */
  onComplete: () => void;
}

interface StepConfig {
  step: number;
  id: InitiationStep;
  label: string;
}

const STEPS: StepConfig[] = [
  { step: 1, id: 'company', label: 'Company' },
  { step: 2, id: 'documents', label: 'Documents' },
  { step: 3, id: 'context', label: 'Context' },
];

interface FeatureConfig {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

const FEATURES: FeatureConfig[] = [
  {
    icon: Upload,
    label: 'Ingest Company DNA',
    description:
      'Upload what your team believes matters: strategy, priorities, constraints, and context.',
  },
  {
    icon: Globe,
    label: 'Learn Everything Else',
    description:
      'Agents learn everything publicly knowable about your company across 10 domains.',
  },
  {
    icon: Sparkles,
    label: 'Power Every Agent',
    description:
      'Ground every Aucctus agent in company-specific context and relevance.',
  },
];

/** Company information collected in Step 1 */
export interface CompanyInfo {
  companyName: string;
  headquarters: string;
  websiteDomain: string;
  headquartersImage: File | null;
}

/** Tracks which fields have been confirmed */
export interface ConfirmedFields {
  companyName: boolean;
  headquarters: boolean;
  websiteDomain: boolean;
}

type CompanyFieldKey = keyof ConfirmedFields;

/** Context question for Step 3 */
export interface ContextQuestion {
  id: string;
  question: string;
  answer: string;
}

/** Default context questions to be asked */
const DEFAULT_CONTEXT_QUESTIONS: Omit<ContextQuestion, 'answer'>[] = [
  {
    id: 'innovation-roadblocks',
    question:
      'What are some of the reasons innovation succeeds or fails at {COMPANY_NAME}? Where are common roadblocks?',
  },
  {
    id: 'critical-principles',
    question:
      'Are there any principles or checkmarks that are so critical to the business that they get weaved into every innovation decision?',
  },
  {
    id: 'no-fly-zones',
    question:
      'Are there any types of initiatives you would never pursue but that frequently get pitched internally? Any guard rails or no fly zones?',
  },
];

/**
 * NucleusInitiation component - Main shell for the Nucleus initialization wizard.
 *
 * Provides a dark-themed full-screen layout with:
 * - Neural network background (via NucleusHeroBackground)
 * - Step indicator showing progress through Company → Documents → Context
 * - Content area for step-specific components
 */
const NucleusInitiation: React.FC<NucleusInitiationProps> = ({
  onComplete,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [currentStep, setCurrentStep] = useState<InitiationStep>('company');

  // Handle the Initialize button click with exit animation
  const handleInitializeClick = useCallback(() => {
    setIsExiting(true);
    // Wait for exit animation to complete before transitioning
    setTimeout(() => {
      setHasStarted(true);
      setIsExiting(false);
    }, 400);
  }, []);

  // Get account info from store for pre-population
  const account = useStore((state) => state.auth.account);

  // React Query hooks
  const queryClient = useQueryClient();
  const { initializeNucleus, isInitializing } = useInitializeNucleus();
  const { lookupCompanyInfo, isLookingUp } = useCompanyInfoLookup();

  // Step 1 state: Company info
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    headquarters: '',
    websiteDomain: '',
    headquartersImage: null,
  });

  const [confirmedFields, setConfirmedFields] = useState<ConfirmedFields>({
    companyName: false,
    headquarters: false,
    websiteDomain: false,
  });

  // Track lookup completion for animation
  const [lookupComplete, setLookupComplete] = useState(false);

  // Pre-populate company info from account when it becomes available
  useEffect(() => {
    if (account) {
      setCompanyInfo((prev) => ({
        ...prev,
        companyName: prev.companyName || account.name || '',
        websiteDomain: prev.websiteDomain || account.domain || '',
      }));
    }
  }, [account]);

  // Look up company HQ and website when wizard starts
  useEffect(() => {
    const companyName = account?.name;
    if (hasStarted && companyName && !isLookingUp && !lookupComplete) {
      lookupCompanyInfo(companyName)
        .then((result) => {
          if (result) {
            setCompanyInfo((prev) => ({
              ...prev,
              // Only update HQ if empty (don't override user edits)
              headquarters: prev.headquarters || result.headquarters || '',
              // Always prefer lookup result for website domain (more accurate than account.domain)
              websiteDomain: result.websiteDomain || prev.websiteDomain || '',
            }));
          }
          setLookupComplete(true);
        })
        .catch(() => {
          // Error handled by the hook's onError - silently continue
          setLookupComplete(true);
        });
    }
    // Only run when hasStarted changes to true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted]);

  // HQ image upload ref
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Step 2 state: Documents
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Step 3 state: Context Questions
  const [contextQuestions, setContextQuestions] = useState<ContextQuestion[]>(
    () =>
      DEFAULT_CONTEXT_QUESTIONS.map((q) => ({
        ...q,
        answer: '',
      })),
  );
  const [customQuestion, setCustomQuestion] = useState<ContextQuestion | null>(
    null,
  );

  // Handle HQ image selection
  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setCompanyInfo((prev) => ({ ...prev, headquartersImage: file }));
        const url = URL.createObjectURL(file);
        setImagePreviewUrl(url);
      }
    },
    [],
  );

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  // Handle field value change
  const updateCompanyField = useCallback(
    (field: keyof CompanyInfo, value: string) => {
      setCompanyInfo((prev) => ({ ...prev, [field]: value }));
      // Unconfirm field when edited (except for image)
      if (field !== 'headquartersImage') {
        setConfirmedFields((prev) => ({
          ...prev,
          [field]: false,
        }));
      }
    },
    [],
  );

  // Toggle field confirmation
  const toggleFieldConfirmation = useCallback((field: CompanyFieldKey) => {
    setConfirmedFields((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Confirm all fields at once
  const confirmAllFields = useCallback(() => {
    setConfirmedFields({
      companyName: true,
      headquarters: true,
      websiteDomain: true,
    });
  }, []);

  // Check if all fields are confirmed
  const allFieldsConfirmed =
    confirmedFields.companyName &&
    confirmedFields.headquarters &&
    confirmedFields.websiteDomain;

  // Step 2: Document upload handlers
  const isValidFileType = useCallback((file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    const validExtensions = [
      '.pdf',
      '.doc',
      '.docx',
      '.xls',
      '.xlsx',
      '.csv',
      '.ppt',
      '.pptx',
    ];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    return (
      validTypes.includes(file.type) || validExtensions.includes(extension)
    );
  }, []);

  const addDocuments = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(isValidFileType);
      setUploadedDocuments((prev) => {
        // Avoid duplicates by filename
        const existingNames = new Set(prev.map((f) => f.name));
        const newFiles = validFiles.filter((f) => !existingNames.has(f.name));
        return [...prev, ...newFiles];
      });
    },
    [isValidFileType],
  );

  const removeDocument = useCallback((fileName: string) => {
    setUploadedDocuments((prev) => prev.filter((f) => f.name !== fileName));
  }, []);

  const handleDocumentInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addDocuments(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [addDocuments],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (e.dataTransfer.files) {
        addDocuments(e.dataTransfer.files);
      }
    },
    [addDocuments],
  );

  // Step 3: Context question handlers
  const updateQuestionAnswer = useCallback(
    (questionId: string, answer: string) => {
      setContextQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, answer } : q)),
      );
    },
    [],
  );

  const updateCustomQuestionAnswer = useCallback((answer: string) => {
    setCustomQuestion((prev) => (prev ? { ...prev, answer } : null));
  }, []);

  const addCustomQuestion = useCallback(() => {
    setCustomQuestion({
      id: 'custom-question',
      question: 'Is there anything else you would like to share with us?',
      answer: '',
    });
  }, []);

  // Check if at least one question is answered
  const hasAtLeastOneAnswer =
    contextQuestions.some((q) => q.answer.trim().length > 0) ||
    (customQuestion?.answer.trim().length ?? 0) > 0;

  // Get the company name for question text substitution
  const displayCompanyName = companyInfo.companyName || 'your company';

  // Handle Complete Setup - call API to initialize Nucleus
  const handleCompleteSetup = useCallback(() => {
    // Collect all questions with answers
    const allQuestions: ApiContextQuestion[] = [
      ...contextQuestions
        .filter((q) => q.answer.trim().length > 0)
        .map((q) => ({
          id: q.id,
          question: q.question.replace('{COMPANY_NAME}', displayCompanyName),
          answer: q.answer.trim(),
        })),
      ...(customQuestion && customQuestion.answer.trim().length > 0
        ? [
            {
              id: customQuestion.id,
              question: customQuestion.question,
              answer: customQuestion.answer.trim(),
            },
          ]
        : []),
    ];

    initializeNucleus(
      {
        data: {
          companyName: companyInfo.companyName,
          headquarters: companyInfo.headquarters,
          websiteDomain: companyInfo.websiteDomain,
          contextQuestions: allQuestions,
        },
        files: uploadedDocuments, // Include uploaded documents
        headquartersImage: companyInfo.headquartersImage ?? undefined, // Include HQ image for video generation
      },
      {
        onSuccess: () => {
          // Invalidate status query so NucleusPage will refetch and show loading state
          queryClient.invalidateQueries([AucctusQueryKeys.nucleusStatus]);
          // Call onComplete to redirect to loading state
          onComplete();
        },
        // Error handling is done in the useInitializeNucleus hook (shows toast)
      },
    );
  }, [
    companyInfo,
    contextQuestions,
    customQuestion,
    displayCompanyName,
    initializeNucleus,
    onComplete,
    queryClient,
    uploadedDocuments,
  ]);

  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep === 'company') {
      setCurrentStep('documents');
    } else if (currentStep === 'documents') {
      setCurrentStep('context');
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep === 'documents') {
      setCurrentStep('company');
    } else if (currentStep === 'context') {
      setCurrentStep('documents');
    } else if (currentStep === 'company') {
      // Go back to landing page
      setHasStarted(false);
    }
  }, [currentStep]);

  const currentStepNumber = STEPS.find((s) => s.id === currentStep)?.step ?? 1;

  const getStepStyles = (stepNumber: number): string => {
    if (currentStepNumber === stepNumber) {
      // Current step - highlighted
      return 'bg-white/15 border-white/30 text-white';
    } else if (currentStepNumber > stepNumber) {
      // Completed step - green
      return 'bg-green-500/15 border-green-400/30 text-green-200';
    } else {
      // Future step - muted
      return 'bg-white/5 border-white/15 text-white/40';
    }
  };

  // Landing page (before wizard starts)
  if (!hasStarted) {
    return (
      <div className='relative min-h-screen w-full bg-black'>
        {/* Neural network background */}
        <NucleusHeroBackground gradientOverlay='bg-gradient-to-t from-black/90 via-black/70 to-black/50' />

        {/* Content overlay */}
        <div className='relative z-10 flex min-h-screen flex-col items-center justify-center px-6'>
          {/* Title with icon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
            transition={{
              duration: isExiting ? 0.3 : 0.5,
              delay: isExiting ? 0.15 : 0,
            }}
            className='mb-4 flex items-center gap-6'
          >
            <div className='relative'>
              <div className='absolute inset-0 scale-150 rounded-lg bg-white/20 blur-xl' />
              <div className='relative rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-md'>
                <Brain className='h-12 w-12 text-white' strokeWidth={1.5} />
              </div>
            </div>
            <h1 className='text-5xl font-bold tracking-tight text-white md:text-7xl'>
              Nucleus
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
            transition={{
              duration: isExiting ? 0.3 : 0.5,
              delay: isExiting ? 0.1 : 0.1,
            }}
            className='mb-12 mt-4 text-center text-lg tracking-wide text-white/50'
          >
            Company Intelligence Core Engine
          </motion.p>

          {/* Feature cards */}
          <div className='mb-12 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3'>
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
                transition={{
                  duration: isExiting ? 0.3 : 0.5,
                  delay: isExiting ? 0.05 * (2 - index) : 0.2 + index * 0.1,
                }}
                className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm'
              >
                <div className='shrink-0 rounded-lg bg-white/10 p-2.5'>
                  <feature.icon className='h-4 w-4 text-white/80' />
                </div>
                <div className='text-left'>
                  <div className='mb-1 text-sm font-medium text-white/90'>
                    {feature.label}
                  </div>
                  <div className='text-[11px] leading-tight text-white/40'>
                    {feature.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Initialize Nucleus button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{
              duration: isExiting ? 0.3 : 0.5,
              delay: isExiting ? 0 : 0.5,
            }}
            onClick={handleInitializeClick}
            disabled={isExiting}
            className='group relative overflow-hidden rounded-full bg-white px-8 py-4 font-semibold text-slate-950 transition-colors duration-300 hover:bg-white/95 disabled:pointer-events-none'
          >
            <span className='relative flex items-center gap-3'>
              <Zap className='h-5 w-5' />
              <span>Initialize Nucleus</span>
            </span>

            {/* Glow effect */}
            <div
              className='absolute -inset-4 -z-10 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100'
              style={{
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
          </motion.button>

          {/* Helper text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -20 : 0 }}
            transition={{
              duration: isExiting ? 0.3 : 0.5,
              delay: isExiting ? 0 : 0.6,
            }}
            className='mt-6 max-w-md text-center text-xs text-white/30'
          >
            We&apos;ll guide you through a quick 3-step setup to
            <br />
            build your company&apos;s innovation intelligence core.
          </motion.p>
        </div>
      </div>
    );
  }

  // Wizard steps (after clicking Initialize Nucleus)
  return (
    <div className='relative min-h-screen w-full bg-black'>
      {/* Neural network background */}
      <NucleusHeroBackground gradientOverlay='bg-gradient-to-t from-black/90 via-black/70 to-black/50' />

      {/* Content overlay */}
      <div className='relative z-10 flex min-h-screen flex-col'>
        {/* Header with Nucleus Setup branding and step indicator */}
        <div className='flex items-center justify-between px-6 py-6'>
          {/* Left: Nucleus Setup branding */}
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]'>
              <Brain className='h-5 w-5 text-white/70' />
            </div>
            <span className='text-xl font-semibold text-white'>
              Nucleus Setup
            </span>
          </div>

          {/* Right: Compact step indicator */}
          <div className='flex items-center gap-2'>
            {STEPS.map(({ step, id, label }) => (
              <button
                key={id}
                onClick={() => setCurrentStep(id)}
                className={`relative flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all duration-200 ${getStepStyles(step)}`}
              >
                {/* Step number or checkmark */}
                <span className='font-medium'>{step}</span>
                <span className='font-medium'>{label}</span>
                {/* Checkmark for completed steps */}
                {currentStepNumber > step && (
                  <div className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500'>
                    <Check className='h-2.5 w-2.5 text-white' />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className='flex flex-1 items-center justify-center px-6 pb-12'>
          <AnimatePresence mode='wait'>
            {/* Step 1: Confirm Company */}
            {currentStep === 'company' && (
              <motion.div
                key='company-step'
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='flex w-full max-w-3xl flex-col items-center'
              >
                <AnimatePresence mode='wait'>
                  {!lookupComplete ? (
                    /* Loading State - shows until lookup completes */
                    <motion.div
                      key='loading'
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3 }}
                      className='flex flex-col items-center py-16'
                    >
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className='mb-6 flex h-20 w-20 animate-pulse-subtle items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] backdrop-blur-xl'
                      >
                        <Search className='h-8 w-8 text-white/60' />
                      </motion.div>
                      <h2 className='mb-3 text-2xl font-bold text-white'>
                        Looking up {companyInfo.companyName || 'your company'}
                      </h2>
                      <p className='mb-8 whitespace-nowrap text-center text-white/50'>
                        Searching for headquarters location and official website
                        domain...
                      </p>
                      <div className='flex items-center gap-3'>
                        <Loader2 className='h-5 w-5 animate-spin text-white/60' />
                        <span className='text-sm text-white/40'>
                          This usually takes a few seconds
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    /* Results State */
                    <motion.div
                      key='results'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      className='w-full'
                    >
                      {/* Header */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0 }}
                        className='mb-10 text-center'
                      >
                        <h2 className='mb-2 text-3xl font-bold text-white'>
                          Confirm Your Company
                        </h2>
                        <p className='text-white/50'>
                          We found these details- confirm or edit them
                        </p>
                      </motion.div>

                      {/* Content: Fields + Image */}
                      <div className='flex w-full items-start gap-8'>
                        {/* Left: Editable fields */}
                        <div className='flex flex-1 flex-col gap-4'>
                          {/* Company Name Field */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            onClick={() =>
                              toggleFieldConfirmation('companyName')
                            }
                            className='relative cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-colors hover:bg-white/[0.06]'
                          >
                            <div className='pr-10'>
                              <span className='mb-1 block text-[10px] uppercase tracking-wider text-white/40'>
                                Full Company Name
                              </span>
                              <input
                                type='text'
                                value={companyInfo.companyName}
                                onChange={(e) =>
                                  updateCompanyField(
                                    'companyName',
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                placeholder='Enter company name...'
                                className='w-full border-0 bg-transparent p-0 text-2xl font-bold text-white outline-none placeholder:text-white/30'
                              />
                            </div>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFieldConfirmation('companyName');
                              }}
                              className={`absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors ${
                                confirmedFields.companyName
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-white/30 hover:border-white/50'
                              }`}
                            >
                              {confirmedFields.companyName && (
                                <Check className='h-3 w-3 text-white' />
                              )}
                            </button>
                          </motion.div>

                          {/* Headquarters Field */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            onClick={() =>
                              toggleFieldConfirmation('headquarters')
                            }
                            className='relative cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-colors hover:bg-white/[0.06]'
                          >
                            <div className='pr-10'>
                              <span className='mb-1 block text-[10px] uppercase tracking-wider text-white/40'>
                                Headquarters
                              </span>
                              <input
                                type='text'
                                value={companyInfo.headquarters}
                                onChange={(e) =>
                                  updateCompanyField(
                                    'headquarters',
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                placeholder='City, State/Province'
                                className='w-full border-0 bg-transparent p-0 text-2xl font-bold text-white outline-none placeholder:text-white/30'
                              />
                            </div>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFieldConfirmation('headquarters');
                              }}
                              className={`absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors ${
                                confirmedFields.headquarters
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-white/30 hover:border-white/50'
                              }`}
                            >
                              {confirmedFields.headquarters && (
                                <Check className='h-3 w-3 text-white' />
                              )}
                            </button>
                          </motion.div>

                          {/* Website Domain Field */}
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            onClick={() =>
                              toggleFieldConfirmation('websiteDomain')
                            }
                            className='relative cursor-pointer rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-colors hover:bg-white/[0.06]'
                          >
                            <div className='pr-10'>
                              <span className='mb-1 block text-[10px] uppercase tracking-wider text-white/40'>
                                Website
                              </span>
                              <input
                                type='text'
                                value={companyInfo.websiteDomain}
                                onChange={(e) =>
                                  updateCompanyField(
                                    'websiteDomain',
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                placeholder='example.com'
                                className='w-full border-0 bg-transparent p-0 text-2xl font-bold text-white outline-none placeholder:text-white/30'
                              />
                            </div>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFieldConfirmation('websiteDomain');
                              }}
                              className={`absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-colors ${
                                confirmedFields.websiteDomain
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-white/30 hover:border-white/50'
                              }`}
                            >
                              {confirmedFields.websiteDomain && (
                                <Check className='h-3 w-3 text-white' />
                              )}
                            </button>
                          </motion.div>
                        </div>

                        {/* Right: HQ Image - matches height of 3 field cards */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className='relative self-center'
                        >
                          <input
                            ref={imageInputRef}
                            type='file'
                            accept='image/*'
                            onChange={handleImageChange}
                            className='hidden'
                          />
                          {/* Container matches 3 cards: 3 * card height + 2 * gap (3 * ~76px + 2 * 16px = ~260px) */}
                          <button
                            type='button'
                            onClick={() => imageInputRef.current?.click()}
                            className='group relative aspect-[4/3] h-[calc(3*76px+2*16px)] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition-colors hover:bg-white/[0.06]'
                          >
                            {imagePreviewUrl ? (
                              <>
                                <img
                                  src={imagePreviewUrl}
                                  alt='Headquarters'
                                  className='h-full w-full object-cover transition-opacity group-hover:opacity-50'
                                />
                                <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
                                  <span className='text-sm font-medium text-white'>
                                    Change
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className='flex h-full w-full flex-col items-center justify-center gap-2'>
                                <Upload className='h-8 w-8 text-white/20' />
                                <span className='text-sm text-white/30'>
                                  HQ Image (Optional)
                                </span>
                                <span className='text-xs text-white/20'>
                                  Click to upload
                                </span>
                              </div>
                            )}
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons - only show when not loading */}
                {(!isLookingUp || lookupComplete) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className='mt-10 flex items-center gap-4'
                  >
                    <button
                      type='button'
                      onClick={goToPreviousStep}
                      className='flex items-center gap-2 rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10'
                    >
                      <ArrowLeft className='h-4 w-4' />
                      Back
                    </button>

                    {allFieldsConfirmed ? (
                      <button
                        type='button'
                        onClick={goToNextStep}
                        className='flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90'
                      >
                        Continue
                        <ChevronRight className='h-4 w-4' />
                      </button>
                    ) : (
                      <button
                        type='button'
                        onClick={confirmAllFields}
                        className='flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15'
                      >
                        Confirm All
                        <Check className='h-4 w-4' />
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 2: Upload Documents */}
            {currentStep === 'documents' && (
              <motion.div
                key='documents-step'
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='flex w-full max-w-3xl flex-col items-center'
              >
                {/* Header */}
                <h2 className='mb-2 text-3xl font-bold text-white'>
                  Upload Key Documents
                </h2>
                <p className='mb-10 max-w-lg text-center text-white/50'>
                  Imagine you&apos;re training a new innovation analyst on your
                  team. What documents would you provide them to ramp up?
                </p>

                {/* Upload Zone */}
                <input
                  ref={documentInputRef}
                  type='file'
                  multiple
                  accept={ACCEPTED_FILE_TYPES}
                  onChange={handleDocumentInputChange}
                  className='hidden'
                />
                <div
                  onClick={() => documentInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex h-48 w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors ${
                    isDragOver
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/[0.07]'
                  }`}
                >
                  <Upload className='mb-3 h-12 w-12 text-white/40' />
                  <span className='font-medium text-white/60'>
                    Drop files here or click to upload
                  </span>
                  <span className='mt-1 text-sm text-white/30'>
                    PDF, Word, PowerPoint, Excel
                  </span>
                </div>

                {/* Uploaded Files */}
                {uploadedDocuments.length > 0 && (
                  <div className='mt-4 flex max-w-lg flex-wrap justify-center gap-2'>
                    {uploadedDocuments.map((file) => (
                      <div
                        key={file.name}
                        className='flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 py-1.5 pl-3 pr-2 text-sm text-white'
                      >
                        <span className='max-w-[150px] truncate'>
                          {file.name}
                        </span>
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDocument(file.name);
                          }}
                          className='flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:bg-white/20'
                        >
                          <X className='h-3 w-3' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Common Uploads suggestion chips */}
                <div className='mt-6 flex items-center justify-center gap-3'>
                  <span className='text-xs uppercase tracking-wider text-white/40'>
                    COMMON UPLOADS:
                  </span>
                  {COMMON_UPLOADS.map((example) => (
                    <span
                      key={example}
                      className='rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/50'
                    >
                      {example}
                    </span>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className='mt-10 flex items-center gap-4'>
                  <button
                    type='button'
                    onClick={goToPreviousStep}
                    className='flex items-center gap-2 rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10'
                  >
                    <ArrowLeft className='h-4 w-4' />
                    Back
                  </button>

                  {uploadedDocuments.length > 0 ? (
                    <button
                      type='button'
                      onClick={goToNextStep}
                      className='flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-white/90'
                    >
                      Continue
                      <ChevronRight className='h-4 w-4' />
                    </button>
                  ) : (
                    <button
                      type='button'
                      onClick={goToNextStep}
                      className='flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15'
                    >
                      Skip
                      <ChevronRight className='h-4 w-4' />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Context Questions */}
            {currentStep === 'context' && (
              <motion.div
                key='context-step'
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='flex w-full max-w-5xl flex-col items-center'
              >
                {/* Header */}
                <h2 className='mb-2 text-3xl font-bold text-white'>
                  Tell Us What Matters Most
                </h2>
                <p className='mb-10 whitespace-nowrap text-center text-white/50'>
                  Help us understand key priorities or nuances before we do more
                  research
                </p>

                {/* Question Cards */}
                <div className='grid w-full max-w-5xl grid-cols-3 gap-4'>
                  {contextQuestions.map((question) => {
                    const hasAnswer = question.answer.trim().length > 0;
                    return (
                      <div
                        key={question.id}
                        className='rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md'
                      >
                        <p className='mb-4 text-base font-medium leading-snug text-white'>
                          {question.question.replace(
                            '{COMPANY_NAME}',
                            displayCompanyName,
                          )}
                        </p>
                        <div className='flex items-start gap-2'>
                          <textarea
                            placeholder='Your answer...'
                            value={question.answer}
                            onChange={(e) =>
                              updateQuestionAnswer(question.id, e.target.value)
                            }
                            rows={3}
                            className={`flex-1 resize-none rounded-lg border px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ${
                              hasAnswer
                                ? 'border-green-500/50 bg-green-500/20 focus:ring-green-500/50'
                                : 'border-white/20 bg-white/10 focus:ring-white/30'
                            }`}
                          />
                          {hasAnswer && (
                            <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500'>
                              <Check className='h-3 w-3 text-white' />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Custom question card (4th card when added) */}
                  {customQuestion && (
                    <div className='rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-md'>
                      <p className='mb-4 text-base font-medium leading-snug text-white'>
                        {customQuestion.question}
                      </p>
                      <div className='flex items-start gap-2'>
                        <textarea
                          placeholder='Your answer...'
                          value={customQuestion.answer}
                          onChange={(e) =>
                            updateCustomQuestionAnswer(e.target.value)
                          }
                          rows={3}
                          className={`flex-1 resize-none rounded-lg border px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 ${
                            customQuestion.answer.trim()
                              ? 'border-green-500/50 bg-green-500/20 focus:ring-green-500/50'
                              : 'border-white/20 bg-white/10 focus:ring-white/30'
                          }`}
                        />
                        {customQuestion.answer.trim() && (
                          <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500'>
                            <Check className='h-3 w-3 text-white' />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Add More Details link */}
                {!customQuestion && (
                  <button
                    type='button'
                    onClick={addCustomQuestion}
                    className='mt-6 flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/60'
                  >
                    <Plus className='h-4 w-4' />
                    Add More Details
                  </button>
                )}

                {/* Navigation Buttons */}
                <div className='mt-10 flex items-center gap-4'>
                  <button
                    type='button'
                    onClick={goToPreviousStep}
                    disabled={isInitializing}
                    className='flex items-center gap-2 rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    <ArrowLeft className='h-4 w-4' />
                    Back
                  </button>

                  <button
                    type='button'
                    onClick={handleCompleteSetup}
                    disabled={!hasAtLeastOneAnswer || isInitializing}
                    className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors ${
                      hasAtLeastOneAnswer && !isInitializing
                        ? 'bg-white text-slate-950 hover:bg-white/90'
                        : 'cursor-not-allowed bg-white/20 text-white/40'
                    }`}
                  >
                    {isInitializing && (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    )}
                    {isInitializing ? 'Initializing...' : 'Complete Setup'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NucleusInitiation;
