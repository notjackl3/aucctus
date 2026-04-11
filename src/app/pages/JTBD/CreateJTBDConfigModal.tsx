import { toast } from '@components';
import { useRimOrbStyles } from '@hooks/useRimOrbStyles';
import {
  useCreateJTBDConfig,
  useGenerateJTBDRules,
  useJTBDConfigs,
  useTriggerJTBDScan,
} from '@hooks/query/jtbd.hook';
import { usePersonas } from '@hooks/query/persona.hook';
import type { IJTBDGeneratedRule } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import JTBDPersonaTagger from './JTBDPersonaTagger';
import { useJTBDView } from './JTBDViewContext';

type Step = 'loading' | 'review' | 'success';

interface CreateJTBDConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (uuid: string) => void;
  initialDescription: string;
}

interface SuggestedRule {
  id: string;
  ruleText: string;
  suggestedPersonaUuid: string | null;
}

const LOADING_STEPS = [
  'Analyzing market description...',
  'Identifying customer pain points...',
  'Mapping unmet needs...',
  'Generating discovery rules...',
  'Matching personas...',
];

const GENERATION_TIMEOUT_MS = 60_000;

const CreateJTBDConfigModal: React.FC<CreateJTBDConfigModalProps> = ({
  open,
  onOpenChange,
  onCreated,
  initialDescription,
}) => {
  const [step, setStep] = useState<Step>('loading');
  const [description, setDescription] = useState('');
  const [viewName, setViewName] = useState('');
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [suggestedRules, setSuggestedRules] = useState<SuggestedRule[]>([]);
  const [pendingResult, setPendingResult] = useState<{
    rules: SuggestedRule[];
    name: string;
  } | null>(null);
  const [selectedPersonaUuids, setSelectedPersonaUuids] = useState<string[]>(
    [],
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const {
    generateRules,
    generatedRules,
    error: generationError,
    reset: resetGeneration,
  } = useGenerateJTBDRules();
  const { createConfigAsync, isCreating } = useCreateJTBDConfig();
  const { triggerScan } = useTriggerJTBDScan();
  const { configs } = useJTBDConfigs();
  const { setActiveConfigUuid } = useJTBDView();
  const { personas: allPersonas } = usePersonas();
  const orbStyles = useRimOrbStyles();

  const existingNames = configs.map((c) => c.name.toLowerCase());
  const isNameDuplicate =
    viewName.trim() !== '' &&
    existingNames.includes(viewName.trim().toLowerCase());

  const reset = useCallback(() => {
    setStep('loading');
    setDescription('');
    setViewName('');
    setLoadingStepIndex(0);
    setSuggestedRules([]);
    setPendingResult(null);
    setSelectedPersonaUuids([]);
    firedRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    resetGeneration();
  }, [resetGeneration]);

  const performClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(reset, 300);
  }, [onOpenChange, reset]);

  const handleClose = useCallback(() => {
    performClose();
  }, [performClose]);

  // Fire rule generation immediately when the modal opens
  useEffect(() => {
    if (!open || !initialDescription?.trim() || firedRef.current) return;
    firedRef.current = true;

    const text = initialDescription.trim();
    setDescription(text);
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

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setStep((currentStep) => {
        if (currentStep === 'loading') {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          toast.error(
            'Generation Timed Out',
            'Rule generation took too long. Please try again.',
          );
          performClose();
          return 'loading';
        }
        return currentStep;
      });
    }, GENERATION_TIMEOUT_MS);

    generateRules({ description: text });
  }, [open, initialDescription, generateRules, performClose]);

  // When WebSocket delivers generated rules, store as pending result
  useEffect(() => {
    if (generatedRules) {
      const rules: SuggestedRule[] = generatedRules.rules.map(
        (r: IJTBDGeneratedRule) => ({
          id: crypto.randomUUID(),
          ruleText: r.ruleText,
          suggestedPersonaUuid: r.suggestedPersonaUuid,
        }),
      );

      // Extract unique persona UUIDs from suggestions
      const personaUuids = [
        ...new Set(
          rules
            .map((r) => r.suggestedPersonaUuid)
            .filter((u): u is string => u !== null),
        ),
      ];

      setPendingResult({
        rules,
        name: generatedRules.name || 'Discovery Area',
      });
      setSelectedPersonaUuids(personaUuids.slice(0, 6));
    }
  }, [generatedRules]);

  // If generation errors out, close the modal
  useEffect(() => {
    if (generationError && step === 'loading') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      performClose();
    }
  }, [generationError, step, performClose]);

  // Transition to review after all loading steps AND result are ready
  useEffect(() => {
    if (pendingResult && loadingStepIndex >= LOADING_STEPS.length - 1) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Clear the safety timeout since we got a result
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      const transitionDelay = setTimeout(() => {
        setSuggestedRules(pendingResult.rules);
        setViewName(pendingResult.name);
        setPendingResult(null);
        setStep('review');
      }, 800);
      return () => clearTimeout(transitionDelay);
    }
  }, [pendingResult, loadingStepIndex]);

  // Cleanup interval and timeout on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleRemoveRule = useCallback((id: string) => {
    setSuggestedRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleEditRule = useCallback((id: string, newText: string) => {
    setSuggestedRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ruleText: newText } : r)),
    );
  }, []);

  const handleAddRule = useCallback((text: string) => {
    setSuggestedRules((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ruleText: text, suggestedPersonaUuid: null },
    ]);
  }, []);

  const handleApprove = useCallback(async () => {
    try {
      const result = await createConfigAsync({
        name: viewName.trim(),
        description: description.trim() || undefined,
        personaUuids:
          selectedPersonaUuids.length > 0 ? selectedPersonaUuids : undefined,
        rules: suggestedRules.map((r) => r.ruleText),
      });

      setStep('success');

      const newUuid = (result as { uuid: string }).uuid;
      triggerScan(newUuid);
      setActiveConfigUuid(newUuid);

      setTimeout(() => {
        onCreated(newUuid);
        onOpenChange(false);
        setTimeout(reset, 300);
        toast.success(
          'Discovery Area Created',
          `"${viewName.trim()}" is now active`,
        );
      }, 1800);
    } catch {
      // Error handled by hook
    }
  }, [
    viewName,
    description,
    selectedPersonaUuids,
    suggestedRules,
    createConfigAsync,
    triggerScan,
    setActiveConfigUuid,
    onCreated,
    onOpenChange,
    reset,
  ]);

  // Build a map of persona UUID -> name for suggestion chips
  const personaNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (allPersonas) {
      allPersonas.forEach((p) => map.set(p.uuid, p.name));
    }
    return map;
  }, [allPersonas]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={handleClose}
            className='glass-modal-overlay fixed inset-0 z-50'
          />

          {/* Modal */}
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className='w-full max-w-[720px]'
            >
              {/* Shell */}
              <div className='liquid-glass-modal-shell'>
                {/* Rim (animated glass ring) */}
                <div
                  aria-hidden='true'
                  className='liquid-glass-modal-rim liquid-glass-modal-rim-animated'
                  style={orbStyles}
                >
                  <div className='rim-orb rim-orb-1' />
                  <div className='rim-orb rim-orb-2' />
                </div>

                {/* Surface */}
                <div
                  className={cn(
                    'liquid-glass-modal-surface',
                    'max-h-[85vh] overflow-hidden',
                    'flex flex-col',
                    'liquid-glass-dark-surface',
                  )}
                >
                  <div className='relative z-10 flex flex-1 flex-col overflow-hidden'>
                    {/* Close button */}
                    <button
                      onClick={handleClose}
                      className='absolute right-3 top-3 z-10 rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/10 hover:text-white/60'
                      aria-label='Close'
                    >
                      <X size={16} />
                    </button>

                    <AnimatePresence mode='wait'>
                      {/* Step 1: Loading */}
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
                              <Loader2
                                size={28}
                                className='animate-spin text-white/60'
                              />
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
                                    i <= loadingStepIndex
                                      ? 'text-white'
                                      : 'text-white/30',
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
                          onApprove={handleApprove}
                          isApproveDisabled={
                            suggestedRules.length === 0 ||
                            !viewName.trim() ||
                            isCreating ||
                            isNameDuplicate
                          }
                          isNameDuplicate={isNameDuplicate}
                          selectedPersonaUuids={selectedPersonaUuids}
                          onPersonaUuidsChange={setSelectedPersonaUuids}
                          personaNameMap={personaNameMap}
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
                          {/* Pulsing rings */}
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
                            Scouts deployed
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.4 }}
                            className='mt-1 text-xs text-white/30'
                          >
                            Discovery area is now active
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

