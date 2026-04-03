import { toast } from '@components';
import LiquidGlassModal from '@components/ui/LiquidGlassModal';
import {
  useCreateWatchtowerConfig,
  useGenerateWatchtowerRules,
  useScanWatchtowerConfig,
  useWatchtowerConfigs,
} from '@hooks/query/watchtower.hook';
import { cn } from '@libs/utils/react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import DescribeStep from './DescribeStep';
import ReviewStep from './ReviewStep';

type Step = 'describe' | 'loading' | 'review' | 'success';

interface CreateWatchtowerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (uuid: string) => void;
}

interface SuggestedRule {
  id: string;
  text: string;
}

const LOADING_STEPS = [
  'Briefing watchers on their mission...',
  'Assigning surveillance positions...',
  'Calibrating signal interceptors...',
  'Running background checks on targets...',
  'Establishing covert monitoring channels...',
];

const CreateWatchtowerModal: React.FC<CreateWatchtowerModalProps> = ({
  open,
  onOpenChange,
  onCreated,
}) => {
  const [step, setStep] = useState<Step>('describe');
  const [description, setDescription] = useState('');
  const [viewName, setViewName] = useState('');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [suggestedRules, setSuggestedRules] = useState<SuggestedRule[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [pendingResult, setPendingResult] = useState<{
    rules: SuggestedRule[];
    name: string;
  } | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    generateRules,
    generatedRules,
    error: generationError,
    reset: resetGeneration,
  } = useGenerateWatchtowerRules();
  const { createWatchtowerAsync: createWatchtower, isCreating } =
    useCreateWatchtowerConfig();
  const { scanWatchtower } = useScanWatchtowerConfig();
  const { watchtowerConfigs } = useWatchtowerConfigs();

  const existingNames = watchtowerConfigs.map((c) => c.name.toLowerCase());
  const isNameDuplicate =
    viewName.trim() !== '' &&
    existingNames.includes(viewName.trim().toLowerCase());

  const reset = useCallback(() => {
    setStep('describe');
    setDescription('');
    setViewName('');
    setLoadingStepIndex(0);
    setSuggestedRules([]);
    setAttachedFiles([]);
    setPendingResult(null);
    setShowCloseConfirm(false);
    resetGeneration();
  }, [resetGeneration]);

  const performClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(reset, 300);
  }, [onOpenChange, reset]);

  const handleClose = useCallback(() => {
    if (step === 'loading') {
      setShowCloseConfirm(true);
      return;
    }
    performClose();
  }, [step, performClose]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
      }
    },
    [],
  );

  const handleRemoveFile = useCallback((index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitDescription = useCallback(async () => {
    if (!description.trim()) return;
    setStep('loading');
    setLoadingStepIndex(0);
    setPendingResult(null);

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setLoadingStepIndex((prev) => {
        if (prev >= LOADING_STEPS.length - 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          return prev;
        }
        return prev + 1;
      });
    }, 2200);

    // Dispatch to Celery -- results arrive via WebSocket
    await generateRules({
      description: description.trim(),
      files: attachedFiles.length > 0 ? attachedFiles : undefined,
    });
  }, [description, attachedFiles, generateRules]);

  // When WebSocket delivers generated rules, store as pending result
  useEffect(() => {
    if (generatedRules) {
      const rules: SuggestedRule[] = generatedRules.rules.map((r) => ({
        id: crypto.randomUUID(),
        text: r,
      }));
      setPendingResult({ rules, name: generatedRules.name || 'Custom View' });
    }
  }, [generatedRules]);

  // If generation errors out, go back to describe step
  useEffect(() => {
    if (generationError && step === 'loading') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setStep('describe');
    }
  }, [generationError, step]);

  // Transition to review after all loading steps AND result are ready
  useEffect(() => {
    if (pendingResult && loadingStepIndex >= LOADING_STEPS.length - 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const timeout = setTimeout(() => {
        setSuggestedRules(pendingResult.rules);
        setViewName(pendingResult.name);
        setPendingResult(null);
        setStep('review');
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [pendingResult, loadingStepIndex]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleRemoveRule = useCallback((id: string) => {
    setSuggestedRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleEditRule = useCallback((id: string, newText: string) => {
    setSuggestedRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, text: newText } : r)),
    );
  }, []);

  const handleAddRule = useCallback((text: string) => {
    setSuggestedRules((prev) => [...prev, { id: crypto.randomUUID(), text }]);
  }, []);

  const handleApprove = useCallback(async () => {
    try {
      const watchtower = await createWatchtower({
        name: viewName.trim(),
        description: description.trim(),
        rules: suggestedRules.map((r) => r.text),
      });

      setStep('success');

      // Trigger scan for the new watchtower
      scanWatchtower(watchtower.uuid);

      setTimeout(() => {
        onCreated(watchtower.uuid);
        onOpenChange(false);
        setTimeout(reset, 300);
        toast.success(
          'Watchtower Created',
          `"${watchtower.name}" view created`,
        );
      }, 1800);
    } catch {
      // Error handled by hook
    }
  }, [
    viewName,
    description,
    suggestedRules,
    createWatchtower,
    scanWatchtower,
    onCreated,
    onOpenChange,
    reset,
  ]);

  return (
    <>
      <LiquidGlassModal
        open={open}
        onOpenChange={(v) => {
          if (!v) handleClose();
        }}
        size='md'
        hideCloseButton
        animatedRim
        className='liquid-glass-dark-surface'
      >
        <Dialog.Title className='sr-only'>New Watchtower</Dialog.Title>
        <Dialog.Description className='sr-only'>
          Describe what you want your agents to watch
        </Dialog.Description>

        {/* Close button */}
        <button
          onClick={handleClose}
          className='absolute right-3 top-3 z-10 rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white/60'
          aria-label='Close'
        >
          <X size={16} />
        </button>

        <AnimatePresence mode='wait'>
          {/* Step 1: Describe */}
          {step === 'describe' && (
            <DescribeStep
              description={description}
              onDescriptionChange={setDescription}
              attachedFiles={attachedFiles}
              onFileAdd={handleFileChange}
              onFileRemove={handleRemoveFile}
              onSubmit={handleSubmitDescription}
              isDisabled={!description.trim()}
            />
          )}

          {/* Step 2: Loading */}
          {step === 'loading' && (
            <motion.div
              key='loading'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='flex min-h-[280px] flex-col items-center justify-center p-10'
            >
              <div className='relative mb-6'>
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05]'>
                  <Loader2 size={28} className='animate-spin text-white/60' />
                </div>
              </div>

              <div className='w-full max-w-xs space-y-3'>
                {LOADING_STEPS.map((text, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: i <= loadingStepIndex ? 1 : 0.3,
                      x: 0,
                    }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className='flex items-center gap-2.5'
                  >
                    {i < loadingStepIndex ? (
                      <Check
                        size={16}
                        className='flex-shrink-0 text-emerald-400'
                      />
                    ) : i === loadingStepIndex ? (
                      <Loader2
                        size={16}
                        className='flex-shrink-0 animate-spin text-white/60'
                      />
                    ) : (
                      <div className='h-4 w-4 flex-shrink-0 rounded-full border border-white/[0.1]' />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        i <= loadingStepIndex ? 'text-white' : 'text-white/30',
                      )}
                    >
                      {text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <ReviewStep
              viewName={viewName}
              onViewNameChange={setViewName}
              suggestedRules={suggestedRules}
              onRemoveRule={handleRemoveRule}
              onEditRule={handleEditRule}
              onAddRule={handleAddRule}
              onBack={() => setStep('describe')}
              onApprove={handleApprove}
              isApproveDisabled={
                suggestedRules.length === 0 ||
                !viewName.trim() ||
                isCreating ||
                isNameDuplicate
              }
              isNameDuplicate={isNameDuplicate}
            />
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              key='success'
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className='flex min-h-[260px] flex-col items-center justify-center p-10 text-center'
            >
              {/* Pulsing radar ring */}
              <div className='relative mb-6 flex h-16 w-16 items-center justify-center'>
                <motion.div
                  className='absolute inset-0 rounded-full border border-emerald-400/30'
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: [0.5, 1.8, 2.5],
                    opacity: [0.6, 0.3, 0],
                  }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <motion.div
                  className='absolute inset-0 rounded-full border border-emerald-400/20'
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: [0.5, 1.5, 2.2],
                    opacity: [0.5, 0.2, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.2,
                    ease: 'easeOut',
                  }}
                />
                <motion.div
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10'
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: 0.1,
                  }}
                >
                  <Check size={20} className='text-emerald-400' />
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className='text-sm font-medium text-white/80'
              >
                Agents deployed
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className='mt-1 text-xs text-white/30'
              >
                Watchtower is now active
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </LiquidGlassModal>

      {/* Close confirmation AlertDialog (shown during loading step) */}
      <AlertDialog.Root
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className='fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm' />
          <AlertDialog.Content className='fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-black/95 p-6 shadow-2xl backdrop-blur-xl'>
            <AlertDialog.Title className='text-base font-semibold text-white'>
              Stop generation?
            </AlertDialog.Title>
            <AlertDialog.Description className='mt-2 text-sm text-white/50'>
              Rule generation is in progress. If you close now, you will need to
              start over.
            </AlertDialog.Description>
            <div className='mt-5 flex justify-end gap-2'>
              <AlertDialog.Cancel asChild>
                <button className='rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white'>
                  Keep Waiting
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={performClose}
                  className='rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500'
                >
                  Close Anyway
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

export default CreateWatchtowerModal;
