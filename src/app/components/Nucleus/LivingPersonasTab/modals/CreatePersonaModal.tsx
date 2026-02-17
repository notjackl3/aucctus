/**
 * CreatePersonaModal - Modal for creating new personas
 *
 * Allows users to create a new persona with:
 * - Persona name (required)
 * - Description (optional)
 * - Avatar upload with preview
 * - Training documents upload (drag & drop)
 *
 * Shows real-time processing stages via WebSocket after submission.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Upload } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LiquidGlassModal, LiquidGlassModalFooter } from '@components';
import { cn } from '@libs/utils/react';
import {
  useCreatePersona,
  useUploadTrainingDocument,
} from '@hooks/query/persona.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import type {
  ILivingPersonasDocumentProcessingProgressMessage,
  ILivingPersonasPersonaReadyMessage,
} from '@libs/api/types/socketMessages/inbound';
import avatarPlaceholder from '@assets/img/avatar.png';
import { CheckCircle2, FileText, Image, User, X } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';

/** Props for the CreatePersonaModal component */
export interface CreatePersonaModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onOpenChange: (open: boolean) => void;
  /** Callback when persona is successfully created */
  onSuccess?: (personaUuid: string) => void;
}

type ModalView = 'form' | 'processing';

/** Backend-aligned processing stages */
const PROCESSING_STAGES = [
  'started',
  'extracting',
  'analyzing',
  'creating_evidence',
  'completed',
] as const;
type ProcessingStageKey = (typeof PROCESSING_STAGES)[number];

const stageLabels: Record<ProcessingStageKey, string> = {
  started: 'Initializing document processing...',
  extracting: 'Extracting document content...',
  analyzing: 'Analyzing content for persona attributes...',
  creating_evidence: 'Creating evidence records...',
  completed: 'Complete!',
};

/** File type badge labels */
const acceptedFileTypes = ['PDF', 'DOCX', 'CSV', 'XLSX'];

/** Timeout before showing stalled-processing recovery (ms) */
const PROCESSING_TIMEOUT_MS = 150_000; // 2.5 minutes

/**
 * CreatePersonaModal Component
 */