// ============================================
// Review Step (extracted to reduce complexity)
// ============================================

interface ReviewStepProps {
  viewName: string;
  onViewNameChange: (name: string) => void;
  suggestedRules: SuggestedRule[];
  onRemoveRule: (id: string) => void;
  onEditRule: (id: string, newText: string) => void;
  onAddRule: (text: string) => void;
  onApprove: () => void;
  isApproveDisabled: boolean;
  isNameDuplicate?: boolean;
  selectedPersonaUuids: string[];
  onPersonaUuidsChange: (uuids: string[]) => void;
  personaNameMap: Map<string, string>;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  viewName,
  onViewNameChange,
  suggestedRules,
  onRemoveRule,
  onEditRule,
  onAddRule,
  onApprove,
  isApproveDisabled,
  isNameDuplicate,
  selectedPersonaUuids,
  onPersonaUuidsChange,
  personaNameMap,
}) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRuleText, setEditingRuleText] = useState('');
  const [newRuleText, setNewRuleText] = useState('');

  const handleStartEditRule = useCallback((rule: SuggestedRule) => {
    setEditingRuleId(rule.id);
    setEditingRuleText(rule.ruleText);
  }, []);

  const handleSaveEditRule = useCallback(() => {
    if (editingRuleId && editingRuleText.trim()) {
      onEditRule(editingRuleId, editingRuleText.trim());
    }
    setEditingRuleId(null);
    setEditingRuleText('');
  }, [editingRuleId, editingRuleText, onEditRule]);

  const handleAddRule = useCallback(() => {
    if (!newRuleText.trim()) return;
    onAddRule(newRuleText.trim());
    setNewRuleText('');
  }, [newRuleText, onAddRule]);

  return (
    <motion.div
      key='review'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className='p-6'
    >
      <div className='mb-5 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10'>
          <Check size={20} className='text-emerald-400' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-white'>
            Review Discovery Rules
          </h2>
          <p className='text-xs text-white/40'>
            Approve or customize the AI-suggested rules
          </p>
        </div>
      </div>

      {/* Config name */}
      <div className='mb-4'>
        <label className='mb-1.5 block text-xs font-medium text-white/40'>
          Discovery Area Name
        </label>
        <input
          value={viewName}
          onChange={(e) => onViewNameChange(e.target.value)}
          className={`h-9 w-full rounded-md border bg-white/[0.04] px-3 text-sm text-white focus:outline-none focus:ring-1 ${
            isNameDuplicate
              ? 'border-red-400/50 focus:border-red-400/70 focus:ring-red-400/20'
              : 'border-white/[0.08] focus:border-white/20 focus:ring-white/10'
          }`}
        />
        {isNameDuplicate && (
          <p className='mt-1 text-xs text-red-400'>
            A discovery area with this name already exists
          </p>
        )}
      </div>

      {/* Rules list */}
      <div className='mb-4'>
        <label className='mb-2 block text-xs font-medium text-white/40'>
          Discovery Rules ({suggestedRules.length})
        </label>
        <div className='max-h-[200px] space-y-2 overflow-y-auto'>
          {suggestedRules.map((rule) => (
            <div
              key={rule.id}
              className='group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2'
            >
              <Check size={14} className='flex-shrink-0 text-emerald-400' />
              {editingRuleId === rule.id ? (
                <input
                  autoFocus
                  value={editingRuleText}
                  onChange={(e) => setEditingRuleText(e.target.value)}
                  onBlur={handleSaveEditRule}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEditRule();
                    if (e.key === 'Escape') {
                      setEditingRuleId(null);
                      setEditingRuleText('');
                    }
                  }}
                  className='flex-1 border-none bg-transparent text-sm text-white outline-none'
                />
              ) : (
                <span
                  className='flex-1 cursor-text text-sm text-white/80 transition-colors hover:text-white'
                  onClick={() => handleStartEditRule(rule)}
                >
                  {rule.ruleText}
                </span>
              )}
              {/* Persona suggestion chip */}
              {rule.suggestedPersonaUuid && (
                <span className='shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[10px] text-white/50'>
                  {personaNameMap.get(rule.suggestedPersonaUuid) ?? 'Persona'}
                </span>
              )}
              <button
                onClick={() => onRemoveRule(rule.id)}
                className='rounded p-1 text-white/30 opacity-0 transition-colors hover:text-red-400 group-hover:opacity-100'
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom rule */}
        <div className='mt-2 flex gap-2'>
          <input
            placeholder='Add a custom rule...'
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
            className='h-8 flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10'
          />
          <button
            className='flex h-8 items-center rounded-md border border-white/[0.15] px-2 text-white/50 transition-colors hover:border-white/[0.3] hover:text-white disabled:opacity-30'
            onClick={handleAddRule}
            disabled={!newRuleText.trim()}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Persona tagger */}
      <div className='mb-4 border-t border-white/[0.08] pt-4'>
        <JTBDPersonaTagger
          selectedUuids={selectedPersonaUuids}
          onChange={onPersonaUuidsChange}
        />
      </div>

      <div className='mt-1 flex justify-end'>
        <button
          onClick={onApprove}
          disabled={isApproveDisabled}
          className='inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30'
        >
          <Check size={14} />
          Deploy Discovery Area
        </button>
      </div>
    </motion.div>
  );
};

export default CreateJTBDConfigModal;