const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  // Form state
  const [segment, setSegment] = useState('');
  const [description, setDescription] = useState('');
  const [, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  // Processing state
  const [modalView, setModalView] = useState<ModalView>('form');
  const [createdPersonaUuid, setCreatedPersonaUuid] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<ProcessingStageKey | null>(
    null,
  );
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingFailed, setProcessingFailed] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [processingTimedOut, setProcessingTimedOut] = useState(false);
  const uploadedDocCountRef = useRef(0);
  const completedDocCountRef = useRef(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  /**
   * Synchronous ref for the created persona UUID.
   * Set immediately before uploads begin so the WebSocket handler never
   * misses early events due to React's asynchronous state batching.
   */
  const createdPersonaUuidRef = useRef<string>('');

  /**
   * Buffer for WebSocket events that arrive before React state
   * (`createdPersonaUuid`) is committed. Replayed once state catches up.
   */
  const eventBufferRef = useRef<
    ILivingPersonasDocumentProcessingProgressMessage[]
  >([]);

  /** Ref to track the processing-stall timeout so it can be cleared. */
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // API mutations
  const { createPersonaAsync } = useCreatePersona();
  const { uploadDocumentAsync } = useUploadTrainingDocument();

  const isValid = segment.trim().length > 0;
  const isActivelyProcessing =
    modalView === 'processing' &&
    !processingComplete &&
    !processingFailed &&
    !processingTimedOut;

  /** Process a single WebSocket event (shared between live + buffered paths). */
  const handleProcessingEvent = useCallback(
    (data: ILivingPersonasDocumentProcessingProgressMessage) => {
      if (data.stage === 'completed') {
        setCurrentStage('completed');
        completedDocCountRef.current += 1;
        if (completedDocCountRef.current >= uploadedDocCountRef.current) {
          setProcessingComplete(true);
        }
      } else if (data.stage === 'failed') {
        setProcessingFailed(true);
        setFailureMessage(data.message || 'Document processing failed.');
      } else {
        const incoming = data.stage as ProcessingStageKey;
        setCurrentStage((prev) => {
          if (!prev) return incoming;
          const prevIdx = PROCESSING_STAGES.indexOf(prev);
          const newIdx = PROCESSING_STAGES.indexOf(incoming);
          return newIdx > prevIdx ? incoming : prev;
        });
      }

      // Reset the stall timeout on any progress activity
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      processingTimeoutRef.current = setTimeout(() => {
        setProcessingTimedOut(true);
      }, PROCESSING_TIMEOUT_MS);
    },
    [],
  );

  // WebSocket listener for document processing progress.
  // Uses the synchronous ref for UUID matching so early events are never dropped.
  useSocketEvent<
    'living_personas.document.processing.progress.account',
    ILivingPersonasDocumentProcessingProgressMessage
  >(
    'living_personas.document.processing.progress.account',
    useCallback(
      (data: ILivingPersonasDocumentProcessingProgressMessage) => {
        const targetUuid = createdPersonaUuidRef.current;

        // If we haven't set the persona UUID yet, buffer the event
        if (!targetUuid) {
          eventBufferRef.current.push(data);
          return;
        }

        if (data.personaUuid !== targetUuid) return;

        handleProcessingEvent(data);
      },
      [handleProcessingEvent],
    ),
  );

  // Replay buffered events once createdPersonaUuid state is committed
  useEffect(() => {
    if (!createdPersonaUuid) return;

    const buffered = eventBufferRef.current;
    eventBufferRef.current = [];

    for (const event of buffered) {
      if (event.personaUuid === createdPersonaUuid) {
        handleProcessingEvent(event);
      }
    }
  }, [createdPersonaUuid, handleProcessingEvent]);

  // Listen for persona ready event (indicates persona is now visible in the list)
  useSocketEvent<
    'living_personas.persona.ready.account',
    ILivingPersonasPersonaReadyMessage
  >(
    'living_personas.persona.ready.account',
    useCallback((data: ILivingPersonasPersonaReadyMessage) => {
      if (data.personaUuid !== createdPersonaUuidRef.current) return;
      // Mark processing as complete when persona is ready
      setProcessingComplete(true);
    }, []),
  );

  // Processing-stall timeout: detect when no WS progress arrives
  useEffect(() => {
    if (!isActivelyProcessing) {
      // Clear the timeout when processing is no longer active
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      return;
    }

    // Start the initial timeout when processing begins
    processingTimeoutRef.current = setTimeout(() => {
      setProcessingTimedOut(true);
    }, PROCESSING_TIMEOUT_MS);

    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    };
  }, [isActivelyProcessing]);

  // Handle avatar file selection
  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setAvatarFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  // Handle document file selection
  const handleDocumentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setDocumentFiles((prev) => [...prev, ...files]);
    },
    [],
  );

  // Handle document drop
  const handleDocumentDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      setDocumentFiles((prev) => [...prev, ...files]);
    },
    [],
  );

  // Remove a document
  const handleRemoveDocument = useCallback((index: number) => {
    setDocumentFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setSegment('');
    setDescription('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setDocumentFiles([]);
    setModalView('form');
    setCreatedPersonaUuid('');
    createdPersonaUuidRef.current = '';
    eventBufferRef.current = [];
    setCurrentStage(null);
    setProcessingComplete(false);
    setProcessingFailed(false);
    setFailureMessage('');
    setProcessingTimedOut(false);
    uploadedDocCountRef.current = 0;
    completedDocCountRef.current = 0;
    setIsSubmitting(false);
    setError(null);
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
  }, []);

  // Auto-close after processing completes
  useEffect(() => {
    if (!processingComplete) return;
    const timer = setTimeout(() => {
      onSuccess?.(createdPersonaUuid);
      onOpenChange(false);
      resetForm();
    }, 1500);
    return () => clearTimeout(timer);
  }, [
    processingComplete,
    createdPersonaUuid,
    onSuccess,
    onOpenChange,
    resetForm,
  ]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!isValid) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const newPersona = await createPersonaAsync({
        segment: segment.trim(),
        overview: description.trim() || undefined,
        hasPendingDocuments: documentFiles.length > 0,
      });

      if (documentFiles.length > 0) {
        // Set the ref synchronously BEFORE uploads so the WebSocket
        // handler can match events immediately — even before React
        // commits the state update from setCreatedPersonaUuid.
        createdPersonaUuidRef.current = newPersona.uuid;
        uploadedDocCountRef.current = documentFiles.length;
        setCreatedPersonaUuid(newPersona.uuid);
        setModalView('processing');

        await Promise.all(
          documentFiles.map((file) =>
            uploadDocumentAsync({ personaUuid: newPersona.uuid, file }),
          ),
        );
      } else {
        // No documents — close immediately
        onSuccess?.(newPersona.uuid);
        onOpenChange(false);
        resetForm();
      }
    } catch {
      setError('Failed to create persona. Please try again.');
      setIsSubmitting(false);
    }
  }, [
    isValid,
    segment,
    description,
    documentFiles,
    createPersonaAsync,
    uploadDocumentAsync,
    onSuccess,
    onOpenChange,
    resetForm,
  ]);

  // Handle close — always allow the user to dismiss the modal
  const handleClose = useCallback(() => {
    onOpenChange(false);
    resetForm();
  }, [onOpenChange, resetForm]);

  /** Render the processing stage list */
  const renderProcessingView = () => {
    const isComplete = processingComplete;
    const isFailed = processingFailed;
    const isTimedOut = processingTimedOut;
    const hasError = isFailed || isTimedOut;

    return (
      <motion.div
        key='processing'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='flex flex-col items-center justify-center px-6 py-10'
      >
        {/* Top icon with pulse ring */}
        <div className='relative mb-6'>
          <motion.div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-2xl',
              hasError
                ? 'bg-error-100 dark:bg-error-900/30'
                : isComplete
                  ? 'bg-success-100 dark:bg-success-900/30'
                  : 'from-brand-200 to-brand-400 dark:from-brand-700 dark:to-brand-500 bg-gradient-to-br',
            )}
            animate={
              !isComplete && !hasError ? { scale: [1, 1.05, 1] } : undefined
            }
            transition={
              !isComplete && !hasError
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : undefined
            }
          >
            <DynamicIcon
              variant={
                hasError
                  ? 'alert-circle'
                  : isComplete
                    ? 'check-circle-broken'
                    : 'sparkles'
              }
              className={cn(
                'h-8 w-8',
                hasError
                  ? 'text-error-600 dark:text-error-400'
                  : isComplete
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-white',
              )}
            />
          </motion.div>
          {/* Pulse ring */}
          {!isComplete && !hasError && (
            <motion.div
              className='border-brand-300 dark:border-brand-600 absolute inset-0 rounded-2xl border-2'
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </div>

        {/* Persona name badge */}
        <div className='aucctus-bg-secondary aucctus-border-secondary mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5'>
          <User className='aucctus-text-tertiary h-3.5 w-3.5' />
          <span className='aucctus-text-sm-medium aucctus-text-primary'>
            {segment}
          </span>
        </div>

        {/* Stage list */}
        <div className='w-full max-w-xs space-y-3'>
          {PROCESSING_STAGES.map((stage) => {
            const stageIdx = PROCESSING_STAGES.indexOf(stage);
            const currentIdx = currentStage
              ? PROCESSING_STAGES.indexOf(currentStage)
              : -1;
            const isStageComplete = currentIdx > stageIdx;
            const isStageActive =
              currentIdx === stageIdx && !isComplete && !hasError;
            const isFuture = currentIdx < stageIdx;

            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: stageIdx * 0.1 }}
                className='flex items-center gap-3'
              >
                {/* Stage indicator */}
                {isStageComplete || (stage === 'completed' && isComplete) ? (
                  <CheckCircle2 className='h-5 w-5 shrink-0 text-success-500' />
                ) : isStageActive ? (
                  <div className='h-5 w-5 shrink-0'>
                    <div className='aucctus-border-brand h-5 w-5 animate-spin rounded-full border-2 border-t-transparent' />
                  </div>
                ) : (
                  <div
                    className={cn(
                      'aucctus-border-secondary h-5 w-5 shrink-0 rounded-full border-2',
                      isFuture && 'opacity-30',
                    )}
                  />
                )}

                {/* Stage label */}
                <span
                  className={cn(
                    'aucctus-text-sm',
                    isStageComplete || (stage === 'completed' && isComplete)
                      ? 'aucctus-text-primary'
                      : isStageActive
                        ? 'aucctus-text-primary font-medium'
                        : 'aucctus-text-quaternary',
                  )}
                >
                  {stageLabels[stage]}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Failure message */}
        {isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-6 w-full max-w-xs'
          >
            <div className='rounded-lg bg-error-50 p-3 dark:bg-error-900/30'>
              <p className='aucctus-text-sm text-error-700 dark:text-error-300'>
                {failureMessage}
              </p>
            </div>
            <button
              type='button'
              onClick={handleClose}
              className='btn btn-ghost btn-md mt-3 w-full'
            >
              Close
            </button>
          </motion.div>
        )}

        {/* Timeout message */}
        {isTimedOut && !isFailed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mt-6 w-full max-w-xs'
          >
            <div className='rounded-lg bg-error-50 p-3 dark:bg-error-900/30'>
              <p className='aucctus-text-sm text-error-700 dark:text-error-300'>
                Processing appears to have stalled. Your persona was created and
                any completed results will be available. You can close this
                dialog and check back shortly.
              </p>
            </div>
            <button
              type='button'
              onClick={() => {
                onSuccess?.(createdPersonaUuid);
                handleClose();
              }}
              className='btn btn-ghost btn-md mt-3 w-full'
            >
              Close
            </button>
          </motion.div>
        )}

        {/* Always-visible cancel link during active processing */}
        {!isComplete && !hasError && (
          <button
            type='button'
            onClick={handleClose}
            className='aucctus-text-tertiary aucctus-text-xs mt-8 underline opacity-60 transition-opacity hover:opacity-100'
          >
            Dismiss &mdash; processing will continue in the background
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={handleClose}
      size='lg'
      title={modalView === 'form' ? 'Create New Persona' : undefined}
      description={
        modalView === 'form' ? 'Define your customer segment' : undefined
      }
      hideCloseButton={false}
      animatedRim
    >
      <AnimatePresence mode='wait'>
        {modalView === 'processing' ? (
          renderProcessingView()
        ) : (
          <motion.div
            key='form'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='p-6'
          >
            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-4 rounded-lg bg-error-50 p-3 dark:bg-error-900/30'
              >
                <p className='aucctus-text-sm text-error-700 dark:text-error-300'>
                  {error}
                </p>
              </motion.div>
            )}

            {/* Main section: Name/Description left, Avatar right */}
            <div className='flex gap-6'>
              {/* Left: Name and Description inputs */}
              <div className='flex-1 space-y-4'>
                {/* Persona Segment - Large elegant input */}
                <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-4'>
                  <span className='aucctus-text-tertiary mb-2 block text-[10px] font-medium uppercase tracking-wider'>
                    Segment Title
                  </span>
                  <input
                    type='text'
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    placeholder='e.g., Young Urban Professionals'
                    autoFocus
                    className='aucctus-text-primary placeholder:aucctus-text-quaternary w-full border-none bg-transparent p-0 text-2xl font-bold shadow-none outline-none ring-0 focus:border-none focus:shadow-none focus:outline-none focus:ring-0'
                  />
                </div>

                {/* Description - Elegant textarea */}
                <div className='aucctus-bg-secondary aucctus-border-secondary rounded-lg border p-4'>
                  <span className='aucctus-text-tertiary mb-2 block text-[10px] font-medium uppercase tracking-wider'>
                    Description
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this persona's key characteristics, goals, and what makes them unique..."
                    className='aucctus-text-primary placeholder:aucctus-text-quaternary min-h-[80px] w-full resize-none border-none bg-transparent p-0 text-sm leading-relaxed shadow-none outline-none ring-0 focus:border-none focus:shadow-none focus:outline-none focus:ring-0'
                  />
                </div>
              </div>

              {/* Right: Avatar */}
              <div className='flex shrink-0 flex-col items-center'>
                <span className='aucctus-text-tertiary mb-2 text-[10px] font-medium uppercase tracking-wider'>
                  Avatar
                </span>
                <input
                  ref={avatarInputRef}
                  type='file'
                  accept='image/*'
                  onChange={handleAvatarChange}
                  className='hidden'
                />
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className='aucctus-bg-secondary aucctus-border-secondary group relative h-44 w-36 cursor-pointer overflow-hidden rounded-lg border transition-all'
                >
                  {avatarPreview ? (
                    <>
                      <img
                        src={avatarPreview}
                        alt='Avatar preview'
                        className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                        <Image className='h-6 w-6 text-white' />
                      </div>
                    </>
                  ) : (
                    <div className='absolute inset-0 flex flex-col items-center justify-center'>
                      {/* Blurred placeholder image */}
                      <img
                        src={avatarPlaceholder}
                        alt='Placeholder avatar'
                        className='absolute inset-0 h-full w-full scale-125 object-cover transition-transform duration-300 group-hover:scale-150'
                        style={{ filter: 'blur(8px)' }}
                      />
                      {/* Overlay on hover */}
                      <div className='aucctus-bg-primary relative z-10 flex flex-col items-center gap-1.5 rounded-lg px-4 py-3 opacity-0 shadow-sm transition-opacity group-hover:opacity-100'>
                        <Image className='aucctus-text-brand-primary h-5 w-5' />
                        <span className='aucctus-text-xs-medium aucctus-text-primary'>
                          Add Photo
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Training Documents - Compact section */}
            <div className='border-border/30 mt-6 border-t pt-5'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='aucctus-text-tertiary text-[10px] font-medium uppercase tracking-wider'>
                  Training Documents
                </span>
                <span className='aucctus-text-tertiary text-[10px]'>
                  Optional &bull; Upload research to auto-populate
                </span>
              </div>

              {/* Compact upload zone */}
              <div
                onDrop={handleDocumentDrop}
                onDragOver={(e) => e.preventDefault()}
                className='border-border/40 hover:border-border hover:bg-muted/20 relative cursor-pointer rounded-lg border p-3 transition-all'
              >
                <input
                  ref={documentInputRef}
                  type='file'
                  accept='.pdf,.doc,.docx,.csv,.xlsx,.xls,.ppt,.pptx'
                  multiple
                  onChange={handleDocumentChange}
                  className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
                />
                <div className='flex items-center gap-3'>
                  <div className='bg-muted/40 rounded-lg p-2'>
                    <Upload className='text-muted-foreground h-4 w-4' />
                  </div>
                  <div className='flex-1'>
                    <p className='aucctus-text-sm-medium aucctus-text-primary'>
                      Drop files here or click to browse
                    </p>
                    <div className='mt-1 flex items-center gap-1.5'>
                      {acceptedFileTypes.map((ext) => (
                        <span
                          key={ext}
                          className='border-border text-foreground inline-flex h-4 items-center rounded-full border px-1.5 text-[9px] font-semibold leading-4'
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* File list - compact */}
              {documentFiles.length > 0 && (
                <div className='mt-3 space-y-1.5'>
                  {documentFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='aucctus-bg-tertiary aucctus-border-secondary flex items-center gap-2 rounded-lg border px-2 py-2'
                    >
                      <FileText className='aucctus-text-secondary h-3.5 w-3.5 shrink-0' />
                      <span className='aucctus-text-xs aucctus-text-primary flex-1 truncate'>
                        {file.name}
                      </span>
                      <span className='aucctus-text-tertiary text-[10px]'>
                        {(file.size / 1024).toFixed(0)} KB
                      </span>
                      <button
                        type='button'
                        aria-label='Remove document'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDocument(index);
                        }}
                        className='hover:aucctus-bg-secondary shrink-0 rounded p-0.5'
                      >
                        <X className='aucctus-text-tertiary h-3 w-3' />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - only in form view */}
      {modalView === 'form' && (
        <LiquidGlassModalFooter>
          <p className='aucctus-text-xs aucctus-text-tertiary flex-1'>
            {isValid
              ? 'Ready to create persona'
              : 'Enter a segment title to continue'}
          </p>
          <button
            type='button'
            onClick={handleClose}
            disabled={isSubmitting}
            className='btn btn-ghost btn-md'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className='btn btn-primary btn-md'
          >
            {isSubmitting ? 'Creating...' : 'Create Persona'}
          </button>
        </LiquidGlassModalFooter>
      )}
    </LiquidGlassModal>
  );
};

export default CreatePersonaModal;
